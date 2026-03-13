"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { track, buildTrackPayload, trackPayload } from "@/lib/analytics";
import { useABTest } from "@/lib/ab-testing";

// Variant configurations
type PaywallVariant = "a" | "b" | "c";

interface VariantConfig {
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  showSocialProof?: boolean;
  accentColor?: string;
}

const VARIANTS: Record<PaywallVariant, VariantConfig> = {
  a: {
    // Control - Original
    title: "Take a breath — you can earn hearts back",
    description: "Practice what you've learned to earn hearts, or get unlimited hearts to keep going.",
    primaryCta: "Get unlimited hearts",
    secondaryCta: "Practice to earn hearts",
  },
  b: {
    // Unlimited Focus
    title: "Keep learning without limits",
    description: "Stop waiting for hearts to refill. Get unlimited access to all lessons and learn at your own pace.",
    primaryCta: "Get unlimited access",
    secondaryCta: "Practice to earn hearts",
  },
  c: {
    // Social Proof
    title: "Join 1,000+ learners who went unlimited",
    description: "Premium members learn 3x faster with unlimited hearts and exclusive features.",
    primaryCta: "Upgrade now",
    secondaryCta: "Practice to earn hearts",
    showSocialProof: true,
  },
};

interface PaywallVariantContentProps {
  variant: PaywallVariant;
  userId: string | null;
  onClose: () => void;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

function PaywallVariantContent({
  variant,
  userId,
  onClose,
  onPrimaryClick,
  onSecondaryClick,
}: PaywallVariantContentProps) {
  const config = VARIANTS[variant];
  const router = useRouter();

  useEffect(() => {
    // Track variant shown
    track("paywall_variant_shown", { variant, surface: "hearts_modal" }).catch(() => undefined);
  }, [variant]);

  const handlePrimaryClick = () => {
    // Track conversion attempt
    trackPayload(
      buildTrackPayload("paywall_conversion_by_variant", {
        variant,
        surface: "hearts_modal",
        converted: true,
      }),
    ).catch(() => undefined);
    track("checkout_start", { surface: "hearts_modal" }).catch(() => undefined);
    onPrimaryClick();
  };

  const handleSecondaryClick = () => {
    // Track dismissal
    trackPayload(
      buildTrackPayload("paywall_conversion_by_variant", {
        variant,
        surface: "hearts_modal",
        converted: false,
      }),
    ).catch(() => undefined);
    onSecondaryClick();
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center w-full justify-center mb-5">
          <Image src="/mascot_bad.svg" alt="Mascot" height={80} width={80} />
        </div>
        <DialogTitle className="text-center font-bold text-2xl">
          {config.title}
        </DialogTitle>
        <DialogDescription className="text-center text-base">
          {config.description}
        </DialogDescription>
        {config.showSocialProof && (
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-neutral-500">
            <span className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white"
                />
              ))}
            </span>
            <span>1,000+ users upgraded this month</span>
          </div>
        )}
      </DialogHeader>
      <DialogFooter className="mb-4">
        <div className="flex flex-col gap-y-4 w-full">
          <Button
            variant="primary"
            className="w-full"
            size="lg"
            onClick={handlePrimaryClick}
          >
            {config.primaryCta}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            size="lg"
            onClick={handleSecondaryClick}
          >
            {config.secondaryCta}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            size="lg"
            onClick={onClose}
          >
            Not now
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

export function PaywallTracker() {
  useEffect(() => {
    track("paywall_view", { surface: "shop" });
  }, []);

  return null;
}

/**
 * Hearts Modal with A/B testing variants
 * Shows different copy based on user's assigned variant
 */
export function HeartsModalWithABTest({ userId }: { userId: string | null }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useHeartsModal();
  const { variant, isReady } = useABTest(userId);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    track("paywall_view", { surface: "hearts_modal" }).catch(() => undefined);
  }, [isOpen]);

  if (!isClient || !isReady) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <PaywallVariantContent
          variant={variant}
          userId={userId}
          onClose={close}
          onPrimaryClick={() => {
            close();
            router.push("/shop");
          }}
          onSecondaryClick={() => {
            close();
            router.push("/practice");
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

// Export the original modal for backward compatibility
export { useHeartsModal };
