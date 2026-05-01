import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { fetchStravaActivities } from "@/lib/strava";

export async function POST() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch last 30 activities
    const activities = await fetchStravaActivities(userId, 1, 30);

    let syncedCount = 0;

    for (const activity of activities) {
      // Upsert activity to cache
      await prisma.stravaActivity.upsert({
        where: { stravaId: activity.id.toString() },
        update: {
          name: activity.name,
          type: activity.type,
          distance: activity.distance,
          movingTime: activity.moving_time,
          elevationGain: activity.total_elevation_gain,
          polyline: activity.map?.summary_polyline,
        },
        create: {
          userId,
          stravaId: activity.id.toString(),
          name: activity.name,
          type: activity.type,
          distance: activity.distance,
          movingTime: activity.moving_time,
          elevationGain: activity.total_elevation_gain,
          startDate: new Date(activity.start_date),
          polyline: activity.map?.summary_polyline,
        },
      });

      syncedCount++;
    }

    // Advanced: Automatic habit logging
    // Here we could find habits related to "Run" or "Exercise" and automatically
    // create a HabitLog if an activity exists for that day.
    // For now, we just cache the activities.

    return NextResponse.json({ success: true, count: syncedCount });
  } catch (error) {
    console.error("Strava sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Strava activities" },
      { status: 500 }
    );
  }
}
