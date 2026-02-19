"use client";

import posthog from "posthog-js";

import { setTrackDispatcher } from "@/lib/analytics";
import { posthogDispatcher } from "@/lib/analytics-posthog";

let didInitAnalytics = false;

export function initAnalytics() {
  if (didInitAnalytics) return;
  if (typeof window === "undefined") return;

  if (!posthog.__loaded) {
    return;
  }

  setTrackDispatcher(posthogDispatcher);
  didInitAnalytics = true;
}
