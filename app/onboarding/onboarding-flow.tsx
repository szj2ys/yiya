"use client";

import { useEffect, useMemo, useRef, useState, useTransition, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Check, Loader2, Zap, ArrowRight } from "lucide-react";

import { courses } from "@/db/schema";
import { upsertUserProgress } from "@/actions/user-progress";
import { getReferralData, clearReferralData } from "@/lib/referral";
import { track } from "@/lib/analytics";
import { useOnboardingTryItABTest } from "@/lib/onboarding-ab-test";

import { getSampleChallenge } from "./sample-challenges";

type Course = typeof courses.$inferSelect;

type TryItStatus = "correct" | "wrong" | null;

const DAILY_GOALS = [
  { label: "Casual", lessons: 1, description: "1 lesson / day" },
  { label: "Regular", lessons: 3, description: "3 lessons / day" },
  { label: "Intense", lessons: 5, description: "5 lessons / day" },
] as const;

const STEP_COUNT = 4;

const TRY_IT_ANIMATION_CSS = [
  "@keyframes ob-pop {",
  "  0%   { transform: scale(1); }",
  "  60%  { transform: scale(1.04); }",
  "  100% { transform: scale(1); }",
  "}",
  "@keyframes ob-shake {",
  "  0%, 100% { transform: translateX(0); }",
  "  15%      { transform: translateX(-4px); }",
  "  30%      { transform: translateX(4px); }",
  "  45%      { transform: translateX(-4px); }",
  "  60%      { transform: translateX(4px); }",
  "  75%      { transform: translateX(-2px); }",
  "  90%      { transform: translateX(2px); }",
  "}",
].join("\n");

type Props = {
  courses: Course[];
};

export const OnboardingFlow = ({ courses }: Props) => {
  const [step, setStep] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null); // No default, user must select
  const [pending, startTransition] = useTransition();

  // A/B test for Try-it Quiz
  const { variant: tryItVariant, getVariantInfo } = useOnboardingTryItABTest(null);

  // Track step timing for duration calculation
  const stepStartTimeRef = useRef<number>(Date.now());
  const currentStepRef = useRef<number>(1);

  // Track initial step view
  useEffect(() => {
    stepStartTimeRef.current = Date.now();
    currentStepRef.current = 1;
    track("onboarding_step_viewed", { step: 1, total_steps: STEP_COUNT });

    // Track page unload/abandon
    const handleBeforeUnload = () => {
      const durationSeconds = Math.round((Date.now() - stepStartTimeRef.current) / 1000);
      track("onboarding_abandon", {
        last_step: currentStepRef.current,
        exit_reason: "page_close",
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Track step changes
  useEffect(() => {
    if (step !== currentStepRef.current) {
      const durationSeconds = Math.round((Date.now() - stepStartTimeRef.current) / 1000);

      // Track completion of previous step
      if (step > currentStepRef.current) {
        track("onboarding_step_completed", {
          step: currentStepRef.current,
          duration_seconds: durationSeconds,
        });
      }

      // Track view of new step (if not completion step)
      if (step <= STEP_COUNT) {
        track("onboarding_step_viewed", { step, total_steps: STEP_COUNT });
      }

      stepStartTimeRef.current = Date.now();
      currentStepRef.current = step;
    }
  }, [step]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId],
  );

  const sampleChallenge = useMemo(() => {
    if (!selectedCourse) return undefined;
    return getSampleChallenge(selectedCourse.title);
  }, [selectedCourse]);

  const correctOptionIndex = useMemo(() => {
    if (!sampleChallenge) return -1;
    return sampleChallenge.options.findIndex((o) => o.correct);
  }, [sampleChallenge]);

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [tryItStatus, setTryItStatus] = useState<TryItStatus>(null);

  const advanceTimeoutRef = useRef<number | null>(null);

  const clearAdvanceTimeout = useCallback(() => {
    if (advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  }, []);

  const goToGoalStep = useCallback(() => {
    clearAdvanceTimeout();
    setStep(3);
  }, [clearAdvanceTimeout]);

  const goToFirstLesson = useCallback(() => {
    if (selectedCourseId === null) return;

    // Track quick start selection
    track("onboarding_quick_start_selected", { course_id: selectedCourseId });

    // Use default goal of 1 lesson/day for quick start
    const goalToUse = selectedGoal ?? 1;

    startTransition(() => {
      upsertUserProgress(selectedCourseId, goalToUse, getReferralData(), new Date().getTimezoneOffset())
        .then(() => {
          clearReferralData();
          // Redirect to first lesson
          window.location.href = "/learn";
        })
        .catch(() => {
          toast.error("Something went wrong. Please try again.");
        });
    });
  }, [selectedCourseId, selectedGoal, startTransition]);

  useEffect(() => {
    if (step !== 2) return;

    // Track variant shown for A/B test analysis
    track("onboarding_try_it_variant_shown", { variant: tryItVariant });

    // Handle "skip_quiz" variant - auto-skip to daily goal
    if (tryItVariant === "skip_quiz") {
      track("onboarding_step_skipped", { step: 2, reason: "ab_test_skip_quiz" });
      goToGoalStep();
      return;
    }

    setSelectedOptionIndex(null);
    setTryItStatus(null);
    clearAdvanceTimeout();
  }, [step, selectedCourseId, clearAdvanceTimeout, tryItVariant]);

  useEffect(() => {
    if (step === 2 && selectedCourseId !== null && !sampleChallenge) {
      goToGoalStep();
    }
  }, [step, selectedCourseId, sampleChallenge, goToGoalStep]);

  useEffect(() => {
    if (step !== 2 || tryItStatus === null) return;

    const ms = tryItStatus === "correct" ? 1500 : 2000;
    advanceTimeoutRef.current = window.setTimeout(goToGoalStep, ms);

    return () => {
      clearAdvanceTimeout();
    };
  }, [step, tryItStatus, goToGoalStep, clearAdvanceTimeout]);

  const handleLanguageSelect = useCallback((courseId: number) => {
    setSelectedCourseId(courseId);
    track("onboarding_course_selected", { course_id: courseId });
  }, []);

  const handleGoalSelect = useCallback((lessons: number) => {
    setSelectedGoal(lessons);
    track("onboarding_goal_selected", { goal: lessons });
  }, []);

  const handleContinueToTryIt = useCallback(() => {
    if (selectedCourseId === null) return;
    setStep(2);
  }, [selectedCourseId]);

  const handleSkipTryIt = useCallback(() => {
    if (selectedCourseId === null) return;
    track("onboarding_step_skipped", { step: 2 });
    goToGoalStep();
  }, [selectedCourseId, goToGoalStep]);

  const handleTryItSelect = useCallback(
    (optionIndex: number) => {
      if (!sampleChallenge) return;
      if (tryItStatus !== null) return;
      if (!sampleChallenge.options[optionIndex]) return;

      const isCorrect = sampleChallenge.options[optionIndex].correct;
      setSelectedOptionIndex(optionIndex);
      setTryItStatus(isCorrect ? "correct" : "wrong");
      track("onboarding_try_it_result", { correct: isCorrect });
    },
    [sampleChallenge, tryItStatus],
  );

  const handleFinish = useCallback(() => {
    if (selectedCourseId === null) return;
    setStep(4);

    const referral = getReferralData();
    startTransition(() => {
      upsertUserProgress(selectedCourseId, selectedGoal ?? 1, referral, new Date().getTimezoneOffset())
        .then(() => clearReferralData())
        .catch(() => {
          toast.error("Something went wrong. Please try again.");
          setStep(3);
        });
    });
  }, [selectedCourseId, selectedGoal, startTransition]);

  return (
    <div className="flex min-h-screen flex-col">
      <style>{TRY_IT_ANIMATION_CSS}</style>

      {/* Progress dots with step label */}
      <div className="flex flex-col items-center gap-2 px-4 pt-6 pb-2">
        <div className="flex items-center gap-2">
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 === step
                  ? "w-8 bg-green-600"
                  : i + 1 < step
                    ? "w-2 bg-green-600"
                    : "w-2 bg-neutral-200"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-neutral-400">
          Step {Math.min(step, STEP_COUNT)} of {STEP_COUNT}
        </p>
      </div>

      {/* Step content */}
      <div className="flex flex-1 flex-col">
        {step === 1 && (
          <div className="flex flex-1 flex-col px-4 pt-6 pb-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mx-auto w-full max-w-lg">
              <h1 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                What do you want to learn?
              </h1>
              <p className="mt-2 text-center text-sm text-neutral-500 sm:text-base">
                Pick a language to get started.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {courses.map((course) => {
                  const isSelected = selectedCourseId === course.id;

                  return (
                    <button
                      key={course.id}
                      onClick={() => handleLanguageSelect(course.id)}
                      className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all duration-200 active:scale-[0.97] ${
                        isSelected
                          ? "border-green-600 bg-green-50 shadow-sm"
                          : "border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className="relative h-12 w-16 overflow-hidden rounded-lg ring-1 ring-black/10">
                        <Image
                          src={course.imageSrc}
                          alt={`${course.title} flag`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm font-semibold text-neutral-900">
                        {course.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mx-auto mt-auto w-full max-w-lg pt-6 pb-2 space-y-3">
              <button
                onClick={handleContinueToTryIt}
                disabled={selectedCourseId === null}
                className="h-12 w-full rounded-2xl bg-green-600 text-base font-semibold text-white transition-all duration-200 hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
              {selectedCourseId !== null && (
                <button
                  onClick={goToFirstLesson}
                  disabled={pending}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-green-600 bg-white text-base font-semibold text-green-600 transition-all duration-200 hover:bg-green-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Zap className="h-4 w-4" />
                  Quick Start
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {step === 2 && sampleChallenge && (
          <div className="flex flex-1 flex-col px-4 pt-6 pb-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mx-auto w-full max-w-lg">
              <h1 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Try it
              </h1>
              <p className="mt-2 text-center text-sm text-neutral-500 sm:text-base">
                One quick question to get a feel for it.
              </p>

              <div className="mt-8 rounded-2xl border-2 border-neutral-100 bg-white p-5 shadow-sm">
                <p className="text-base font-semibold text-neutral-900" data-testid="try-it-question">
                  {sampleChallenge.question}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {sampleChallenge.options.map((option, index) => {
                  const isSelected = selectedOptionIndex === index;
                  const isCorrect = option.correct;

                  const showCorrect = tryItStatus !== null && isCorrect;
                  const showWrong = tryItStatus === "wrong" && isSelected && !isCorrect;

                  const isDisabled = tryItStatus !== null;

                  const animationClass = showWrong
                    ? "animate-[ob-shake_300ms_ease-out]"
                    : showCorrect && tryItStatus === "correct"
                      ? "animate-[ob-pop_250ms_ease-out]"
                      : "";

                  return (
                    <button
                      key={option.text}
                      onClick={() => handleTryItSelect(index)}
                      disabled={isDisabled}
                      className={`relative flex min-h-[56px] w-full items-center justify-between rounded-2xl border-2 border-b-4 px-5 py-4 text-left transition-all duration-200 active:scale-[0.98] active:border-b-2 disabled:cursor-not-allowed ${
                        showCorrect
                          ? "border-green-600 bg-green-50"
                          : showWrong
                            ? "border-rose-400 bg-rose-50"
                            : "border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50"
                      } ${animationClass} motion-reduce:animate-none`}
                      aria-label={option.text}
                      data-testid={`try-it-option-${index}`}
                    >
                      <span
                        className={`text-base font-semibold ${
                          showCorrect
                            ? "text-green-700"
                            : showWrong
                              ? "text-rose-700"
                              : "text-neutral-900"
                        }`}
                      >
                        {option.text}
                      </span>

                      {showCorrect && (
                        <span className="ml-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
                          <Check className="h-4 w-4 text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {tryItStatus === "correct" && (
                <p className="mt-6 text-center text-base font-semibold text-green-700 animate-in fade-in duration-200">
                  Nice!
                </p>
              )}

              {tryItStatus === "wrong" && (
                <p className="mt-6 text-center text-base font-semibold text-rose-700 animate-in fade-in duration-200">
                  Almost!
                </p>
              )}
            </div>

            {/* Bottom CTA */}
            <div className="mx-auto mt-auto w-full max-w-lg pt-6 pb-2">
              {tryItVariant === "prominent_skip" ? (
                <div className="space-y-3">
                  <button
                    onClick={handleSkipTryIt}
                    className="h-12 w-full rounded-2xl border-2 border-neutral-200 bg-white text-base font-semibold text-neutral-700 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98]"
                  >
                    Not sure? Skip for now
                  </button>
                  <button
                    onClick={handleSkipTryIt}
                    className="h-10 w-full rounded-2xl text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-600"
                  >
                    I&apos;ll try later
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSkipTryIt}
                  className="h-10 w-full rounded-2xl text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-1 flex-col px-4 pt-6 pb-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mx-auto w-full max-w-lg">
              <h1 className="text-center text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Set your daily goal
              </h1>
              <p className="mt-2 text-center text-sm text-neutral-500 sm:text-base">
                You can always change this later.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                {DAILY_GOALS.map((goal) => {
                  const isSelected = selectedGoal === goal.lessons;

                  return (
                    <button
                      key={goal.lessons}
                      onClick={() => handleGoalSelect(goal.lessons)}
                      className={`flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-200 active:scale-[0.98] ${
                        isSelected
                          ? "border-green-600 bg-green-50 shadow-sm"
                          : "border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                          isSelected
                            ? "bg-green-600 text-white"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {goal.lessons}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-semibold text-neutral-900">
                          {goal.label}
                        </span>
                        <span className="text-sm text-neutral-500">
                          {goal.description}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mx-auto mt-auto w-full max-w-lg pt-6 pb-2">
              <button
                onClick={handleFinish}
                disabled={pending || selectedGoal === null}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-green-600 text-base font-semibold text-white transition-all duration-200 hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Start Learning"
                )}
              </button>
              <button
                onClick={() => setStep(1)}
                disabled={pending}
                className="mt-3 h-10 w-full rounded-2xl text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700 disabled:opacity-40"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-1 flex-col items-center justify-center px-4 animate-in fade-in duration-500">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="mt-4 text-base font-medium text-neutral-600">
              Setting up your course...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
