import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookToken, processActivityEvent } from "@/lib/strava/webhook";
import type { StravaWebhookEvent } from "@/types/strava";

// Strava webhook validation (subscription setup)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = searchParams.get("hub.verify_token");

  if (mode === "subscribe" && verifyToken && verifyWebhookToken(verifyToken)) {
    return NextResponse.json({ "hub.challenge": challenge });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Strava webhook events
export async function POST(request: NextRequest) {
  try {
    const event: StravaWebhookEvent = await request.json();

    // Process asynchronously — Strava expects a 200 within 2 seconds
    processActivityEvent(event).catch(console.error);

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
