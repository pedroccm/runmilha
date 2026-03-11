import { NextRequest, NextResponse } from "next/server";
import { exchangeStravaCode } from "@/lib/strava/oauth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/settings?error=strava_denied", request.url)
    );
  }

  try {
    // Get current user from session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Exchange code for tokens
    const tokenData = await exchangeStravaCode(code);

    // Store connection using admin client (bypasses RLS)
    const admin = createAdminClient();
    await admin.from("rm_strava_connections").upsert(
      {
        user_id: user.id,
        strava_athlete_id: tokenData.athlete.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        scope: "read,activity:read_all",
      },
      { onConflict: "user_id" }
    );

    // Update user avatar if not set
    if (tokenData.athlete.profile) {
      await admin
        .from("rm_users")
        .update({ avatar_url: tokenData.athlete.profile })
        .eq("id", user.id)
        .is("avatar_url", null);
    }

    return NextResponse.redirect(
      new URL("/settings?success=strava_connected", request.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/settings?error=strava_failed", request.url)
    );
  }
}
