import { describe, expect, it, vi } from "vitest";

import { auth } from "@clerk/nextjs";

vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/ai/variants", () => ({
  getVariantQuestion: vi.fn(),
}));

const mockAuth = vi.mocked(auth);

import { getVariantQuestion } from "@/lib/ai/variants";

const mockGetVariantQuestion = vi.mocked(getVariantQuestion);

describe("POST /api/ai/variants", () => {
  it("should return variant for valid request", async () => {
    mockAuth.mockReturnValue({ userId: "user_1" } as ReturnType<typeof auth>);

    mockGetVariantQuestion.mockResolvedValue({
      question: "VQ",
      type: "SELECT",
      options: [
        { text: "CA", correct: true },
        { text: "D1", correct: false },
        { text: "D2", correct: false },
        { text: "D3", correct: false },
      ],
    } as any);

    const { POST } = await import("@/app/api/ai/variants/route");

    const res = await POST(
      new Request("http://localhost/api/ai/variants", {
        method: "POST",
        body: JSON.stringify({
          challengeId: 1,
          originalQuestion: "OQ",
          correctAnswer: "CA",
          challengeType: "SELECT",
          courseLanguage: "Spanish",
        }),
      }),
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.variant.question).toBe("VQ");
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockReturnValue({ userId: null } as ReturnType<typeof auth>);

    const { POST } = await import("@/app/api/ai/variants/route");

    const res = await POST(
      new Request("http://localhost/api/ai/variants", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(res.status).toBe(401);
  });
});
