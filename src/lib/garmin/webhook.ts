import { createAdminClient } from "../supabase/admin";
import { calculateMilhas } from "../coins";
import type { GarminActivity } from "@/types/garmin";
import { GARMIN_ACTIVITY_MAP } from "@/types/garmin";

export function verifyGarminWebhook(signature: string, body: string): boolean {
  // Garmin Health API sends a signature header for webhook verification
  // In production, validate HMAC-SHA256 with your consumer secret
  return !!signature && !!body;
}

export async function processGarminActivities(
  garminUserId: string,
  activities: GarminActivity[]
) {
  const supabase = createAdminClient();

  // Find the user with this Garmin user ID
  const { data: connection } = await supabase
    .from("rm_garmin_connections")
    .select("*")
    .eq("garmin_user_id", garminUserId)
    .single();

  if (!connection) return;

  // Get user's plan for conversion rate
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

  let currentMonthlyEarned = (monthlyActivities || []).reduce(
    (sum, a) => sum + (a.milhas_earned || 0),
    0
  );

  for (const activity of activities) {
    // Map Garmin activity type to our standard type
    const activityType = GARMIN_ACTIVITY_MAP[activity.activityType] || activity.activityType;
    const distanceKm = activity.distanceInMeters / 1000;
    const startDate = new Date(activity.startTimeInSeconds * 1000).toISOString();

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
          provider: "garmin",
          provider_activity_id: String(activity.activityId),
          type: activityType,
          name: activity.activityName || `${activityType} Activity`,
          distance_meters: activity.distanceInMeters,
          moving_time_seconds: activity.activeTimeInSeconds,
          elapsed_time_seconds: activity.durationInSeconds,
          start_date: startDate,
          milhas_earned: conversion.milhasEarned,
          processed: conversion.milhasEarned > 0,
          raw_data: activity,
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
          description: `${activityType}: ${activity.activityName || "Activity"} (${distanceKm.toFixed(1)} km)`,
          reference_type: "activity",
          reference_id: savedActivity.id,
        });

        currentMonthlyEarned += conversion.milhasEarned;
      }
    }
  }
}
