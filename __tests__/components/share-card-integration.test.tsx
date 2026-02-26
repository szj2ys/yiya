import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import type { challenges } from "@/db/schema";

import { Quiz } from "@/app/lesson/quiz";

// Mocks
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
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

vi.mock("@/app/lesson/header", () => ({ Header: () => null }));
vi.mock("@/app/lesson/result-card", () => ({ ResultCard: () => null }));
vi.mock("@/app/lesson/question-bubble", () => ({ QuestionBubble: () => null }));
vi.mock("@/components/share-card", () => ({
  ShareCard: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="share-card-modal">
      <button onClick={onClose}>Close Share</button>
    </div>
  ),
}));

vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<any>) => {
    let Component: any = null;
    loader().then((mod: any) => { Component = mod.default; });
    return (props: any) => Component ? <Component {...props} /> : null;
  },
}));

const fetchSpy = vi.fn();
global.fetch = fetchSpy as unknown as typeof global.fetch;

const singleChallenge = [
  {
    id: 10,
    lessonId: 1,
    type: "SELECT" as (typeof challenges.$inferSelect)["type"],
    question: "Q1?",
    order: 1,
    completed: false,
    challengeOptions: [
      { id: 1, challengeId: 10, text: "Wrong", correct: false, imageSrc: null, audioSrc: null },
      { id: 2, challengeId: 10, text: "Right", correct: true, imageSrc: null, audioSrc: null },
    ],
  },
];

describe("Share card integration in Quiz", () => {
  it("should show share button when daily goal is met", async () => {
    fetchSpy.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={7}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={singleChallenge}
        todayLessonCount={3}
        dailyGoal={3}
      />,
    );

    // Complete the lesson
    fireEvent.click(screen.getByText("Right"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    // Completion screen
    expect(await screen.findByText("Lesson complete")).toBeInTheDocument();

    // Should see the share button
    expect(screen.getByText("Share your progress")).toBeInTheDocument();
  });

  it("should not show share button when goal not met", async () => {
    fetchSpy.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={7}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={singleChallenge}
        todayLessonCount={1}
        dailyGoal={3}
      />,
    );

    // Complete the lesson
    fireEvent.click(screen.getByText("Right"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    expect(await screen.findByText("Lesson complete")).toBeInTheDocument();

    // Should NOT show the share button
    expect(screen.queryByText("Share your progress")).not.toBeInTheDocument();
  });

  it("should not show share button when props are not provided", async () => {
    fetchSpy.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={7}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={singleChallenge}
      />,
    );

    // Complete the lesson
    fireEvent.click(screen.getByText("Right"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    expect(await screen.findByText("Lesson complete")).toBeInTheDocument();
    expect(screen.queryByText("Share your progress")).not.toBeInTheDocument();
  });

  it("should open share card modal when share button is clicked", async () => {
    fetchSpy.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={7}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={singleChallenge}
        todayLessonCount={2}
        dailyGoal={1}
        wordsLearned={50}
      />,
    );

    // Complete the lesson
    fireEvent.click(screen.getByText("Right"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    expect(await screen.findByText("Lesson complete")).toBeInTheDocument();

    // Click share button
    fireEvent.click(screen.getByText("Share your progress"));

    // Share card modal should appear
    expect(screen.getByTestId("share-card-modal")).toBeInTheDocument();
  });
});
