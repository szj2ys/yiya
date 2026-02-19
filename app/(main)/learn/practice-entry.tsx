"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type PracticeEntryProps = {
  reviewItemCount: number;
  dueCount: number;
};

export const PracticeEntry = ({ reviewItemCount, dueCount }: PracticeEntryProps) => {
  const router = useRouter();

  const hasItems = dueCount > 0 || reviewItemCount > 0;
  const itemsDue = dueCount > 0 ? dueCount : reviewItemCount;
  const summary =
    itemsDue > 0
      ? `${itemsDue} items due \u00b7 ~${Math.max(1, Math.ceil(itemsDue / 4))} min`
      : "All caught up!";

  const onPractice = () => {
    router.push("/practice");
  };

  return (
    <div className="mb-6 rounded-2xl border bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <Image src="/unlimited.svg" alt="Practice" height={44} width={44} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-neutral-800">Today&apos;s practice</p>
            {itemsDue > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
                {itemsDue}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-600">{summary}</p>
        </div>
        <Button onClick={onPractice} disabled={!hasItems}>
          Practice
        </Button>
      </div>
    </div>
  );
};
