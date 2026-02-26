"use client";

import { useEffect } from "react";
import { captureUtmParams, captureReferralParams } from "@/lib/referral";

export function UtmCapture() {
  useEffect(() => {
    captureReferralParams();
    captureUtmParams();
  }, []);
  return null;
}
