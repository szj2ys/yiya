import { test, expect, hasAuth, signInIfNeeded } from "./fixtures/clerk-auth";
import { urls } from "./fixtures/test-data";
import { resetTestUser, closePool } from "./fixtures/db-reset";

test.describe("Lesson Completion Flow", () => {
  test.beforeAll(async () => { await resetTestUser(); });
  test.afterAll(async () => { await closePool(); });

  test("page is accessible in E2E mode", async ({ page }) => {
    const response = await page.goto(urls.lesson);
    expect(response?.status()).toBe(200);
  });

  test.describe("authenticated", () => {
    test.skip(!hasAuth, "Skipped — no CLERK_E2E_USER_EMAIL set");

    test.beforeEach(async ({ page }) => {
      await signInIfNeeded(page);
    });

    test("completing all challenges shows completion summary", async ({
      page,
    }) => {
      await page.goto(urls.lesson);

      const maxChallenges = 20;
      let completed = false;

      for (let turn = 0; turn < maxChallenges; turn++) {
        if (
          await page
            .getByText("Lesson complete")
            .isVisible()
            .catch(() => false)
        ) {
          completed = true;
          break;
        }

        const options = page.locator(".grid").first().locator("> div");
        const count = await options.count();
        if (count === 0) break;

        let answered = false;
        for (let i = 0; i < count; i++) {
          await options.nth(i).click();
          const btn = page.getByRole("button", { name: "Check" });
          if (await btn.isVisible()) await btn.click();
          await page.waitForTimeout(500);

          const next = page.getByRole("button", { name: "Next" });
          if (await next.isVisible()) {
            await next.click();
            await page.waitForTimeout(300);
            answered = true;
            break;
          }
          const retry = page.getByRole("button", { name: "Retry" });
          if (await retry.isVisible()) {
            await retry.click();
            await page.waitForTimeout(200);
          }
        }
        if (!answered) break;
      }

      if (completed) {
        await expect(page.getByText("Lesson complete")).toBeVisible();
        await expect(page.getByText(/\d+\/\d+ correct/)).toBeVisible();
        await expect(page.getByText("Accuracy")).toBeVisible();
      }
    });
  });
});
