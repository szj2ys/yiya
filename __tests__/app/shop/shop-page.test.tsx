import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("ShopPage", () => {
  const pageSource = readFileSync(
    resolve(process.cwd(), "app/(main)/shop/page.tsx"),
    "utf-8",
  );

  it("should import PaywallTracker", () => {
    expect(pageSource).toContain("PaywallTracker");
    expect(pageSource).toContain("./paywall-tracker");
  });

  it("should render PaywallTracker only for non-pro users", () => {
    expect(pageSource).toContain("!isPro && <PaywallTracker");
  });

  it("should keep Promo on shop page", () => {
    expect(pageSource).toContain("<Promo");
  });
});
