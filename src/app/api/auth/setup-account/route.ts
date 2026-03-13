import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshStravaToken } from "@/lib/strava/oauth";

export async function POST(req: NextRequest) {
  const { email, password, provider } = await req.json();

  if (!email || !password || !provider) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only allowed for synthetic Strava accounts
  if (!user.email?.endsWith("@runmilha.app")) {
    return NextResponse.json({ error: "Not applicable" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Update email and set password — Supabase returns error if email already taken
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Now disconnect the provider
  const TABLE_MAP: Record<string, string> = {
    strava: "rm_strava_connections",
    polar: "rm_polar_connections",
    garmin: "rm_garmin_connections",
  };

  if (provider === "strava") {
    const { data: connection } = await admin
      .from("rm_strava_connections")
      .select("access_token, refresh_token, expires_at")
      .eq("user_id", user.id)
      .single();

    if (connection) {
      try {
        let accessToken = connection.access_token;
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

  await admin.from(TABLE_MAP[provider]).delete().eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
