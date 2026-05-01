"use client";

import { useEffect, useState } from "react";
import { HabitCompletionChart } from "@/components/stats/habit-completion-chart";
import { StravaGoalProgress } from "@/components/stats/strava-goal-progress";
import { BarChart2 } from "lucide-react";

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Statistics</h1>
        <p className="text-muted-foreground mt-1">Detailed overview of your progress.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : stats ? (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Habits</h3>
              <p className="text-3xl font-bold">{stats.completionData?.length || 0}</p>
            </div>
            <div className="p-6 bg-card border border-border rounded-xl">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Strava Activities</h3>
              <p className="text-3xl font-bold">{stats.recentActivities?.length || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HabitCompletionChart data={stats.completionData || []} />
            <div className="p-6 bg-card border border-border rounded-xl flex flex-col justify-center">
              <StravaGoalProgress currentKm={stats.currentKm || 0} goalKm={stats.goalKm || 20} />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-xl flex flex-col items-center">
          <BarChart2 className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Unable to load statistics.</p>
        </div>
      )}
    </div>
  );
}
