"use client";

import posthog from "posthog-js";

import type { TrackDispatcher } from "@/lib/analytics";

export const posthogDispatcher: TrackDispatcher = (payload) => {
  posthog.capture(payload.event, payload.properties);
};
