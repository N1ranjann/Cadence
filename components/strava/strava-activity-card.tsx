"use client";

import { ActivityMap } from "./activity-map";
import { format, parseISO } from "date-fns";
import { Activity, Mountain, Timer } from "lucide-react";

interface StravaActivity {
  id: string;
  stravaId: string;
  name: string;
  type: string;
  distance: number;
  movingTime: number;
  elevationGain: number;
  startDate: string;
  polyline: string | null;
}

export function StravaActivityCard({ activity }: { activity: StravaActivity }) {
  // Convert distance from meters to km
  const distanceKm = (activity.distance / 1000).toFixed(2);
  
  // Convert moving time from seconds to hr/min format
  const hours = Math.floor(activity.movingTime / 3600);
  const minutes = Math.floor((activity.movingTime % 3600) / 60);
  const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Format date
  // Handle case where date comes from Prisma directly (Date object) or via API (string)
  const dateObj = typeof activity.startDate === 'string' ? parseISO(activity.startDate) : new Date(activity.startDate);
  const dateStr = format(dateObj, "MMM d, yyyy 'at' h:mm a");

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/20 transition-all">
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg leading-tight">{activity.name}</h3>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 whitespace-nowrap ml-2">
            {activity.type}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{dateStr}</p>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-card">
        <div className="p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <Activity className="size-3" /> Distance
          </p>
          <p className="font-semibold">{distanceKm} km</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <Timer className="size-3" /> Time
          </p>
          <p className="font-semibold">{timeStr}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <Mountain className="size-3" /> Elev
          </p>
          <p className="font-semibold">{Math.round(activity.elevationGain)} m</p>
        </div>
      </div>

      {activity.polyline ? (
        <ActivityMap summaryPolyline={activity.polyline} />
      ) : (
        <div className="w-full h-12 bg-muted/30 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">No map data available</span>
        </div>
      )}
    </div>
  );
}
