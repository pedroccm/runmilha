import { NextRequest, NextResponse } from "next/server";
import { processPolarExerciseEvent } from "@/lib/polar/webhook";
import type { PolarWebhookEvent } from "@/types/polar";

// Polar AccessLink webhook for exercise notifications
export async function POST(request: NextRequest) {
  try {
    const event: PolarWebhookEvent = await request.json();

    await processPolarExerciseEvent(event);

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Polar webhook error:", error);
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }
}

// Polar webhook validation
export async function GET() {
  return NextResponse.json({ status: "active" }, { status: 200 });
}
