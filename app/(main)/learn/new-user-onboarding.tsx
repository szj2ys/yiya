"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, BookOpen, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type TooltipStep = {
  id: string;
  title: string;
  description: string;
  target: string;
  icon: React.ReactNode;
};

const TOOLTIP_STEPS: TooltipStep[] = [
  {
    id: "hearts",
    title: "Hearts System",
    description: "You have 5 hearts. Each mistake costs one heart. Practice to earn them back!",
    target: "hearts-indicator",
    icon: <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-lg">❤️</div>,
  },
  {
    id: "streak",
    title: "Build Your Streak",
    description: "Complete a lesson every day to build your streak. Don't break the chain!",
    target: "streak-indicator",
    icon: <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-lg">🔥</div>,
  },
  {
    id: "xp",
    title: "Earn XP",
    description: "Complete lessons to earn XP and level up. Compete with friends on the leaderboard!",
    target: "xp-indicator",
    icon: <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-lg">⚡</div>,
  },
];

type Props = {
  userId: string;
  onComplete: () => void;
};

export function NewUserOnboarding({ userId, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has already seen onboarding
    const hasSeenOnboarding = localStorage.getItem("yiya_onboarding_completed");
    if (hasSeenOnboarding) {
      setIsVisible(false);
    }
  }, []);

  const handleStart = () => {
    setHasStarted(true);
    track("onboarding_step_viewed", { step: 0 }).catch(() => undefined);
  };

  const handleNext = () => {
    if (currentStep < TOOLTIP_STEPS.length - 1) {
      track("onboarding_step_completed", { step: currentStep }).catch(() => undefined);
      setCurrentStep((prev) => prev + 1);
      track("onboarding_step_viewed", { step: currentStep + 1 }).catch(() => undefined);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    track("onboarding_step_skipped", { step: currentStep }).catch(() => undefined);
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("yiya_onboarding_completed", "true");
    track("onboarding_step_completed", { step: currentStep }).catch(() => undefined);
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  // Welcome screen before tooltips
  if (!hasStarted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-sm w-full rounded-2xl bg-white p-6 text-center dark:bg-neutral-900"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-4xl">
            🎉
          </div>
          <h2 className="mb-2 text-xl font-bold text-neutral-800 dark:text-neutral-100">
            Welcome to Yiya!
          </h2>
          <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
            Let&apos;s take a quick tour to get you started on your language learning journey.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={handleSkip}>
              Skip
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleStart}>
              Start Tour
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const step = TOOLTIP_STEPS[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/30"
      >
        {/* Spotlight effect would go here */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <motion.div
            key={step.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-sm w-full rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">
                Step {currentStep + 1} of {TOOLTIP_STEPS.length}
              </span>
              <button
                onClick={handleSkip}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3">
              {step.icon}
              <div>
                <h3 className="font-bold text-neutral-800 dark:text-neutral-100">
                  {step.title}
                </h3>
              </div>
            </div>

            <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
              {step.description}
            </p>

            <div className="flex items-center gap-2">
              {TOOLTIP_STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    idx <= currentStep
                      ? "bg-emerald-500"
                      : "bg-neutral-200 dark:bg-neutral-700"
                  }`}
                />
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                >
                  Back
                </Button>
              )}
              <Button variant="primary" className="flex-1" onClick={handleNext}>
                {currentStep === TOOLTIP_STEPS.length - 1 ? "Get Started" : "Next"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
