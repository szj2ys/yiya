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

  it("should not call getCourseStats or getLearningStats or getClaimedQuests", () => {
    expect(pageSource).not.toContain("getCourseStats");
    expect(pageSource).not.toContain("getLearningStats");
    expect(pageSource).not.toContain("getClaimedQuests");
  });

  it("should fetch weekly activity data", () => {
    expect(pageSource).toContain("getWeeklyActivity");
    expect(pageSource).toContain("weeklyActivityData");
  });

  it("should pass todayLessonCount to DailyGoal instead of lastLessonAt", () => {
    expect(pageSource).toContain("todayLessonCount={todayLessonCount}");
    expect(pageSource).not.toContain("lastLessonAt={userProgress.lastLessonAt");
  });

  it("should render Continue Learning hero CTA when active lesson exists", () => {
    expect(pageSource).toContain("courseProgress.activeLesson.title");
    expect(pageSource).toContain("courseProgress.activeLesson.unit.description");
    expect(pageSource).toContain("Continue");
    expect(pageSource).toContain('href="/lesson"');
  });

  it("should keep only UserProgress, Streak, and Quests in sidebar", () => {
    expect(pageSource).toContain("<UserProgress");
    expect(pageSource).toContain("<Streak");
    expect(pageSource).toContain("<Quests");
  });
});
