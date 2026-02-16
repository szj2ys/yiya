import { test, expect, hasAuth, signInIfNeeded } from "./fixtures/clerk-auth";
import { urls, languages } from "./fixtures/test-data";
import { resetTestUser, closePool } from "./fixtures/db-reset";

test.describe("Full User Journey — End-to-End Happy Path", () => {
  test.beforeAll(async () => { await resetTestUser(); });
  test.afterAll(async () => { await closePool(); });

  test.describe("authenticated", () => {
    test.skip(!hasAuth, "Skipped — no CLERK_E2E_USER_EMAIL set");

    test.beforeEach(async ({ page }) => {
      await signInIfNeeded(page);
    });

    test("complete journey: select course → lesson → shop → quests", async ({
      page,
    }) => {
      // Step 1: Course Selection
      await page.goto(urls.courses);
      await expect(page.getByText("Language Courses")).toBeVisible();
      await page.getByText("Spanish").first().click();
      await page.waitForURL(/\/learn/, { timeout: 10_000 });

      // Step 2: Start lesson — verify it loads
      await page.goto(urls.lesson);
      await expect(
        page.getByRole("button", { name: "Check" }),
      ).toBeVisible({ timeout: 10_000 });

      // Step 3: Visit Shop
      await page.goto(urls.shop);
      await expect(page.getByText("Refill hearts")).toBeVisible();

      // Step 4: Visit Leaderboard
      await page.goto(urls.leaderboard);
      await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();

      // Step 5: View Quests
      await page.goto(urls.quests);
      await expect(page.getByText("Earn 20 XP")).toBeVisible();

      // Step 6: Return to Learn
      await page.goto(urls.learn);
      await expect(page.locator("main")).toBeVisible();
    });
  });
});
