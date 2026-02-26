import { describe, expect, it, vi, beforeEach } from "vitest";

import { auth } from "@clerk/nextjs";

vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn(),
}));

vi.mock("@/db/queries", () => ({
  getUserProgress: vi.fn(),
}));

vi.mock("@/lib/challenge", () => ({
  generateChallengeId: vi.fn(() => "test-challenge-id"),
  selectChallengeQuestions: vi.fn(),
  storeChallenge: vi.fn(),
}));

vi.mock("@/lib/ai/rate-limit", () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ allowed: true, remaining: 9 })),
}));

const mockAuth = vi.mocked(auth);

import { getUserProgress } from "@/db/queries";
import { selectChallengeQuestions, storeChallenge } from "@/lib/challenge";
import { checkRateLimit } from "@/lib/ai/rate-limit";

const mockGetUserProgress = vi.mocked(getUserProgress);
const mockSelectQuestions = vi.mocked(selectChallengeQuestions);
const mockStoreChallenge = vi.mocked(storeChallenge);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

describe("POST /api/challenge/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create challenge and return share URL", async () => {
    mockAuth.mockReturnValue({ userId: "user_1" } as ReturnType<typeof auth>);
    mockGetUserProgress.mockResolvedValue({
      userId: "user_1",
      userName: "Alice",
      userImageSrc: "/mascot.svg",
      activeCourseId: 1,
      hearts: 5,
      points: 100,
      streak: 3,
      longestStreak: 5,
      dailyGoal: 1,
      lastLessonAt: null,
      weeklyXp: 0,
      weeklyXpResetAt: null,
      activeCourse: { id: 1, title: "Spanish", imageSrc: "/es.svg" },
    } as any);
    mockSelectQuestions.mockResolvedValue({
      questions: [
        { id: 1, question: "Q1", options: [{ id: 10, text: "A", imageSrc: null }] },
      ],
      answers: { 1: 10 },
    });
    mockStoreChallenge.mockResolvedValue(undefined);
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 9 });

    const { POST } = await import("@/app/api/challenge/create/route");

    const res = await POST(
      new Request("http://localhost/api/challenge/create", {
        method: "POST",
        body: JSON.stringify({ challengerScore: 4 }),
      }),
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.challengeId).toBe("test-challenge-id");
    expect(json.shareUrl).toContain("/challenge/test-challenge-id");
    expect(mockStoreChallenge).toHaveBeenCalledOnce();
  });

  it("should return 401 for unauthenticated", async () => {
    mockAuth.mockReturnValue({ userId: null } as ReturnType<typeof auth>);

    const { POST } = await import("@/app/api/challenge/create/route");

    const res = await POST(
      new Request("http://localhost/api/challenge/create", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(res.status).toBe(401);
  });

  it("should reject when rate limit exceeded", async () => {
    mockAuth.mockReturnValue({ userId: "user_1" } as ReturnType<typeof auth>);
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0 });

    const { POST } = await import("@/app/api/challenge/create/route");

    const res = await POST(
      new Request("http://localhost/api/challenge/create", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(res.status).toBe(429);
  });

  it("should return 400 when user has no active course", async () => {
    mockAuth.mockReturnValue({ userId: "user_1" } as ReturnType<typeof auth>);
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 9 });
    mockGetUserProgress.mockResolvedValue({
      userId: "user_1",
      userName: "Alice",
      userImageSrc: "/mascot.svg",
      activeCourseId: null,
      hearts: 5,
      points: 0,
      streak: 0,
      longestStreak: 0,
      dailyGoal: 1,
      lastLessonAt: null,
      weeklyXp: 0,
      weeklyXpResetAt: null,
    } as any);

    const { POST } = await import("@/app/api/challenge/create/route");

    const res = await POST(
      new Request("http://localhost/api/challenge/create", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(res.status).toBe(400);
  });
});
