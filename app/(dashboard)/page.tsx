import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { HabitHeatmap } from "@/components/habits/habit-heatmap";
import { StravaGoalProgress } from "@/components/stats/strava-goal-progress";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch data for the dashboard
  const habits = await prisma.habit.findMany({
    where: { userId: user.id, isArchived: false },
    include: {
      logs: {
        orderBy: { completedAt: "desc" },
        take: 30,
      },
    },
    take: 3,
  });

  // Calculate weekly running distance
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const recentActivities = await prisma.stravaActivity.findMany({
    where: {
      userId: user.id,
      startDate: { gte: weekStart, lte: weekEnd },
    },
  });

  const currentKm = recentActivities.reduce((sum, act) => sum + act.distance, 0) / 1000;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Good morning, {user.name?.split(" ")[0] || "there"}!</h1>
        <p className="text-muted-foreground mt-1">Here is your daily cadence overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-card border border-border rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Habit Consistency</h2>
            <div className="space-y-6">
              {habits.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 italic">No habits tracking yet. Add some in the Habits tab!</p>
              ) : (
                habits.map(habit => (
                  <div key={habit.id} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">{habit.emoji} {habit.name}</span>
                    </div>
                    <HabitHeatmap logs={habit.logs.map(l => ({ id: l.id, completedAt: l.completedAt.toISOString() }))} color={habit.color} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <StravaGoalProgress currentKm={currentKm} goalKm={user.weeklyDistanceGoal || 0} />
          
          <div className="p-6 bg-card border border-border rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Quick Stats</h2>
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Habits</span>
                <span className="font-semibold">{habits.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Strava Linked</span>
                <span className="font-semibold text-orange-500">{user.strava_athlete_id ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
