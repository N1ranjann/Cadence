"use client";

import { useEffect, useState } from "react";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitForm } from "@/components/habits/habit-form";
import { Flame } from "lucide-react";

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/habits");
      if (res.ok) {
        const data = await res.json();
        setHabits(data.habits || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Habits</h1>
          <p className="text-muted-foreground mt-1">Manage and track your daily routines.</p>
        </div>
        <HabitForm onCreated={fetchHabits} />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl bg-card/50">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Flame className="size-8 text-primary/50" />
          </div>
          <h3 className="text-lg font-semibold">No habits yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-2 mb-6">
            Create your first habit to start tracking your progress and building consistency.
          </p>
          <HabitForm onCreated={fetchHabits} />
        </div>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <HabitCard key={habit.id} habit={habit} onUpdate={fetchHabits} />
          ))}
        </div>
      )}
    </div>
  );
}
