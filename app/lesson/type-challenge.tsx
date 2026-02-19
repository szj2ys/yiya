"use client";

import { useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Character-level diff helper                                        */
/* ------------------------------------------------------------------ */

/** Normalize for comparison: trim, lowercase, strip combining diacritics. */
export const normalizeDiff = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * Build a list of { char, match } tuples by walking both strings index by index.
 * `match` is true when the normalized characters at that position are equal.
 */
export const buildCharDiff = (
  typed: string,
  correct: string,
): { typed: { char: string; match: boolean }[]; correct: { char: string; match: boolean }[] } => {
  const nTyped = normalizeDiff(typed);
  const nCorrect = normalizeDiff(correct);
  const maxLen = Math.max(typed.length, correct.length);

  const typedResult: { char: string; match: boolean }[] = [];
  const correctResult: { char: string; match: boolean }[] = [];

  for (let i = 0; i < maxLen; i++) {
    const tChar = typed[i] ?? "";
    const cChar = correct[i] ?? "";
    const nT = nTyped[i] ?? "";
    const nC = nCorrect[i] ?? "";
    const isMatch = nT === nC && nT !== "";

    if (i < typed.length) {
      typedResult.push({ char: tChar, match: isMatch });
    }
    if (i < correct.length) {
      correctResult.push({ char: cChar, match: isMatch });
    }
  }

  return { typed: typedResult, correct: correctResult };
};

/* ------------------------------------------------------------------ */
/*  DiffDisplay sub-component                                          */
/* ------------------------------------------------------------------ */

const DiffDisplay = ({ typed, correct }: { typed: string; correct: string }) => {
  const diff = buildCharDiff(typed, correct);

  return (
    <div className="flex flex-col gap-y-2 text-sm" data-testid="diff-display">
      <div>
        <span className="text-neutral-500 mr-2">You typed:</span>
        <span className="font-mono tracking-wide">
          {diff.typed.map((entry, i) => (
            <span
              key={i}
              className={entry.match ? "text-neutral-600" : "text-rose-600 bg-rose-100 rounded px-px"}
            >
              {entry.char}
            </span>
          ))}
        </span>
      </div>
      <div>
        <span className="text-neutral-500 mr-2">Correct:</span>
        <span className="font-mono tracking-wide">
          {diff.correct.map((entry, i) => (
            <span
              key={i}
              className={entry.match ? "text-neutral-600" : "text-green-600 bg-green-100 rounded px-px"}
            >
              {entry.char}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  CSS keyframes for feedback animations (static string, safe)        */
/* ------------------------------------------------------------------ */

const ANIMATION_CSS = [
  "@keyframes tc-pulse-green {",
  "  0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }",
  "  50%  { box-shadow: 0 0 0 6px rgba(34,197,94,0.15); }",
  "  100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }",
  "}",
  "@keyframes tc-shake {",
  "  0%, 100% { transform: translateX(0); }",
  "  15%      { transform: translateX(-4px); }",
  "  30%      { transform: translateX(4px); }",
  "  45%      { transform: translateX(-4px); }",
  "  60%      { transform: translateX(4px); }",
  "  75%      { transform: translateX(-2px); }",
  "  90%      { transform: translateX(2px); }",
  "}",
  ".animate-tc-pulse-green { animation: tc-pulse-green 300ms ease-out; }",
  ".animate-tc-shake       { animation: tc-shake 300ms ease-out; }",
].join("\n");

/* ------------------------------------------------------------------ */
/*  TypeChallenge component                                            */
/* ------------------------------------------------------------------ */

type Props = {
  question: string;
  value: string;
  onChange: (value: string) => void;
  status: "correct" | "wrong" | "none";
  disabled?: boolean;
  correctAnswer?: string;
  onSubmit?: () => void;
};

export const TypeChallenge = ({
  question,
  value,
  onChange,
  status,
  disabled,
  correctAnswer,
  onSubmit,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  /* Task 1: Auto-focus on new question (status resets to "none", question text changes) */
  useEffect(() => {
    if (status === "none") {
      // Small timeout to ensure DOM is ready after transition
      const timer = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [status, question]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || status !== "none") return;
      onChange(e.target.value);
    },
    [disabled, status, onChange],
  );

  /* Task 2: Enter key to submit */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && status === "none" && value.trim().length > 0 && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
    },
    [status, value, onSubmit],
  );

  return (
    <>
      {/* Inject animation keyframes (static CSS literal) */}
      <style>{ANIMATION_CSS}</style>

      <div className="flex flex-col gap-y-4 w-full">
        {/* Task 4: Animation classes based on status */}
        <div
          data-testid="type-challenge-container"
          className={cn(
            "w-full rounded-xl border-2 border-b-4 p-4 transition-colors",
            status === "none" && "border-neutral-200 focus-within:border-sky-300",
            status === "correct" && "border-green-300 bg-green-50 animate-tc-pulse-green",
            status === "wrong" && "border-rose-300 bg-rose-50 animate-tc-shake",
          )}
        >
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || status !== "none"}
            placeholder="Type your answer..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className={cn(
              "w-full bg-transparent outline-none text-base lg:text-lg text-neutral-700 placeholder:text-neutral-400",
              status === "correct" && "text-green-600",
              status === "wrong" && "text-rose-600",
              disabled && "cursor-not-allowed opacity-60",
            )}
          />
        </div>

        {/* Task 3: Character-level diff on wrong answer */}
        {status === "wrong" && correctAnswer && (
          <DiffDisplay typed={value} correct={correctAnswer} />
        )}
      </div>
    </>
  );
};
