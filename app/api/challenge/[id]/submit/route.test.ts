import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/challenge", () => ({
  getChallenge: vi.fn(),
  calculateScore: vi.fn(),
}));

vi.mock("@/lib/ai/rate-limit", () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ allowed: true, remaining: 19 })),
}));

import { getChallenge, calculateScore } from "@/lib/challenge";
import { checkRateLimit } from "@/lib/ai/rate-limit";

const mockGetChallenge = vi.mocked(getChallenge);
const mockCalculateScore = vi.mocked(calculateScore);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

describe("POST /api/challenge/[id]/submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate score on submission", async () => {
    mockGetChallenge.mockResolvedValue({
      id: "test-123",
      challengerId: "user_1",
      challengerName: "Alice",
      language: "Spanish",
      questions: [{ id: 1, question: "Q", options: [] }],
      answers: { 1: 10 },
      challengerScore: 4,
      createdAt: Date.now(),
    });

    mockCalculateScore.mockReturnValue({
      friendScore: 3,
      challengerScore: 4,
      totalQuestions: 5,
      correctAnswers: [1, 2, 3],
    });

    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 19 });

    const { POST } = await import(
      "@/app/api/challenge/[id]/submit/route"
    );

    const res = await POST(
      new Request("http://localhost/api/challenge/test-123/submit", {
        method: "POST",
        body: JSON.stringify({ answers: { "1": 10, "2": 21, "3": 30 } }),
      }),
      { params: { id: "test-123" } },
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.friendScore).toBe(3);
    expect(json.challengerScore).toBe(4);
  });

  it("should return 404 when challenge not found", async () => {
    mockGetChallenge.mockResolvedValue(null);
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 19 });

    const { POST } = await import(
      "@/app/api/challenge/[id]/submit/route"
    );

    const res = await POST(
      new Request("http://localhost/api/challenge/missing/submit", {
        method: "POST",
        body: JSON.stringify({ answers: {} }),
      }),
      { params: { id: "missing" } },
    );

    expect(res.status).toBe(404);
  });

  it("should return 400 when answers not provided", async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 19 });

    const { POST } = await import(
      "@/app/api/challenge/[id]/submit/route"
    );

    const res = await POST(
      new Request("http://localhost/api/challenge/test-123/submit", {
        method: "POST",
        body: JSON.stringify({}),
      }),
      { params: { id: "test-123" } },
    );

    expect(res.status).toBe(400);
  });

  it("should reject when rate limit exceeded", async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0 });

    const { POST } = await import(
      "@/app/api/challenge/[id]/submit/route"
    );

    const res = await POST(
      new Request("http://localhost/api/challenge/test-123/submit", {
        method: "POST",
        body: JSON.stringify({ answers: { "1": 10 } }),
      }),
      { params: { id: "test-123" } },
    );

    expect(res.status).toBe(429);
  });
});
