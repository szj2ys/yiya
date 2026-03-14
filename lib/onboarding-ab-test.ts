"use client";

import { useCallback, useEffect, useState } from "react";

export type OnboardingTryItVariant = "control" | "prominent_skip" | "skip_quiz";

const STORAGE_KEY = "yiya_onboarding_tryit_variant";

/**
 * Simple hash function for consistent user bucketing.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

/**
 * Assign a user to a variant based on their user ID or session.
 * Uses consistent hashing so the same user always gets the same variant.
 */
export function assignOnboardingTryItVariant(
  userId: string | null,
  sessionId?: string,
): OnboardingTryItVariant {
  // Use sessionId if available, otherwise userId, otherwise random
  const seed = sessionId || userId || Math.random().toString();
  const hash = hashString(seed);

  if (hash < 0.34) {
    return "control";
  } else if (hash < 0.67) {
    return "prominent_skip";
  } else {
    return "skip_quiz";
  }
}

function getStoredVariant(): OnboardingTryItVariant | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ["control", "prominent_skip", "skip_quiz"].includes(stored)) {
      return stored as OnboardingTryItVariant;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

function storeVariant(variant: OnboardingTryItVariant): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, variant);
  } catch {
    // localStorage not available
  }
}

export function getOnboardingTryItVariant(
  userId: string | null,
  sessionId?: string,
): OnboardingTryItVariant {
  const stored = getStoredVariant();
  if (stored) {
    return stored;
  }

  const variant = assignOnboardingTryItVariant(userId, sessionId);
  storeVariant(variant);
  return variant;
}

export function clearOnboardingTryItVariant(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}

/**
 * React hook for Try-it Quiz A/B testing.
 */
export function useOnboardingTryItABTest(userId: string | null) {
  const [variant, setVariant] = useState<OnboardingTryItVariant>("control");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Generate a session-based ID if no userId
    const sessionId = typeof window !== "undefined"
      ? `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      : undefined;
    const v = getOnboardingTryItVariant(userId, sessionId);
    setVariant(v);
    setIsReady(true);
  }, [userId]);

  const refreshVariant = useCallback(() => {
    clearOnboardingTryItVariant();
    const sessionId = typeof window !== "undefined"
      ? `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      : undefined;
    const v = getOnboardingTryItVariant(userId, sessionId);
    setVariant(v);
    return v;
  }, [userId]);

  const getVariantInfo = useCallback(() => {
    const names: Record<OnboardingTryItVariant, string> = {
      control: "Control (Current)",
      prominent_skip: "Prominent Skip Option",
      skip_quiz: "Skip Quiz Entirely",
    };

    return {
      variant,
      variantName: names[variant],
      isControl: variant === "control",
      showProminentSkip: variant === "prominent_skip",
      skipQuiz: variant === "skip_quiz",
    };
  }, [variant]);

  return {
    variant,
    isReady,
    refreshVariant,
    getVariantInfo,
  };
}
