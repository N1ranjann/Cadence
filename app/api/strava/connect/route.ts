import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-utils";

export async function GET(req: Request) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const host = url.host;
  const protocol = url.protocol;
  const redirectUri = `${protocol}//${host}/api/strava/callback`;

  const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;

  if (!STRAVA_CLIENT_ID) {
    return NextResponse.json(
      { error: "Strava client ID not configured" },
      { status: 500 }
    );
  }

  const scope = "read,activity:read_all";
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&approval_prompt=force&scope=${scope}`;

  return NextResponse.redirect(authUrl);
}
