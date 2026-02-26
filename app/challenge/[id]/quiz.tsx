"use client";

import { useState, useCallback } from "react";

import type { ChallengePublic, ChallengeResult, ChallengeQuestion } from "@/lib/challenge";
import { cn } from "@/lib/utils";

type Props = {
  challenge: ChallengePublic;
  onComplete: (result: ChallengeResult) => void;
};

export function ChallengeQuiz({ challenge, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [status, setStatus] = useState<"none" | "correct" | "wrong">("none");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const question = challenge.questions[currentIndex];
  const totalQuestions = challenge.questions.length;
  const progress = ((currentIndex) / totalQuestions) * 100;

  const handleSelect = useCallback(
    (optionId: number) => {
      if (status !== "none") return;
      setSelectedOption(optionId);
    },
    [status],
  );

  const handleCheck = useCallback(async () => {
    if (selectedOption === null) return;

    if (status !== "none") {
      // Move to next question
      const nextIndex = currentIndex + 1;

      if (nextIndex >= totalQuestions) {
        // Submit all answers
        setSubmitting(true);
        try {
          const res = await fetch(`/api/challenge/${challenge.id}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers }),
          });
          if (res.ok) {
            const result = (await res.json()) as ChallengeResult;
            onComplete(result);
          } else {
            // Fallback: compute locally (we don't have answers, but show 0)
            onComplete({
              friendScore: 0,
              challengerScore: challenge.challengerScore,
              totalQuestions,
              correctAnswers: [],
            });
          }
        } catch {
          onComplete({
            friendScore: 0,
            challengerScore: challenge.challengerScore,
            totalQuestions,
            correctAnswers: [],
          });
        }
        return;
      }

      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setStatus("none");
      return;
    }

    // Record answer
    const newAnswers = { ...answers, [question.id]: selectedOption };
    setAnswers(newAnswers);

    // We don't know the correct answer client-side, so just mark as answered
    // and move forward. The actual scoring happens server-side on submit.
    // For UX, we'll just show a neutral "answered" state and move on.
    setStatus("correct"); // Visual feedback — actual correctness computed on submit
  }, [
    selectedOption,
    status,
    currentIndex,
    totalQuestions,
    answers,
    question,
    challenge.id,
    challenge.challengerScore,
    onComplete,
  ]);

  if (!question) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with progress */}
      <div className="flex items-center gap-4 px-6 pt-6 pb-4 max-w-lg mx-auto w-full">
        <div className="flex-1 h-3 rounded-full bg-neutral-100 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm font-semibold text-neutral-500 tabular-nums min-w-[3rem] text-right">
          {currentIndex + 1}/{totalQuestions}
        </p>
      </div>

      {/* Challenge info */}
      <div className="px-6 max-w-lg mx-auto w-full">
        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">
          {challenge.challengerName}&apos;s Challenge
        </p>
        <p className="text-xs text-neutral-400 mb-4">{challenge.language}</p>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full">
        <h2 className="text-xl lg:text-2xl font-bold text-neutral-800 text-center mb-8">
          {question.question}
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3 w-full" data-testid="challenge-options">
          {question.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isAnswered = status !== "none";

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                disabled={isAnswered}
                className={cn(
                  "w-full rounded-2xl border-2 p-4 text-left font-medium transition-all",
                  "hover:bg-neutral-50 active:scale-[0.98]",
                  isSelected && !isAnswered &&
                    "border-emerald-500 bg-emerald-50 text-emerald-700",
                  isSelected && isAnswered &&
                    "border-emerald-500 bg-emerald-50 text-emerald-700",
                  !isSelected && !isAnswered &&
                    "border-neutral-200 text-neutral-700",
                  !isSelected && isAnswered &&
                    "border-neutral-200 text-neutral-400 opacity-60",
                )}
              >
                {option.imageSrc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={option.imageSrc}
                    alt=""
                    className="w-10 h-10 mb-2 rounded"
                  />
                )}
                {option.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 max-w-lg mx-auto w-full">
        <button
          type="button"
          onClick={handleCheck}
          disabled={selectedOption === null || submitting}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-lg transition-all",
            selectedOption !== null
              ? "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800"
              : "bg-neutral-100 text-neutral-400 cursor-not-allowed",
          )}
          data-testid="challenge-check-btn"
        >
          {submitting
            ? "Calculating..."
            : status !== "none"
              ? currentIndex + 1 >= totalQuestions
                ? "See Results"
                : "Next"
              : "Check"}
        </button>
      </div>
    </div>
  );
}
