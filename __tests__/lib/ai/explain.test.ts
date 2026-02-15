import { beforeEach, describe, expect, it, vi } from "vitest";

import { __testing__resetCache } from "@/lib/ai/cache";
import { __testing__resetRateLimit } from "@/lib/ai/rate-limit";

vi.mock("@/lib/ai/client", () => {
  return {
    aiChat: vi.fn(),
  };
});

import { aiChat } from "@/lib/ai/client";

const mockAiChat = vi.mocked(aiChat);

describe("getExplanation", () => {
  beforeEach(() => {
    __testing__resetCache();
    __testing__resetRateLimit();
    vi.clearAllMocks();
  });

  it("should return explanation from LLM", async () => {
    mockAiChat.mockResolvedValueOnce(
      JSON.stringify({
        explanation: "Because of verb agreement.",
        rule: "Use 'have' with I/you/we/they.",
        tip: "I = have.",
        examples: [
          { source: "I have time.", translation: "I have time." },
          { source: "They have a dog.", translation: "They have a dog." },
        ],
      }),
    );

    const { getExplanation } = await import("@/lib/ai/explain");

    const result = await getExplanation({
      userId: "user_1",
      challengeId: 123,
      question: "Pick correct",
      userAnswer: "I has",
      correctAnswer: "I have",
      challengeType: "translate",
      courseLanguage: "English",
    });

    expect(result).not.toBeNull();
    expect(result?.explanation).toContain("verb agreement");
    expect(result?.cached).toBe(false);
    expect(mockAiChat).toHaveBeenCalledTimes(1);
  });

  it("should return cached explanation on second call", async () => {
    mockAiChat.mockResolvedValueOnce(
      JSON.stringify({
        explanation: "Because...",
        rule: "Rule...",
        tip: "Tip...",
        examples: [
          { source: "A", translation: "B" },
          { source: "C", translation: "D" },
        ],
      }),
    );

    const { getExplanation } = await import("@/lib/ai/explain");

    const first = await getExplanation({
      userId: "user_1",
      challengeId: 123,
      question: "Q",
      userAnswer: "UA",
      correctAnswer: "CA",
      challengeType: "translate",
      courseLanguage: "English",
    });

    const second = await getExplanation({
      userId: "user_1",
      challengeId: 123,
      question: "Q",
      userAnswer: "UA",
      correctAnswer: "CA",
      challengeType: "translate",
      courseLanguage: "English",
    });

    expect(first?.cached).toBe(false);
    expect(second?.cached).toBe(true);
    expect(mockAiChat).toHaveBeenCalledTimes(1);
  });

  it("should return null when rate limited", async () => {
    const { getExplanation } = await import("@/lib/ai/explain");

    // explain limit is 20/day; 21st call should be blocked
    for (let i = 0; i < 20; i++) {
      mockAiChat.mockResolvedValueOnce(
        JSON.stringify({
          explanation: "E",
          rule: "R",
          tip: "T",
          examples: [
            { source: "A", translation: "B" },
            { source: "C", translation: "D" },
          ],
        }),
      );

      const ok = await getExplanation({
        userId: "user_1",
        challengeId: i,
        question: "Q",
        userAnswer: "UA",
        correctAnswer: "CA",
        challengeType: "translate",
        courseLanguage: "English",
      });
      expect(ok).not.toBeNull();
    }

    const blocked = await getExplanation({
      userId: "user_1",
      challengeId: 999,
      question: "Q",
      userAnswer: "UA",
      correctAnswer: "CA",
      challengeType: "translate",
      courseLanguage: "English",
    });

    expect(blocked).toBeNull();
  });

  it("should return fallback on malformed LLM response", async () => {
    mockAiChat.mockResolvedValueOnce("not-json");

    const { getExplanation, __testing__ } = await import("@/lib/ai/explain");

    const result = await getExplanation({
      userId: "user_1",
      challengeId: 123,
      question: "Q",
      userAnswer: "UA",
      correctAnswer: "CA",
      challengeType: "translate",
      courseLanguage: "English",
    });

    expect(result).not.toBeNull();
    expect(result?.explanation).toBe(__testing__.FALLBACK_EXPLANATION.explanation);
  });
});
