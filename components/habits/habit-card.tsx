"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Check, Flame, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HabitLog {
  id: string;
  completedAt: string;
}

interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  targetDaysPerWeek: number;
  logs: HabitLog[];
}

interface HabitCardProps {
  habit: Habit;
  onUpdate: () => void;
}

export function HabitCard({ habit, onUpdate }: HabitCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Check if completed today based on the logs
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const isCompletedToday = habit.logs.some((log) => {
    // Assuming completedAt is ISO string from API
    const logDateStr = log.completedAt.split("T")[0];
    return logDateStr === todayStr;
  });

  const toggleHabit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/habits/${habit.id}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayStr }),
      });

      if (!res.ok) throw new Error("Failed to toggle habit");
      
      const data = await res.json();
      if (data.status === "added") {
        toast.success(`Completed ${habit.name}!`);
      }
      
      onUpdate();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHabit = async () => {
    if (!confirm("Are you sure you want to delete this habit?")) return;
    
    try {
      const res = await fetch(`/api/habits/${habit.id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) throw new Error("Failed to delete habit");
      toast.success("Habit deleted");
      onUpdate();
    } catch {
      toast.error("Failed to delete habit");
    }
  };

  // Calculate current streak (naive implementation for UI)
  const calculateStreak = () => {
    if (habit.logs.length === 0) return 0;
    
    let streak = 0;
    const currentDate = new Date();
    
    // If not completed today, start checking from yesterday
    if (!isCompletedToday) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    const logDates = new Set(
      habit.logs.map(log => log.completedAt.split("T")[0])
    );

    while (true) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      if (logDates.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl transition-all hover:border-primary/20 hover:shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleHabit}
          disabled={isLoading}
          className={cn(
            "flex items-center justify-center size-12 rounded-full border-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
            isCompletedToday 
              ? "bg-primary border-primary text-primary-foreground" 
              : "bg-transparent border-muted-foreground/30 hover:border-primary/50 text-transparent hover:text-primary/20"
          )}
          style={{
            backgroundColor: isCompletedToday ? habit.color : "transparent",
            borderColor: isCompletedToday ? habit.color : undefined,
          }}
        >
          <Check className="size-6" strokeWidth={isCompletedToday ? 3 : 2} />
        </button>
        
        <div>
          <h3 className="font-semibold flex items-center gap-2 text-lg">
            <span>{habit.emoji}</span>
            {habit.name}
          </h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Flame className={cn("size-3.5", streak > 0 && "text-orange-500")} />
              {streak} day streak
            </span>
            <span className="opacity-50">•</span>
            <span>{habit.targetDaysPerWeek}x / week</span>
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground outline-none transition-colors">
          <MoreVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={deleteHabit} className="text-destructive focus:text-destructive">
            Delete Habit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
