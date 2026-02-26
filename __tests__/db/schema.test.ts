import { describe, it, expect } from "vitest";
import { userProgress } from "@/db/schema";

describe("userProgress schema", () => {
  it("should have dailyGoal column with default 1", () => {
    const columns = userProgress as Record<string, any>;
    const dailyGoalCol = columns.dailyGoal;

    expect(dailyGoalCol).toBeDefined();
    expect(dailyGoalCol.name).toBe("daily_goal");
    expect(dailyGoalCol.hasDefault).toBe(true);
    expect(dailyGoalCol.default).toBe(1);
    expect(dailyGoalCol.notNull).toBe(true);
  });

  it("should have weeklyXp column with default 0", () => {
    const columns = userProgress as Record<string, any>;
    const weeklyXpCol = columns.weeklyXp;

    expect(weeklyXpCol).toBeDefined();
    expect(weeklyXpCol.name).toBe("weekly_xp");
    expect(weeklyXpCol.hasDefault).toBe(true);
    expect(weeklyXpCol.default).toBe(0);
    expect(weeklyXpCol.notNull).toBe(true);
  });

  it("should have weeklyXpResetAt timestamp column that is nullable", () => {
    const columns = userProgress as Record<string, any>;
    const weeklyXpResetAtCol = columns.weeklyXpResetAt;

    expect(weeklyXpResetAtCol).toBeDefined();
    expect(weeklyXpResetAtCol.name).toBe("weekly_xp_reset_at");
    expect(weeklyXpResetAtCol.notNull).toBe(false);
  });

  it("should have timezoneOffset integer column that is nullable", () => {
    const columns = userProgress as Record<string, any>;
    const timezoneOffsetCol = columns.timezoneOffset;

    expect(timezoneOffsetCol).toBeDefined();
    expect(timezoneOffsetCol.name).toBe("timezone_offset");
    expect(timezoneOffsetCol.notNull).toBe(false);
  });
});
