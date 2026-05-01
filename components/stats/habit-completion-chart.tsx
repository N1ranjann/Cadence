"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, subDays } from "date-fns";
import { useTheme } from "next-themes";

interface HabitCompletionChartProps {
  data: Record<string, number>;
}

export function HabitCompletionChart({ data }: HabitCompletionChartProps) {
  const { theme } = useTheme();

  // Generate last 30 days array to ensure no gaps in the chart
  const today = new Date();
  const chartData = Array.from({ length: 30 })
    .map((_, i) => {
      const date = subDays(today, 29 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      return {
        date: format(date, "MMM d"),
        fullDate: dateStr,
        completions: data[dateStr] || 0,
      };
    });

  const textColor = theme === "dark" ? "#888888" : "#555555";

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={20}
          />
          <YAxis
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground">
                          Date
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {payload[0].payload.fullDate}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground">
                          Completed
                        </span>
                        <span className="font-bold">
                          {payload[0].value} habits
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="completions"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-primary"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
