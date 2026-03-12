import { GARMIN_API_BASE } from "../constants";
import { refreshGarminToken } from "./oauth";
import { createAdminClient } from "../supabase/admin";
import type { GarminActivity } from "@/types/garmin";

interface GarminCredentials {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  garmin_user_id: string;
}

async function getValidToken(credentials: GarminCredentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  if (credentials.expires_at > now + 60) {
    return credentials.access_token;
  }

  const refreshed = await refreshGarminToken(credentials.refresh_token);

  const supabase = createAdminClient();
  await supabase
    .from("rm_garmin_connections")
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + refreshed.expires_in,
    })
    .eq("garmin_user_id", credentials.garmin_user_id);

  return refreshed.access_token;
}

export async function getGarminActivity(
  credentials: GarminCredentials,
  activityId: number
): Promise<GarminActivity> {
  const token = await getValidToken(credentials);

  const response = await fetch(
    `${GARMIN_API_BASE}/activities/${activityId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Garmin activity ${activityId}: ${response.statusText}`);
  }

  return response.json();
}

export async function getGarminActivities(
  credentials: GarminCredentials,
  startTime: number,
  endTime: number
): Promise<GarminActivity[]> {
  const token = await getValidToken(credentials);

  const response = await fetch(
    `${GARMIN_API_BASE}/activities?uploadStartTimeInSeconds=${startTime}&uploadEndTimeInSeconds=${endTime}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Garmin activities: ${response.statusText}`);
  }

  return response.json();
}
