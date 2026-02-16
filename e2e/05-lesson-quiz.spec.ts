import { test, expect, hasAuth, signInIfNeeded } from "./fixtures/clerk-auth";
import { urls } from "./fixtures/test-data";

test.describe("Lesson / Quiz Flow — /lesson", () => {
  test("page is accessible in E2E mode", async ({ page }) => {
    const response = await page.goto(urls.lesson);
    expect(response?.status()).toBe(200);
  });

  test.describe("authenticated", () => {
    test.skip(!hasAuth, "Skipped — no CLERK_E2E_USER_EMAIL set");

    test.beforeEach(async ({ page }) => {
      await signInIfNeeded(page);
    });

    test("renders quiz header with hearts and progress bar", async ({
      page,
    }) => {
      await page.goto(urls.lesson);
      await expect(page.locator('img[alt="Heart"]').first()).toBeVisible();
      await expect(
        page.locator('[role="progressbar"]').first(),
      ).toBeVisible();
    });

    test("displays a challenge question", async ({ page }) => {
      await page.goto(urls.lesson);
      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();
    });

    test("shows answer options for the challenge", async ({ page }) => {
      await page.goto(urls.lesson);
      const optionGrid = page.locator(".grid").first();
      await expect(optionGrid).toBeVisible();
      const options = optionGrid.locator("> div");
      expect(await options.count()).toBeGreaterThanOrEqual(2);
    });

    test("Check button is disabled until an option is selected", async ({
      page,
    }) => {
      await page.goto(urls.lesson);
      await expect(
        page.getByRole("button", { name: "Check" }),
      ).toBeDisabled();
    });

    test("selecting an option enables the Check button", async ({ page }) => {
      await page.goto(urls.lesson);
      const firstOption = page.locator(".grid").first().locator("> div").first();
      await firstOption.click();
      await expect(
        page.getByRole("button", { name: "Check" }),
      ).toBeEnabled();
    });

    test("clicking X opens exit confirmation modal", async ({ page }) => {
      await page.goto(urls.lesson);
      await page.locator("header svg").first().click();
      await expect(page.getByText("Wait, don't go!")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Keep learning" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "End session" }),
      ).toBeVisible();
    });

    test("'Keep learning' closes the exit modal", async ({ page }) => {
      await page.goto(urls.lesson);
      await page.locator("header svg").first().click();
      await page.getByRole("button", { name: "Keep learning" }).click();
      await expect(page.getByText("Wait, don't go!")).toBeHidden();
    });

    test("'End session' navigates back to /learn", async ({ page }) => {
      await page.goto(urls.lesson);
      await page.locator("header svg").first().click();
      await page.getByRole("button", { name: "End session" }).click();
      await page.waitForURL(/\/learn/, { timeout: 10_000 });
    });
  });
});
