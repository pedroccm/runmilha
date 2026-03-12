import { createAdminClient } from "../supabase/admin";
import { getPolarExercise, parsePolarDuration } from "./client";
import { calculateMilhas } from "../coins";
import type { PolarWebhookEvent } from "@/types/polar";
import { POLAR_ACTIVITY_MAP } from "@/types/polar";

export function verifyPolarWebhook(signature: string, body: string): boolean {
  // Polar sends X-Polar-Signature header (HMAC-SHA256)
  // In production, validate with your webhook signing secret
  return !!signature && !!body;
}

export async function processPolarExerciseEvent(event: PolarWebhookEvent) {
  if (event.event !== "EXERCISE") return;

  const supabase = createAdminClient();

  // Find user by Polar user ID
  const { data: connection } = await supabase
    .from("rm_polar_connections")
    .select("*")
    .eq("polar_user_id", String(event.user_id))
    .single();

  if (!connection) return;

  // Fetch exercise details from Polar
  const exercise = await getPolarExercise(
    {
      access_token: connection.access_token,
      polar_user_id: connection.polar_user_id,
    },
    event.url
  );

  // Map Polar sport to our standard type
  const activityType = POLAR_ACTIVITY_MAP[exercise.sport] || exercise.sport;
  const distanceKm = exercise.distance / 1000;
  const durationSeconds = parsePolarDuration(exercise.duration);

  // Get user's plan
  const { data: user } = await supabase
    .from("rm_users")
    .select("*, plan:rm_plans(*)")
    .eq("id", connection.user_id)
    .single();

  const plan = user?.plan;
  const conversionRate = plan?.conversion_rate ?? 0.5;
  const monthlyCap = plan?.monthly_cap ?? 100;

  // Get current monthly earnings
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

  const conversion = calculateMilhas({
    distanceKm,
    activityType,
    conversionRate,
    monthlyCap,
    currentMonthlyEarned,
  });

  // Upsert activity
  const { data: savedActivity } = await supabase
    .from("rm_activities")
    .upsert(
      {
        user_id: connection.user_id,
        provider: "polar",
        provider_activity_id: String(exercise.id),
        type: activityType,
        name: `${activityType} Activity`,
        distance_meters: exercise.distance,
        moving_time_seconds: durationSeconds,
        elapsed_time_seconds: durationSeconds,
        start_date: exercise["start-time"],
        milhas_earned: conversion.milhasEarned,
        processed: conversion.milhasEarned > 0,
        raw_data: exercise,
      },
      { onConflict: "provider,provider_activity_id" }
    )
    .select()
    .single();

  // Credit wallet
  if (conversion.milhasEarned > 0 && savedActivity) {
    const { data: wallet } = await supabase
      .from("rm_wallets")
      .select("*")
      .eq("user_id", connection.user_id)
      .single();

    if (wallet) {
      const newBalance = wallet.balance + conversion.milhasEarned;
      await supabase
        .from("rm_wallets")
        .update({
          balance: newBalance,
          total_earned: wallet.total_earned + conversion.milhasEarned,
          updated_at: new Date().toISOString(),
        })
        .eq("id", wallet.id);

      await supabase.from("rm_transactions").insert({
        user_id: connection.user_id,
        wallet_id: wallet.id,
        type: "earn",
        amount: conversion.milhasEarned,
        balance_after: newBalance,
        description: `${activityType}: Polar Activity (${distanceKm.toFixed(1)} km)`,
        reference_type: "activity",
        reference_id: savedActivity.id,
      });
    }
  }
}
