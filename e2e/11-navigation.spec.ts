import { test, expect, hasAuth, signInIfNeeded, openMobileSidebar, isMobileViewport } from "./fixtures/clerk-auth";
import { urls } from "./fixtures/test-data";

test.describe("Navigation — Full User Journey", () => {
  test.describe("authenticated", () => {
    test.skip(!hasAuth, "Skipped — no CLERK_E2E_USER_EMAIL set");

    test.beforeEach(async ({ page }) => {
      await signInIfNeeded(page);
    });

    /** Helper to click a sidebar link, handling mobile sheet */
    async function clickSidebarLink(page: import("@playwright/test").Page, href: string) {
      const mobile = await isMobileViewport(page);
      const scope = mobile ? await openMobileSidebar(page) : page.locator("body");
      await scope.locator(`a[href="${href}"]`).first().click();
      // Close the Sheet overlay on mobile (it persists after navigation)
      if (mobile) {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
      }
    }

    test("sidebar navigates between all main pages", async ({ page }) => {
      await page.goto(urls.learn);

      await clickSidebarLink(page, "/leaderboard");
      await page.waitForURL(/\/leaderboard/);
      await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();

      await clickSidebarLink(page, "/quests");
      await page.waitForURL(/\/quests/);

      await clickSidebarLink(page, "/shop");
      await page.waitForURL(/\/shop/);
      await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();

      await clickSidebarLink(page, "/learn");
      await page.waitForURL(/\/learn/);
    });

    test("browser back button works between pages", async ({ page }) => {
      await page.goto(urls.learn);
      await clickSidebarLink(page, "/shop");
      await page.waitForURL(/\/shop/);
      await page.goBack();
      await page.waitForURL(/\/learn/);
    });

    test("direct URL access to /shop works", async ({ page }) => {
      await page.goto(urls.shop);
      await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();
    });

    test("direct URL access to /leaderboard works", async ({ page }) => {
      await page.goto(urls.leaderboard);
      await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
    });

    test("direct URL access to /quests works", async ({ page }) => {
      await page.goto(urls.quests);
      await expect(page.getByRole("heading", { name: "Quests" })).toBeVisible();
    });
  });
});
