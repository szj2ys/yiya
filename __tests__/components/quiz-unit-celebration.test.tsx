import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { Quiz } from "@/app/lesson/quiz";

// Mocks
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("next/image", () => ({ default: (props: any) => <img {...props} /> }));

let capturedConfettiProps: any = {};
vi.mock("react-confetti", () => ({
  default: (props: any) => {
    capturedConfettiProps = props;
    return null;
  },
}));

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

// Keep UI shallow
vi.mock("@/app/lesson/header", () => ({ Header: () => null }));
vi.mock("@/app/lesson/result-card", () => ({ ResultCard: () => null }));
vi.mock("@/app/lesson/question-bubble", () => ({ QuestionBubble: () => null }));

const fetchSpy = vi.fn();
global.fetch = fetchSpy as unknown as typeof global.fetch;

// Using an empty challenges array causes activeIndex=0 but challenges[0]=undefined
// so `!challenge` is true and the results screen renders immediately.
const emptyLessonChallenges: any[] = [];

describe("Quiz unit celebration card", () => {
  beforeEach(() => {
    capturedConfettiProps = {};
  });

  it("should render unit celebration card when isLastLessonInUnit is true", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isLastLessonInUnit={true}
        unitTitle="Basics"
        unitOrder={2}
      />,
    );

    expect(screen.getByTestId("unit-celebration-card")).toBeInTheDocument();
    expect(screen.getByText("Unit 2 Complete!")).toBeInTheDocument();
    expect(screen.getByText("Basics")).toBeInTheDocument();
    expect(
      screen.getByText("You've mastered all lessons in this unit. Keep going!"),
    ).toBeInTheDocument();
  });

  it("should not render unit celebration card when isLastLessonInUnit is false", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isLastLessonInUnit={false}
        unitTitle="Basics"
        unitOrder={2}
      />,
    );

    expect(screen.queryByTestId("unit-celebration-card")).not.toBeInTheDocument();
  });

  it("should not render unit celebration card when isLastLessonInUnit is not provided", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
      />,
    );

    expect(screen.queryByTestId("unit-celebration-card")).not.toBeInTheDocument();
  });

  it("should not render unit celebration card in practice mode", () => {
    render(
      <Quiz
        initialPercentage={100}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isLastLessonInUnit={true}
        unitTitle="Basics"
        unitOrder={2}
      />,
    );

    expect(screen.queryByTestId("unit-celebration-card")).not.toBeInTheDocument();
  });

  it("should render 1000 confetti pieces for unit completion", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isLastLessonInUnit={true}
        unitTitle="Basics"
        unitOrder={1}
      />,
    );

    expect(capturedConfettiProps.numberOfPieces).toBe(1000);
  });

  it("should not boost confetti when isLastLessonInUnit is false", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isLastLessonInUnit={false}
      />,
    );

    // 0 wrong answers, 0 challenges => isPerfect = true => 800
    expect(capturedConfettiProps.numberOfPieces).toBe(800);
  });

  it("should accept isLastLessonInUnit prop without errors", () => {
    const { container } = render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isLastLessonInUnit={true}
        unitTitle="Advanced"
        unitOrder={5}
      />,
    );

    expect(container).toBeTruthy();
  });
});
