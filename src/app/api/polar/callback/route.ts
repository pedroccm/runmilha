import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { exchangePolarCode, registerPolarUser } from "@/lib/polar/oauth";
import { createAdminClient } from "@/lib/supabase/admin";

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
    // Build the redirect response first so we can attach cookies to it
    const successRedirect = NextResponse.redirect(
      new URL("/settings?success=polar_connected", request.url)
    );

    // Create Supabase client bound to the redirect response so refreshed
    // session cookies are carried along with the redirect
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              successRedirect.cookies.set(name, value, options as never);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    return successRedirect;
  } catch {
    return NextResponse.redirect(
      new URL("/settings?error=polar_failed", request.url)
    );
  }
}
