"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

import { courses } from "@/db/schema";
import { upsertUserProgress } from "@/actions/user-progress";

type Course = typeof courses.$inferSelect;

const DAILY_GOALS = [
  { label: "Casual", lessons: 1, description: "1 lesson / day" },
  { label: "Regular", lessons: 3, description: "3 lessons / day" },
  { label: "Intense", lessons: 5, description: "5 lessons / day" },
] as const;

const STEP_COUNT = 3;

type Props = {
  courses: Course[];
};

export const OnboardingFlow = ({ courses }: Props) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const handleLanguageSelect = useCallback((courseId: number) => {
    setSelectedCourseId(courseId);
  }, []);

  const handleGoalSelect = useCallback((lessons: number) => {
    setSelectedGoal(lessons);
  }, []);

  const handleContinueToGoal = useCallback(() => {
    if (selectedCourseId === null) return;
    setStep(2);
  }, [selectedCourseId]);

  const handleFinish = useCallback(() => {
    if (selectedCourseId === null) return;
    setStep(3);

    startTransition(() => {
      upsertUserProgress(selectedCourseId, selectedGoal ?? 1).catch(() => {
        toast.error("Something went wrong. Please try again.");
        setStep(2);
      });
    });
  }, [selectedCourseId, selectedGoal, startTransition]);

  return (
    <div className="flex min-h-screen flex-col">
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
                onClick={handleContinueToGoal}
                disabled={selectedCourseId === null}
                className="h-12 w-full rounded-2xl bg-green-600 text-base font-semibold text-white transition-all duration-200 hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
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

        {step === 3 && (
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
