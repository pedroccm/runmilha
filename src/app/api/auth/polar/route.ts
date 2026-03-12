import { NextRequest, NextResponse } from "next/server";
import { exchangePolarCode, registerPolarUser } from "@/lib/polar/oauth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/login?error=polar_denied", request.url)
    );
  }

  try {
    const tokenData = await exchangePolarCode(code);
    const polarUserId = String(tokenData.x_user_id);

    // Register user in Polar AccessLink
    await registerPolarUser(tokenData.access_token);

    const admin = createAdminClient();

    // Check if this Polar user is already linked
    const { data: existingConnection } = await admin
      .from("rm_polar_connections")
      .select("user_id")
      .eq("polar_user_id", polarUserId)
      .single();

    let userId: string;

    if (existingConnection) {
      userId = existingConnection.user_id;

      await admin
        .from("rm_polar_connections")
        .update({
          access_token: tokenData.access_token,
          expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
        })
        .eq("user_id", userId);
    } else {
      // New user — create account
      const email = `polar_${polarUserId}@runmilha.app`;

      const { data: newUser, error: createError } =
        await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: "Polar User",
            polar_user_id: polarUserId,
          },
        });

      if (createError || !newUser.user) {
        throw new Error(createError?.message || "Failed to create user");
      }

      userId = newUser.user.id;
      await new Promise((r) => setTimeout(r, 500));

      await admin.from("rm_polar_connections").insert({
        user_id: userId,
        polar_user_id: polarUserId,
        access_token: tokenData.access_token,
        expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
        scope: "accesslink.read_all",
      });
    }

    // Generate magic link
    const email = existingConnection
      ? (await admin.auth.admin.getUserById(userId)).data.user?.email
      : `polar_${polarUserId}@runmilha.app`;

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
    console.error("Polar login error:", err);
    return NextResponse.redirect(
      new URL("/login?error=polar_failed", request.url)
    );
  }
}
