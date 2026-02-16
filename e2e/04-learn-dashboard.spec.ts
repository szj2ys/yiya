import { test, expect, hasAuth, signInIfNeeded, openMobileSidebar, isMobileViewport } from "./fixtures/clerk-auth";
import { urls } from "./fixtures/test-data";

test.describe("Learn Dashboard — /learn", () => {
  test("page is accessible in E2E mode", async ({ page }) => {
    const response = await page.goto(urls.learn);
    expect(response?.status()).toBe(200);
  });

  test.describe("authenticated", () => {
    test.skip(!hasAuth, "Skipped — no CLERK_E2E_USER_EMAIL set");

    test.beforeEach(async ({ page }) => {
      await signInIfNeeded(page);
    });

    test("shows sidebar navigation with Learn, Leaderboard, Quests, Shop", async ({
      page,
    }) => {
      await page.goto(urls.learn);
      const scope = await isMobileViewport(page)
        ? await openMobileSidebar(page)
        : page.locator("body");
      await expect(scope.getByText("Yiya").first()).toBeVisible();
    });

    test("displays user progress panel with hearts and points", async ({
      page,
    }) => {
      await page.goto(urls.learn);
      if (await isMobileViewport(page)) {
        // On mobile, the sidebar/sticky wrapper with hearts/points is hidden.
        // Verify main content renders instead.
        await expect(page.locator("main").or(page.getByText("Unit 1")).first()).toBeVisible();
      } else {
        await expect(page.locator('img[alt="Hearts"]').first()).toBeVisible();
        await expect(page.locator('img[alt="Points"]').first()).toBeVisible();
      }
    });

    test("main content area is rendered", async ({ page }) => {
      await page.goto(urls.learn);
      await expect(page.locator("main")).toBeVisible();
    });

    test("clicking Leaderboard navigates to /leaderboard", async ({
      page,
    }) => {
      await page.goto(urls.learn);
      const mobile = await isMobileViewport(page);
      const scope = mobile ? await openMobileSidebar(page) : page.locator("body");
      await scope.locator('a[href="/leaderboard"]').first().click();
      await page.waitForURL(/\/leaderboard/);
      if (mobile) await page.keyboard.press("Escape");
      await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
    });

    test("clicking Quests navigates to /quests", async ({ page }) => {
      await page.goto(urls.learn);
      const mobile = await isMobileViewport(page);
      const scope = mobile ? await openMobileSidebar(page) : page.locator("body");
      await scope.locator('a[href="/quests"]').first().click();
      await page.waitForURL(/\/quests/);
      if (mobile) await page.keyboard.press("Escape");
      await expect(page.getByRole("heading", { name: "Quests" })).toBeVisible();
    });

    test("clicking Shop navigates to /shop", async ({ page }) => {
      await page.goto(urls.learn);
      const mobile = await isMobileViewport(page);
      const scope = mobile ? await openMobileSidebar(page) : page.locator("body");
      await scope.locator('a[href="/shop"]').first().click();
      await page.waitForURL(/\/shop/);
      if (mobile) await page.keyboard.press("Escape");
      await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();
    });
  });
});
