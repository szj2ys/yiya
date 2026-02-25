import { Flame, Snowflake } from "lucide-react";

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

  if (!isAtRisk) return null;

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
          ? `冻结保护中，但今天学习可以延续 ${streak} 天连胜`
          : `你的 ${streak} 天连胜还差今天的课程！`}
      </p>
    </div>
  );
};
