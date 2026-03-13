import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
      .select("access_token")
      .eq("user_id", user.id)
      .single();

    if (connection?.access_token) {
      await fetch("https://www.strava.com/oauth/deauthorize", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `access_token=${connection.access_token}`,
      }).catch(() => {});
    }
  }

  await admin.from(TABLE_MAP[provider]).delete().eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
