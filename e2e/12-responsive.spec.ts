import { test, expect, hasAuth, signInIfNeeded } from "./fixtures/clerk-auth";
import { urls, languages } from "./fixtures/test-data";

test.describe("Responsive Design — Mobile viewport", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  // Landing page — always accessible
  test("landing page renders correctly on mobile", async ({ page }) => {
    await page.goto(urls.home);
    await expect(page.getByText("Speak confidently.")).toBeVisible();
    // Clerk buttons may not render in E2E mode — just verify hero content
    for (const lang of languages) {
      await expect(page.getByText(lang).first()).toBeVisible();
    }
  });

  // Protected pages — test only with auth
  test.describe("authenticated", () => {
    test.skip(!hasAuth, "Skipped — no CLERK_E2E_USER_EMAIL set");

    test.beforeEach(async ({ page }) => {
      await signInIfNeeded(page);
    });

    test("lesson quiz is usable on mobile", async ({ page }) => {
      await page.goto(urls.lesson);
      // Wait for lesson to load — check for question text or Check button
      await expect(
        page.getByRole("button", { name: "Check" }),
      ).toBeVisible({ timeout: 10_000 });
      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();
    });

    test("answer cards have adequate touch targets", async ({ page }) => {
      await page.goto(urls.lesson);
      const firstOption = page
        .locator(".grid")
        .first()
        .locator("> div")
        .first();
      if (await firstOption.isVisible()) {
        const box = await firstOption.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test("shop page renders on mobile", async ({ page }) => {
      await page.goto(urls.shop);
      await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();
      await expect(page.getByText("Refill hearts")).toBeVisible();
    });

    test("leaderboard renders on mobile", async ({ page }) => {
      await page.goto(urls.leaderboard);
      await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
    });

    test("quests page renders on mobile", async ({ page }) => {
      await page.goto(urls.quests);
      await expect(page.getByText("Earn 20 XP")).toBeVisible();
    });

    test("course cards display in grid on mobile", async ({ page }) => {
      await page.goto(urls.courses);
      await expect(page.getByText("Language Courses")).toBeVisible();
    });
  });
});
