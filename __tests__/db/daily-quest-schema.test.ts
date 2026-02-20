import { describe, it, expect } from "vitest";
import { dailyQuestClaims } from "@/db/schema";
import { DAILY_QUESTS } from "@/constants";

describe("dailyQuestClaims schema", () => {
  it("should have userId column that is not null", () => {
    const columns = dailyQuestClaims as Record<string, any>;
    const col = columns.userId;
    expect(col).toBeDefined();
    expect(col.name).toBe("user_id");
    expect(col.notNull).toBe(true);
  });

  it("should have questId column that is not null", () => {
    const columns = dailyQuestClaims as Record<string, any>;
    const col = columns.questId;
    expect(col).toBeDefined();
    expect(col.name).toBe("quest_id");
    expect(col.notNull).toBe(true);
  });

  it("should have claimedDate column that is not null", () => {
    const columns = dailyQuestClaims as Record<string, any>;
    const col = columns.claimedDate;
    expect(col).toBeDefined();
    expect(col.name).toBe("claimed_date");
    expect(col.notNull).toBe(true);
  });

  it("should have claimedAt column with default", () => {
    const columns = dailyQuestClaims as Record<string, any>;
    const col = columns.claimedAt;
    expect(col).toBeDefined();
    expect(col.name).toBe("claimed_at");
    expect(col.hasDefault).toBe(true);
  });
});

describe("DAILY_QUESTS constants", () => {
  it("should have correct DAILY_QUESTS structure", () => {
    expect(DAILY_QUESTS).toHaveLength(3);

    for (const quest of DAILY_QUESTS) {
      expect(quest).toHaveProperty("id");
      expect(quest).toHaveProperty("title");
      expect(quest).toHaveProperty("description");
      expect(quest).toHaveProperty("xpReward");
      expect(typeof quest.id).toBe("string");
      expect(typeof quest.title).toBe("string");
      expect(typeof quest.description).toBe("string");
      expect(typeof quest.xpReward).toBe("number");
      expect(quest.xpReward).toBeGreaterThan(0);
    }
  });

  it("should contain the expected quest ids", () => {
    const ids = DAILY_QUESTS.map((q) => q.id);
    expect(ids).toContain("complete_lesson");
    expect(ids).toContain("hit_daily_goal");
    expect(ids).toContain("practice_review");
  });
});
