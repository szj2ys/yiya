import { CheckCircle2, Target } from "lucide-react";

import { Progress } from "@/components/ui/progress";

type Props = {
  lastLessonAt: Date | null;
  completedLessons: number;
  totalLessons: number;
  dailyGoal: number;
};

/**
 * Counts how many lessons the user completed "today" by comparing
 * the lastLessonAt timestamp to the current date.
 *
 * Approximation: since we only store a single `lastLessonAt` timestamp
 * (not per-lesson timestamps), we can only know whether the user had
 * *at least one* lesson today. We therefore show min(1, dailyGoal)
 * when a lesson was completed today. This will be more accurate once
 * per-lesson completion timestamps are tracked.
 */
export const DailyGoal = ({
  lastLessonAt,
  completedLessons,
  totalLessons,
  dailyGoal,
}: Props) => {
  const goal = dailyGoal;
  const today = new Date();
  const hadLessonToday =
    lastLessonAt !== null &&
    lastLessonAt.getFullYear() === today.getFullYear() &&
    lastLessonAt.getMonth() === today.getMonth() &&
    lastLessonAt.getDate() === today.getDate();

  // Approximation: we only know "at least 1 lesson today" from lastLessonAt.
  // TODO: Replace with accurate per-lesson timestamp counting when available.
  const todayCount = hadLessonToday ? Math.min(1, goal) : 0;
  const isGoalMet = todayCount >= goal;
  const progressPercent = Math.round((todayCount / goal) * 100);

  return (
    <div
      className={[
        "mb-6 rounded-2xl border p-4",
        isGoalMet
          ? "border-green-200 bg-green-50/50"
          : "border-neutral-200 bg-white",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            isGoalMet ? "bg-green-100" : "bg-neutral-100",
          ].join(" ")}
        >
          {isGoalMet ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Target className="h-5 w-5 text-neutral-500" />
          )}
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-800">
              Daily goal
            </p>
            <span
              className={[
                "text-xs font-semibold",
                isGoalMet ? "text-green-600" : "text-neutral-500",
              ].join(" ")}
            >
              {todayCount}/{goal} lesson{goal > 1 ? "s" : ""}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-neutral-500">
            {isGoalMet
              ? "Great job! You hit your daily goal."
              : "Complete a lesson today to stay on track."}
          </p>
        </div>
      </div>
    </div>
  );
};
