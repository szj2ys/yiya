"use client";

import Image from "next/image";
import { useCallback, useState, useTransition } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { claimQuestReward } from "@/actions/quest-rewards";

type Props = {
  title: string;
  value: number;
  reward: number;
  points: number;
  claimed: boolean;
};

export const QuestItem = ({ title, value, reward, points, claimed }: Props) => {
  const progress = Math.min((points / value) * 100, 100);
  const isComplete = progress >= 100;

  const [isClaimed, setIsClaimed] = useState(claimed);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleClaim = useCallback(() => {
    startTransition(async () => {
      const result = await claimQuestReward(value, reward);

      if ("success" in result) {
        setIsClaimed(true);
        setIsCelebrating(true);
        setTimeout(() => setIsCelebrating(false), 1000);
      }
    });
  }, [value, reward]);

  return (
    <div
      className={`flex items-center w-full p-4 gap-x-4 border-t-2 transition-all duration-300 ${
        isCelebrating
          ? "scale-[1.02] ring-2 ring-green-400 ring-opacity-75 rounded-lg shadow-[0_0_12px_rgba(34,197,94,0.4)]"
          : ""
      }`}
    >
      <Image
        src="/points.svg"
        alt="Points"
        width={60}
        height={60}
      />
      <div className="flex flex-col gap-y-2 w-full">
        <p className="text-neutral-700 text-xl font-bold">
          {title}
        </p>
        <Progress value={progress} className="h-3" />
      </div>
      {isComplete && !isClaimed && (
        <Button
          size="sm"
          variant="secondary"
          onClick={handleClaim}
          disabled={pending}
          className="ml-2 shrink-0"
        >
          Claim +{reward} XP
        </Button>
      )}
      {isComplete && isClaimed && (
        <div className="ml-2 shrink-0 flex items-center gap-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500">
            <Check className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-bold text-green-600">
            Claimed +{reward} XP
          </span>
        </div>
      )}
    </div>
  );
};
