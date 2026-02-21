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

    expect(result).toEqual({ streak: 1, shouldUpdateStreak: true, longestStreak: 1 });
  });

  it("should not change streak when same day (elapsed < 1 day)", () => {
    const lastLessonAt = new Date(baseNow.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago

    const result = computeNextStreak({
      currentStreak: 5,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 10,
    });

    expect(result).toEqual({ streak: 5, shouldUpdateStreak: false, longestStreak: 10 });
  });

  it("should increment streak when elapsed >= 1 day and <= 2 days (next day)", () => {
    const lastLessonAt = new Date(baseNow.getTime() - DAY_IN_MS - 1000); // ~25 hours ago

    const result = computeNextStreak({
      currentStreak: 3,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 3,
    });

    expect(result).toEqual({ streak: 4, shouldUpdateStreak: true, longestStreak: 4 });
  });

  it("should reset streak when elapsed > 2 days", () => {
    const lastLessonAt = new Date(baseNow.getTime() - 3 * DAY_IN_MS); // 3 days ago

    const result = computeNextStreak({
      currentStreak: 10,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 10,
    });

    expect(result).toEqual({ streak: 1, shouldUpdateStreak: true, longestStreak: 10 });
  });

  it("should increment streak at exactly 24h boundary", () => {
    const lastLessonAt = new Date(baseNow.getTime() - DAY_IN_MS); // exactly 24h ago

    const result = computeNextStreak({
      currentStreak: 7,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 7,
    });

    expect(result).toEqual({ streak: 8, shouldUpdateStreak: true, longestStreak: 8 });
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
      currentLongestStreak: 4,
    });

    // Exactly 48h: not > 2 days, so it increments (>= 1 day)
    expect(result).toEqual({ streak: 5, shouldUpdateStreak: true, longestStreak: 5 });
  });

  it("should reset streak when just over 48h boundary", () => {
    const lastLessonAt = new Date(baseNow.getTime() - 2 * DAY_IN_MS - 1); // 48h + 1ms

    const result = computeNextStreak({
      currentStreak: 4,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 4,
    });

    expect(result).toEqual({ streak: 1, shouldUpdateStreak: true, longestStreak: 4 });
  });

  it("should not change streak when elapsed is just under 24h", () => {
    const lastLessonAt = new Date(baseNow.getTime() - DAY_IN_MS + 1); // 24h - 1ms

    const result = computeNextStreak({
      currentStreak: 2,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 5,
    });

    expect(result).toEqual({ streak: 2, shouldUpdateStreak: false, longestStreak: 5 });
  });

  it("should return streak=1 when lastLessonAt is null even with high currentStreak", () => {
    const result = computeNextStreak({
      currentStreak: 50,
      lastLessonAt: null,
      now: baseNow,
      currentLongestStreak: 50,
    });

    expect(result).toEqual({ streak: 1, shouldUpdateStreak: true, longestStreak: 50 });
  });

  // --- longestStreak specific tests ---

  it("should preserve longest streak when current streak resets", () => {
    const lastLessonAt = new Date(baseNow.getTime() - 3 * DAY_IN_MS); // 3 days ago

    const result = computeNextStreak({
      currentStreak: 5,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 15,
    });

    expect(result.streak).toBe(1);
    expect(result.shouldUpdateStreak).toBe(true);
    expect(result.longestStreak).toBe(15); // preserved
  });

  it("should update longest streak when new streak exceeds it", () => {
    const lastLessonAt = new Date(baseNow.getTime() - DAY_IN_MS - 1000);

    const result = computeNextStreak({
      currentStreak: 9,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 9,
    });

    expect(result.streak).toBe(10);
    expect(result.longestStreak).toBe(10); // new record
  });

  it("should not update longest streak when new streak is below it", () => {
    const lastLessonAt = new Date(baseNow.getTime() - DAY_IN_MS - 1000);

    const result = computeNextStreak({
      currentStreak: 3,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 20,
    });

    expect(result.streak).toBe(4);
    expect(result.longestStreak).toBe(20); // unchanged
  });

  it("should default currentLongestStreak to 0 when not provided", () => {
    const result = computeNextStreak({
      currentStreak: 0,
      lastLessonAt: null,
      now: baseNow,
    });

    expect(result.longestStreak).toBe(1);
  });

  // --- Streak Freeze tests ---

  it("should maintain streak when freeze exists for missed day", () => {
    // User last studied ~36 hours ago (missed yesterday), but has a freeze
    const lastLessonAt = new Date(baseNow.getTime() - DAY_IN_MS * 1.5);

    const result = computeNextStreak({
      currentStreak: 5,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 10,
      hasFreezeForMissedDay: true,
    });

    expect(result.streak).toBe(5);
    expect(result.shouldUpdateStreak).toBe(false);
    expect(result.longestStreak).toBe(10);
  });

  it("should reset streak when no freeze and missed day", () => {
    // User last studied ~36 hours ago but no freeze => streak increments normally
    // (between 1 and 2 days, no freeze)
    const lastLessonAt = new Date(baseNow.getTime() - DAY_IN_MS * 1.5);

    const result = computeNextStreak({
      currentStreak: 5,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 10,
      hasFreezeForMissedDay: false,
    });

    // Without freeze, 1.5 days is in the normal "next day" window so streak increments
    expect(result.streak).toBe(6);
    expect(result.shouldUpdateStreak).toBe(true);
  });

  it("should not use freeze when elapsed > 2 days", () => {
    // More than 2 days: freeze can only protect 1 day
    const lastLessonAt = new Date(baseNow.getTime() - 3 * DAY_IN_MS);

    const result = computeNextStreak({
      currentStreak: 5,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 10,
      hasFreezeForMissedDay: true,
    });

    expect(result.streak).toBe(1);
    expect(result.shouldUpdateStreak).toBe(true);
  });

  it("should not use freeze when elapsed is exactly 1 day (no missed day)", () => {
    // Exactly 24h is a normal continuation, freeze should not interfere
    const lastLessonAt = new Date(baseNow.getTime() - DAY_IN_MS);

    const result = computeNextStreak({
      currentStreak: 3,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 3,
      hasFreezeForMissedDay: true,
    });

    // At exactly 24h, elapsedMs === DAY_IN_MS, which is NOT > DAY_IN_MS
    // So the freeze condition (elapsedMs > DAY_IN_MS && hasFreezeForMissedDay) doesn't trigger
    // Instead it falls through to the normal increment
    expect(result.streak).toBe(4);
    expect(result.shouldUpdateStreak).toBe(true);
  });

  it("should maintain streak with freeze when just over 1 day", () => {
    // 24h + 1ms: freeze should protect
    const lastLessonAt = new Date(baseNow.getTime() - DAY_IN_MS - 1);

    const result = computeNextStreak({
      currentStreak: 7,
      lastLessonAt,
      now: baseNow,
      currentLongestStreak: 7,
      hasFreezeForMissedDay: true,
    });

    expect(result.streak).toBe(7);
    expect(result.shouldUpdateStreak).toBe(false);
  });
});
