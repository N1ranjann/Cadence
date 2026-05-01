"use client";

import { format, subDays, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface HabitLog {
  id: string;
  completedAt: string;
}

interface HabitHeatmapProps {
  logs: HabitLog[];
  color: string;
}

export function HabitHeatmap({ logs, color }: HabitHeatmapProps) {
  // Generate array of last 30 days
  const today = new Date();
  const days = Array.from({ length: 30 }).map((_, i) => subDays(today, 29 - i));

  // Create a fast lookup Set for completed dates
  const completedDateStrings = new Set(
    logs.map((log) => log.completedAt.split("T")[0])
  );

  return (
    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
      {days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const isCompleted = completedDateStrings.has(dateStr);
        const isToday = isSameDay(day, today);

        return (
          <div
            key={dateStr}
            title={`${format(day, "MMM d, yyyy")}${
              isCompleted ? " (Completed)" : ""
            }`}
            className={cn(
              "w-4 h-4 rounded-sm flex-shrink-0 transition-colors",
              isToday && "ring-2 ring-offset-1 ring-border ring-offset-background"
            )}
            style={{
              backgroundColor: isCompleted ? color : undefined,
            }}
            // Use tailwind bg for empty state, inline style for dynamic color
            {...(!isCompleted && { className: cn("w-4 h-4 rounded-sm flex-shrink-0 bg-muted", isToday && "ring-2 ring-offset-1 ring-border ring-offset-background") })}
          />
        );
      })}
    </div>
  );
}
