"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { REFERRAL_REWARD_XP } from "@/constants";

type Props = {
  count: number;
};

export function ReferralRewardToast({ count }: Props) {
  const shown = useRef(false);

  useEffect(() => {
    if (count > 0 && !shown.current) {
      shown.current = true;
      toast.success(
        count === 1
          ? `Your friend joined! You both earned ${REFERRAL_REWARD_XP} XP`
          : `${count} friends joined! You earned ${REFERRAL_REWARD_XP * count} XP`,
      );
    }
  }, [count]);

  return null;
}
