"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { Share2, X, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Props = {
  streak: number;
  onClose: () => void;
};

const MILESTONES = [3, 7, 30, 100];

export function StreakMilestoneModal({ streak, onClose }: Props) {
  const handleShare = useCallback(async () => {
    const text = `I just hit a ${streak}-day streak on Yiya! 🔥\n\nJoin me and learn a language together:`;
    const url = "https://yiya.app";

    try {
      if (navigator.share && navigator.canShare({ title: "", text: "", url: "" })) {
        await navigator.share({ title: "My Yiya Streak!", text, url });
        track("milestone_share_clicked", { type: "streak", value: streak, method: "native" });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast.success("Copied to clipboard!");
        track("milestone_share_clicked", { type: "streak", value: streak, method: "clipboard" });
      }
    } catch {
      // User cancelled share
    }
  }, [streak]);

  if (!MILESTONES.includes(streak)) return null;

  const getMessage = () => {
    if (streak === 3) return "You're building momentum!";
    if (streak === 7) return "One week strong!";
    if (streak === 30) return "A whole month! Incredible!";
    if (streak === 100) return "100 days! You're unstoppable!";
    return "Amazing streak!";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Milestone Reached!
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
            <Flame className="h-10 w-10 text-orange-500" />
          </div>
          <p className="mt-4 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {streak} Day Streak
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {getMessage()}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={handleShare} className="flex-1 gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="primaryOutline" onClick={onClose} className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
