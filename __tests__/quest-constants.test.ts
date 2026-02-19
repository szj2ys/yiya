import { describe, expect, it } from "vitest";

import { quests, getQuestClaimedKey } from "@/constants";

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

  it("should generate correct localStorage keys", () => {
    expect(getQuestClaimedKey(20)).toBe("yiya_claimed_quests_20");
    expect(getQuestClaimedKey(1000)).toBe("yiya_claimed_quests_1000");
  });
});
