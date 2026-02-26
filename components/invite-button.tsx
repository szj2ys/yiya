"use client";

import { useCallback } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Props = {
  userId: string;
};

export function InviteButton({ userId }: Props) {
  const handleInvite = useCallback(async () => {
    const url = `${window.location.origin}/?ref=${userId}&ref_source=referral`;
    const shareData = {
      title: "Learn a language with Yiya!",
      text: "Join me on Yiya and we both get 100 XP!",
      url,
    };

    let method = "clipboard";
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        method = "share";
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      } catch {
        toast.error("Could not copy link");
        return;
      }
    }

    track("referral_invite_shared", { user_id: userId, method });
  }, [userId]);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start gap-x-3 px-4 text-sm font-medium text-neutral-500 hover:text-neutral-700"
      onClick={handleInvite}
      data-testid="invite-button"
    >
      <UserPlus className="h-5 w-5" />
      Invite friends
    </Button>
  );
}
