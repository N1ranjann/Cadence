"use client";

import { useEffect, useState } from "react";
import { StravaActivityCard as ActivityCard } from "@/components/strava/strava-activity-card";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCcw } from "lucide-react";

export default function StravaPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const fetchStatusAndActivities = async () => {
    try {
      console.log("Fetching Strava status and activities...");
      setLoading(true);
      // Fetch connection status
      const userRes = await fetch("/api/user");
      if (userRes.ok) {
        const userData = await userRes.json();
        console.log("User data fetched:", userData);
        setIsConnected(!!userData.strava_athlete_id);
      } else {
        console.warn("Failed to fetch user status", userRes.status);
      }

      // Fetch activities from our DB (cached)
      const statsRes = await fetch("/api/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log("Stats data fetched:", statsData);
        if (statsData.strava?.recentActivities) {
          setActivities(statsData.strava.recentActivities);
        }
      } else {
        console.warn("Failed to fetch stats", statsRes.status);
      }
    } catch (e) {
      console.error("Error in fetchStatusAndActivities:", e);
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  const syncStrava = async () => {
    try {
      setSyncing(true);
      await fetch("/api/strava/sync", { method: "POST" });
      await fetchStatusAndActivities();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchStatusAndActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin size-8 border-4 border-[#FC4C02] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strava Integration</h1>
          <p className="text-muted-foreground mt-1">Connect your account to sync activities.</p>
        </div>
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl bg-card/50">
          <Activity className="size-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Not Connected</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-2 mb-6">
            Connect your Strava account to automatically sync your runs and rides to Cadence.
          </p>
          <Button onClick={() => window.location.href = "/api/strava/connect"} className="bg-[#FC4C02] hover:bg-[#FC4C02]/90 text-white">
            Connect with Strava
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recent Activities</h1>
          <p className="text-muted-foreground mt-1">Your latest runs and rides from Strava.</p>
        </div>
        <Button onClick={syncStrava} disabled={syncing} variant="outline" className="gap-2">
          <RefreshCcw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Now"}
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl text-muted-foreground">
          No recent activities found. Go for a run!
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
