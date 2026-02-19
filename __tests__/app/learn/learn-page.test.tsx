import { describe, it, expect, vi } from "vitest";

/**
 * Integration test: verify that the learn page passes dailyGoal
 * from userProgress to the DailyGoal component.
 *
 * Since the learn page is a server component, we test by verifying
 * the wiring: the DailyGoal component accepts dailyGoal as a prop,
 * and the page passes userProgress.dailyGoal to it.
 *
 * We verify this contract by:
 * 1. Checking the DailyGoal component accepts the dailyGoal prop (covered in daily-goal.test.tsx)
 * 2. Checking the page source includes the dailyGoal prop pass-through
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("LearnPage integration", () => {
  it("should pass dailyGoal from user progress to DailyGoal", () => {
    const pageSource = readFileSync(
      resolve(process.cwd(), "app/(main)/learn/page.tsx"),
      "utf-8",
    );

    // Verify that the page passes dailyGoal prop to DailyGoal component
    expect(pageSource).toContain("dailyGoal={userProgress.dailyGoal");
  });

  it("should provide fallback of 1 when dailyGoal is missing", () => {
    const pageSource = readFileSync(
      resolve(process.cwd(), "app/(main)/learn/page.tsx"),
      "utf-8",
    );

    // Verify the fallback default
    expect(pageSource).toMatch(/dailyGoal=\{userProgress\.dailyGoal\s*\?\?\s*1\}/);
  });
});
