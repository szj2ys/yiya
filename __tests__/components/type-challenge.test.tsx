import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, act } from "@testing-library/react";

import {
  TypeChallenge,
  buildCharDiff,
  normalizeDiff,
} from "@/app/lesson/type-challenge";

/* ------------------------------------------------------------------ */
/*  Unit tests: diff logic                                             */
/* ------------------------------------------------------------------ */

describe("normalizeDiff", () => {
  it("should lowercase and trim", () => {
    expect(normalizeDiff("  Hello  ")).toBe("hello");
  });

  it("should strip combining diacritics", () => {
    expect(normalizeDiff("café")).toBe("cafe");
    expect(normalizeDiff("naïve")).toBe("naive");
  });
});

describe("buildCharDiff", () => {
  it("should highlight character differences between user answer and correct answer", () => {
    const diff = buildCharDiff("gatto", "gato");

    // typed: g(match) a(match) t(match) t(no match) o(no match)
    // correct: g(match) a(match) t(match) o(no match)
    expect(diff.typed).toHaveLength(5);
    expect(diff.correct).toHaveLength(4);

    // First three characters match
    expect(diff.typed[0]).toEqual({ char: "g", match: true });
    expect(diff.typed[1]).toEqual({ char: "a", match: true });
    expect(diff.typed[2]).toEqual({ char: "t", match: true });
    // Extra 't' doesn't match 'o' in correct
    expect(diff.typed[3]).toEqual({ char: "t", match: false });
    // 'o' in typed position 4 is beyond correct length
    expect(diff.typed[4]).toEqual({ char: "o", match: false });

    expect(diff.correct[0]).toEqual({ char: "g", match: true });
    expect(diff.correct[1]).toEqual({ char: "a", match: true });
    expect(diff.correct[2]).toEqual({ char: "t", match: true });
    // 'o' in correct at index 3 doesn't match 't' in typed at index 3
    expect(diff.correct[3]).toEqual({ char: "o", match: false });
  });

  it("should handle identical strings as all matching", () => {
    const diff = buildCharDiff("hello", "hello");
    expect(diff.typed.every((e) => e.match)).toBe(true);
    expect(diff.correct.every((e) => e.match)).toBe(true);
  });

  it("should handle completely different strings", () => {
    const diff = buildCharDiff("abc", "xyz");
    expect(diff.typed.every((e) => !e.match)).toBe(true);
    expect(diff.correct.every((e) => !e.match)).toBe(true);
  });

  it("should handle case-insensitive comparison", () => {
    const diff = buildCharDiff("Hello", "hello");
    expect(diff.typed.every((e) => e.match)).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  Component tests                                                    */
/* ------------------------------------------------------------------ */

describe("TypeChallenge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should auto-focus input on mount and question change", () => {
    const { rerender } = render(
      <TypeChallenge
        question="q1"
        value=""
        onChange={() => {}}
        status="none"
      />,
    );

    act(() => {
      vi.advanceTimersByTime(20);
    });

    const input = screen.getByPlaceholderText("Type your answer...");
    expect(document.activeElement).toBe(input);

    // Blur and change question to simulate new question
    (input as HTMLInputElement).blur();
    expect(document.activeElement).not.toBe(input);

    rerender(
      <TypeChallenge
        question="q2"
        value=""
        onChange={() => {}}
        status="none"
      />,
    );

    act(() => {
      vi.advanceTimersByTime(20);
    });

    expect(document.activeElement).toBe(input);
  });

  it("should submit on Enter key press", () => {
    const onSubmit = vi.fn();

    render(
      <TypeChallenge
        question="q1"
        value="answer"
        onChange={() => {}}
        status="none"
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByPlaceholderText("Type your answer...");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("should not submit on Enter when input is empty", () => {
    const onSubmit = vi.fn();

    render(
      <TypeChallenge
        question="q1"
        value=""
        onChange={() => {}}
        status="none"
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByPlaceholderText("Type your answer...");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should not submit on Enter when input is whitespace only", () => {
    const onSubmit = vi.fn();

    render(
      <TypeChallenge
        question="q1"
        value="   "
        onChange={() => {}}
        status="none"
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByPlaceholderText("Type your answer...");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should not submit on Enter when status is not none", () => {
    const onSubmit = vi.fn();

    render(
      <TypeChallenge
        question="q1"
        value="answer"
        onChange={() => {}}
        status="correct"
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByPlaceholderText("Type your answer...");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should highlight character differences between user answer and correct answer", () => {
    render(
      <TypeChallenge
        question="q1"
        value="gatto"
        onChange={() => {}}
        status="wrong"
        correctAnswer="gato"
      />,
    );

    const diffDisplay = screen.getByTestId("diff-display");
    expect(diffDisplay).toBeInTheDocument();

    // Should show "You typed:" and "Correct:" labels
    expect(screen.getByText("You typed:")).toBeInTheDocument();
    expect(screen.getByText("Correct:")).toBeInTheDocument();

    // Check that the diff has red-highlighted characters for wrong parts in user answer
    const roseBgSpans = diffDisplay.querySelectorAll(".bg-rose-100");
    expect(roseBgSpans.length).toBeGreaterThan(0);

    // Check that the diff has green-highlighted characters for differing parts in correct answer
    const greenBgSpans = diffDisplay.querySelectorAll(".bg-green-100");
    expect(greenBgSpans.length).toBeGreaterThan(0);
  });

  it("should not show diff when status is not wrong", () => {
    render(
      <TypeChallenge
        question="q1"
        value="gato"
        onChange={() => {}}
        status="correct"
        correctAnswer="gato"
      />,
    );

    expect(screen.queryByTestId("diff-display")).not.toBeInTheDocument();
  });

  it("should apply correct animation class on correct status", () => {
    render(
      <TypeChallenge
        question="q1"
        value="gato"
        onChange={() => {}}
        status="correct"
        correctAnswer="gato"
      />,
    );

    const container = screen.getByTestId("type-challenge-container");
    expect(container.classList.contains("animate-tc-pulse-green")).toBe(true);
    expect(container.classList.contains("animate-tc-shake")).toBe(false);
  });

  it("should apply shake animation class on wrong status", () => {
    render(
      <TypeChallenge
        question="q1"
        value="gatto"
        onChange={() => {}}
        status="wrong"
        correctAnswer="gato"
      />,
    );

    const container = screen.getByTestId("type-challenge-container");
    expect(container.classList.contains("animate-tc-shake")).toBe(true);
    expect(container.classList.contains("animate-tc-pulse-green")).toBe(false);
  });

  it("should not apply animation classes on none status", () => {
    render(
      <TypeChallenge
        question="q1"
        value=""
        onChange={() => {}}
        status="none"
      />,
    );

    const container = screen.getByTestId("type-challenge-container");
    expect(container.classList.contains("animate-tc-pulse-green")).toBe(false);
    expect(container.classList.contains("animate-tc-shake")).toBe(false);
  });
});
