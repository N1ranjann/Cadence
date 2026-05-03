import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { subDays, startOfWeek, endOfWeek } from "date-fns";

export async function GET() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Habit completion stats (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const logs = await prisma.habitLog.findMany({
      where: {
        userId,
        completedAt: { gte: thirtyDaysAgo },
      },
    });

    const totalCompletions = logs.length;

    // Group logs by date for the activity chart
    const completionsByDate = logs.reduce((acc, log) => {
      const dateStr = log.completedAt.toISOString().split("T")[0];
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 2. Strava distance stats (this week)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const recentActivities = await prisma.stravaActivity.findMany({
      where: {
        userId,
        startDate: { gte: weekStart, lte: weekEnd },
      },
    });

    // Distance is in meters, convert to kilometers
    const weeklyDistanceKm =
      recentActivities.reduce((sum, act) => sum + act.distance, 0) / 1000;

    // Get user goal
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { weeklyDistanceGoal: true },
    });

    return NextResponse.json({
      habits: {
        totalCompletionsLast30Days: totalCompletions,
        completionsByDate,
      },
      strava: {
        weeklyDistanceKm: parseFloat(weeklyDistanceKm.toFixed(1)),
        weeklyGoalKm: user?.weeklyDistanceGoal || 0,
        activityCount: recentActivities.length,
        recentActivities, // Added for the Strava page
      },
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
