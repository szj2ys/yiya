"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Props = {
  userId: string;
  onStartLesson: () => void;
};

export const FirstLessonPrompt = ({ userId, onStartLesson }: Props) => {
  useEffect(() => {
    track("empty_state_shown", {
      state_type: "first_lesson",
      user_id: userId,
    }).catch(() => undefined);
  }, [userId]);

  const handleStart = () => {
    track("empty_state_cta_clicked", {
      state_type: "first_lesson",
      user_id: userId,
      cta_action: "start_first_lesson",
    }).catch(() => undefined);
    onStartLesson();
  };

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 p-6 dark:border-emerald-800 dark:from-emerald-950/50 dark:to-teal-950/50">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
            Welcome to your language journey!
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Your first lesson takes just 2 minutes
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-white/60 p-4 dark:bg-neutral-900/60">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-amber-400 to-orange-500 dark:border-neutral-800"
            />
          ))}
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">1,000+ learners</span> started today
        </p>
      </div>

      <Button
        size="lg"
        variant="primary"
        className="w-full animate-pulse"
        onClick={handleStart}
      >
        Start your first lesson
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export const NoProgressYet = ({ userId, onStartLesson }: Props) => {
  useEffect(() => {
    track("empty_state_shown", {
      state_type: "no_progress",
      user_id: userId,
    }).catch(() => undefined);
  }, [userId]);

  const handleStart = () => {
    track("empty_state_cta_clicked", {
      state_type: "no_progress",
      user_id: userId,
      cta_action: "begin_learning",
    }).catch(() => undefined);
    onStartLesson();
  };

  return (
    <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900">
          <Image
            src="/mascot.svg"
            alt="Yiya mascot"
            width={40}
            height={40}
            className="opacity-80"
          />
        </div>
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">
          0
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
          No progress yet
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Every expert was once a beginner. Start your first lesson now!
        </p>
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={handleStart}>
        Begin learning
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

type LearningPathProps = Props & {
  courseName: string;
  totalUnits: number;
};

export const LearningPathPreview = ({ userId, courseName, totalUnits, onStartLesson }: LearningPathProps) => {
  useEffect(() => {
    track("empty_state_shown", {
      state_type: "new_user",
      user_id: userId,
    }).catch(() => undefined);
  }, [userId]);

  const handleStart = () => {
    track("empty_state_cta_clicked", {
      state_type: "new_user",
      user_id: userId,
      cta_action: "start_learning_path",
    }).catch(() => undefined);
    onStartLesson();
  };

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white">
        <h3 className="font-bold">Your learning path</h3>
        <p className="text-sm text-white/80">{courseName}</p>
      </div>

      <div className="p-4">
        <div className="mb-4 flex items-center gap-2">
          {Array.from({ length: Math.min(totalUnits, 5) }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i === 0
                  ? "bg-violet-500"
                  : "bg-neutral-200 dark:bg-neutral-700"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">
            {totalUnits} units
          </span>
          <span className="font-medium text-violet-600 dark:text-violet-400">
            Unit 1 of {totalUnits}
          </span>
        </div>

        <div className="mt-4 rounded-xl bg-violet-50 p-3 dark:bg-violet-950/50">
          <p className="text-sm text-violet-800 dark:text-violet-200">
            Complete Unit 1 to unlock your first certificate!
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="mt-4 w-full"
          onClick={handleStart}
        >
          Start learning
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
