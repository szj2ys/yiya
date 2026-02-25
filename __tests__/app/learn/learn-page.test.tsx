import { describe, it, expect, vi } from "vitest";

/**
 * Integration test: verify that the learn page wires up
 * components correctly, including the Continue Learning hero CTA,
 * decluttered sidebar, and simplified queries.
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

  it("should render weekly activity", () => {
    // Verify WeeklyActivity is imported and rendered
    expect(pageSource).toContain('import { WeeklyActivity }');
    expect(pageSource).toContain("<WeeklyActivity");
  });

  it("should not render ProgressStats, LearningStats, or Promo", () => {
    expect(pageSource).not.toContain("<ProgressStats");
    expect(pageSource).not.toContain("<LearningStats");
    expect(pageSource).not.toContain("<Promo");
  });

  it("should fetch progress stats for LearningProgress", () => {
    expect(pageSource).toContain("getCourseStats");
    expect(pageSource).toContain("getMemoryStrength");
    expect(pageSource).toContain("getLearningStats");
    expect(pageSource).toContain("<LearningProgress");
  });

  it("should not call getClaimedQuests (the XP milestone variant)", () => {
    // The page should not import the old getClaimedQuests (XP milestone quests).
    // It may import getClaimedDailyQuests (daily quests), which is a different function.
    // Use a regex that matches getClaimedQuests only when NOT followed by more word characters.
    const matches = pageSource.match(/getClaimedQuests(?![A-Za-z])/g);
    expect(matches).toBeNull();
  });

  it("should fetch weekly activity data", () => {
    expect(pageSource).toContain("getWeeklyActivity");
    expect(pageSource).toContain("weeklyActivityData");
  });

  it("should pass todayLessonCount to DailyGoal instead of lastLessonAt", () => {
    expect(pageSource).toContain("todayLessonCount={todayLessonCount}");
    expect(pageSource).not.toContain("lastLessonAt={userProgress.lastLessonAt");
  });

  it("should use getUnitsWithProgress instead of separate getUnits and getCourseProgress", () => {
    expect(pageSource).toContain("getUnitsWithProgress");
    // Should NOT import the old deprecated functions on the learn page
    expect(pageSource).not.toContain("getUnits,");
    // getCourseProgress is no longer exported — only the derived local variable exists
    expect(pageSource).not.toContain("getCourseProgress,");
  });

  it("should render ContinueCta with correct props when active lesson exists", () => {
    expect(pageSource).toContain('import { ContinueCta }');
    expect(pageSource).toContain("<ContinueCta");
    expect(pageSource).toContain("lessonTitle={courseProgress.activeLesson.title}");
    expect(pageSource).toContain("unitDescription={courseProgress.activeLesson.unit.description}");
    expect(pageSource).toContain("lessonPercentage={lessonPercentage}");
  });

  it("should keep only UserProgress, Streak, and Quests in sidebar", () => {
    expect(pageSource).toContain("<UserProgress");
    expect(pageSource).toContain("<Streak");
    expect(pageSource).toContain("<Quests");
  });

  it("should render daily quests card on learn page", () => {
    expect(pageSource).toContain('import { DailyQuestsCard }');
    expect(pageSource).toContain("<DailyQuestsCard");
    expect(pageSource).toContain("getDailyQuestProgress");
    expect(pageSource).toContain("getClaimedDailyQuests");
    expect(pageSource).toContain("DAILY_QUESTS");
  });

  it("should render DailyQuestsCard between DailyGoal and WeeklyActivity", () => {
    const dailyGoalIdx = pageSource.indexOf("<DailyGoal");
    const dailyQuestsIdx = pageSource.indexOf("<DailyQuestsCard");
    const weeklyActivityIdx = pageSource.indexOf("<WeeklyActivity");

    expect(dailyGoalIdx).toBeGreaterThan(-1);
    expect(dailyQuestsIdx).toBeGreaterThan(-1);
    expect(weeklyActivityIdx).toBeGreaterThan(-1);
    expect(dailyQuestsIdx).toBeGreaterThan(dailyGoalIdx);
    expect(dailyQuestsIdx).toBeLessThan(weeklyActivityIdx);
  });
});
