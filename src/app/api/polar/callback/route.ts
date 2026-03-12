import { NextRequest, NextResponse } from "next/server";
import { exchangePolarCode, registerPolarUser } from "@/lib/polar/oauth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/settings?error=polar_denied", request.url)
    );
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const tokenData = await exchangePolarCode(code);
    const polarUserId = String(tokenData.x_user_id);

    // Register in AccessLink
    await registerPolarUser(tokenData.access_token);

    const admin = createAdminClient();
    await admin.from("rm_polar_connections").upsert(
      {
        user_id: user.id,
        polar_user_id: polarUserId,
        access_token: tokenData.access_token,
        expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
        scope: "accesslink.read_all",
      },
      { onConflict: "user_id" }
    );

    return NextResponse.redirect(
      new URL("/settings?success=polar_connected", request.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/settings?error=polar_failed", request.url)
    );
  }
}
