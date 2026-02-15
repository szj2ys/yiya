import { describe, expect, it, vi } from "vitest";

import { auth } from "@clerk/nextjs";

vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/ai/explain", () => ({
  getExplanation: vi.fn(),
}));

const mockAuth = vi.mocked(auth);

import { getExplanation } from "@/lib/ai/explain";

const mockGetExplanation = vi.mocked(getExplanation);

describe("POST /api/ai/explain", () => {
  it("should return explanation for valid request", async () => {
    mockAuth.mockReturnValue({ userId: "user_1" } as ReturnType<typeof auth>);
    mockGetExplanation.mockResolvedValue({
      explanation: "E",
      rule: "R",
      tip: "T",
      examples: [],
      cached: false,
    } as any);

    const { POST } = await import("@/app/api/ai/explain/route");

    const res = await POST(
      new Request("http://localhost/api/ai/explain", {
        method: "POST",
        body: JSON.stringify({
          challengeId: 1,
          question: "Q",
          userAnswer: "UA",
          correctAnswer: "CA",
          challengeType: "translate",
          courseLanguage: "English",
        }),
      }),
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.explanation).toBe("E");
  });

  it("should return 401 for unauthenticated", async () => {
    mockAuth.mockReturnValue({ userId: null } as ReturnType<typeof auth>);

    const { POST } = await import("@/app/api/ai/explain/route");

    const res = await POST(
      new Request("http://localhost/api/ai/explain", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(res.status).toBe(401);
  });

  it("should return 429 when rate limited", async () => {
    mockAuth.mockReturnValue({ userId: "user_1" } as ReturnType<typeof auth>);
    mockGetExplanation.mockResolvedValue(null);

    const { POST } = await import("@/app/api/ai/explain/route");

    const res = await POST(
      new Request("http://localhost/api/ai/explain", {
        method: "POST",
        body: JSON.stringify({
          challengeId: 1,
          question: "Q",
          userAnswer: "UA",
          correctAnswer: "CA",
          challengeType: "translate",
          courseLanguage: "English",
        }),
      }),
    );

    expect(res.status).toBe(429);
  });
});
