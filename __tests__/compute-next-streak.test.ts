import { describe, it, expect } from "vitest";
import { computeNextStreak, toLocalDateString } from "@/lib/streak";

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

// =============================================
// Timezone-aware tests (userTimezoneOffset)
// =============================================

describe("toLocalDateString", () => {
  it("should return UTC date when offset is 0", () => {
    expect(toLocalDateString(new Date("2025-06-15T23:30:00Z"), 0)).toBe("2025-06-15");
  });

  it("should shift date for UTC-8 (offset=480)", () => {
    // UTC 2025-06-16T07:00:00Z => UTC-8 local = 2025-06-15 23:00
    expect(toLocalDateString(new Date("2025-06-16T07:00:00Z"), 480)).toBe("2025-06-15");
  });

  it("should shift date for UTC+9 (offset=-540)", () => {
    // UTC 2025-06-15T15:30:00Z => UTC+9 local = 2025-06-16 00:30
    expect(toLocalDateString(new Date("2025-06-15T15:30:00Z"), -540)).toBe("2025-06-16");
  });

  it("should handle half-hour offset UTC+5:30 (offset=-330)", () => {
    // UTC 2025-06-15T18:29:00Z => +5:30 local = 2025-06-15 23:59
    expect(toLocalDateString(new Date("2025-06-15T18:29:00Z"), -330)).toBe("2025-06-15");
    // UTC 2025-06-15T18:31:00Z => +5:30 local = 2025-06-16 00:01
    expect(toLocalDateString(new Date("2025-06-15T18:31:00Z"), -330)).toBe("2025-06-16");
  });
});

describe("computeNextStreak with userTimezoneOffset", () => {
  it("should maintain backward compatibility when no timezone offset provided", () => {
    const now = new Date("2025-06-15T12:00:00Z");
    const lastLessonAt = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const result = computeNextStreak({
      currentStreak: 5,
      lastLessonAt,
      now,
      currentLongestStreak: 10,
    });

    // Legacy path: < 24h means same day, no change
    expect(result).toEqual({ streak: 5, shouldUpdateStreak: false, longestStreak: 10 });
  });

  it("should behave identically to legacy for UTC+0 user (offset=0)", () => {
    const now = new Date("2025-06-15T12:00:00Z");
    // Last lesson at 2025-06-14T10:00:00Z — different calendar day
    const lastLessonAt = new Date("2025-06-14T10:00:00Z");

    const result = computeNextStreak({
      currentStreak: 3,
      lastLessonAt,
      now,
      currentLongestStreak: 3,
      userTimezoneOffset: 0,
    });

    expect(result).toEqual({ streak: 4, shouldUpdateStreak: true, longestStreak: 4 });
  });

  it("should increment streak when lessons span midnight in user timezone (UTC-8)", () => {
    // Scenario from TODO: UTC-8 user at local 11pm (UTC 7am next day)
    // then at local 1am next day (UTC 9am next day) — only 2h gap in UTC.
    // Legacy: 2h < 24h → "same day" → no streak increment (BUG).
    // Timezone-aware: different local dates → streak increments.
    const lastLessonAt = new Date("2025-06-16T07:00:00Z"); // UTC-8 local: Jun 15 11pm
    const now = new Date("2025-06-16T09:00:00Z");            // UTC-8 local: Jun 16 1am

    const result = computeNextStreak({
      currentStreak: 5,
      lastLessonAt,
      now,
      currentLongestStreak: 5,
      userTimezoneOffset: 480, // UTC-8
    });

    expect(result).toEqual({ streak: 6, shouldUpdateStreak: true, longestStreak: 6 });
  });

  it("should not increment streak when both lessons are same local day despite UTC day change (UTC-8)", () => {
    // UTC-8: both timestamps fall on local Jun 15
    const lastLessonAt = new Date("2025-06-15T20:00:00Z"); // UTC-8 local: Jun 15 12pm
    const now = new Date("2025-06-16T06:00:00Z");            // UTC-8 local: Jun 15 10pm

    const result = computeNextStreak({
      currentStreak: 3,
      lastLessonAt,
      now,
      currentLongestStreak: 3,
      userTimezoneOffset: 480,
    });

    expect(result).toEqual({ streak: 3, shouldUpdateStreak: false, longestStreak: 3 });
  });

  it("should increment streak for UTC+9 user crossing local midnight", () => {
    // UTC+9 (Japan, offset=-540)
    // Last lesson: UTC 2025-06-15T14:30:00Z → local Jun 15 23:30
    // Now:         UTC 2025-06-15T15:30:00Z → local Jun 16 00:30
    const lastLessonAt = new Date("2025-06-15T14:30:00Z");
    const now = new Date("2025-06-15T15:30:00Z");

    const result = computeNextStreak({
      currentStreak: 10,
      lastLessonAt,
      now,
      currentLongestStreak: 10,
      userTimezoneOffset: -540,
    });

    expect(result).toEqual({ streak: 11, shouldUpdateStreak: true, longestStreak: 11 });
  });

  it("should handle half-hour timezone offsets correctly (UTC+5:30, India)", () => {
    // UTC+5:30 (offset=-330)
    // Last lesson: UTC 2025-06-15T18:29:00Z → local Jun 15 23:59
    // Now:         UTC 2025-06-15T18:31:00Z → local Jun 16 00:01
    const lastLessonAt = new Date("2025-06-15T18:29:00Z");
    const now = new Date("2025-06-15T18:31:00Z");

    const result = computeNextStreak({
      currentStreak: 2,
      lastLessonAt,
      now,
      currentLongestStreak: 2,
      userTimezoneOffset: -330,
    });

    expect(result).toEqual({ streak: 3, shouldUpdateStreak: true, longestStreak: 3 });
  });

  it("should reset streak when gap is 3+ local days even with timezone offset", () => {
    // 3 days apart in local time
    const lastLessonAt = new Date("2025-06-12T10:00:00Z");
    const now = new Date("2025-06-15T10:00:00Z");

    const result = computeNextStreak({
      currentStreak: 5,
      lastLessonAt,
      now,
      currentLongestStreak: 5,
      userTimezoneOffset: 480,
    });

    expect(result).toEqual({ streak: 1, shouldUpdateStreak: true, longestStreak: 5 });
  });

  it("should protect streak with freeze when exactly 2 local days apart", () => {
    // 2 local days gap with freeze
    const lastLessonAt = new Date("2025-06-13T10:00:00Z");
    const now = new Date("2025-06-15T10:00:00Z");

    const result = computeNextStreak({
      currentStreak: 7,
      lastLessonAt,
      now,
      currentLongestStreak: 7,
      userTimezoneOffset: 0,
      hasFreezeForMissedDay: true,
    });

    expect(result).toEqual({ streak: 7, shouldUpdateStreak: false, longestStreak: 7 });
  });

  it("should not use freeze when gap is 1 local day (no missed day)", () => {
    const lastLessonAt = new Date("2025-06-14T10:00:00Z");
    const now = new Date("2025-06-15T10:00:00Z");

    const result = computeNextStreak({
      currentStreak: 3,
      lastLessonAt,
      now,
      currentLongestStreak: 3,
      userTimezoneOffset: 0,
      hasFreezeForMissedDay: true,
    });

    // 1 day diff → normal increment, freeze not applicable
    expect(result).toEqual({ streak: 4, shouldUpdateStreak: true, longestStreak: 4 });
  });

  it("should reset streak when 2 local days apart without freeze", () => {
    const lastLessonAt = new Date("2025-06-13T10:00:00Z");
    const now = new Date("2025-06-15T10:00:00Z");

    const result = computeNextStreak({
      currentStreak: 5,
      lastLessonAt,
      now,
      currentLongestStreak: 5,
      userTimezoneOffset: 0,
      hasFreezeForMissedDay: false,
    });

    // 2 day diff without freeze → reset
    expect(result).toEqual({ streak: 1, shouldUpdateStreak: true, longestStreak: 5 });
  });

  it("should return streak=1 when lastLessonAt is null even with timezone offset", () => {
    const result = computeNextStreak({
      currentStreak: 0,
      lastLessonAt: null,
      now: new Date("2025-06-15T12:00:00Z"),
      userTimezoneOffset: 480,
    });

    expect(result).toEqual({ streak: 1, shouldUpdateStreak: true, longestStreak: 1 });
  });
});
