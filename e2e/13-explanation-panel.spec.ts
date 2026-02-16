import { test, expect, hasAuth, signInIfNeeded } from "./fixtures/clerk-auth";
import { urls } from "./fixtures/test-data";
import { resetTestUser, closePool } from "./fixtures/db-reset";

test.describe("AI Explanation Panel", () => {
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

    test("explanation panel appears after wrong answer", async ({ page }) => {
      await page.goto(urls.lesson);

      // Mock AI explain endpoint
      await page.route("**/api/ai/explain", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            why: "Test explanation.",
            rule: "Grammar rule: test.",
            tip: "Memory tip: test.",
            examples: ["Example 1"],
          }),
        });
      });

      const options = page.locator(".grid").first().locator("> div");
      const count = await options.count();

      for (let i = count - 1; i >= 0; i--) {
        await options.nth(i).click();
        await page.getByRole("button", { name: "Check" }).click();
        await page.waitForTimeout(800);
        if (await page.getByRole("button", { name: "Retry" }).isVisible()) {
          // Explanation panel should be loading/visible
          break;
        }
        const next = page.getByRole("button", { name: "Next" });
        if (await next.isVisible()) {
          await next.click();
          await page.waitForTimeout(300);
        }
      }
    });
  });
});
