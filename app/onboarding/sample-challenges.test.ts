import { describe, expect, it } from "vitest";

import { getSampleChallenge, sampleChallenges } from "./sample-challenges";

describe("sample-challenges", () => {
  it("should return a challenge for each supported language", () => {
    const courseTitles = [
      "Spanish",
      "Italian",
      "French",
      "Japanese",
      "English",
      "Chinese",
    ];

    for (const title of courseTitles) {
      const challenge = getSampleChallenge(title);
      expect(challenge).toBeDefined();
      expect(challenge?.courseTitle).toBe(title);
      expect(challenge?.options).toHaveLength(4);
    }

    expect(Object.keys(sampleChallenges)).toHaveLength(6);
  });

  it("should have exactly one correct option per challenge", () => {
    for (const challenge of Object.values(sampleChallenges)) {
      const correctCount = challenge.options.filter((o) => o.correct).length;
      expect(correctCount).toBe(1);
    }
  });
});
