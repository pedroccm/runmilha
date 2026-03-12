import { GARMIN_OAUTH_URL, GARMIN_TOKEN_URL } from "../constants";
import type { GarminTokenResponse } from "@/types/garmin";

export function getGarminAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.GARMIN_CLIENT_ID!,
    redirect_uri: process.env.NEXT_PUBLIC_GARMIN_REDIRECT_URI!,
    response_type: "code",
    scope: "activity_read",
    approval_prompt: "auto",
  });
  return `${GARMIN_OAUTH_URL}?${params.toString()}`;
}

export async function exchangeGarminCode(code: string): Promise<GarminTokenResponse & { userId: string; displayName: string }> {
  const response = await fetch(GARMIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GARMIN_CLIENT_ID!,
      client_secret: process.env.GARMIN_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.NEXT_PUBLIC_GARMIN_REDIRECT_URI!,
    }),
  });

  if (!response.ok) {
    throw new Error(`Garmin token exchange failed: ${response.statusText}`);
  }

  const tokenData: GarminTokenResponse = await response.json();

  // Fetch user info
  const userResponse = await fetch("https://apis.garmin.com/wellness-api/rest/user/id", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const userData = await userResponse.json();

  return {
    ...tokenData,
    userId: userData.userId,
    displayName: userData.displayName || "Garmin User",
  };
}

export async function refreshGarminToken(refreshToken: string): Promise<GarminTokenResponse> {
  const response = await fetch(GARMIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GARMIN_CLIENT_ID!,
      client_secret: process.env.GARMIN_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Garmin token refresh failed: ${response.statusText}`);
  }

  return response.json();
}
