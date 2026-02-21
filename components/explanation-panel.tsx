"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import type { ExplanationResult } from "@/lib/ai/explain";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export type ExplanationPanelProps = {
  challengeId: number;
  explanation: ExplanationResult | null;
  loading: boolean;
  onDismiss: () => void;
  onPractice: () => void;
};

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 w-full rounded-md bg-slate-200/80 animate-pulse",
        className,
      )}
    />
  );
}

export function ExplanationPanel({
  challengeId,
  explanation,
  loading,
  onDismiss,
  onPractice,
}: ExplanationPanelProps) {
  const isOpen = loading || Boolean(explanation);

  useEffect(() => {
    if (!explanation) return;
    track("explanation_view", {
      challenge_id: challengeId,
      cached: explanation.cached,
    }).catch(() => undefined);
  }, [challengeId, explanation]);

  return (
    <div
      aria-hidden={!isOpen}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 transition-transform duration-200 ease-out",
        isOpen ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto w-full max-w-2xl px-4 pb-4">
        <div className="rounded-2xl border border-slate-200 dark:border-neutral-700 bg-gradient-to-br from-amber-50 to-sky-50 dark:from-neutral-800 dark:to-neutral-800 shadow-lg">
          <div className="px-4 pt-4 pb-3">
            <div className="text-sm font-bold text-slate-700 dark:text-neutral-200">Why it’s wrong</div>
            <div className="mt-2 text-sm text-slate-700 dark:text-neutral-300">
              {loading ? (
                <div className="space-y-2">
                  <SkeletonLine />
                  <SkeletonLine className="w-5/6" />
                </div>
              ) : (
                <span>{explanation?.explanation}</span>
              )}
            </div>

            <div className="mt-4 text-sm font-bold text-slate-700 dark:text-neutral-200">Rule</div>
            <div className="mt-2 text-sm text-slate-700 dark:text-neutral-300">
              {loading ? (
                <div className="space-y-2">
                  <SkeletonLine />
                  <SkeletonLine className="w-4/6" />
                </div>
              ) : (
                <span>{explanation?.rule}</span>
              )}
            </div>

            <div className="mt-4 text-sm font-bold text-slate-700 dark:text-neutral-200">Memory tip</div>
            <div className="mt-2 text-sm text-slate-700 dark:text-neutral-300">
              {loading ? (
                <SkeletonLine className="w-3/4" />
              ) : (
                <span>{explanation?.tip}</span>
              )}
            </div>

            <div className="mt-4 text-sm font-bold text-slate-700 dark:text-neutral-200">Similar examples</div>
            <div className="mt-2 space-y-3 text-sm text-slate-700 dark:text-neutral-300">
              {loading ? (
                <div className="space-y-2">
                  <SkeletonLine />
                  <SkeletonLine className="w-4/5" />
                  <SkeletonLine />
                  <SkeletonLine className="w-4/5" />
                </div>
              ) : explanation?.examples?.length ? (
                explanation.examples.slice(0, 2).map((ex, idx) => (
                  <div key={idx} className="rounded-xl bg-white/70 dark:bg-neutral-700/70 p-3">
                    <div className="font-medium">{ex.source}</div>
                    <div className="mt-1 text-slate-600 dark:text-neutral-400">{ex.translation}</div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500">No examples available.</div>
              )}
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-200 dark:border-neutral-700 px-4 py-3">
            <Button
              variant="primaryOutline"
              className="flex-1"
              onClick={onDismiss}
              disabled={loading}
            >
              Got it
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                track("explanation_practice_click", {
                  challenge_id: challengeId,
                }).catch(() => undefined);
                onPractice();
              }}
              disabled={loading}
            >
              Practice this rule →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
