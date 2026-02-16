import { test as base, expect } from "@playwright/test";

/**
 * In E2E mode (E2E_TESTING=true), Clerk middleware is fully bypassed
 * and getAuthUserId() falls back to a hardcoded test user.
 * No sign-in or Clerk testing tokens are needed.
 */
const hasAuth = true;

export const test = base;

/** No-op: auth is bypassed via E2E_TESTING=true + getAuthUserId() fallback */
export async function signInIfNeeded(
  _page: import("@playwright/test").Page,
) {
  // Nothing to do — middleware returns NextResponse.next() in E2E mode
}

/** Open mobile sidebar sheet if the hamburger menu is visible.
 *  Returns a locator scoped to the sheet dialog content. */
export async function openMobileSidebar(
  page: import("@playwright/test").Page,
): Promise<import("@playwright/test").Locator> {
  const hamburger = page.locator("nav.lg\\:hidden").locator("svg").first();
  if (await hamburger.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await hamburger.click();
    // Radix Dialog portal renders with role="dialog"
    const sheet = page.locator('div[role="dialog"]');
    await sheet.waitFor({ state: "visible", timeout: 5_000 });
    return sheet;
  }
  return page.locator("body");
}

/** Check if we're on a mobile viewport (sidebar hidden) */
export async function isMobileViewport(
  page: import("@playwright/test").Page,
): Promise<boolean> {
  const viewport = page.viewportSize();
  return (viewport?.width ?? 1280) < 1024;
}

export { expect, hasAuth };
