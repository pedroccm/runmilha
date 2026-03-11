import { STRAVA_API_BASE } from "../constants";
import { refreshStravaToken } from "./oauth";
import { createAdminClient } from "../supabase/admin";
import type { StravaActivity, StravaAthlete } from "@/types/strava";

interface StravaCredentials {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  strava_athlete_id: number;
}

async function getValidToken(credentials: StravaCredentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  if (credentials.expires_at > now + 60) {
    return credentials.access_token;
  }

  // Token expired or about to expire — refresh it
  const refreshed = await refreshStravaToken(credentials.refresh_token);

  // Update stored tokens
  const supabase = createAdminClient();
  await supabase
    .from("rm_strava_connections")
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: refreshed.expires_at,
    })
    .eq("strava_athlete_id", credentials.strava_athlete_id);

  return refreshed.access_token;
}

export async function getStravaActivity(
  credentials: StravaCredentials,
  activityId: number
): Promise<StravaActivity> {
  const token = await getValidToken(credentials);

  const response = await fetch(`${STRAVA_API_BASE}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Strava activity ${activityId}: ${response.statusText}`);
  }

  return response.json();
}

export async function getStravaAthlete(
  credentials: StravaCredentials
): Promise<StravaAthlete> {
  const token = await getValidToken(credentials);

  const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Strava athlete: ${response.statusText}`);
  }

  return response.json();
}
