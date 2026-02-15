import { describe, expect, it } from "vitest";

import { buildExplainPrompt } from "@/lib/ai/prompts/explain";

describe("buildExplainPrompt", () => {
  it("should build correct system prompt with language context", () => {
    const messages = buildExplainPrompt({
      question: "Choose the correct sentence",
      userAnswer: "I has a book.",
      correctAnswer: "I have a book.",
      challengeType: "translate",
      courseLanguage: "English",
    });

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(String(messages[0].content)).toContain("Write a concise explanation in English");
    expect(String(messages[0].content)).toContain("Return ONLY valid JSON");
  });

  it("should include user answer and correct answer in user prompt", () => {
    const messages = buildExplainPrompt({
      question: "Translate",
      userAnswer: "yo soy",
      correctAnswer: "I am",
      challengeType: "translate",
      courseLanguage: "English",
    });

    expect(messages[1].role).toBe("user");
    expect(String(messages[1].content)).toContain("Student answer:\nyo soy");
    expect(String(messages[1].content)).toContain("Correct answer:\nI am");
  });
});
