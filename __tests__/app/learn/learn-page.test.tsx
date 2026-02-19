import { describe, it, expect, vi } from "vitest";

/**
 * Integration test: verify that the learn page wires up
 * components correctly, including the new WeeklyActivity
 * and LearningStats components.
 *
 * Since the learn page is a server component, we test by verifying
 * the source code wiring.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("LearnPage integration", () => {
  const pageSource = readFileSync(
    resolve(process.cwd(), "app/(main)/learn/page.tsx"),
    "utf-8",
  );

  it("should pass dailyGoal from user progress to DailyGoal", () => {
    expect(pageSource).toContain("dailyGoal={userProgress.dailyGoal");
  });

  it("should provide fallback of 1 when dailyGoal is missing", () => {
    expect(pageSource).toMatch(/dailyGoal=\{userProgress\.dailyGoal\s*\?\?\s*1\}/);
  });

  it("should render weekly activity and learning stats", () => {
    // Verify WeeklyActivity is imported and rendered
    expect(pageSource).toContain('import { WeeklyActivity }');
    expect(pageSource).toContain("<WeeklyActivity");

    // Verify LearningStats is imported and rendered
    expect(pageSource).toContain('import { LearningStats }');
    expect(pageSource).toContain("<LearningStats");
  });

  it("should fetch weekly activity data", () => {
    expect(pageSource).toContain("getWeeklyActivity");
    expect(pageSource).toContain("weeklyActivityData");
  });

  it("should fetch learning stats data", () => {
    expect(pageSource).toContain("getLearningStats");
    expect(pageSource).toContain("learningStatsData");
  });
});
