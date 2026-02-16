import { test, expect, hasAuth, signInIfNeeded, isMobileViewport } from "./fixtures/clerk-auth";
import { urls } from "./fixtures/test-data";

test.describe("Shop — /shop", () => {
  test("page is accessible in E2E mode", async ({ page }) => {
    const response = await page.goto(urls.shop);
    expect(response?.status()).toBe(200);
  });

  test.describe("authenticated", () => {
    test.skip(!hasAuth, "Skipped — no CLERK_E2E_USER_EMAIL set");

    test.beforeEach(async ({ page }) => {
      await signInIfNeeded(page);
    });

    test("displays shop heading and description", async ({ page }) => {
      await page.goto(urls.shop);
      await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();
      await expect(
        page.getByText("Spend your points on cool stuff."),
      ).toBeVisible();
    });

    test("shows refill hearts option", async ({ page }) => {
      await page.goto(urls.shop);
      await expect(page.getByText("Refill hearts")).toBeVisible();
    });

    test("shows unlimited hearts / upgrade option", async ({ page }) => {
      await page.goto(urls.shop);
      // Target the specific bold text in the shop items, not the sidebar promo
      await expect(
        page.locator("p.font-bold", { hasText: "Unlimited hearts" }),
      ).toBeVisible();
    });

    test("displays user progress in sidebar", async ({ page }) => {
      await page.goto(urls.shop);
      if (await isMobileViewport(page)) {
        // On mobile, the sticky sidebar is hidden. Verify main content instead.
        await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();
      } else {
        await expect(page.locator('img[alt="Hearts"]').first()).toBeVisible();
        await expect(page.locator('img[alt="Points"]').first()).toBeVisible();
      }
    });
  });
});
