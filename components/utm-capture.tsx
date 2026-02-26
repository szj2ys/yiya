"use client";

import { useEffect } from "react";
import { captureUtmParams } from "@/lib/referral";

export function UtmCapture() {
  useEffect(() => {
    captureUtmParams();
  }, []);
  return null;
}
