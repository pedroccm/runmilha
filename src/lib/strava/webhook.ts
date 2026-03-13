import { createAdminClient } from "../supabase/admin";
import { getStravaActivity } from "./client";
import { calculateMilhas } from "../coins";
import type { StravaWebhookEvent } from "@/types/strava";

export function verifyWebhookToken(token: string): boolean {
  return token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN;
}

export async function processActivityEvent(event: StravaWebhookEvent) {
  const supabaseAdmin = createAdminClient();

  // Athlete deauthorized the app from Strava's side — clean up connection
  if (event.object_type === "athlete" && event.aspect_type === "delete") {
    await supabaseAdmin
      .from("rm_strava_connections")
      .delete()
      .eq("strava_athlete_id", event.owner_id);
    return;
  }

  if (event.object_type !== "activity") return;

  const supabase = supabaseAdmin;

  // Find the user with this Strava athlete ID
  const { data: connection } = await supabase
    .from("rm_strava_connections")
    .select("*")
    .eq("strava_athlete_id", event.owner_id)
    .single();

  if (!connection) return;

  if (event.aspect_type === "delete") {
    // Handle activity deletion — remove milhas if already credited
    const { data: activity } = await supabase
      .from("rm_activities")
      .select("*")
      .eq("strava_activity_id", event.object_id)
      .single();

    if (activity?.processed && activity.milhas_earned) {
      // Deduct milhas from wallet
      const { data: wallet } = await supabase
        .from("rm_wallets")
        .select("*")
        .eq("user_id", connection.user_id)
        .single();

      if (wallet) {
        const newBalance = wallet.balance - activity.milhas_earned;
        await supabase
          .from("rm_wallets")
          .update({
            balance: newBalance,
            total_earned: wallet.total_earned - activity.milhas_earned,
            updated_at: new Date().toISOString(),
          })
          .eq("id", wallet.id);

        await supabase.from("rm_transactions").insert({
          user_id: connection.user_id,
          wallet_id: wallet.id,
          type: "adjustment",
          amount: -activity.milhas_earned,
          balance_after: newBalance,
          description: `Activity deleted: ${activity.name}`,
          reference_type: "activity",
          reference_id: activity.id,
        });
      }
    }

    await supabase
      .from("rm_activities")
      .delete()
      .eq("strava_activity_id", event.object_id);

    return;
  }

  // Create or update — fetch full activity from Strava
  const stravaActivity = await getStravaActivity(
    {
      access_token: connection.access_token,
      refresh_token: connection.refresh_token,
      expires_at: connection.expires_at,
      strava_athlete_id: connection.strava_athlete_id,
    },
    event.object_id
  );

  // Get user's plan for conversion rate
  const { data: user } = await supabase
    .from("rm_users")
    .select("*, plan:rm_plans(*)")
    .eq("id", connection.user_id)
    .single();

  const plan = user?.plan;
  const conversionRate = plan?.conversion_rate ?? 0.5;
  const monthlyCap = plan?.monthly_cap ?? 100;

  // Get current monthly earnings for cap check
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyActivities } = await supabase
    .from("rm_activities")
    .select("milhas_earned")
    .eq("user_id", connection.user_id)
    .eq("processed", true)
    .gte("start_date", startOfMonth.toISOString());

  const currentMonthlyEarned = (monthlyActivities || []).reduce(
    (sum, a) => sum + (a.milhas_earned || 0),
    0
  );

  const distanceKm = stravaActivity.distance / 1000;
  const conversion = calculateMilhas({
    distanceKm,
    activityType: stravaActivity.type,
    conversionRate,
    monthlyCap,
    currentMonthlyEarned,
  });

  // Check if activity was already credited before upserting
  const { data: existingActivity } = await supabase
    .from("rm_activities")
    .select("milhas_earned, processed")
    .eq("strava_activity_id", stravaActivity.id)
    .single();

  const previouslyEarned = existingActivity?.milhas_earned ?? 0;

  // Upsert activity
  const { data: activity } = await supabase
    .from("rm_activities")
    .upsert(
      {
        user_id: connection.user_id,
        provider: "strava",
        provider_activity_id: String(stravaActivity.id),
        strava_activity_id: stravaActivity.id,
        type: stravaActivity.type,
        name: stravaActivity.name,
        distance_meters: stravaActivity.distance,
        moving_time_seconds: stravaActivity.moving_time,
        elapsed_time_seconds: stravaActivity.elapsed_time,
        start_date: stravaActivity.start_date,
        milhas_earned: conversion.milhasEarned,
        processed: conversion.milhasEarned > 0,
        raw_data: stravaActivity,
      },
      { onConflict: "strava_activity_id" }
    )
    .select()
    .single();

  // Calculate the delta to credit/debit (handles updates and duplicates)
  const milhasDelta = conversion.milhasEarned - previouslyEarned;

  // Credit wallet only if there's a positive delta
  if (milhasDelta > 0 && activity) {
    const { data: wallet } = await supabase
      .from("rm_wallets")
      .select("*")
      .eq("user_id", connection.user_id)
      .single();

    if (wallet) {
      const newBalance = wallet.balance + milhasDelta;
      await supabase
        .from("rm_wallets")
        .update({
          balance: newBalance,
          total_earned: wallet.total_earned + milhasDelta,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);

      await supabase.from("rm_transactions").insert({
        user_id: connection.user_id,
        wallet_id: wallet.id,
        type: "earn",
        amount: milhasDelta,
        balance_after: newBalance,
        description: `${stravaActivity.type}: ${stravaActivity.name} (${distanceKm.toFixed(1)} km)`,
        reference_type: "activity",
        reference_id: activity.id,
      });
    }
  }
}
