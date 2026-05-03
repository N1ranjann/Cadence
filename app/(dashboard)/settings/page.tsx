"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Activity, LogOut, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(console.error);
  }, []);

  const handleDisconnectStrava = async () => {
    if (!confirm("Are you sure you want to disconnect Strava?")) return;
    try {
      const res = await fetch("/api/strava/disconnect", { method: "POST" });
      if (res.ok) {
        toast.success("Strava disconnected");
        setUser({ ...user, strava_athlete_id: null });
      }
    } catch {
      toast.error("Failed to disconnect Strava");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <div className="space-y-6 mt-8">
        <div className="p-6 bg-card border border-border rounded-xl space-y-4">
          <h2 className="text-xl font-semibold">Profile</h2>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{user?.name || "Loading..."}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email || "Loading..."}</p>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="size-5 text-[#FC4C02]" />
                Strava Connection
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.strava_athlete_id ? "Your account is connected to Strava." : "Connect to automatically sync your runs."}
              </p>
            </div>
            {user?.strava_athlete_id ? (
              <Button variant="destructive" onClick={handleDisconnectStrava} className="gap-2">
                <Trash2 className="size-4" />
                Disconnect
              </Button>
            ) : (
              <Button onClick={() => window.location.href = "/api/strava/connect"} className="bg-[#FC4C02] hover:bg-[#FC4C02]/90 text-white">
                Connect Strava
              </Button>
            )}
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">Log out of your Cadence account on this device.</p>
          <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="size-4" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
