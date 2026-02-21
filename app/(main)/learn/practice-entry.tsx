"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type PracticeEntryProps = {
  reviewItemCount: number;
  dueCount: number;
};

export const PracticeEntry = ({ reviewItemCount, dueCount }: PracticeEntryProps) => {
  const router = useRouter();

  const hasItems = dueCount > 0 || reviewItemCount > 0;
  const itemsDue = dueCount > 0 ? dueCount : reviewItemCount;

  const onPractice = () => {
    router.push("/practice");
  };

  return (
    <div
      className={[
        "mb-6 rounded-2xl border p-5 transition-colors",
        hasItems
          ? "border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950"
          : "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30",
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
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
                  : "text-emerald-800 dark:text-emerald-200",
              ].join(" ")}
            >
              {hasItems ? "Today\u2019s practice" : "Great job! All caught up for today."}
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
                : "text-emerald-600 dark:text-emerald-400",
            ].join(" ")}
          >
            {hasItems
              ? `${itemsDue} items due \u00b7 ~${Math.max(1, Math.ceil(itemsDue / 4))} min`
              : "Check back tomorrow for new reviews."}
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
        {hasItems && (
          <Button
            onClick={onPractice}
            variant="primary"
            className="shadow-sm"
          >
            Practice
          </Button>
        )}
      </div>
    </div>
  );
};
