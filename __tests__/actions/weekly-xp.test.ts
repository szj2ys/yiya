import { describe, expect, it } from "vitest";
import { getStartOfWeek, computeWeeklyXp } from "@/lib/weekly-xp";

describe("getStartOfWeek", () => {
  it("should return Monday 00:00 UTC for a Wednesday", () => {
    // 2026-02-18 is a Wednesday
    const wed = new Date("2026-02-18T14:30:00.000Z");
    const result = getStartOfWeek(wed);

    expect(result.toISOString()).toBe("2026-02-16T00:00:00.000Z"); // Monday
  });

  it("should return the same Monday when given a Monday", () => {
    const mon = new Date("2026-02-16T10:00:00.000Z");
    const result = getStartOfWeek(mon);

    expect(result.toISOString()).toBe("2026-02-16T00:00:00.000Z");
  });

  it("should return previous Monday when given a Sunday", () => {
    // 2026-02-22 is a Sunday
    const sun = new Date("2026-02-22T23:59:59.000Z");
    const result = getStartOfWeek(sun);

    expect(result.toISOString()).toBe("2026-02-16T00:00:00.000Z");
  });

  it("should return previous Monday when given a Saturday", () => {
    // 2026-02-21 is a Saturday
    const sat = new Date("2026-02-21T12:00:00.000Z");
    const result = getStartOfWeek(sat);

    expect(result.toISOString()).toBe("2026-02-16T00:00:00.000Z");
  });
});

describe("computeWeeklyXp", () => {
  it("should reset weeklyXp when weeklyXpResetAt is null", () => {
    const now = new Date("2026-02-18T12:00:00.000Z");
    const result = computeWeeklyXp(0, null, 10, now);

    expect(result.weeklyXp).toBe(10);
    expect(result.weeklyXpResetAt).toEqual(now);
  });

  it("should reset weeklyXp when weeklyXpResetAt is before current week start", () => {
    // weeklyXpResetAt was last Tuesday (2026-02-10), now is this Monday (2026-02-16)
    const lastTuesday = new Date("2026-02-10T15:00:00.000Z");
    const thisMonday = new Date("2026-02-16T08:00:00.000Z");

    const result = computeWeeklyXp(50, lastTuesday, 10, thisMonday);

    expect(result.weeklyXp).toBe(10);
    expect(result.weeklyXpResetAt).toEqual(thisMonday);
  });

  it("should increment weeklyXp when weeklyXpResetAt is within current week", () => {
    // weeklyXpResetAt was this Monday, now is this Wednesday
    const thisMonday = new Date("2026-02-16T08:00:00.000Z");
    const thisWednesday = new Date("2026-02-18T12:00:00.000Z");

    const result = computeWeeklyXp(30, thisMonday, 10, thisWednesday);

    expect(result.weeklyXp).toBe(40);
    expect(result.weeklyXpResetAt).toEqual(thisMonday); // not updated
  });

  it("should reset on exact week boundary (Monday 00:00 UTC)", () => {
    // weeklyXpResetAt was Sunday 23:59 (still previous week)
    const sundayLate = new Date("2026-02-15T23:59:59.000Z");
    const mondayExact = new Date("2026-02-16T00:00:00.000Z");

    const result = computeWeeklyXp(100, sundayLate, 10, mondayExact);

    expect(result.weeklyXp).toBe(10); // reset
    expect(result.weeklyXpResetAt).toEqual(mondayExact);
  });

  it("should not reset when weeklyXpResetAt is exactly the week start", () => {
    // weeklyXpResetAt is Monday 00:00:00, now is later in the week
    const mondayExact = new Date("2026-02-16T00:00:00.000Z");
    const wednesday = new Date("2026-02-18T10:00:00.000Z");

    const result = computeWeeklyXp(20, mondayExact, 10, wednesday);

    expect(result.weeklyXp).toBe(30); // incremented, not reset
    expect(result.weeklyXpResetAt).toEqual(mondayExact);
  });
});
