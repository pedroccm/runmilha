import { NextRequest, NextResponse } from "next/server";
import { exchangeStravaCode } from "@/lib/strava/oauth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/login?error=strava_denied", request.url)
    );
  }

  try {
    // Exchange code for tokens + athlete data
    const tokenData = await exchangeStravaCode(code);
    const athlete = tokenData.athlete;

    const admin = createAdminClient();

    // Check if this Strava athlete is already linked to a user
    const { data: existingConnection } = await admin
      .from("rm_strava_connections")
      .select("user_id")
      .eq("strava_athlete_id", athlete.id)
      .single();

    let userId: string;

    if (existingConnection) {
      // Existing user — just update tokens
      userId = existingConnection.user_id;

      await admin
        .from("rm_strava_connections")
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_at,
        })
        .eq("user_id", userId);
    } else {
      // New user — create account via Supabase Auth
      const email = `strava_${athlete.id}@runmilha.app`;
      const fullName = `${athlete.firstname} ${athlete.lastname}`.trim();

      const { data: newUser, error: createError } =
        await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            avatar_url: athlete.profile,
            strava_athlete_id: athlete.id,
          },
        });

      if (createError || !newUser.user) {
        throw new Error(createError?.message || "Failed to create user");
      }

      userId = newUser.user.id;

      try {
        // Wait for the trigger to create rm_users + rm_wallets, then update with Strava data
        await new Promise((r) => setTimeout(r, 500));

        await admin
          .from("rm_users")
          .update({
            full_name: fullName,
            avatar_url: athlete.profile,
          })
          .eq("id", userId);

        // Create Strava connection
        await admin.from("rm_strava_connections").insert({
          user_id: userId,
          strava_athlete_id: athlete.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_at,
          scope: "read,activity:read_all",
        });
      } catch (setupError) {
        // Rollback: delete the auth user so it doesn't become a phantom
        await admin.auth.admin.deleteUser(userId);
        throw setupError;
      }
    }

    // Generate magic link to sign in the user
    const email =
      existingConnection
        ? (
            await admin.auth.admin.getUserById(userId)
          ).data.user?.email
        : `strava_${athlete.id}@runmilha.app`;

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email: email!,
      });

    if (linkError || !linkData) {
      throw new Error(linkError?.message || "Failed to generate login link");
    }

    // Extract the token from the magic link and redirect to callback
    const magicLinkUrl = new URL(linkData.properties.action_link);
    const token_hash = magicLinkUrl.searchParams.get("token") || magicLinkUrl.hash;

    // Build the verification URL that Supabase auth will handle
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://runmilha.netlify.app";
    const verifyUrl = new URL("/callback", appUrl);
    verifyUrl.searchParams.set("token_hash", linkData.properties.hashed_token);
    verifyUrl.searchParams.set("type", "magiclink");

    return NextResponse.redirect(verifyUrl.toString());
  } catch (err) {
    console.error("Strava login error:", err);
    return NextResponse.redirect(
      new URL("/login?error=strava_failed", request.url)
    );
  }
}
