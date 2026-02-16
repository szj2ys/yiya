import { test, expect, hasAuth, signInIfNeeded } from "./fixtures/clerk-auth";
import { urls } from "./fixtures/test-data";

test.describe("Quests — /quests", () => {
  test("page is accessible in E2E mode", async ({ page }) => {
    const response = await page.goto(urls.quests);
    expect(response?.status()).toBe(200);
  });

  test.describe("authenticated", () => {
    test.skip(!hasAuth, "Skipped — no CLERK_E2E_USER_EMAIL set");

    test.beforeEach(async ({ page }) => {
      await signInIfNeeded(page);
    });

    test("displays quests heading and description", async ({ page }) => {
      await page.goto(urls.quests);
      await expect(page.getByRole("heading", { name: "Quests" })).toBeVisible();
      await expect(
        page.getByText("Complete quests by earning points."),
      ).toBeVisible();
    });

    test("displays all five quest milestones", async ({ page }) => {
      await page.goto(urls.quests);
      for (const xp of [20, 50, 100, 500, 1000]) {
        await expect(page.getByText(`Earn ${xp} XP`)).toBeVisible();
      }
    });

    test("each quest has a progress bar", async ({ page }) => {
      await page.goto(urls.quests);
      const bars = page.locator('[role="progressbar"]');
      expect(await bars.count()).toBeGreaterThanOrEqual(5);
    });
  });
});
