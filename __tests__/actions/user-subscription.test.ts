import { describe, expect, it, vi, beforeEach } from "vitest";

const billingPortalCreateSpy = vi.fn();
const checkoutCreateSpy = vi.fn();

vi.mock("@/lib/analytics", () => ({
  track: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "user_a" }),
  currentUser: vi.fn().mockResolvedValue({
    emailAddresses: [{ emailAddress: "a@example.com" }],
  }),
}));

vi.mock("@/db/queries", () => ({
  getUserSubscription: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/lib/utils", () => ({
  absoluteUrl: (path: string) => `https://example.com${path}`,
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    billingPortal: { sessions: { create: billingPortalCreateSpy } },
    checkout: { sessions: { create: checkoutCreateSpy } },
  },
}));

describe("createStripeUrl analytics", () => {
  beforeEach(() => {
    billingPortalCreateSpy.mockReset();
    checkoutCreateSpy.mockReset();
  });

  it("should track checkout_start when creating checkout session", async () => {
    checkoutCreateSpy.mockResolvedValue({ url: "https://stripe.test/checkout" });

    const { createStripeUrl } = await import("@/actions/user-subscription");
    const { track } = await import("@/lib/analytics");

    await createStripeUrl();

    expect(track).toHaveBeenCalledWith("checkout_start", { surface: "shop" });
  });
});

