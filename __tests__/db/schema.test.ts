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
});
