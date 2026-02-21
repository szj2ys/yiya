import React from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const trackSpy = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/analytics", () => ({
  track: (...args: unknown[]) => trackSpy(...args),
}));

describe("PaywallTracker", () => {
  beforeEach(() => {
    trackSpy.mockClear();
  });

  it("should track paywall_view on mount for non-pro users", async () => {
    const { PaywallTracker } = await import(
      "@/app/(main)/shop/paywall-tracker"
    );

    render(<PaywallTracker />);

    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith("paywall_view", { surface: "shop" });
  });
});
