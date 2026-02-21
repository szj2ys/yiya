"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2 } from "lucide-react";

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
    <div
      className={[
        "mb-6 rounded-2xl border p-5 transition-colors",
        hasItems
          ? "border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950"
          : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800",
      ].join(" ")}
      data-testid="practice-entry"
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          {hasItems ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900">
              <BookOpen className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p
              className={[
                "text-sm font-semibold",
                hasItems
                  ? "text-sky-800 dark:text-sky-200"
                  : "text-neutral-800 dark:text-neutral-200",
              ].join(" ")}
            >
              Today&apos;s practice
            </p>
            {itemsDue > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1.5 text-[11px] font-semibold text-white">
                {itemsDue}
              </span>
            )}
          </div>
          <p
            className={[
              "text-xs",
              hasItems
                ? "text-sky-600 dark:text-sky-400"
                : "text-neutral-600 dark:text-neutral-400",
            ].join(" ")}
          >
            {summary}
          </p>
          {hasItems && (
            <div className="mt-2 h-1.5 w-full rounded-full bg-sky-200 dark:bg-sky-800">
              <div
                className="h-1.5 rounded-full bg-sky-500 transition-all"
                style={{ width: `${Math.min(100, Math.max(5, (1 - itemsDue / 20) * 100))}%` }}
              />
            </div>
          )}
        </div>
        <Button
          onClick={onPractice}
          disabled={!hasItems}
          variant={hasItems ? "primary" : "default"}
          className={hasItems ? "shadow-sm" : ""}
        >
          Practice
        </Button>
      </div>
    </div>
  );
};
