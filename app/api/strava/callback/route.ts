import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("Strava OAuth error:", error);
    return NextResponse.redirect(new URL("/settings?error=strava_auth_failed", req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/settings?error=no_code", req.url));
  }

  const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
  const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

  try {
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: STRAVA_CLIENT_ID!,
        client_secret: STRAVA_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Strava token exchange failed:", errorData);
      throw new Error("Failed to exchange code for token");
    }

    const data = await response.json();

    // Ensure we have athlete info
    if (!data.athlete?.id) {
      throw new Error("No athlete info in response");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        strava_access_token: data.access_token,
        strava_refresh_token: data.refresh_token,
        strava_token_expires_at: data.expires_at,
        strava_athlete_id: data.athlete.id.toString(),
      },
    });

    // Optionally, we could trigger an initial sync here in the background

    return NextResponse.redirect(new URL("/settings?success=strava_connected", req.url));
  } catch (error) {
    console.error("Strava callback error:", error);
    return NextResponse.redirect(new URL("/settings?error=strava_connection_failed", req.url));
  }
}
