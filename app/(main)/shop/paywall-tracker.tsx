"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics";

export function PaywallTracker() {
  useEffect(() => {
    track("paywall_view", { surface: "shop" });
  }, []);

  return null;
}
