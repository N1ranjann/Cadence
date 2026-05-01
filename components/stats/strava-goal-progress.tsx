"use client";

import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

interface StravaGoalProgressProps {
  currentKm: number;
  goalKm: number;
}

export function StravaGoalProgress({ currentKm, goalKm }: StravaGoalProgressProps) {
  const percentage = goalKm > 0 ? Math.min(Math.round((currentKm / goalKm) * 100), 100) : 0;
  const isCompleted = percentage >= 100;

  return (
    <div className="bg-card border border-border p-5 rounded-xl">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-1">
            <Target className="size-5 text-orange-500" /> 
            Weekly Running Goal
          </h3>
          <p className="text-sm text-muted-foreground">
            {isCompleted 
              ? "You've crushed your weekly goal! 🎉" 
              : "Keep it up! You're making good progress."}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-3xl font-bold">{currentKm.toFixed(1)}</span>
            <span className="text-muted-foreground font-medium">/ {goalKm} km</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={percentage} className="h-3" indicatorClassName="bg-orange-500" />
        <div className="flex justify-between text-xs font-medium">
          <span className="text-muted-foreground">0%</span>
          <span className={isCompleted ? "text-orange-500 font-bold" : "text-muted-foreground"}>
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}
