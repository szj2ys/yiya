import { test, expect, hasAuth, signInIfNeeded, isMobileViewport } from "./fixtures/clerk-auth";
import { urls } from "./fixtures/test-data";
import { resetTestUser, closePool } from "./fixtures/db-reset";

test.describe("Keyboard Shortcuts — Lesson Quiz", () => {
  test.beforeAll(async () => { await resetTestUser(); });
  test.afterAll(async () => { await closePool(); });

  test("lesson page is accessible in E2E mode", async ({ page }) => {
    const response = await page.goto(urls.lesson);
    expect(response?.status()).toBe(200);
  });

  test.describe("authenticated", () => {
    test.skip(!hasAuth, "Skipped — no CLERK_E2E_USER_EMAIL set");

    test.beforeEach(async ({ page }) => {
      await signInIfNeeded(page);
    });

    test("pressing Enter triggers Check action after selection", async ({
      page,
    }) => {
      // Keyboard shortcuts are a desktop interaction
      if (await isMobileViewport(page)) {
        test.skip();
        return;
      }

      await page.goto(urls.lesson);

      // Wait for options to appear
      const firstOption = page
        .locator(".grid")
        .first()
        .locator("> div")
        .first();
      await firstOption.waitFor({ state: "visible" });
      await firstOption.click();

      // Press Enter to trigger Check via useKey hook
      await page.keyboard.press("Enter");

      // Wait for the footer to show correct/wrong feedback (Next or Retry button appears)
      await expect(
        page.getByRole("button", { name: "Next" })
          .or(page.getByRole("button", { name: "Retry" }))
          .first()
      ).toBeVisible({ timeout: 10_000 });
    });
  });
});
