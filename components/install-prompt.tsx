"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { track } from "@/lib/analytics";

const SESSION_COUNT_KEY = "yiya_session_count";
const INSTALL_DISMISSED_KEY = "yiya_install_dismissed";
const SESSION_THRESHOLD = 2;

/**
 * Smart "Add to Home Screen" banner.
 * Appears after the user's 2nd session (tracked via localStorage).
 * Captures the `beforeinstallprompt` event and shows a custom prompt.
 */
export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Don't show if previously dismissed
    if (localStorage.getItem(INSTALL_DISMISSED_KEY)) return;

    // Don't show until user has completed at least one lesson
    if (!localStorage.getItem("yiya_first_lesson_completed")) return;

    // Track session count
    const count = parseInt(localStorage.getItem(SESSION_COUNT_KEY) ?? "0", 10) + 1;
    localStorage.setItem(SESSION_COUNT_KEY, String(count));

    if (count < SESSION_THRESHOLD) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setVisible(true);
      track("pwa_install_prompt_shown", {});
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    prompt.prompt();
    const result = await prompt.userChoice;

    if (result.outcome === "accepted") {
      track("pwa_installed", {});
    }

    deferredPromptRef.current = null;
    setVisible(false);
    localStorage.setItem(INSTALL_DISMISSED_KEY, "1");
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(INSTALL_DISMISSED_KEY, "1");
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Yiya"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
    >
      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        Add Yiya to Home Screen
      </p>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Get an app-like experience with quick access from your home screen.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-xs font-bold text-white hover:bg-green-600"
        >
          Install
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

/**
 * TypeScript: extend Window with the `beforeinstallprompt` event types.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}
