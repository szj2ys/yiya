"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { track } from "@/lib/analytics";

const SESSION_COUNT_KEY = "yiya_session_count";
const INSTALL_DISMISSED_KEY = "yiya_install_dismissed";
const DISMISS_COOLDOWN_DAYS = 7;
const SESSION_THRESHOLD = 2;

/**
 * Detect if the device is iOS
 */
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Detect if the app is already installed (standalone mode)
 */
function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS specific check for standalone mode
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

/**
 * TypeScript: extend Window with the `beforeinstallprompt` event types.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function getPlatform(): 'ios' | 'android' | 'desktop' {
  if (typeof navigator === "undefined") return 'desktop';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

/**
 * Smart "Add to Home Screen" banner.
 * Appears after the user's 2nd session (tracked via localStorage).
 * Supports both Android/Chrome (beforeinstallprompt) and iOS Safari (manual instructions).
 */
export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Don't show if already installed (standalone mode)
    if (isStandalone()) return;

    // Check if dismissed with cooldown
    const dismissedAt = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (dismissedAt) {
      const cooldownMs = DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedAt, 10) < cooldownMs) {
        return;
      }
    }

    // Detect iOS
    setIsIOSDevice(isIOS());

    // Track session count
    const count = parseInt(localStorage.getItem(SESSION_COUNT_KEY) ?? "0", 10) + 1;
    localStorage.setItem(SESSION_COUNT_KEY, String(count));

    if (count < SESSION_THRESHOLD) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setVisible(true);
      track("pwa_install_prompt_shown", { platform: getPlatform() });
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show custom prompt after delay
    if (isIOS() && count >= SESSION_THRESHOLD) {
      const timer = setTimeout(() => {
        if (!isStandalone()) {
          setVisible(true);
          track("pwa_install_prompt_shown", { platform: getPlatform() });
        }
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Listen for app installed event
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAppInstalled = () => {
      track("pwa_installed", { platform: getPlatform() });
      setVisible(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    return () => window.removeEventListener("appinstalled", handleAppInstalled);
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOSDevice) {
      // iOS requires manual installation
      return;
    }

    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    track("pwa_install_clicked", { platform: getPlatform() });
    prompt.prompt();
    const result = await prompt.userChoice;

    if (result.outcome === "accepted") {
      track("pwa_installed", { platform: getPlatform() });
    }

    deferredPromptRef.current = null;
    setVisible(false);
    localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
  }, [isIOSDevice]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
    track("pwa_install_dismissed", { platform: getPlatform() });
  }, []);

  const handleNeverShow = useCallback(() => {
    setVisible(false);
    // Set dismissal far in the future (effectively permanent)
    localStorage.setItem(INSTALL_DISMISSED_KEY, "9999999999999");
    track("pwa_install_never", { platform: getPlatform() });
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Yiya"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
    >
      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {isIOSDevice ? "Add Yiya to Home Screen" : "Install Yiya App"}
      </p>

      {isIOSDevice ? (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Install Yiya on your iPhone for quick access and a better experience.
          </p>
          <ol className="ml-4 list-decimal text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
            <li>
              Tap the share button{" "}
              <svg className="inline h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 5l-1.42-1.42-3.58 3.59V2h-2v5.17L5.42 3.58 4 5l7 7 7-7zm7 7c0 5.52-4.48 10-10 10S3 17.52 3 12s4.48-10 10-10 10 4.48 10 10zm-2 0c0-4.42-3.58-8-8-8s-8 3.58-8 8 3.58 8 8 8 8-3.58 8-8z"/>
              </svg>{" "}
              in Safari
            </li>
            <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
            <li>Tap &quot;Add&quot; in the top right</li>
          </ol>
        </div>
      ) : (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Install Yiya to your home screen for quick access and offline learning.
        </p>
      )}

      <div className="mt-3 flex gap-2">
        {!isIOSDevice && (
          <button
            onClick={handleInstall}
            className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-xs font-bold text-white hover:bg-green-600 active:scale-95 transition-transform"
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="flex-1 rounded-lg border px-3 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Not now
        </button>
      </div>

      <button
        onClick={handleNeverShow}
        className="mt-2 text-xs text-neutral-400 hover:text-neutral-500 dark:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
      >
        Don&apos;t show again
      </button>
    </div>
  );
}
