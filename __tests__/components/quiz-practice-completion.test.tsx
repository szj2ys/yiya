import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

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

vi.mock("@/store/use-practice-modal", () => ({
  usePracticeModal: () => ({ open: vi.fn() }),
}));

vi.mock("@/store/use-hearts-modal", () => ({
  useHeartsModal: () => ({ open: vi.fn() }),
}));

vi.mock("@/actions/challenge-progress", () => ({
  upsertChallengeProgress: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/actions/user-progress", () => ({
  reduceHearts: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/actions/review", () => ({
  submitReview: vi.fn().mockResolvedValue({}),
}));

// Keep UI shallow
vi.mock("@/app/lesson/header", () => ({ Header: () => null }));
vi.mock("@/app/lesson/result-card", () => ({ ResultCard: () => null }));
vi.mock("@/app/lesson/question-bubble", () => ({ QuestionBubble: () => null }));

const fetchSpy = vi.fn();
global.fetch = fetchSpy as unknown as typeof global.fetch;

const makePracticeChallenge = (id: number, correctText: string) => ({
  id,
  lessonId: 1,
  type: "SELECT" as (typeof challenges.$inferSelect)["type"],
  question: `Q${id}?`,
  order: id,
  completed: true,
  challengeOptions: [
    { id: id * 10, challengeId: id, text: correctText, correct: true, imageSrc: null, audioSrc: null },
    { id: id * 10 + 1, challengeId: id, text: "Wrong", correct: false, imageSrc: null, audioSrc: null },
  ],
});

describe("Quiz practice completion", () => {
  it("should show next step guidance on practice completion with remaining items", async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: async () => ({}) });

    render(
      <Quiz
        initialPercentage={100}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        remainingDueCount={5}
        reviewCardIds={{ 1: 100 }}
        initialLessonChallenges={[makePracticeChallenge(1, "Correct")]}
      />,
    );

    // Answer the single challenge correctly
    fireEvent.click(screen.getByText("Correct"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    // Now on completion page
    expect(await screen.findByText("Review complete")).toBeInTheDocument();

    // Should show remaining due indicator
    expect(screen.getByTestId("remaining-due-indicator")).toBeInTheDocument();
    expect(screen.getByText("5 more items due for review")).toBeInTheDocument();

    // Should show Continue Review button
    const continueBtn = screen.getByTestId("continue-review-btn");
    expect(continueBtn).toBeInTheDocument();
    expect(screen.getByText("5 more items due")).toBeInTheDocument();

    // Should also show Share and Back to Learn
    expect(screen.getByRole("button", { name: "Share your progress" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to Learn" })).toBeInTheDocument();

    // Click Continue Review
    fireEvent.click(continueBtn);
    expect(pushSpy).toHaveBeenCalledWith("/practice");
  });

  it("should show all caught up on practice completion with no remaining items", async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: async () => ({}) });

    render(
      <Quiz
        initialPercentage={100}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        remainingDueCount={0}
        reviewCardIds={{ 1: 100 }}
        initialLessonChallenges={[makePracticeChallenge(1, "Correct")]}
      />,
    );

    // Answer correctly
    fireEvent.click(screen.getByText("Correct"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    // On completion page
    expect(await screen.findByText("Review complete")).toBeInTheDocument();

    // Should show all-caught-up indicator
    expect(screen.getByTestId("all-caught-up-indicator")).toBeInTheDocument();
    expect(screen.getByText("All caught up! Check back tomorrow for new reviews.")).toBeInTheDocument();

    // No Continue Review button
    expect(screen.queryByTestId("continue-review-btn")).toBeNull();

    // Should have Back to Learn and Share
    expect(screen.getByRole("button", { name: "Back to Learn" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share your progress" })).toBeInTheDocument();
  });

  it("should render correctly in dark mode", async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: async () => ({}) });

    render(
      <Quiz
        initialPercentage={100}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        remainingDueCount={0}
        reviewCardIds={{ 1: 100 }}
        initialLessonChallenges={[makePracticeChallenge(1, "Correct")]}
      />,
    );

    fireEvent.click(screen.getByText("Correct"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    await screen.findByText("Review complete");

    // Verify dark mode classes exist on key elements
    const indicator = screen.getByTestId("all-caught-up-indicator");
    expect(indicator.className).toContain("dark:bg-emerald-900/20");
    expect(indicator.className).toContain("dark:border-emerald-800");
  });
});
