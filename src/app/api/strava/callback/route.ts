import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { exchangeStravaCode } from "@/lib/strava/oauth";
import { createAdminClient } from "@/lib/supabase/admin";

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
    // Build the redirect response first so we can attach cookies to it
    const successRedirect = NextResponse.redirect(
      new URL("/settings?success=strava_connected", request.url)
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

    return successRedirect;
  } catch {
    return NextResponse.redirect(
      new URL("/settings?error=strava_failed", request.url)
    );
  }
}
