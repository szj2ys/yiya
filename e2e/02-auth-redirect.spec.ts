import { test, expect } from "./fixtures/clerk-auth";
import { urls } from "./fixtures/test-data";

test.describe("Route Access — E2E Mode (Clerk bypassed)", () => {
  /**
   * With E2E_TESTING=true, Clerk middleware is bypassed and
   * getAuthUserId() returns a hardcoded test user. All routes
   * should be accessible and return 200.
   */

  const appRoutes = [
    { name: "learn", path: urls.learn },
    { name: "courses", path: urls.courses },
    { name: "shop", path: urls.shop },
    { name: "leaderboard", path: urls.leaderboard },
    { name: "quests", path: urls.quests },
  ];

  for (const route of appRoutes) {
    test(`${route.name} page is accessible`, async ({ page }) => {
      const response = await page.goto(route.path);
      const status = response?.status() ?? 0;
      expect(status).toBe(200);
    });
  }

  test("landing page (/) is publicly accessible and renders content", async ({
    page,
  }) => {
    await page.goto(urls.home);
    await expect(page.getByText("Speak confidently.")).toBeVisible();
  });
});
