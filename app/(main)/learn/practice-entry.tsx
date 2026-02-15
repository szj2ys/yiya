"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { startPractice } from "@/actions/practice";
import { Button } from "@/components/ui/button";

import { getReviewSummary } from "./practice-summary";

type PracticeStartResult = Awaited<ReturnType<typeof startPractice>>;

type PracticeEntryProps = {
  reviewItemCount: number;
};

export const PracticeEntry = ({ reviewItemCount }: PracticeEntryProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onPractice = () => {
    if (pending) {
      return;
    }

    startTransition(() => {
      startPractice()
        .then(handlePracticeStart)
        .catch(() => toast.error("Something went wrong. Please try again."));
    });
  };

  const handlePracticeStart = (result: PracticeStartResult) => {
    if (result.type === "empty") {
      toast.message("No practice items for today yet.");
      return;
    }

    router.push(`/lesson/${result.lessonId}`);
  };

  const label = "Today\u2019s practice";
  const summary = getReviewSummary(reviewItemCount);

  return (
    <div className="mb-6 rounded-2xl border bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <Image src="/unlimited.svg" alt="Practice" height={44} width={44} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-800">{label}</p>
          <p className="text-xs text-neutral-600">{summary}</p>
        </div>
        <Button onClick={onPractice} disabled={pending}>
          Practice
        </Button>
      </div>
    </div>
  );
};
