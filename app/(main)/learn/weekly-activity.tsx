"use client";

import type { WeeklyActivityDay } from "@/db/queries";

type Props = {
  data: WeeklyActivityDay[];
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDay(); // 0 = Sun
  return DAY_LABELS[day === 0 ? 6 : day - 1];
}

function isToday(dateStr: string): boolean {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  return dateStr === todayStr;
}

function getActivityColor(count: number): string {
  if (count === 0) return "bg-neutral-100";
  if (count === 1) return "bg-green-200";
  return "bg-green-500";
}

function getActivityTextColor(count: number): string {
  if (count === 0) return "text-neutral-400";
  if (count === 1) return "text-green-700";
  return "text-white";
}

export const WeeklyActivity = ({ data }: Props) => {
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-neutral-800">This week</p>
        <span className="text-xs font-medium text-neutral-500">
          {totalCount} lesson{totalCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-end gap-2">
        {data.map((day) => {
          const today = isToday(day.date);
          return (
            <div
              key={day.date}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <div
                className={[
                  "flex h-9 w-full items-center justify-center rounded-lg text-xs font-semibold transition-colors",
                  getActivityColor(day.count),
                  getActivityTextColor(day.count),
                  today ? "ring-2 ring-green-600 ring-offset-1" : "",
                ].join(" ")}
                aria-label={`${getDayLabel(day.date)}: ${day.count} lesson${day.count !== 1 ? "s" : ""}`}
              >
                {day.count > 0 ? day.count : ""}
              </div>
              <span
                className={[
                  "text-[11px] leading-none",
                  today
                    ? "font-semibold text-green-600"
                    : "font-medium text-neutral-400",
                ].join(" ")}
              >
                {getDayLabel(day.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
