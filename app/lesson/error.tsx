"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[100svh] w-full px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
            <AlertTriangle className="h-6 w-6 text-neutral-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">
              Oops! This lesson hit a snag.
            </h1>
            <p className="mt-1 text-sm leading-6 text-neutral-600">
              You can try again, or go back to your lessons.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <Button
            type="button"
            variant="secondary"
            className="h-12 w-full rounded-2xl text-base normal-case tracking-normal"
            onClick={reset}
          >
            Try again
          </Button>

          <Button
            asChild
            variant="default"
            className="h-12 w-full rounded-2xl text-base normal-case tracking-normal"
          >
            <Link href="/learn">Back to lessons</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
