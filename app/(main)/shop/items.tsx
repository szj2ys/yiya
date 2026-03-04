"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useState, useTransition } from "react";
import { Snowflake, X, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { POINTS_TO_REFILL, STREAK_FREEZE_COST } from "@/constants";
import { refillHearts } from "@/actions/user-progress";
import { createStripeUrl } from "@/actions/user-subscription";
import { buyStreakFreeze } from "@/actions/streak-freeze";
import { PayPalButton } from "@/components/paypal-button";

type Props = {
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
  hasActiveFreezeToday?: boolean;
  provider?: "stripe" | "paypal" | null;
};

export const Items = ({
  hearts,
  points,
  hasActiveSubscription,
  hasActiveFreezeToday = false,
  provider,
}: Props) => {
  const [pending, startTransition] = useTransition();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const onRefillHearts = () => {
    if (pending || hearts === 5 || points < POINTS_TO_REFILL) {
      return;
    }

    startTransition(() => {
      refillHearts()
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const onStripeUpgrade = () => {
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

  const onManageSubscription = () => {
    if (provider === "paypal") {
      // For PayPal, we open the customer portal
      window.open("https://www.paypal.com/myaccount/autopay/", "_blank");
    } else {
      // For Stripe
      onStripeUpgrade();
    }
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

  const onUpgradeClick = () => {
    if (hasActiveSubscription) {
      onManageSubscription();
    } else {
      setShowPaymentModal(true);
    }
  };

  return (
    <>
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
            onClick={onUpgradeClick}
            disabled={pending}
          >
            {hasActiveSubscription ? "Manage" : "upgrade"}
          </Button>
        </div>
      </ul>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Upgrade to Pro
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Choose your payment method
            </p>

            <div className="mt-6 space-y-4">
              {/* Stripe Option */}
              <button
                onClick={onStripeUpgrade}
                disabled={pending}
                className="flex w-full items-center gap-4 rounded-xl border-2 border-neutral-100 bg-white p-4 transition-all hover:border-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-neutral-900">Credit Card</p>
                  <p className="text-sm text-neutral-500">Powered by Stripe</p>
                </div>
                <span className="text-sm font-medium text-neutral-400">→</span>
              </button>

              {/* PayPal Option */}
              <div className="rounded-xl border-2 border-neutral-100 bg-white p-4">
                <PayPalButton
                  onSuccess={() => {
                    setShowPaymentModal(false);
                    toast.success("Subscription activated!");
                    window.location.reload();
                  }}
                  onError={() => {
                    toast.error("PayPal checkout failed");
                  }}
                />
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-neutral-500">
              $20/month · Cancel anytime
            </p>
          </div>
        </div>
      )}
    </>
  );
};
