import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import type { challenges } from "@/db/schema";

import { Quiz } from "@/app/lesson/quiz";

// Mocks
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("next/image", () => ({ default: (props: any) => <img {...props} /> }));
vi.mock("react-confetti", () => ({ default: () => null }));
vi.mock("react-use", () => ({
  useMount: (fn: any) => fn(),
  useWindowSize: () => ({ width: 0, height: 0 }),
  useAudio: () => [null, null, { play: vi.fn() }],
  useKey: vi.fn(),
  useMedia: () => false,
}));

const pushSpy = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushSpy }) }));

const openPracticeModalSpy = vi.fn();
vi.mock("@/store/use-practice-modal", () => ({
  usePracticeModal: () => ({ open: openPracticeModalSpy }),
}));

vi.mock("@/store/use-hearts-modal", () => ({ useHeartsModal: () => ({ open: vi.fn() }) }));
vi.mock("@/actions/challenge-progress", () => ({
  upsertChallengeProgress: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/actions/user-progress", () => ({ reduceHearts: vi.fn().mockResolvedValue({}) }));

// Keep UI shallow for non-completion parts
vi.mock("@/app/lesson/header", () => ({ Header: () => null }));
vi.mock("@/app/lesson/result-card", () => ({ ResultCard: () => null }));
vi.mock("@/app/lesson/question-bubble", () => ({ QuestionBubble: () => null }));

const fetchSpy = vi.fn();
// @ts-expect-error - test env
global.fetch = fetchSpy;

beforeEach(() => {
  pushSpy.mockClear();
  openPracticeModalSpy.mockClear();
  fetchSpy.mockReset();
});

describe("Quiz completion screen enhancements", () => {
  it("should show perfect badge when no wrong answers", () => {
    // Render with empty challenges array => immediately shows completion screen
    // wrongAnswers stays empty (0 wrong), so "Perfect!" should appear
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        nextLessonId={2}
        initialLessonChallenges={[]}
      />,
    );

    expect(screen.getByText("Perfect!")).toBeInTheDocument();
    expect(screen.getByText("Zero mistakes — outstanding work.")).toBeInTheDocument();
    expect(screen.getByText("Lesson complete")).toBeInTheDocument();
  });

  it("should render next lesson button as primary CTA", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        nextLessonId={2}
        initialLessonChallenges={[]}
      />,
    );

    const nextBtn = screen.getByRole("button", { name: "Next Lesson" });
    expect(nextBtn).toBeInTheDocument();
    // Verify it has the green primary CTA styling
    expect(nextBtn.className).toContain("bg-emerald-600");
  });

  it("should navigate to next lesson on click", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={0}
        courseLanguage="Spanish"
        userSubscription={null}
        nextLessonId={42}
        initialLessonChallenges={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next Lesson" }));
    expect(pushSpy).toHaveBeenCalledWith("/lesson/42");
  });

  it("should show Back to Learn button when no next lesson", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={0}
        courseLanguage="Spanish"
        userSubscription={null}
        nextLessonId={null}
        initialLessonChallenges={[]}
      />,
    );

    expect(screen.getByText("All lessons complete!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to Learn" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next Lesson" })).not.toBeInTheDocument();
  });

  it("should navigate to /learn when Back to Learn clicked", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={0}
        courseLanguage="Spanish"
        userSubscription={null}
        nextLessonId={null}
        initialLessonChallenges={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Back to Learn" }));
    expect(pushSpy).toHaveBeenCalledWith("/learn");
  });

  it("should show Back to Learn as secondary when next lesson exists", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={0}
        courseLanguage="Spanish"
        userSubscription={null}
        nextLessonId={5}
        initialLessonChallenges={[]}
      />,
    );

    // Both Next Lesson and Back to Learn should exist
    expect(screen.getByRole("button", { name: "Next Lesson" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to Learn" })).toBeInTheDocument();
  });

  it("should display next lesson title below the Next Lesson button", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        nextLessonId={2}
        nextLessonTitle="Colors"
        initialLessonChallenges={[]}
      />,
    );

    expect(screen.getByText("Next Lesson")).toBeInTheDocument();
    expect(screen.getByText("Colors")).toBeInTheDocument();
    // The title should be inside the same button
    const colorsEl = screen.getByText("Colors");
    expect(colorsEl.closest("button")).not.toBeNull();
    expect(colorsEl.className).toContain("text-sm");
    expect(colorsEl.className).toContain("text-neutral-500");
  });

  it("should not show next lesson title when nextLessonTitle is null", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        nextLessonId={2}
        nextLessonTitle={null}
        initialLessonChallenges={[]}
      />,
    );

    expect(screen.getByText("Next Lesson")).toBeInTheDocument();
    // No subtitle should be rendered
    const nextBtn = screen.getByText("Next Lesson").closest("button")!;
    expect(nextBtn.querySelectorAll("span")).toHaveLength(1);
  });

  it("should not show perfect badge when nextLessonId is undefined (backward compatible)", () => {
    // Test backward compatibility: nextLessonId not passed
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={0}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={[]}
      />,
    );

    // Should still show completion screen
    expect(screen.getByText("Lesson complete")).toBeInTheDocument();
    // Perfect badge should still appear (0 wrong answers)
    expect(screen.getByText("Perfect!")).toBeInTheDocument();
  });
});
