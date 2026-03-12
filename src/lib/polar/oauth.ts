import { POLAR_OAUTH_URL, POLAR_TOKEN_URL } from "../constants";
import type { PolarTokenResponse } from "@/types/polar";

export function getPolarAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.POLAR_CLIENT_ID!,
    redirect_uri: process.env.NEXT_PUBLIC_POLAR_REDIRECT_URI!,
    response_type: "code",
    scope: "accesslink.read_all",
  });
  return `${POLAR_OAUTH_URL}?${params.toString()}`;
}

export async function exchangePolarCode(code: string): Promise<PolarTokenResponse> {
  const credentials = Buffer.from(
    `${process.env.POLAR_CLIENT_ID}:${process.env.POLAR_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(POLAR_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.NEXT_PUBLIC_POLAR_REDIRECT_URI!,
    }),
  });

  if (!response.ok) {
    throw new Error(`Polar token exchange failed: ${response.statusText}`);
  }

  return response.json();
}

// Register user in Polar AccessLink (required after first auth)
export async function registerPolarUser(accessToken: string): Promise<void> {
  const response = await fetch("https://www.polaraccesslink.com/v3/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "member-id": `runmilha-${Date.now()}`,
    }),
  });

  // 409 Conflict means already registered — that's OK
  if (!response.ok && response.status !== 409) {
    throw new Error(`Polar user registration failed: ${response.statusText}`);
  }
}
