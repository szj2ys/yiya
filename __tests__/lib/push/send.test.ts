import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock web-push
vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

// Mock db
vi.mock("@/db/drizzle", () => ({
  default: {
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}));

vi.mock("@/db/schema", () => ({
  pushSubscriptions: {
    id: "id",
    userId: "user_id",
    endpoint: "endpoint",
    p256dh: "p256dh",
    auth: "auth",
  },
}));

describe("push/send", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should format notification payload correctly", async () => {
    const { buildNotificationPayload } = await import("@/lib/push/send");

    const payload = buildNotificationPayload({
      title: "Test Title",
      body: "Test body message",
    });

    expect(payload).toEqual({
      title: "Test Title",
      body: "Test body message",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: "/learn" },
    });
  });

  it("should allow overriding default payload fields", async () => {
    const { buildNotificationPayload } = await import("@/lib/push/send");

    const payload = buildNotificationPayload({
      title: "Custom",
      body: "Custom body",
      icon: "/custom-icon.png",
      data: { url: "/quests" },
    });

    expect(payload.icon).toBe("/custom-icon.png");
    expect(payload.data?.url).toBe("/quests");
  });

  it("should send notification via web-push", async () => {
    const webpush = await import("web-push");
    (webpush.default.sendNotification as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const { sendPushToSubscription, buildNotificationPayload } = await import("@/lib/push/send");

    const sub = { id: 1, endpoint: "https://push.example.com", p256dh: "key1", auth: "auth1" };
    const payload = buildNotificationPayload({ title: "Test", body: "Hello" });

    const result = await sendPushToSubscription(sub, payload);
    expect(result).toBe(true);
    expect(webpush.default.sendNotification).toHaveBeenCalledOnce();
  });

  it("should clean up expired subscriptions on 410 response", async () => {
    const webpush = await import("web-push");
    const dbMod = await import("@/db/drizzle");

    const deleteWhereMock = vi.fn().mockResolvedValue(undefined);
    (dbMod.default.delete as ReturnType<typeof vi.fn>).mockReturnValue({
      where: deleteWhereMock,
    });

    (webpush.default.sendNotification as ReturnType<typeof vi.fn>).mockRejectedValue({
      statusCode: 410,
    });

    const { sendPushToSubscription, buildNotificationPayload } = await import("@/lib/push/send");

    const sub = { id: 42, endpoint: "https://expired.example.com", p256dh: "k", auth: "a" };
    const payload = buildNotificationPayload({ title: "Test", body: "Hello" });

    const result = await sendPushToSubscription(sub, payload);
    expect(result).toBe(false);
    expect(dbMod.default.delete).toHaveBeenCalled();
  });
});
