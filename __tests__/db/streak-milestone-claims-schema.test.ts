import { describe, it, expect } from "vitest";
import { streakMilestoneClaims } from "@/db/schema";

describe("streakMilestoneClaims schema", () => {
  it("should define streakMilestoneClaims with userId and milestoneDays", () => {
    const columns = streakMilestoneClaims as Record<string, any>;

    expect(columns.userId).toBeDefined();
    expect(columns.userId.name).toBe("user_id");
    expect(columns.userId.notNull).toBe(true);

    expect(columns.milestoneDays).toBeDefined();
    expect(columns.milestoneDays.name).toBe("milestone_days");
    expect(columns.milestoneDays.notNull).toBe(true);

    expect(columns.xpRewarded).toBeDefined();
    expect(columns.xpRewarded.name).toBe("xp_rewarded");
    expect(columns.xpRewarded.notNull).toBe(true);

    expect(columns.claimedAt).toBeDefined();
    expect(columns.claimedAt.name).toBe("claimed_at");
  });
});
