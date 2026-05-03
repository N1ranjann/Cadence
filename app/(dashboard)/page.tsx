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
      },
    },
    take: 3,
  });

  // Simple streak calculation for each habit
  const habitsWithStreaks = habits.map(habit => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const logDates = new Set(habit.logs.map(l => {
      const d = new Date(l.completedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }));

    let current = today;
    // If not logged today, check if logged yesterday to keep streak alive
    if (!logDates.has(current.getTime())) {
      current = new Date(today);
      current.setDate(current.getDate() - 1);
    }

    while (logDates.has(current.getTime())) {
      streak++;
      current = new Date(current);
      current.setDate(current.getDate() - 1);
    }

    return { ...habit, streak };
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Habit Consistency</h2>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <div className="space-y-8">
              {habitsWithStreaks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 italic">No habits tracking yet. Add some in the Habits tab!</p>
              ) : (
                habitsWithStreaks.map(habit => (
                  <div key={habit.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{habit.emoji}</span>
                        <span className="font-semibold">{habit.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-medium">
                          {habit.streak} day streak
                        </span>
                        <span className="text-muted-foreground">
                          {habit.logs.length} total logs
                        </span>
                      </div>
                    </div>
                    <HabitHeatmap logs={habit.logs.slice(0, 30).map(l => ({ id: l.id, completedAt: l.completedAt.toISOString() }))} color={habit.color} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <StravaGoalProgress currentKm={currentKm} goalKm={user.weeklyDistanceGoal || 0} />
          
          <div className="p-6 bg-card border border-border rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Habits</span>
                <span className="font-semibold">{habits.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Strava Linked</span>
                <span className="font-semibold text-orange-500">{user.strava_athlete_id ? "Yes" : "No"}</span>
              </div>
              {user.weeklyDistanceGoal === 0 && (
                <div className="pt-2">
                  <p className="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded-lg leading-relaxed">
                    💡 Tip: Set a weekly distance goal in Settings to track your running progress.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
