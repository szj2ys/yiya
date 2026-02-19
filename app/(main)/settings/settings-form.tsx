"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

import { courses } from "@/db/schema";
import { updateUserSettings } from "@/actions/user-settings";

type Course = typeof courses.$inferSelect;

const DAILY_GOALS = [
  { label: "Casual", lessons: 1, description: "1 lesson / day" },
  { label: "Regular", lessons: 3, description: "3 lessons / day" },
  { label: "Intense", lessons: 5, description: "5 lessons / day" },
] as const;

type Props = {
  courses: Course[];
  currentCourseId: number;
  currentDailyGoal: number;
};

export const SettingsForm = ({
  courses,
  currentCourseId,
  currentDailyGoal,
}: Props) => {
  const [selectedCourseId, setSelectedCourseId] = useState(currentCourseId);
  const [selectedGoal, setSelectedGoal] = useState(currentDailyGoal);
  const [pending, startTransition] = useTransition();

  const hasChanges =
    selectedCourseId !== currentCourseId || selectedGoal !== currentDailyGoal;

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateUserSettings(selectedCourseId, selectedGoal);
        toast.success("Settings saved!");
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="w-full space-y-10">
      {/* Daily Goal Section */}
      <section>
        <h2 className="text-lg font-bold text-neutral-800 mb-1">
          Daily goal
        </h2>
        <p className="text-sm text-neutral-500 mb-4">
          How many lessons do you want to complete each day?
        </p>
        <div className="flex flex-col gap-3">
          {DAILY_GOALS.map((goal) => {
            const isSelected = selectedGoal === goal.lessons;

            return (
              <button
                key={goal.lessons}
                onClick={() => setSelectedGoal(goal.lessons)}
                disabled={pending}
                className={`flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-200 active:scale-[0.98] disabled:opacity-60 ${
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
      </section>

      {/* Language Section */}
      <section>
        <h2 className="text-lg font-bold text-neutral-800 mb-1">
          Language
        </h2>
        <p className="text-sm text-neutral-500 mb-4">
          Switch to a different language course.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {courses.map((course) => {
            const isSelected = selectedCourseId === course.id;

            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                disabled={pending}
                className={`relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all duration-200 active:scale-[0.97] disabled:opacity-60 ${
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
      </section>

      {/* Save Button */}
      <div className="sticky bottom-4 pt-2">
        <button
          onClick={handleSave}
          disabled={!hasChanges || pending}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-green-600 text-base font-semibold text-white transition-all duration-200 hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </div>
  );
};
