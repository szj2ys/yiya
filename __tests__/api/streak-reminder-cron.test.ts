import { beforeEach, describe, expect, it, vi } from "vitest";

// --- Mocks setup ---
const selectMock = vi.fn();
const fromMock = vi.fn();
const whereMock = vi.fn();
const limitMock = vi.fn();

const dbChain = {
  select: selectMock,
  from: fromMock,
  where: whereMock,
  limit: limitMock,
};

// Each chained method returns the chain
selectMock.mockReturnValue(dbChain);
fromMock.mockReturnValue(dbChain);
whereMock.mockReturnValue(dbChain);
limitMock.mockReturnValue(dbChain);

vi.mock("@/db/drizzle", () => ({ default: dbChain }));

vi.mock("@/db/schema", () => ({
  userProgress: {
    streak: "streak",
    emailReminders: "emailReminders",
    lastLessonAt: "lastLessonAt",
    userId: "userId",
  },
  streakFreezes: {
    userId: "userId",
    usedDate: "usedDate",
  },
}));

const sendEmailMock = vi.fn();
vi.mock("@/lib/email", () => ({
  sendEmail: sendEmailMock,
}));

vi.mock("@/lib/email/templates/streak-reminder", () => ({
  buildStreakReminderSubject: (count: number) => `${count}-day streak!`,
  buildStreakReminderHtml: ({ streakCount, userId }: any) =>
    `<p>${streakCount} streak for ${userId}</p>`,
}));

const clerkGetUserMock = vi.fn();
vi.mock("@clerk/nextjs", () => ({
  clerkClient: {
    users: { getUser: clerkGetUserMock },
  },
}));

vi.mock("drizzle-orm", () => ({
  and: (...args: any[]) => args,
  gt: (a: any, b: any) => ({ op: "gt", a, b }),
  lt: (a: any, b: any) => ({ op: "lt", a, b }),
  eq: (a: any, b: any) => ({ op: "eq", a, b }),
  isNotNull: (a: any) => ({ op: "isNotNull", a }),
}));

describe("GET /api/cron/streak-reminder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup chain returns after clearAllMocks
    selectMock.mockReturnValue(dbChain);
    fromMock.mockReturnValue(dbChain);
    process.env.CRON_SECRET = "test-secret";
  });

  it("should return 401 when authorization header is missing", async () => {
    const { GET } = await import("@/app/api/cron/streak-reminder/route");
    const request = new Request("http://localhost/api/cron/streak-reminder");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("should return 401 when authorization header is wrong", async () => {
    const { GET } = await import("@/app/api/cron/streak-reminder/route");
    const request = new Request("http://localhost/api/cron/streak-reminder", {
      headers: { authorization: "Bearer wrong" },
    });
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("should send emails only to users at risk of losing streak", async () => {
    // First chain: user query
    whereMock.mockReturnValueOnce(dbChain);
    limitMock.mockResolvedValueOnce([
      { userId: "user_1", streak: 5 },
      { userId: "user_2", streak: 10 },
    ]);

    // Second chain: freeze query (no freezes)
    whereMock.mockResolvedValueOnce([]);

    clerkGetUserMock.mockResolvedValue({
      emailAddresses: [{ emailAddress: "test@example.com" }],
    });
    sendEmailMock.mockResolvedValue(true);

    const { GET } = await import("@/app/api/cron/streak-reminder/route");
    const request = new Request("http://localhost/api/cron/streak-reminder", {
      headers: { authorization: "Bearer test-secret" },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.atRisk).toBe(2);
    expect(data.eligible).toBe(2);
    expect(data.sent).toBe(2);
    expect(sendEmailMock).toHaveBeenCalledTimes(2);
  });

  it("should skip users with streak freeze", async () => {
    whereMock.mockReturnValueOnce(dbChain);
    limitMock.mockResolvedValueOnce([
      { userId: "user_1", streak: 5 },
      { userId: "user_2", streak: 10 },
    ]);

    // user_1 has a streak freeze
    whereMock.mockResolvedValueOnce([{ userId: "user_1" }]);

    clerkGetUserMock.mockResolvedValue({
      emailAddresses: [{ emailAddress: "test@example.com" }],
    });
    sendEmailMock.mockResolvedValue(true);

    const { GET } = await import("@/app/api/cron/streak-reminder/route");
    const request = new Request("http://localhost/api/cron/streak-reminder", {
      headers: { authorization: "Bearer test-secret" },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.frozen).toBe(1);
    expect(data.eligible).toBe(1);
    expect(data.sent).toBe(1);
  });

  it("should not send email when user has opted out", async () => {
    // DB query filters out opted-out users, so 0 results
    whereMock.mockReturnValueOnce(dbChain);
    limitMock.mockResolvedValueOnce([]);

    const { GET } = await import("@/app/api/cron/streak-reminder/route");
    const request = new Request("http://localhost/api/cron/streak-reminder", {
      headers: { authorization: "Bearer test-secret" },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.atRisk).toBe(0);
    expect(data.sent).toBe(0);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});
