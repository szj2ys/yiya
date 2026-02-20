import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock the child components to isolate testing
vi.mock("./unit-banner", () => ({
  UnitBanner: ({
    title,
    description,
    completedLessons,
    totalLessons,
  }: {
    title: string;
    description: string;
    completedLessons: number;
    totalLessons: number;
  }) => (
    <div data-testid="unit-banner">
      <span data-testid="banner-title">{title}</span>
      <span data-testid="banner-completed">{completedLessons}</span>
      <span data-testid="banner-total">{totalLessons}</span>
    </div>
  ),
}));

vi.mock("./lesson-button", () => ({
  LessonButton: ({ id, title }: { id: number; title: string }) => (
    <div data-testid={`lesson-${id}`}>{title}</div>
  ),
}));

vi.mock("./unit-progress", () => ({
  UnitProgress: ({
    completed,
    total,
  }: {
    completed: number;
    total: number;
    className?: string;
  }) => (
    <div data-testid="unit-progress">
      <span data-testid="progress-completed">{completed}</span>
      <span data-testid="progress-total">{total}</span>
    </div>
  ),
}));

import { UnitWithProgress } from "./unit-with-progress";

const makeLessons = (completedFlags: boolean[]) =>
  completedFlags.map((completed, i) => ({
    id: i + 1,
    title: `Lesson ${i + 1}`,
    unitId: 1,
    order: i + 1,
    completed,
  }));

describe("UnitWithProgress", () => {
  it("should calculate correct completed lesson count", () => {
    const lessons = makeLessons([true, true, false, false, false]);

    render(
      <UnitWithProgress
        id={1}
        order={1}
        title="Unit 1"
        description="Test unit"
        lessons={lessons}
        activeLesson={undefined}
        activeLessonPercentage={0}
      />
    );

    expect(screen.getByTestId("banner-completed")).toHaveTextContent("2");
    expect(screen.getByTestId("banner-total")).toHaveTextContent("5");
  });

  it("should pass 0 completed when no lessons are done", () => {
    const lessons = makeLessons([false, false, false]);

    render(
      <UnitWithProgress
        id={1}
        order={1}
        title="Unit 1"
        description="Test unit"
        lessons={lessons}
        activeLesson={undefined}
        activeLessonPercentage={0}
      />
    );

    expect(screen.getByTestId("banner-completed")).toHaveTextContent("0");
    expect(screen.getByTestId("banner-total")).toHaveTextContent("3");
  });

  it("should pass all completed when all lessons are done", () => {
    const lessons = makeLessons([true, true, true]);

    render(
      <UnitWithProgress
        id={1}
        order={1}
        title="Unit 1"
        description="Test unit"
        lessons={lessons}
        activeLesson={undefined}
        activeLessonPercentage={0}
      />
    );

    expect(screen.getByTestId("banner-completed")).toHaveTextContent("3");
    expect(screen.getByTestId("banner-total")).toHaveTextContent("3");
  });

  it("should handle empty lessons array", () => {
    render(
      <UnitWithProgress
        id={1}
        order={1}
        title="Unit 1"
        description="Test unit"
        lessons={[]}
        activeLesson={undefined}
        activeLessonPercentage={0}
      />
    );

    expect(screen.getByTestId("banner-completed")).toHaveTextContent("0");
    expect(screen.getByTestId("banner-total")).toHaveTextContent("0");
  });

  it("should also pass correct counts to UnitProgress bar", () => {
    const lessons = makeLessons([true, false, true, false]);

    render(
      <UnitWithProgress
        id={1}
        order={1}
        title="Unit 1"
        description="Test unit"
        lessons={lessons}
        activeLesson={undefined}
        activeLessonPercentage={0}
      />
    );

    expect(screen.getByTestId("progress-completed")).toHaveTextContent("2");
    expect(screen.getByTestId("progress-total")).toHaveTextContent("4");
  });
});
