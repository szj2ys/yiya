import { CheckCircle, Flame, Snowflake } from "lucide-react";

type NextMilestone = {
  days: number;
  xpReward: number;
  daysUntil: number;
} | null;

type Props = {
  streak: number;
  lastLessonAt: Date | null;
  freezeActive?: boolean;
  nextMilestone?: NextMilestone;
};

const milestones = new Set([7, 30, 100]);

const isToday = (date: Date): boolean => {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export const Streak = ({ streak, lastLessonAt, freezeActive = false, nextMilestone }: Props) => {
  const isMilestone = milestones.has(streak);
  const completedToday = lastLessonAt ? isToday(lastLessonAt) : false;
  const showReminder = streak > 0 && !completedToday && !freezeActive;

  return (
    <div
      className={[
        "w-full rounded-xl border bg-white dark:bg-neutral-800 p-4",
        "flex flex-col gap-y-2",
        isMilestone ? "border-orange-200" : "border-neutral-200",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-x-3">
        <div className="flex items-center gap-x-3">
          <div
            className={[
              "h-10 w-10 rounded-full flex items-center justify-center",
              completedToday
                ? "bg-green-100"
                : freezeActive
                  ? "bg-sky-100"
                  : isMilestone
                    ? "bg-orange-100"
                    : "bg-neutral-100",
              isMilestone && !completedToday ? "animate-pulse" : "",
            ].join(" ")}
            aria-hidden="true"
          >
            {completedToday ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : freezeActive ? (
              <Snowflake className="h-5 w-5 text-sky-500" />
            ) : (
              <Flame
                className={[
                  "h-5 w-5",
                  isMilestone ? "text-orange-600" : "text-orange-500",
                ].join(" ")}
              />
            )}
          </div>
          <div className="flex flex-col">
            {streak > 0 ? (
              <p className="text-sm font-semibold text-neutral-700">
                {streak} day streak
              </p>
            ) : (
              <p className="text-sm font-semibold text-neutral-700">
                Start your streak!
              </p>
            )}
            {completedToday ? (
              <p className="text-xs text-green-600">Completed today</p>
            ) : freezeActive ? (
              <p className="text-xs text-sky-600">Protected today</p>
            ) : isMilestone && streak > 0 ? (
              <p className="text-xs text-neutral-500">Milestone unlocked</p>
            ) : (
              <p className="text-xs text-neutral-500">Keep learning daily</p>
            )}
          </div>
        </div>
        {streak > 0 && (
          <div className="text-xs font-semibold text-orange-600">
            {completedToday ? (
              <span className="text-green-600" aria-label="completed">
                &#10003;
              </span>
            ) : freezeActive ? (
              <Snowflake className="h-4 w-4 text-sky-500" />
            ) : (
              <>&#128293;</>
            )}
          </div>
        )}
      </div>
      {showReminder && (
        <p className="text-xs text-amber-600 font-medium pl-[52px]">
          Don&apos;t forget to study today!
        </p>
      )}
      {nextMilestone && nextMilestone.daysUntil > 0 && (
        <p className="text-xs text-orange-500 font-medium pl-[52px]" data-testid="next-milestone">
          {nextMilestone.daysUntil} {nextMilestone.daysUntil === 1 ? "day" : "days"} to {nextMilestone.xpReward} XP bonus
        </p>
      )}
    </div>
  );
};
