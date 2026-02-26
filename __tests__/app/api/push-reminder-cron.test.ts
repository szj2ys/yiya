import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock db
vi.mock("@/db/drizzle", () => ({
  default: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  },
}));

vi.mock("@/db/schema", () => ({
  userProgress: {
    userId: "user_id",
    streak: "streak",
    lastLessonAt: "last_lesson_at",
  },
  pushSubscriptions: {
    id: "id",
    userId: "user_id",
    endpoint: "endpoint",
    p256dh: "p256dh",
    auth: "auth",
  },
}));

vi.mock("@/lib/push/send", () => ({
  sendPushToSubscription: vi.fn().mockResolvedValue(true),
  buildNotificationPayload: vi.fn().mockReturnValue({
    title: "Don't lose your streak!",
    body: "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: "/learn" },
  }),
}));

describe("Cron push-reminder route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
  });

  it("should reject unauthorized requests", async () => {
    const { GET } = await import("@/app/api/cron/push-reminder/route");

    const req = new Request("http://localhost/api/cron/push-reminder", {
      headers: {},
    });

    const response = await GET(req);
    expect(response.status).toBe(401);
  });

  it("should accept valid CRON_SECRET", async () => {
    const { GET } = await import("@/app/api/cron/push-reminder/route");

    const req = new Request("http://localhost/api/cron/push-reminder", {
      headers: { authorization: "Bearer test-secret" },
    });

    const response = await GET(req);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toHaveProperty("sent");
    expect(json).toHaveProperty("checked");
  });

  it("should send push only to users at streak risk with active subscriptions", async () => {
    const dbMod = await import("@/db/drizzle");
    const { sendPushToSubscription } = await import("@/lib/push/send");

    const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000);

    // Mock users with active streaks and subscriptions
    const whereMock = vi.fn().mockResolvedValue([
      {
        userId: "user-1",
        streak: 5,
        lastLessonAt: twentyHoursAgo,
        subId: 1,
        endpoint: "https://push.example.com/1",
        p256dh: "key1",
        auth: "auth1",
      },
    ]);

    (dbMod.default.select as ReturnType<typeof vi.fn>).mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: whereMock,
        }),
      }),
    });

    const { GET } = await import("@/app/api/cron/push-reminder/route");

    const req = new Request("http://localhost/api/cron/push-reminder", {
      headers: { authorization: "Bearer test-secret" },
    });

    const response = await GET(req);
    const json = await response.json();

    expect(json.sent).toBe(1);
    expect(sendPushToSubscription).toHaveBeenCalledOnce();
  });
});
