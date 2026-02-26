"use client";

import { useEffect, useMemo, useRef, useState, useTransition, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

import { courses } from "@/db/schema";
import { upsertUserProgress } from "@/actions/user-progress";
import { getReferralData, clearReferralData } from "@/lib/referral";

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
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

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

  useEffect(() => {
    if (step !== 2) return;

    setSelectedOptionIndex(null);
    setTryItStatus(null);
    clearAdvanceTimeout();
  }, [step, selectedCourseId, clearAdvanceTimeout]);

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
  }, []);

  const handleGoalSelect = useCallback((lessons: number) => {
    setSelectedGoal(lessons);
  }, []);

  const handleContinueToTryIt = useCallback(() => {
    if (selectedCourseId === null) return;
    setStep(2);
  }, [selectedCourseId]);

  const handleSkipTryIt = useCallback(() => {
    if (selectedCourseId === null) return;
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
    },
    [sampleChallenge, tryItStatus],
  );

  const handleFinish = useCallback(() => {
    if (selectedCourseId === null) return;
    setStep(4);

    const referral = getReferralData();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    startTransition(() => {
      upsertUserProgress(selectedCourseId, selectedGoal ?? 1, referral, tz)
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

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 px-4 pt-6 pb-2">
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
            <div className="mx-auto mt-auto w-full max-w-lg pt-6 pb-2">
              <button
                onClick={handleContinueToTryIt}
                disabled={selectedCourseId === null}
                className="h-12 w-full rounded-2xl bg-green-600 text-base font-semibold text-white transition-all duration-200 hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
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
              <button
                onClick={handleSkipTryIt}
                className="h-10 w-full rounded-2xl text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700"
              >
                Skip
              </button>
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
                disabled={selectedGoal === null || pending}
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
