import { CheckCircle, Flame } from "lucide-react";

type Props = {
  streak: number;
  lastLessonAt: Date | null;
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

export const Streak = ({ streak, lastLessonAt }: Props) => {
  const isMilestone = milestones.has(streak);
  const completedToday = lastLessonAt ? isToday(lastLessonAt) : false;
  const showReminder = streak > 0 && !completedToday;

  return (
    <div
      className={[
        "w-full rounded-xl border bg-white p-4",
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
                : isMilestone
                  ? "bg-orange-100"
                  : "bg-neutral-100",
              isMilestone && !completedToday ? "animate-pulse" : "",
            ].join(" ")}
            aria-hidden="true"
          >
            {completedToday ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
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
    </div>
  );
};
