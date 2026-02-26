"use client";

import { useEffect, useState, useCallback } from "react";
import { subscribeToPush, saveSubscriptionToServer } from "@/lib/push";
import { track } from "@/lib/analytics";

type PushPromptProps = {
  /** Total lesson completions for the current user */
  lessonCompletionCount: number;
};

const PUSH_PROMPT_THRESHOLD = 3;

/**
 * Prompts for push notification permission after the user's 3rd lesson completion.
 * Only shows once (tracked in localStorage).
 */
export function PushPrompt({ lessonCompletionCount }: PushPromptProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("PushManager" in window)) return;
    if (Notification.permission !== "default") return;
    if (lessonCompletionCount < PUSH_PROMPT_THRESHOLD) return;

    const dismissed = localStorage.getItem("yiya_push_prompted");
    if (dismissed) return;

    setVisible(true);
  }, [lessonCompletionCount]);

  const handleEnable = useCallback(async () => {
    setVisible(false);
    localStorage.setItem("yiya_push_prompted", "1");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        track("push_declined", {});
        return;
      }

      const subscription = await subscribeToPush();
      if (subscription) {
        await saveSubscriptionToServer(subscription);
        track("push_subscribed", {});
      }
    } catch {
      track("push_declined", {});
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem("yiya_push_prompted", "1");
    track("push_declined", {});
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Enable notifications"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
    >
      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        Never lose your streak!
      </p>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Get a gentle reminder when your streak is about to expire.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleEnable}
          className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-xs font-bold text-white hover:bg-green-600"
        >
          Enable
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 rounded-lg border px-3 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
