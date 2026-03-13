import { CheckCircle2, Flame, Snowflake } from "lucide-react";

type Props = {
  streak: number;
  todayLessonCount: number;
  hasFreezeToday: boolean;
};

export const StreakRiskBanner = ({
  streak,
  todayLessonCount,
  hasFreezeToday,
}: Props) => {
  const isAtRisk = streak > 0 && todayLessonCount === 0;
  const hasProgress = todayLessonCount > 0;

  if (!isAtRisk && !hasProgress) return null;

  if (hasProgress) {
    return (
      <div
        data-testid="streak-progress-banner"
        className="mb-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950"
      >
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          {todayLessonCount === 1
            ? "1 lesson done today — keep going!"
            : `${todayLessonCount} lessons done today — great work!`}
          {streak > 0 && ` 🔥 ${streak}-day streak`}
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="streak-risk-banner"
      className={[
        "mb-4 flex items-center gap-3 rounded-xl border px-4 py-3",
        hasFreezeToday
          ? "border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950"
          : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
      ].join(" ")}
    >
      {hasFreezeToday ? (
        <Snowflake className="h-5 w-5 shrink-0 text-sky-500" />
      ) : (
        <Flame className="h-5 w-5 shrink-0 text-amber-500" />
      )}
      <p
        className={[
          "text-sm font-medium",
          hasFreezeToday
            ? "text-sky-700 dark:text-sky-300"
            : "text-amber-700 dark:text-amber-300",
        ].join(" ")}
      >
        {hasFreezeToday
          ? `Freeze active — but a lesson today keeps your ${streak}-day streak growing!`
          : `Your ${streak}-day streak needs today's lesson!`}
      </p>
    </div>
  );
};
