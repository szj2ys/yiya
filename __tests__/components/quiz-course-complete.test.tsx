import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

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

// Keep UI shallow
vi.mock("@/app/lesson/header", () => ({ Header: () => null }));
vi.mock("@/app/lesson/result-card", () => ({ ResultCard: () => null }));
vi.mock("@/app/lesson/question-bubble", () => ({ QuestionBubble: () => null }));

const fetchSpy = vi.fn();
global.fetch = fetchSpy as unknown as typeof global.fetch;

// Using an empty challenges array causes activeIndex=0 but challenges[0]=undefined
// so `!challenge` is true and the results screen renders immediately.
const emptyLessonChallenges: any[] = [];

describe("Quiz course complete card", () => {
  beforeEach(() => {
    pushSpy.mockClear();
  });

  it("should show course complete card when isCourseComplete is true", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isCourseComplete={true}
        courseName="Spanish"
      />,
    );

    expect(screen.getByTestId("course-complete-card")).toBeInTheDocument();
    expect(screen.getByText("Course Complete!")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You've completed all lessons in Spanish. That's an incredible achievement.",
      ),
    ).toBeInTheDocument();
  });

  it("should show three CTAs in course complete card", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isCourseComplete={true}
        courseName="Spanish"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Continue Reviewing" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Share Achievement" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try Another Language" }),
    ).toBeInTheDocument();
  });

  it("should navigate to /practice when Continue Reviewing is clicked", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isCourseComplete={true}
        courseName="Spanish"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue Reviewing" }));
    expect(pushSpy).toHaveBeenCalledWith("/practice");
  });

  it("should navigate to /courses when Try Another Language is clicked", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isCourseComplete={true}
        courseName="Spanish"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Try Another Language" }),
    );
    expect(pushSpy).toHaveBeenCalledWith("/courses");
  });

  it("should not show course complete card when isCourseComplete is false", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isCourseComplete={false}
        courseName="Spanish"
      />,
    );

    expect(screen.queryByTestId("course-complete-card")).not.toBeInTheDocument();
  });

  it("should not show course complete card when isCourseComplete is not provided", () => {
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

    expect(screen.queryByTestId("course-complete-card")).not.toBeInTheDocument();
  });

  it("should not show course complete card in practice mode", () => {
    render(
      <Quiz
        initialPercentage={100}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isCourseComplete={true}
        courseName="Spanish"
      />,
    );

    expect(screen.queryByTestId("course-complete-card")).not.toBeInTheDocument();
  });

  it("should use fallback text when courseName is not provided", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isCourseComplete={true}
      />,
    );

    expect(
      screen.getByText(
        "You've completed all lessons in this course. That's an incredible achievement.",
      ),
    ).toBeInTheDocument();
  });

  it("should render learning stats on course complete", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isCourseComplete={true}
        courseName="Spanish"
        totalLessons={24}
        wordsLearned={150}
      />,
    );

    const statsSection = screen.getByTestId("course-complete-stats");
    expect(statsSection).toBeInTheDocument();
    expect(statsSection).toHaveTextContent("24");
    expect(statsSection).toHaveTextContent("Lessons");
    expect(statsSection).toHaveTextContent("150");
    expect(statsSection).toHaveTextContent("Words");
    expect(statsSection).toHaveTextContent("Accuracy");
  });

  it("should render practice, courses, and share CTAs on course complete", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isCourseComplete={true}
        courseName="Spanish"
      />,
    );

    const card = screen.getByTestId("course-complete-card");
    expect(card).toBeInTheDocument();

    // Practice CTA
    expect(
      screen.getByRole("button", { name: "Continue Reviewing" }),
    ).toBeInTheDocument();

    // Share CTA
    expect(
      screen.getByRole("button", { name: "Share Achievement" }),
    ).toBeInTheDocument();

    // Try new language CTA
    expect(
      screen.getByRole("button", { name: "Try Another Language" }),
    ).toBeInTheDocument();
  });

  it("should show course complete guide when isFinalLesson is true", () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={3}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={emptyLessonChallenges}
        isCourseComplete={true}
        courseName="Spanish"
      />,
    );

    // Course complete card is shown instead of normal finish
    expect(screen.getByTestId("course-complete-card")).toBeInTheDocument();
    expect(screen.getByText("Course Complete!")).toBeInTheDocument();

    // Has the 3 CTAs for "what's next" guidance
    expect(
      screen.getByRole("button", { name: "Continue Reviewing" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Share Achievement" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try Another Language" }),
    ).toBeInTheDocument();
  });
});
