import { prisma } from "./prisma";

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

export async function refreshStravaToken(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      strava_refresh_token: true,
      strava_token_expires_at: true,
    },
  });

  if (!user || !user.strava_refresh_token) {
    throw new Error("No Strava integration found for user.");
  }

  // Check if token is still valid (with 5 min buffer)
  const now = Math.floor(Date.now() / 1000);
  if (user.strava_token_expires_at && user.strava_token_expires_at > now + 300) {
    // Token still valid, just return the current access token
    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { strava_access_token: true },
    });
    return fullUser?.strava_access_token;
  }

  // Refresh the token
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: STRAVA_CLIENT_ID!,
      client_secret: STRAVA_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: user.strava_refresh_token,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Strava token");
  }

  const data = await response.json();

  await prisma.user.update({
    where: { id: userId },
    data: {
      strava_access_token: data.access_token,
      strava_refresh_token: data.refresh_token,
      strava_token_expires_at: data.expires_at,
    },
  });

  return data.access_token;
}

export async function fetchStravaActivities(userId: string, page = 1, perPage = 30) {
  const accessToken = await refreshStravaToken(userId);

  const response = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Strava activities");
  }

  return response.json();
}
