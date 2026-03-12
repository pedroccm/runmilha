import { NextRequest, NextResponse } from "next/server";
import { exchangeGarminCode } from "@/lib/garmin/oauth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/login?error=garmin_denied", request.url)
    );
  }

  try {
    const tokenData = await exchangeGarminCode(code);
    const admin = createAdminClient();

    // Check if this Garmin user is already linked
    const { data: existingConnection } = await admin
      .from("rm_garmin_connections")
      .select("user_id")
      .eq("garmin_user_id", tokenData.userId)
      .single();

    let userId: string;

    if (existingConnection) {
      userId = existingConnection.user_id;

      await admin
        .from("rm_garmin_connections")
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
        })
        .eq("user_id", userId);
    } else {
      // New user — create account
      const email = `garmin_${tokenData.userId}@runmilha.app`;
      const fullName = tokenData.displayName;

      const { data: newUser, error: createError } =
        await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            garmin_user_id: tokenData.userId,
          },
        });

      if (createError || !newUser.user) {
        throw new Error(createError?.message || "Failed to create user");
      }

      userId = newUser.user.id;
      await new Promise((r) => setTimeout(r, 500));

      await admin
        .from("rm_users")
        .update({ full_name: fullName })
        .eq("id", userId);

      await admin.from("rm_garmin_connections").insert({
        user_id: userId,
        garmin_user_id: tokenData.userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
        scope: "activity_read",
      });
    }

    // Generate magic link
    const email = existingConnection
      ? (await admin.auth.admin.getUserById(userId)).data.user?.email
      : `garmin_${tokenData.userId}@runmilha.app`;

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email: email!,
      });

    if (linkError || !linkData) {
      throw new Error(linkError?.message || "Failed to generate login link");
    }

    const verifyUrl = new URL("/callback", request.url);
    verifyUrl.searchParams.set("token_hash", linkData.properties.hashed_token);
    verifyUrl.searchParams.set("type", "magiclink");

    return NextResponse.redirect(verifyUrl.toString());
  } catch (err) {
    console.error("Garmin login error:", err);
    return NextResponse.redirect(
      new URL("/login?error=garmin_failed", request.url)
    );
  }
}
