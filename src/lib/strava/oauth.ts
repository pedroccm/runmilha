import { STRAVA_OAUTH_URL, STRAVA_TOKEN_URL } from "../constants";
import type { StravaTokenResponse } from "@/types/strava";

export function getStravaAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI!,
    response_type: "code",
    scope: "read,activity:read_all",
    approval_prompt: "auto",
  });
  return `${STRAVA_OAUTH_URL}?${params.toString()}`;
}

export async function exchangeStravaCode(code: string): Promise<StravaTokenResponse> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error(`Strava token exchange failed: ${response.statusText}`);
  }

  return response.json();
}

export async function refreshStravaToken(refreshToken: string): Promise<StravaTokenResponse> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Strava token refresh failed: ${response.statusText}`);
  }

  return response.json();
}
