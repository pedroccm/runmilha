import { NextRequest, NextResponse } from "next/server";
import { exchangeGarminCode } from "@/lib/garmin/oauth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/settings?error=garmin_denied", request.url)
    );
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const tokenData = await exchangeGarminCode(code);

    const admin = createAdminClient();
    await admin.from("rm_garmin_connections").upsert(
      {
        user_id: user.id,
        garmin_user_id: tokenData.userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
        scope: "activity_read",
      },
      { onConflict: "user_id" }
    );

    return NextResponse.redirect(
      new URL("/settings?success=garmin_connected", request.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/settings?error=garmin_failed", request.url)
    );
  }
}
