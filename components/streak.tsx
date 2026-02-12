import { Flame } from "lucide-react";

type Props = {
  streak: number;
};

const milestones = new Set([7, 30, 100]);

export const Streak = ({ streak }: Props) => {
  const isMilestone = milestones.has(streak);

  return (
    <div
      className={[
        "w-full rounded-xl border bg-white p-4",
        "flex items-center justify-between gap-x-3",
        isMilestone ? "border-orange-200" : "border-neutral-200",
      ].join(" ")}
    >
      <div className="flex items-center gap-x-3">
        <div
          className={[
            "h-10 w-10 rounded-full flex items-center justify-center",
            isMilestone ? "bg-orange-100" : "bg-neutral-100",
            isMilestone ? "animate-pulse" : "",
          ].join(" ")}
          aria-hidden="true"
        >
          <Flame
            className={[
              "h-5 w-5",
              isMilestone ? "text-orange-600" : "text-orange-500",
            ].join(" ")}
          />
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
          {isMilestone && streak > 0 ? (
            <p className="text-xs text-neutral-500">Milestone unlocked</p>
          ) : (
            <p className="text-xs text-neutral-500">Keep learning daily</p>
          )}
        </div>
      </div>
      {streak > 0 && (
        <div className="text-xs font-semibold text-orange-600">🔥</div>
      )}
    </div>
  );
};
