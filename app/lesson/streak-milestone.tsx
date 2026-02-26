"use client";

import { STREAK_MILESTONES } from "@/constants";

type Props = {
  streak: number;
  onShare?: () => void;
};

const MILESTONE_LABELS: Record<number, string> = {
  7: "One week strong!",
  14: "Two weeks of dedication!",
  30: "A whole month!",
  60: "Two months of consistency!",
  100: "Triple digits — incredible!",
  365: "One full year — legendary!",
};

export const StreakMilestone = ({ streak, onShare }: Props) => {
  const isMilestone = (STREAK_MILESTONES as readonly number[]).includes(streak);

  if (!isMilestone) return null;

  return (
    <div className="w-full mb-5" data-testid="streak-milestone-card">
      <div className="rounded-2xl border-2 border-orange-300 bg-gradient-to-b from-orange-50 to-amber-50 p-5 flex flex-col items-center gap-y-3 text-center">
        <div className="text-4xl" role="img" aria-label="fire">&#x1F525;</div>
        <p className="text-2xl font-extrabold text-orange-700">{streak}-Day Streak!</p>
        <p className="text-sm text-orange-600">
          {MILESTONE_LABELS[streak] ?? `${streak} days — keep it going!`}
        </p>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="mt-1 h-10 w-full max-w-[240px] rounded-2xl bg-orange-600 text-white font-semibold hover:bg-orange-700 active:bg-orange-800 transition text-sm"
          >
            Share Milestone
          </button>
        )}
      </div>
    </div>
  );
};
