import { beforeEach, describe, expect, it, vi } from "vitest";

const mockConstructEvent = vi.fn();
const mockRetrieveSubscription = vi.fn();
const mockDbInsertValues = vi.fn();
const mockDbInsert = vi.fn(() => ({ values: mockDbInsertValues }));

const mockTrack = vi.fn();

vi.mock("next/headers", () => ({
  headers: () => new Map([["Stripe-Signature", "sig"]]),
}));

vi.mock("@/lib/analytics", () => ({ track: mockTrack }));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
    subscriptions: {
      retrieve: mockRetrieveSubscription,
    },
  },
}));

vi.mock("@/db/drizzle", () => ({
  default: {
    insert: mockDbInsert,
    update: vi.fn(),
  },
}));

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockRetrieveSubscription.mockResolvedValue({
      id: "sub_123",
      customer: "cus_123",
      current_period_end: 1,
      items: {
        data: [{ price: { id: "price_123" } }],
      },
    });

    mockDbInsertValues.mockResolvedValue(undefined);
    mockTrack.mockResolvedValue(undefined);
  });

  it("should track checkout_complete on successful purchase", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          subscription: "sub_123",
          metadata: { userId: "user_123" },
        },
      },
    });

    const { POST } = await import("./route");
    const res = await POST(new Request("http://localhost", { method: "POST", body: "{}" }));

    expect(res.status).toBe(200);
    expect(mockTrack).toHaveBeenCalledWith("checkout_complete", { surface: "shop" });
  });
});
