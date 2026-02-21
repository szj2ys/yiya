"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
import { track } from "@/lib/analytics";

export const HeartsModal = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useHeartsModal();

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    track("paywall_view", { surface: "hearts_modal" }).catch(() => undefined);
  }, [isOpen]);

  if (!isClient) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-5">
            <Image src="/mascot_bad.svg" alt="Mascot" height={80} width={80} />
          </div>
          <DialogTitle className="text-center font-bold text-2xl">
            Take a breath — you can earn hearts back
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Practice what you&apos;ve learned to earn hearts, or get unlimited hearts to keep going.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mb-4">
          <div className="flex flex-col gap-y-4 w-full">
            <Button
              variant="secondary"
              className="w-full"
              size="lg"
              onClick={() => {
                close();
                router.push("/practice");
              }}
            >
              Practice to earn hearts
            </Button>
            <Button
              variant="primaryOutline"
              className="w-full"
              size="lg"
              onClick={() => {
                track("checkout_start", { surface: "hearts_modal" }).catch(() => undefined);
                close();
                router.push("/shop");
              }}
            >
              Get unlimited hearts
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              size="lg"
              onClick={close}
            >
              Not now
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
