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
global.fetch = fetchSpy as unknown as typeof global.fetch;

beforeEach(() => {
  pushSpy.mockClear();
  openPracticeModalSpy.mockClear();
  fetchSpy.mockReset();
});

const twoChallengeLessonProps = {
  initialPercentage: 0,
  initialHearts: 5,
  initialLessonId: 1,
  initialStreak: 3,
  courseLanguage: "Spanish",
  userSubscription: null,
  initialLessonChallenges: [
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
  ],
};

describe("Quiz review-added indicator", () => {
  it("should show review-added indicator when answer is wrong in lesson mode", async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: async () => ({}) });

    render(<Quiz {...twoChallengeLessonProps} />);

    // Select wrong answer
    fireEvent.click(screen.getByText("Wrong 1"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));

    // Wait for the wrong status to render
    const indicator = await screen.findByTestId("review-added-indicator");
    expect(indicator).toBeInTheDocument();
    expect(indicator.textContent).toContain("Added to review");
    expect(indicator.textContent).toContain("will appear at the best time");
  });

  it("should not show review-added indicator in practice mode", async () => {
    render(
      <Quiz
        initialPercentage={100}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
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
        ]}
      />,
    );

    // Select wrong answer
    fireEvent.click(screen.getByText("Wrong 1"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));

    // Wait for wrong status
    await screen.findByRole("button", { name: "Retry" });

    expect(screen.queryByTestId("review-added-indicator")).not.toBeInTheDocument();
  });
});

describe("Quiz completion review queue stats", () => {
  it("should show review queue count when there are wrong answers", async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: async () => ({}) });

    render(<Quiz {...twoChallengeLessonProps} />);

    // Q1: get it wrong, then correct
    fireEvent.click(screen.getByText("Wrong 1"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Retry" }));

    fireEvent.click(screen.getByText("Right 1"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    // Q2: correct
    expect(await screen.findByText("Q2?")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Right 2"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    // Completion screen
    expect(await screen.findByText("Lesson complete")).toBeInTheDocument();

    const statsEl = screen.getByTestId("review-queue-stats");
    expect(statsEl).toBeInTheDocument();
    expect(statsEl.textContent).toContain("1 item added to your review queue");
    expect(statsEl.textContent).toContain("reappear at the best time for your memory");
  });

  it("should not show review queue message when perfect run", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={[]}
      />,
    );

    expect(screen.getByText("Lesson complete")).toBeInTheDocument();
    expect(screen.queryByTestId("review-queue-stats")).not.toBeInTheDocument();
  });

  it("should show plural form for multiple wrong answers", async () => {
    fetchSpy.mockResolvedValue({ ok: true, json: async () => ({}) });

    render(<Quiz {...twoChallengeLessonProps} />);

    // Q1: wrong
    fireEvent.click(screen.getByText("Wrong 1"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Retry" }));

    fireEvent.click(screen.getByText("Right 1"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    // Q2: wrong
    expect(await screen.findByText("Q2?")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Wrong 2"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Retry" }));

    fireEvent.click(screen.getByText("Right 2"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    fireEvent.click(await screen.findByRole("button", { name: "Next" }));

    // Completion screen
    expect(await screen.findByText("Lesson complete")).toBeInTheDocument();

    const statsEl = screen.getByTestId("review-queue-stats");
    expect(statsEl.textContent).toContain("2 items added to your review queue");
  });

  it("should not show review queue stats on practice completion", () => {
    render(
      <Quiz
        initialPercentage={100}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={[]}
      />,
    );

    expect(screen.getByText("Review complete")).toBeInTheDocument();
    expect(screen.queryByTestId("review-queue-stats")).not.toBeInTheDocument();
  });
});
