import { describe, expect, it } from "vitest";

import { buildVariantPrompt } from "@/lib/ai/prompts/variants";

describe("buildVariantPrompt", () => {
  it("should return system+user messages", () => {
    const messages = buildVariantPrompt({
      originalQuestion: "What is the capital of France?",
      correctAnswer: "Paris",
      challengeType: "SELECT",
      courseLanguage: "French",
    });

    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe("system");
    expect(messages[1]?.role).toBe("user");
  });

  it("should include original question context", () => {
    const messages = buildVariantPrompt({
      originalQuestion: "Original question text",
      correctAnswer: "Correct answer text",
      challengeType: "TYPE",
      courseLanguage: "Spanish",
    });

    const userContent = messages[1]?.content;
    expect(typeof userContent).toBe("string");
    expect(userContent).toContain("Original question text");
    expect(userContent).toContain("Correct answer text");
  });
});
