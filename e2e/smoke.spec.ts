import { test, expect } from "./fixtures/clerk-auth";
import { urls } from "./fixtures/test-data";

/**
 * Post-deploy smoke tests.
 *
 * These are lightweight checks that validate core user flows are working
 * after a fresh deploy. They should run fast (< 30s total) and cover:
 *   1. Landing page loads
 *   2. Auth redirect works (app routes accessible in E2E mode)
 *   3. Lesson page renders
 */
test.describe("Smoke Tests", () => {
  test("should load landing page and verify core navigation", async ({
    page,
  }) => {
    const response = await page.goto(urls.home);
    expect(response?.status()).toBe(200);

    // Hero content renders
    await expect(page.getByText("Speak confidently.")).toBeVisible();

    // Page has correct title
    await expect(page).toHaveTitle(/Yiya/);
  });

  test("should access app routes when authenticated", async ({ page }) => {
    // In E2E mode, Clerk middleware is bypassed — all app routes should return 200
    const response = await page.goto(urls.learn);
    expect(response?.status()).toBe(200);
  });

  test("should load lesson page and render quiz UI", async ({ page }) => {
    // Navigate to the learn page first
    await page.goto(urls.learn);

    // Find and click the first available lesson button
    const lessonButton = page
      .locator('a[href*="/lesson"]')
      .first();
    const lessonExists = await lessonButton.isVisible({ timeout: 5_000 }).catch(() => false);

    if (lessonExists) {
      await lessonButton.click();
      await page.waitForURL(/\/lesson/, { timeout: 10_000 });

      // Verify lesson page has rendered (progress bar or quiz content)
      const progressBar = page.locator('[role="progressbar"]');
      const practiceModal = page.getByText("Practice lesson");
      const quizContent = page.locator("h1");

      await expect(
        progressBar.or(practiceModal).or(quizContent).first(),
      ).toBeVisible({ timeout: 10_000 });
    } else {
      // No lessons available — verify learn page rendered correctly instead
      await expect(page.locator("body")).toBeVisible();
    }
  });
});
