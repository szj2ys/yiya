import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Streak } from "@/components/streak";

describe("Streak component", () => {
  let dateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Fix "today" to 2025-06-15 for deterministic tests
    dateSpy = vi
      .spyOn(globalThis, "Date")
      .mockImplementation(function (this: Date, ...args: any[]) {
        if (args.length === 0) {
          return new (Function.prototype.bind.apply(
            OriginalDate,
            [null, 2025, 5, 15, 12, 0, 0] as any,
          ))();
        }
        return new (Function.prototype.bind.apply(
          OriginalDate,
          [null, ...args] as any,
        ))();
      } as any);
  });

  const OriginalDate = globalThis.Date;

  afterEach(() => {
    dateSpy.mockRestore();
  });

  it("should show completed state when lastLessonAt is today", () => {
    const today = new OriginalDate(2025, 5, 15, 9, 30, 0);

    render(<Streak streak={5} lastLessonAt={today} />);

    expect(screen.getByText("Completed today")).toBeInTheDocument();
    expect(screen.getByText("5 day streak")).toBeInTheDocument();
    // Should NOT show reminder when completed today
    expect(
      screen.queryByText("Don't forget to study today!"),
    ).not.toBeInTheDocument();
  });

  it("should show reminder when streak > 0 and lastLessonAt is not today", () => {
    const yesterday = new OriginalDate(2025, 5, 14, 18, 0, 0);

    render(<Streak streak={3} lastLessonAt={yesterday} />);

    expect(screen.getByText("Don't forget to study today!")).toBeInTheDocument();
    expect(screen.getByText("3 day streak")).toBeInTheDocument();
    expect(screen.queryByText("Completed today")).not.toBeInTheDocument();
  });

  it("should show 'Start your streak!' when streak is 0", () => {
    render(<Streak streak={0} lastLessonAt={null} />);

    expect(screen.getByText("Start your streak!")).toBeInTheDocument();
    // Should not show reminder when streak is 0
    expect(
      screen.queryByText("Don't forget to study today!"),
    ).not.toBeInTheDocument();
  });

  it("should show milestone text when streak is 7 and not completed today", () => {
    const yesterday = new OriginalDate(2025, 5, 14, 12, 0, 0);

    render(<Streak streak={7} lastLessonAt={yesterday} />);

    expect(screen.getByText("7 day streak")).toBeInTheDocument();
    // Milestone text should not show when not completed today, because reminder takes priority in subtitle
    // Actually: milestone shows in the subtitle area; reminder is separate below
    expect(screen.getByText("Milestone unlocked")).toBeInTheDocument();
    expect(screen.getByText("Don't forget to study today!")).toBeInTheDocument();
  });

  it("should show completed state overriding milestone text when lastLessonAt is today", () => {
    const today = new OriginalDate(2025, 5, 15, 10, 0, 0);

    render(<Streak streak={30} lastLessonAt={today} />);

    expect(screen.getByText("Completed today")).toBeInTheDocument();
    expect(screen.getByText("30 day streak")).toBeInTheDocument();
    // When completed today, "Milestone unlocked" is overridden by "Completed today"
    expect(screen.queryByText("Milestone unlocked")).not.toBeInTheDocument();
  });

  it("should not show reminder when streak is 0 and lastLessonAt is null", () => {
    render(<Streak streak={0} lastLessonAt={null} />);

    expect(
      screen.queryByText("Don't forget to study today!"),
    ).not.toBeInTheDocument();
  });
});
