import { test, expect, hasAuth, signInIfNeeded } from "./fixtures/clerk-auth";
import { urls } from "./fixtures/test-data";

test.describe("Leaderboard — /leaderboard", () => {
  test("page is accessible in E2E mode", async ({ page }) => {
    const response = await page.goto(urls.leaderboard);
    expect(response?.status()).toBe(200);
  });

  test.describe("authenticated", () => {
    test.skip(!hasAuth, "Skipped — no CLERK_E2E_USER_EMAIL set");

    test.beforeEach(async ({ page }) => {
      await signInIfNeeded(page);
    });

    test("displays leaderboard heading and description", async ({ page }) => {
      await page.goto(urls.leaderboard);
      await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
      await expect(
        page.getByText("See where you stand among other learners"),
      ).toBeVisible();
    });

    test("shows leaderboard trophy image", async ({ page }) => {
      await page.goto(urls.leaderboard);
      // Target the large leaderboard image (90x90) in the main content area
      const img = page.locator('img[alt="Leaderboard"][width="90"]');
      await expect(img).toBeVisible();
    });

    test("shows up to 10 user entries", async ({ page }) => {
      await page.goto(urls.leaderboard);
      const entries = page.getByText(/\d+ XP/);
      expect(await entries.count()).toBeLessThanOrEqual(10);
    });
  });
});
