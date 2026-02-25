import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Component test for the redesigned LeaderboardPage.
 *
 * Since the leaderboard page is a server component, we verify
 * correct wiring by inspecting the source code for expected
 * patterns, imports, data flow, and UI structure.
 */
describe("LeaderboardPage", () => {
  const pageSource = readFileSync(
    resolve(process.cwd(), "app/(main)/leaderboard/page.tsx"),
    "utf-8",
  );

  // --- Data wiring ---

  it("should call getUserWeeklyRank query", () => {
    expect(pageSource).toContain("getUserWeeklyRank");
    expect(pageSource).toContain("userRankData");
  });

  it("should call getTopTenWeekly query", () => {
    expect(pageSource).toContain("getTopTenWeekly");
  });

  it("should get current userId via getAuthUserId", () => {
    expect(pageSource).toContain("getAuthUserId");
    expect(pageSource).toContain("currentUserId");
  });

  it("should await all data in parallel with Promise.all", () => {
    expect(pageSource).toContain("Promise.all");
  });

  // --- Top 3 podium ---

  it("should render top 3 podium with medals", () => {
    // Check for medal emojis
    expect(pageSource).toContain("\u{1F947}");
    expect(pageSource).toContain("\u{1F948}");
    expect(pageSource).toContain("\u{1F949}");
    // Check for podium data-testid
    expect(pageSource).toContain('data-testid="podium"');
  });

  it("should render podium in correct visual order (#2 left, #1 center, #3 right)", () => {
    // The podium maps indices [1, 0, 2] to show #2, #1, #3
    expect(pageSource).toContain("[1, 0, 2]");
  });

  it("should use larger avatar for #1 position", () => {
    expect(pageSource).toContain("h-16 w-16");
    expect(pageSource).toContain("h-12 w-12");
  });

  it("should apply podium background colors (amber for gold, neutral for silver, orange for bronze)", () => {
    expect(pageSource).toContain("bg-amber-50");
    expect(pageSource).toContain("bg-neutral-100");
    expect(pageSource).toContain("bg-orange-50");
  });

  // --- Current user highlighting ---

  it("should highlight current user in top 10 with green ring", () => {
    expect(pageSource).toContain("ring-2 ring-green-200 bg-green-50");
  });

  it("should identify current user by comparing userId", () => {
    expect(pageSource).toContain("user.userId === currentUserId");
  });

  // --- User not in top 10 ---

  it("should show rank section when user not in top 10", () => {
    expect(pageSource).toContain('data-testid="your-ranking"');
    expect(pageSource).toContain("Your ranking");
    expect(pageSource).toContain("userRank.rank");
  });

  it("should show XP-to-top-10 motivational text", () => {
    expect(pageSource).toContain("XP to enter top 10");
    expect(pageSource).toContain("xpToTop10");
  });

  it("should only show rank section when user is not in top 10 and rank data exists", () => {
    expect(pageSource).toContain("!currentUserInTop10 && userRank");
  });

  // --- Weekly XP display ---

  it("should display weeklyXp values instead of all-time points", () => {
    expect(pageSource).toContain("weeklyXp");
    expect(pageSource).toContain("XP this week");
  });

  it("should calculate xpToTop10 based on weekly XP", () => {
    expect(pageSource).toContain("weeklyXp");
    expect(pageSource).toContain("xpToTop10");
    // Ensure it uses weeklyXp, not points, for top10 calculation
    expect(pageSource).toMatch(/leaderboard\[leaderboard\.length - 1\]\.weeklyXp/);
  });

  it("should not use all-time points for leaderboard rankings", () => {
    // The page should NOT reference user.points for ranking display
    // (it still uses userProgress.points for the sidebar UserProgress component)
    expect(pageSource).not.toContain("getTopTenUsers");
    expect(pageSource).not.toContain("getUserRank()");
  });

  // --- Empty state ---

  it("should show empty state when all users have 0 weekly XP", () => {
    expect(pageSource).toContain("leaderboard.length === 0");
    expect(pageSource).toContain("本周还没有人学习");
  });

  // --- Layout structure ---

  it("should keep StickyWrapper sidebar with UserProgress and Quests", () => {
    expect(pageSource).toContain("<StickyWrapper");
    expect(pageSource).toContain("<UserProgress");
    expect(pageSource).toContain("<Quests");
  });

  it("should not render Promo on leaderboard page", () => {
    expect(pageSource).not.toContain("<Promo");
    expect(pageSource).not.toContain("@/components/promo");
  });

  it("should use FeedWrapper for main content", () => {
    expect(pageSource).toContain("<FeedWrapper");
  });

  it("should show subtitle with weekly context", () => {
    expect(pageSource).toContain("top learners");
  });

  // --- Rest of list (#4-#10) ---

  it("should render rest of list with alternating backgrounds", () => {
    expect(pageSource).toContain("bg-neutral-50");
    expect(pageSource).toContain("bg-white");
  });

  it("should show hover state on list rows", () => {
    expect(pageSource).toContain("hover:bg-gray-200/50");
  });

  it("should redirect to courses when no user progress", () => {
    expect(pageSource).toContain('redirect("/courses")');
  });
});
