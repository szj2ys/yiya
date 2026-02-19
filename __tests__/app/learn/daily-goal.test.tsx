import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { DailyGoal } from "@/app/(main)/learn/daily-goal";

// Mock the Progress component so we don't need radix internals
vi.mock("@/components/ui/progress", () => ({
  Progress: ({ value, className }: { value: number; className?: string }) => (
    <div data-testid="progress-bar" data-value={value} className={className} />
  ),
}));

describe("DailyGoal", () => {
  it("should display correct goal count from prop", () => {
    render(
      <DailyGoal
        todayLessonCount={0}
        completedLessons={0}
        totalLessons={10}
        dailyGoal={3}
      />,
    );

    expect(screen.getByText("0/3 lessons")).toBeInTheDocument();
  });

  it("should show accurate lesson count from lessonCompletions table", () => {
    render(
      <DailyGoal
        todayLessonCount={2}
        completedLessons={5}
        totalLessons={10}
        dailyGoal={3}
      />,
    );

    expect(screen.getByText("2/3 lessons")).toBeInTheDocument();
  });

  it("should show goal met when todayLessonCount >= dailyGoal", () => {
    render(
      <DailyGoal
        todayLessonCount={3}
        completedLessons={5}
        totalLessons={10}
        dailyGoal={3}
      />,
    );

    expect(screen.getByText("3/3 lessons")).toBeInTheDocument();
    expect(
      screen.getByText("Great job! You hit your daily goal."),
    ).toBeInTheDocument();
  });

  it("should show goal met when dailyGoal=1 and todayLessonCount=1", () => {
    render(
      <DailyGoal
        todayLessonCount={1}
        completedLessons={1}
        totalLessons={10}
        dailyGoal={1}
      />,
    );

    expect(screen.getByText("1/1 lesson")).toBeInTheDocument();
    expect(
      screen.getByText("Great job! You hit your daily goal."),
    ).toBeInTheDocument();
  });

  it("should show 0 progress when no lessons completed today", () => {
    render(
      <DailyGoal
        todayLessonCount={0}
        completedLessons={5}
        totalLessons={10}
        dailyGoal={3}
      />,
    );

    expect(screen.getByText("0/3 lessons")).toBeInTheDocument();
    expect(
      screen.getByText("Complete a lesson today to stay on track."),
    ).toBeInTheDocument();
  });

  it("should use singular 'lesson' when dailyGoal is 1", () => {
    render(
      <DailyGoal
        todayLessonCount={0}
        completedLessons={0}
        totalLessons={10}
        dailyGoal={1}
      />,
    );

    expect(screen.getByText("0/1 lesson")).toBeInTheDocument();
  });

  it("should use plural 'lessons' when dailyGoal is greater than 1", () => {
    render(
      <DailyGoal
        todayLessonCount={0}
        completedLessons={0}
        totalLessons={10}
        dailyGoal={5}
      />,
    );

    expect(screen.getByText("0/5 lessons")).toBeInTheDocument();
  });
});
