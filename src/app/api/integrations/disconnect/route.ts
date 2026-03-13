import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { refreshStravaToken } from "@/lib/strava/oauth";

const TABLE_MAP: Record<string, string> = {
  strava: "rm_strava_connections",
  polar: "rm_polar_connections",
  garmin: "rm_garmin_connections",
};

export async function DELETE(req: NextRequest) {
  const { provider } = await req.json();

  if (!provider || !TABLE_MAP[provider]) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If user logged in via Strava (synthetic email), require password setup first
  if (provider === "strava" && user.email?.endsWith("@runmilha.app")) {
    return NextResponse.json({ requiresPasswordSetup: true }, { status: 200 });
  }

  // For Strava, revoke token on their side first
  if (provider === "strava") {
    const { data: connection } = await supabase
      .from("rm_strava_connections")
      .select("access_token, refresh_token, expires_at")
      .eq("user_id", user.id)
      .single();

    if (connection) {
      try {
        let accessToken = connection.access_token;

        // Refresh token if expired (Strava tokens expire every 6h)
        const now = Math.floor(Date.now() / 1000);
        if (connection.expires_at <= now + 60) {
          const refreshed = await refreshStravaToken(connection.refresh_token);
          accessToken = refreshed.access_token;
        }

        await fetch("https://www.strava.com/oauth/deauthorize", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `access_token=${accessToken}`,
        });
      } catch {
        // Non-critical: proceed with local deletion even if Strava revocation fails
      }
    }
  }

  const { error } = await supabase
    .from(TABLE_MAP[provider])
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
