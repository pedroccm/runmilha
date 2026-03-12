import { NextRequest, NextResponse } from "next/server";
import { processGarminActivities } from "@/lib/garmin/webhook";
import type { GarminActivity } from "@/types/garmin";

// Garmin Health API pushes activity data to this endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Garmin sends activities grouped by user
    // Format: { "activities": [...] } or { "activityDetails": [...] }
    const activities: GarminActivity[] = body.activities || body.activityDetails || [];

    if (activities.length === 0) {
      return NextResponse.json({ status: "ok" }, { status: 200 });
    }

    // Group activities by user (Garmin includes userAccessToken in push)
    // In the Health API push model, activities come with user context
    const userToken = request.headers.get("X-Garmin-User-Id");

    if (userToken) {
      await processGarminActivities(userToken, activities);
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Garmin webhook error:", error);
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }
}

// Garmin webhook validation
export async function GET() {
  return NextResponse.json({ status: "active" }, { status: 200 });
}
