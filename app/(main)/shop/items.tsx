"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useTransition } from "react";
import { Snowflake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { POINTS_TO_REFILL, STREAK_FREEZE_COST } from "@/constants";
import { refillHearts } from "@/actions/user-progress";
import { createStripeUrl } from "@/actions/user-subscription";
import { buyStreakFreeze } from "@/actions/streak-freeze";

type Props = {
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
  hasActiveFreezeToday?: boolean;
};

export const Items = ({
  hearts,
  points,
  hasActiveSubscription,
  hasActiveFreezeToday = false,
}: Props) => {
  const [pending, startTransition] = useTransition();

  const onRefillHearts = () => {
    if (pending || hearts === 5 || points < POINTS_TO_REFILL) {
      return;
    }

    startTransition(() => {
      refillHearts()
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const onUpgrade = () => {
    startTransition(() => {
      createStripeUrl()
        .then((response) => {
          if (response.data) {
            window.location.href = response.data;
          }
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const onBuyFreeze = () => {
    if (pending || hasActiveFreezeToday || points < STREAK_FREEZE_COST) {
      return;
    }

    startTransition(() => {
      buyStreakFreeze()
        .then(() => toast.success("Streak freeze activated!"))
        .catch(() => toast.error("Something went wrong"));
    });
  };

  return (
    <ul className="w-full">
      <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
        <Image
          src="/heart.svg"
          alt="Heart"
          height={60}
          width={60}
        />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Refill hearts
          </p>
        </div>
        <Button
          onClick={onRefillHearts}
          disabled={
            pending
            || hearts === 5
            || points < POINTS_TO_REFILL
          }
        >
          {hearts === 5
            ? "Full"
            : (
              <div className="flex items-center">
                <Image
                  src="/points.svg"
                  alt="Points"
                  height={20}
                  width={20}
                />
                <p>
                  {POINTS_TO_REFILL}
                </p>
              </div>
            )
          }
        </Button>
      </div>
      <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2">
        <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-sky-100">
          <Snowflake className="h-8 w-8 text-sky-500" />
        </div>
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Streak Freeze
          </p>
          <p className="text-neutral-500 text-sm">
            {hasActiveFreezeToday
              ? "Active today"
              : `${STREAK_FREEZE_COST} points · Protect your streak for 1 day`}
          </p>
        </div>
        <Button
          onClick={onBuyFreeze}
          disabled={pending || hasActiveFreezeToday || points < STREAK_FREEZE_COST}
        >
          {hasActiveFreezeToday
            ? "Active"
            : (
              <div className="flex items-center">
                <Image
                  src="/points.svg"
                  alt="Points"
                  height={20}
                  width={20}
                />
                <p>
                  {STREAK_FREEZE_COST}
                </p>
              </div>
            )
          }
        </Button>
      </div>
      <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2">
        <Image
          src="/unlimited.svg"
          alt="Unlimited"
          height={60}
          width={60}
        />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Unlimited hearts
          </p>
          {!hasActiveSubscription && (
            <p className="text-neutral-500 text-sm">
              $20/month · Unlimited hearts
            </p>
          )}
        </div>
        <Button
          onClick={onUpgrade}
          disabled={pending}
        >
          {hasActiveSubscription ? "Manage" : "upgrade"}
        </Button>
      </div>
    </ul>
  );
};
