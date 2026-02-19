import { describe, it, expect, vi, beforeEach } from "vitest";
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
        lastLessonAt={null}
        completedLessons={0}
        totalLessons={10}
        dailyGoal={3}
      />,
    );

    expect(screen.getByText("0/3 lessons")).toBeInTheDocument();
  });

  it("should show 1/3 lessons when dailyGoal=3 and lastLessonAt is today", () => {
    const today = new Date();

    render(
      <DailyGoal
        lastLessonAt={today}
        completedLessons={5}
        totalLessons={10}
        dailyGoal={3}
      />,
    );

    // Approximation: only 1 lesson counted since we only track lastLessonAt
    expect(screen.getByText("1/3 lessons")).toBeInTheDocument();
  });

  it("should show goal met when dailyGoal=1 and lastLessonAt is today", () => {
    const today = new Date();

    render(
      <DailyGoal
        lastLessonAt={today}
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

  it("should show 0 progress when lastLessonAt is not today", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    render(
      <DailyGoal
        lastLessonAt={yesterday}
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
        lastLessonAt={null}
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
        lastLessonAt={null}
        completedLessons={0}
        totalLessons={10}
        dailyGoal={5}
      />,
    );

    expect(screen.getByText("0/5 lessons")).toBeInTheDocument();
  });
});
