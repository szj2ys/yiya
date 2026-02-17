import { CheckCircle2, Target } from "lucide-react";

import { Progress } from "@/components/ui/progress";

const DAILY_GOAL = 1; // lessons per day, hardcoded for now

type Props = {
  lastLessonAt: Date | null;
  completedLessons: number;
  totalLessons: number;
};

/**
 * Counts how many lessons the user completed "today" by comparing
 * completedLessons count and lastLessonAt timestamp. Since we don't
 * have per-lesson timestamps, we approximate: if the user had a
 * lesson today, count min(completedLessons, DAILY_GOAL) as today's.
 */
export const DailyGoal = ({
  lastLessonAt,
  completedLessons,
  totalLessons,
}: Props) => {
  const today = new Date();
  const hadLessonToday =
    lastLessonAt !== null &&
    lastLessonAt.getFullYear() === today.getFullYear() &&
    lastLessonAt.getMonth() === today.getMonth() &&
    lastLessonAt.getDate() === today.getDate();

  // If the user completed a lesson today, count at least 1 toward the daily goal.
  // We cap at DAILY_GOAL because we only track a single timestamp.
  const todayCount = hadLessonToday ? Math.min(completedLessons, DAILY_GOAL) : 0;
  const isGoalMet = todayCount >= DAILY_GOAL;
  const progressPercent = Math.round((todayCount / DAILY_GOAL) * 100);

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
              {todayCount}/{DAILY_GOAL} lesson{DAILY_GOAL > 1 ? "s" : ""}
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
