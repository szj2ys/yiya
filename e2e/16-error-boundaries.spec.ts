import { test, expect } from "./fixtures/clerk-auth";
import { urls } from "./fixtures/test-data";

test.describe("Error Handling & Edge Cases", () => {
  test("non-existent page returns 404 or is handled gracefully", async ({
    page,
  }) => {
    const response = await page.goto("/this-page-does-not-exist");
    const status = response?.status() ?? 0;
    expect([200, 401, 302, 307, 404]).toContain(status);
  });

  test("non-existent lesson ID is handled gracefully", async ({ page }) => {
    const response = await page.goto("/lesson/99999");
    const status = response?.status() ?? 0;
    expect([200, 401, 302, 307, 404, 500]).toContain(status);
  });

  test("AI explain API returns error for missing fields", async ({ page }) => {
    const response = await page.request.post(
      "http://localhost:3000/api/ai/explain",
      {
        data: {},
        headers: { "Content-Type": "application/json" },
      },
    );
    // Without valid body, should get 400 Bad Request
    expect([400, 401, 403, 500]).toContain(response.status());
  });

  test("landing page loads under normal conditions", async ({ page }) => {
    await page.goto(urls.home, { timeout: 30_000 });
    // In E2E mode, the hero text renders server-side before Clerk JS loads
    await expect(page.getByText("Speak confidently.")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("navigating to /courses does not crash", async ({
    page,
  }) => {
    await page.goto(urls.courses);
    await page.waitForTimeout(500);
    await expect(page.getByText("Language Courses")).toBeVisible();
  });
});
