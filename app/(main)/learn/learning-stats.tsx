"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, Flame, GraduationCap, Target } from "lucide-react";

import type { LearningStatsData } from "@/db/queries";

type Props = {
  stats: LearningStatsData;
};

export const LearningStats = ({ stats }: Props) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="w-full rounded-xl border border-neutral-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between"
        aria-expanded={isExpanded}
      >
        <h3 className="text-sm font-bold text-neutral-700">Learning stats</h3>
        <ChevronDown
          className={[
            "h-4 w-4 text-neutral-400 transition-transform duration-200",
            isExpanded ? "" : "-rotate-90",
          ].join(" ")}
        />
      </button>

      {isExpanded && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-x-2.5 rounded-lg bg-orange-50 px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-neutral-700 truncate">
                {stats.currentStreak > 0 ? `${stats.currentStreak} days` : "0"}
              </span>
              <span className="text-[11px] text-neutral-500">Streak</span>
            </div>
          </div>

          <div className="flex items-center gap-x-2.5 rounded-lg bg-green-50 px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
              <BookOpen className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-neutral-700 truncate">
                {stats.totalWordsLearned}
              </span>
              <span className="text-[11px] text-neutral-500">Words</span>
            </div>
          </div>

          <div className="flex items-center gap-x-2.5 rounded-lg bg-blue-50 px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-neutral-700 truncate">
                {stats.totalLessonsCompleted}
              </span>
              <span className="text-[11px] text-neutral-500">Lessons</span>
            </div>
          </div>

          <div className="flex items-center gap-x-2.5 rounded-lg bg-purple-50 px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-neutral-700 truncate">
                {stats.averageAccuracy}%
              </span>
              <span className="text-[11px] text-neutral-500">Accuracy</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
