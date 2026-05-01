import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { HabitHeatmap } from "@/components/habits/habit-heatmap";
import { StravaGoalProgress } from "@/components/stats/strava-goal-progress";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Good morning, {user.name?.split(" ")[0] || "there"}!</h1>
        <p className="text-muted-foreground mt-1">Here is your daily cadence overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-card border border-border rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Activity Heatmap</h2>
            {/* We'll pass empty data for now or fetch it from API */}
            <HabitHeatmap logs={[]} color="#2dd4bf" />
          </div>
        </div>
        <div className="space-y-6">
          <StravaGoalProgress currentKm={0} goalKm={20} />
        </div>
      </div>
    </div>
  );
}
