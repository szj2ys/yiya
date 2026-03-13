"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Share2, X, Flame, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Props = {
  streak: number;
  onClose: () => void;
};

const MILESTONES = [3, 7, 30, 100];

export function StreakMilestoneModal({ streak, onClose }: Props) {
  // Track when modal is opened
  useEffect(() => {
    track("share_card_opened", { type: "streak_milestone", streak });
  }, [streak]);

  const handleShare = useCallback(async () => {
    const text = `I just hit a ${streak}-day streak on Yiya! \uD83D\uDD25\n\nJoin me and learn a language together:`;
    const url = "https://yiya.app";

    track("share_attempted", { type: "streak_milestone", method: "native" });

    try {
      if (navigator.share && navigator.canShare({ title: "", text: "", url: "" })) {
        await navigator.share({ title: "My Yiya Streak!", text, url });
        track("share_completed", { type: "streak_milestone", method: "native", success: true });
        track("milestone_share_clicked", { type: "streak", value: streak, method: "native" });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast.success("Copied to clipboard!");
        track("share_completed", { type: "streak_milestone", method: "clipboard", success: true });
        track("milestone_share_clicked", { type: "streak", value: streak, method: "clipboard" });
      }
    } catch {
      // User cancelled share
      track("share_completed", { type: "streak_milestone", method: "native", success: false });
    }
  }, [streak]);

  const handleCopy = useCallback(async () => {
    const text = `I just hit a ${streak}-day streak on Yiya! \uD83D\uDD25\n\nJoin me and learn a language together: https://yiya.app`;

    track("share_attempted", { type: "streak_milestone", method: "clipboard" });

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
      track("share_completed", { type: "streak_milestone", method: "clipboard", success: true });
      track("milestone_share_clicked", { type: "streak", value: streak, method: "clipboard" });
    } catch {
      track("share_completed", { type: "streak_milestone", method: "clipboard", success: false });
      toast.error("Could not copy to clipboard.");
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

  const getEmoji = () => {
    if (streak === 3) return "\uD83D\uDD25";
    if (streak === 7) return "\u2728";
    if (streak === 30) return "\uD83C\uDF1F";
    if (streak === 100) return "\uD83C\uDFC6";
    return "\uD83D\uDD25";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
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
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg">
            <span className="text-4xl">{getEmoji()}</span>
          </div>
          <p className="mt-4 text-4xl font-bold text-neutral-900 dark:text-neutral-100">
            {streak} Day Streak
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {getMessage()}
          </p>
        </div>

        {/* Share preview */}
        <div className="mt-5 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            I just hit a {streak}-day streak on Yiya! \uD83D\uDD25
          </p>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            Join me and learn a language together
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <Button onClick={handleShare} className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="primaryOutline" onClick={handleCopy} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>
        <Button variant="ghost" onClick={onClose} className="mt-2 w-full">
          Continue Learning
        </Button>
      </div>
    </div>
  );
}
