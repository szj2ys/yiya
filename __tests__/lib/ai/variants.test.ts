import { beforeEach, describe, expect, it, vi } from "vitest";

import { __testing__resetCache } from "@/lib/ai/cache";

vi.mock("@/lib/ai/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/ai/client", () => {
  // Replicate AiConfigError in the mock so tests can reference it
  class AiConfigError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AiConfigError";
    }
  }

  return {
    aiChat: vi.fn(),
    AiConfigError,
  };
});

import { checkRateLimit } from "@/lib/ai/rate-limit";
import { aiChat, AiConfigError } from "@/lib/ai/client";

const mockCheckRateLimit = vi.mocked(checkRateLimit);
const mockAiChat = vi.mocked(aiChat);

describe("getVariantQuestion", () => {
  beforeEach(() => {
    __testing__resetCache();
    vi.clearAllMocks();
  });

  it("should return null when rate limited", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, remaining: 0 });

    const { getVariantQuestion } = await import("@/lib/ai/variants");

    const res = await getVariantQuestion({
      userId: "user_1",
      challengeId: 1,
      originalQuestion: "OQ",
      correctAnswer: "CA",
      challengeType: "SELECT",
      courseLanguage: "Spanish",
    });

    expect(res).toBeNull();
    expect(mockAiChat).not.toHaveBeenCalled();
  });

  it("should return null when AI config missing", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 10 });
    mockAiChat.mockRejectedValueOnce(new AiConfigError("Missing required env var: OPENAI_API_KEY"));

    const { getVariantQuestion } = await import("@/lib/ai/variants");

    const res = await getVariantQuestion({
      userId: "user_1",
      challengeId: 1,
      originalQuestion: "OQ",
      correctAnswer: "CA",
      challengeType: "SELECT",
      courseLanguage: "Spanish",
    });

    expect(res).toBeNull();
  });

  it("should return parsed variant on success", async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: true, remaining: 10 });
    mockAiChat.mockResolvedValueOnce(
      JSON.stringify({
        question: "Variant question",
        type: "SELECT",
        options: [
          { text: "CA", correct: true },
          { text: "D1", correct: false },
          { text: "D2", correct: false },
          { text: "D3", correct: false },
        ],
      }),
    );

    const { getVariantQuestion } = await import("@/lib/ai/variants");

    const res = await getVariantQuestion({
      userId: "user_1",
      challengeId: 1,
      originalQuestion: "OQ",
      correctAnswer: "CA",
      challengeType: "SELECT",
      courseLanguage: "Spanish",
    });

    expect(res).not.toBeNull();
    expect(res?.question).toBe("Variant question");
    expect(res?.type).toBe("SELECT");
    expect(res?.options).toHaveLength(4);
  });
});
