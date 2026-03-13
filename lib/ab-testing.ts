"use client";

import { useCallback, useEffect, useState } from "react";

type Variant = "a" | "b" | "c";

const STORAGE_KEY = "yiya_ab_test_bucket";

/**
 * Simple hash function for consistent user bucketing.
 * Returns a number between 0 and 1 for the given string.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Normalize to 0-1 range
  return (Math.abs(hash) % 1000) / 1000;
}

/**
 * Assign a user to a variant based on their user ID.
 * Uses consistent hashing so the same user always gets the same variant.
 */
export function assignVariant(userId: string | null): Variant {
  if (!userId) {
    return "a"; // Default to control for anonymous users
  }

  const hash = hashString(userId);
  if (hash < 0.33) {
    return "a";
  } else if (hash < 0.66) {
    return "b";
  } else {
    return "c";
  }
}

/**
 * Get the stored variant from localStorage.
 */
function getStoredVariant(): Variant | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === "a" || stored === "b" || stored === "c")) {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

/**
 * Store the variant in localStorage.
 */
function storeVariant(variant: Variant): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, variant);
  } catch {
    // localStorage not available
  }
}

/**
 * Get or assign a variant for the current user.
 * First checks localStorage, then assigns based on userId if not stored.
 */
export function getVariant(userId: string | null): Variant {
  // Check localStorage first for persistence
  const stored = getStoredVariant();
  if (stored) {
    return stored;
  }

  // Assign new variant
  const variant = assignVariant(userId);
  storeVariant(variant);
  return variant;
}

/**
 * Clear the stored variant (useful for testing).
 */
export function clearVariant(): void {
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
 * React hook for A/B testing.
 * Returns the current variant and functions to get/copy variant info.
 */
export function useABTest(userId: string | null) {
  const [variant, setVariant] = useState<Variant>("a");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const v = getVariant(userId);
    setVariant(v);
    setIsReady(true);
  }, [userId]);

  const refreshVariant = useCallback(() => {
    clearVariant();
    const v = getVariant(userId);
    setVariant(v);
    return v;
  }, [userId]);

  const getVariantInfo = useCallback(() => {
    return {
      variant,
      variantName: variant === "a" ? "Control" : variant === "b" ? "Unlimited Focus" : "Social Proof",
      isControl: variant === "a",
    };
  }, [variant]);

  return {
    variant,
    isReady,
    refreshVariant,
    getVariantInfo,
  };
}
