import { describe, it, expect } from "vitest";
import { computeNextStreak } from "@/lib/streak";

const DAY_IN_MS = 86_400_000;

describe("computeNextStreak", () => {
  const baseNow = new Date("2025-06-15T12:00:00Z");

  it("should return streak=1 when lastLessonAt is null (first completion)", () => {
    const result = computeNextStreak({
      currentStreak: 0,
      lastLessonAt: null,
      now: baseNow,
    });

    expect(result).toEqual({ streak: 1, shouldUpdateStreak: true });
  });

  it("should not change streak when same day (elapsed < 1 day)", () => {
    const lastLessonAt = new Date(baseNow.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago

    const result = computeNextStreak({
      currentStreak: 5,
      lastLessonAt,
      now: baseNow,
    });

    expect(result).toEqual({ streak: 5, shouldUpdateStreak: false });
  });

  it("should increment streak when elapsed >= 1 day and <= 2 days (next day)", () => {
    const lastLessonAt = new Date(baseNow.getTime() - DAY_IN_MS - 1000); // ~25 hours ago

    const result = computeNextStreak({
      currentStreak: 3,
      lastLessonAt,
      now: baseNow,
    });

    expect(result).toEqual({ streak: 4, shouldUpdateStreak: true });
  });

  it("should reset streak when elapsed > 2 days", () => {
    const lastLessonAt = new Date(baseNow.getTime() - 3 * DAY_IN_MS); // 3 days ago

    const result = computeNextStreak({
      currentStreak: 10,
      lastLessonAt,
      now: baseNow,
    });

    expect(result).toEqual({ streak: 1, shouldUpdateStreak: true });
  });

  it("should increment streak at exactly 24h boundary", () => {
    const lastLessonAt = new Date(baseNow.getTime() - DAY_IN_MS); // exactly 24h ago

    const result = computeNextStreak({
      currentStreak: 7,
      lastLessonAt,
      now: baseNow,
    });

    expect(result).toEqual({ streak: 8, shouldUpdateStreak: true });
  });

  it("should reset streak at exactly 48h boundary (elapsed > 2 days is strict >)", () => {
    // At exactly 48h (2 * DAY_IN_MS), elapsedMs === TWO_DAYS_IN_MS.
    // The condition is `elapsedMs > TWO_DAYS_IN_MS`, so exactly 48h does NOT reset.
    // It falls through to `elapsedMs >= DAY_IN_MS`, which increments.
    const lastLessonAt = new Date(baseNow.getTime() - 2 * DAY_IN_MS); // exactly 48h ago

    const result = computeNextStreak({
      currentStreak: 4,
      lastLessonAt,
      now: baseNow,
    });

    // Exactly 48h: not > 2 days, so it increments (>= 1 day)
    expect(result).toEqual({ streak: 5, shouldUpdateStreak: true });
  });

  it("should reset streak when just over 48h boundary", () => {
    const lastLessonAt = new Date(baseNow.getTime() - 2 * DAY_IN_MS - 1); // 48h + 1ms

    const result = computeNextStreak({
      currentStreak: 4,
      lastLessonAt,
      now: baseNow,
    });

    expect(result).toEqual({ streak: 1, shouldUpdateStreak: true });
  });

  it("should not change streak when elapsed is just under 24h", () => {
    const lastLessonAt = new Date(baseNow.getTime() - DAY_IN_MS + 1); // 24h - 1ms

    const result = computeNextStreak({
      currentStreak: 2,
      lastLessonAt,
      now: baseNow,
    });

    expect(result).toEqual({ streak: 2, shouldUpdateStreak: false });
  });

  it("should return streak=1 when lastLessonAt is null even with high currentStreak", () => {
    const result = computeNextStreak({
      currentStreak: 50,
      lastLessonAt: null,
      now: baseNow,
    });

    expect(result).toEqual({ streak: 1, shouldUpdateStreak: true });
  });
});
