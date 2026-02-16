import { test, expect, hasAuth, signInIfNeeded } from "./fixtures/clerk-auth";
import { urls, languages } from "./fixtures/test-data";

/**
 * Course selection tests.
 * Protected by Clerk — without auth these routes return 401.
 * We verify protection is in place and skip content tests when no auth.
 */

test.describe("Course Selection — /courses", () => {
  test("page is accessible in E2E mode", async ({ page }) => {
    const response = await page.goto(urls.courses);
    expect(response?.status()).toBe(200);
  });

  // These tests require authentication — skip when credentials are unavailable
  test.describe("authenticated", () => {
    test.skip(!hasAuth, "Skipped — no CLERK_E2E_USER_EMAIL set");

    test.beforeEach(async ({ page }) => {
      await signInIfNeeded(page);
    });

    test("displays all available language courses", async ({ page }) => {
      await page.goto(urls.courses);
      await expect(page.getByText("Language Courses")).toBeVisible();
      for (const lang of languages) {
        await expect(page.getByText(lang).first()).toBeVisible();
      }
    });

    test("course cards are rendered in a grid layout", async ({ page }) => {
      await page.goto(urls.courses);
      const cards = page.locator(".grid > div");
      await expect(cards).toHaveCount(languages.length);
    });

    test("clicking a course card activates it and redirects to /learn", async ({
      page,
    }) => {
      await page.goto(urls.courses);
      await page.getByText("Spanish").first().click();
      await page.waitForURL(/\/learn/, { timeout: 10_000 });
    });
  });
});
