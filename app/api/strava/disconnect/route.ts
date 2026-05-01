import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Note: We could optionally call Strava's deauthorize endpoint here
    // https://www.strava.com/oauth/deauthorize

    // Remove Strava data from user
    await prisma.user.update({
      where: { id: userId },
      data: {
        strava_access_token: null,
        strava_refresh_token: null,
        strava_token_expires_at: null,
        strava_athlete_id: null,
      },
    });

    // Optionally delete cached activities
    await prisma.stravaActivity.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Strava disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Strava" },
      { status: 500 }
    );
  }
}
