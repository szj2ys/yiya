"use client";

import Image from "next/image";
import { useCallback, useState, useTransition } from "react";
import { Check } from "lucide-react";

import { quests } from "@/constants";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { claimQuestReward } from "@/actions/quest-rewards";

type Props = {
  points: number;
  claimedQuestValues?: number[];
};

export const Quests = ({ points, claimedQuestValues = [] }: Props) => {
  const [claimedQuests, setClaimedQuests] = useState<Set<number>>(
    () => new Set(claimedQuestValues),
  );
  const [celebratingQuest, setCelebratingQuest] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const handleClaim = useCallback(
    (questValue: number, reward: number) => {
      startTransition(async () => {
        const result = await claimQuestReward(questValue, reward);

        if ("success" in result) {
          setClaimedQuests((prev) => new Set(prev).add(questValue));
          setCelebratingQuest(questValue);
          setTimeout(() => setCelebratingQuest(null), 1000);
        }
      });
    },
    [],
  );

  return (
    <div className="border-2 rounded-xl p-4 space-y-4">
      <h3 className="font-bold text-lg">
        Quests
      </h3>
      <ul className="w-full space-y-4">
        {quests.map((quest) => {
          const progress = Math.min((points / quest.value) * 100, 100);
          const isComplete = progress >= 100;
          const isClaimed = claimedQuests.has(quest.value);
          const isCelebrating = celebratingQuest === quest.value;

          return (
            <div
              className={`flex items-center w-full pb-4 gap-x-3 transition-all duration-300 ${
                isCelebrating
                  ? "scale-105 ring-2 ring-green-400 ring-opacity-75 rounded-lg shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                  : ""
              }`}
              key={quest.title}
            >
              <Image
                src="/points.svg"
                alt="Points"
                width={40}
                height={40}
              />
              <div className="flex flex-col gap-y-2 w-full">
                <p className="text-neutral-700 text-sm font-bold">
                  {quest.title}
                </p>
                <Progress value={progress} className="h-2" />
              </div>
              {isComplete && !isClaimed && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleClaim(quest.value, quest.reward)}
                  disabled={pending}
                  className="ml-2 shrink-0"
                >
                  Claim
                </Button>
              )}
              {isComplete && isClaimed && (
                <div className="ml-2 shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </ul>
    </div>
  );
};
