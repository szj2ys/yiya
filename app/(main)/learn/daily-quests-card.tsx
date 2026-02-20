"use client";

import { useState, useTransition } from "react";
import { Star, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

import { claimDailyQuest } from "@/actions/daily-quests";

export type DailyQuestItem = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
};

type Props = {
  quests: DailyQuestItem[];
};

export const DailyQuestsCard = ({ quests }: Props) => {
  const [claimedIds, setClaimedIds] = useState<Set<string>>(
    () => new Set(quests.filter((q) => q.claimed).map((q) => q.id)),
  );
  const [pending, startTransition] = useTransition();

  const handleClaim = (questId: string, xpReward: number) => {
    startTransition(async () => {
      const result = await claimDailyQuest(questId);

      if ("success" in result) {
        setClaimedIds((prev) => new Set(prev).add(questId));
        toast.success(`+${xpReward} XP earned!`);
      } else if (result.error === "already_claimed") {
        setClaimedIds((prev) => new Set(prev).add(questId));
      } else {
        toast.error("Could not claim quest. Please try again.");
      }
    });
  };

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Star className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-neutral-800">
          Today&apos;s Quests
        </h3>
      </div>

      <div className="space-y-2">
        {quests.map((quest) => {
          const isClaimed = claimedIds.has(quest.id);

          return (
            <div
              key={quest.id}
              className={[
                "flex items-center gap-3 rounded-xl p-3",
                isClaimed
                  ? "bg-green-50/50"
                  : quest.completed
                    ? "bg-amber-50/50"
                    : "bg-neutral-50",
              ].join(" ")}
            >
              {/* Left: status indicator */}
              <div className="shrink-0">
                {isClaimed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : quest.completed ? (
                  <Circle className="h-5 w-5 text-amber-500" />
                ) : (
                  <Circle className="h-5 w-5 text-neutral-300" />
                )}
              </div>

              {/* Middle: quest info */}
              <div className="flex-1 min-w-0">
                <p
                  className={[
                    "text-sm font-medium",
                    isClaimed
                      ? "text-green-700"
                      : quest.completed
                        ? "text-neutral-800"
                        : "text-neutral-500",
                  ].join(" ")}
                >
                  {quest.title}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {quest.description}
                </p>
              </div>

              {/* Right: claim button or status */}
              <div className="shrink-0">
                {isClaimed ? (
                  <span className="text-xs font-semibold text-green-600">
                    Claimed
                  </span>
                ) : quest.completed ? (
                  <button
                    onClick={() => handleClaim(quest.id, quest.xpReward)}
                    disabled={pending}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                  >
                    Claim +{quest.xpReward} XP
                  </button>
                ) : (
                  <span className="text-xs font-medium text-neutral-400">
                    +{quest.xpReward} XP
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
