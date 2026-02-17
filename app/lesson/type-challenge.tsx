"use client";

import { useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type Props = {
  question: string;
  value: string;
  onChange: (value: string) => void;
  status: "correct" | "wrong" | "none";
  disabled?: boolean;
  correctAnswer?: string;
};

export const TypeChallenge = ({
  question,
  value,
  onChange,
  status,
  disabled,
  correctAnswer,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "none") {
      inputRef.current?.focus();
    }
  }, [status, question]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || status !== "none") return;
      onChange(e.target.value);
    },
    [disabled, status, onChange],
  );

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div
        className={cn(
          "w-full rounded-xl border-2 border-b-4 p-4 transition-colors",
          status === "none" && "border-neutral-200 focus-within:border-sky-300",
          status === "correct" && "border-green-300 bg-green-50",
          status === "wrong" && "border-rose-300 bg-rose-50",
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
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

      {status === "wrong" && correctAnswer && (
        <p className="text-sm text-neutral-600">
          Correct answer:{" "}
          <span className="font-semibold text-green-600">{correctAnswer}</span>
        </p>
      )}
    </div>
  );
};
