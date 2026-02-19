import { describe, expect, it } from "vitest";

import { quests } from "@/constants";

describe("quest constants", () => {
  it("should have reward field on each quest", () => {
    for (const quest of quests) {
      expect(quest).toHaveProperty("reward");
      expect(typeof quest.reward).toBe("number");
      expect(quest.reward).toBeGreaterThan(0);
    }
  });

  it("should have rewards proportional to difficulty", () => {
    const rewards = quests.map((q) => q.reward);
    for (let i = 1; i < rewards.length; i++) {
      expect(rewards[i]).toBeGreaterThanOrEqual(rewards[i - 1]);
    }
  });
});
