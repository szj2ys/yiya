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

const openPracticeModalSpy = vi.fn();
vi.mock("@/store/use-practice-modal", () => ({
  usePracticeModal: () => ({ open: openPracticeModalSpy }),
}));

vi.mock("@/store/use-hearts-modal", () => ({ useHeartsModal: () => ({ open: vi.fn() }) }));
vi.mock("@/actions/challenge-progress", () => ({
  upsertChallengeProgress: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/actions/user-progress", () => ({ reduceHearts: vi.fn().mockResolvedValue({}) }));

// Keep UI shallow
vi.mock("@/app/lesson/header", () => ({ Header: () => null }));
vi.mock("@/app/lesson/result-card", () => ({ ResultCard: () => null }));
vi.mock("@/app/lesson/question-bubble", () => ({ QuestionBubble: () => null }));

const fetchSpy = vi.fn();
global.fetch = fetchSpy as unknown as typeof global.fetch;

describe("Quiz completion summary", () => {
  it("should display correct/wrong summary on lesson completion", async () => {
    fetchSpy.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={7}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={[
          {
            id: 10,
            lessonId: 1,
            type: "SELECT" as (typeof challenges.$inferSelect)["type"],
            question: "Q1?",
            order: 1,
            completed: false,
            challengeOptions: [
              { id: 1, challengeId: 10, text: "Wrong 1", correct: false, imageSrc: null, audioSrc: null },
              { id: 2, challengeId: 10, text: "Right 1", correct: true, imageSrc: null, audioSrc: null },
            ],
          },
          {
            id: 11,
            lessonId: 1,
            type: "SELECT" as (typeof challenges.$inferSelect)["type"],
            question: "Q2?",
            order: 2,
            completed: false,
            challengeOptions: [
              { id: 3, challengeId: 11, text: "Right 2", correct: true, imageSrc: null, audioSrc: null },
              { id: 4, challengeId: 11, text: "Wrong 2", correct: false, imageSrc: null, audioSrc: null },
            ],
          },
        ]}
      />,
    );

    // Q1: get it wrong once, then correct
    fireEvent.click(screen.getByText("Wrong 1"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Retry" }));

    fireEvent.click(screen.getByText("Right 1"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    // Q2 correct
    expect(await screen.findByText("Q2?")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Right 2"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    expect(await screen.findByText("Lesson complete")).toBeInTheDocument();
    expect(screen.getByText("2/2 correct")).toBeInTheDocument();

    expect(screen.getByText("Review these")).toBeInTheDocument();
    expect(screen.getByText("Q1?")).toBeInTheDocument();
  });
});
