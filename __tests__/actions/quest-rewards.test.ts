import { describe, expect, it, vi, beforeEach } from "vitest";

const whereSpy = vi.fn().mockResolvedValue(undefined);
const setSpy = vi.fn(() => ({ where: whereSpy }));
const updateSpy = vi.fn(() => ({ set: setSpy }));
const insertValuesSpy = vi.fn().mockResolvedValue(undefined);
const insertSpy = vi.fn(() => ({ values: insertValuesSpy }));

const getUserProgressSpy = vi.fn();
const questClaimsFindFirstSpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    update: updateSpy,
    insert: insertSpy,
    query: {
      questClaims: { findFirst: questClaimsFindFirstSpy },
    },
  },
}));

vi.mock("@/db/queries", () => ({
  getUserProgress: getUserProgressSpy,
}));

vi.mock("@/lib/auth-utils", () => ({
  getAuthUserId: vi.fn().mockResolvedValue("user_a"),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeEach(() => {
  whereSpy.mockClear();
  setSpy.mockClear();
  updateSpy.mockClear();
  insertSpy.mockClear();
  insertValuesSpy.mockClear();
  getUserProgressSpy.mockReset();
  questClaimsFindFirstSpy.mockReset();
  // Default: no existing claim
  questClaimsFindFirstSpy.mockResolvedValue(null);
});

describe("claimQuestReward", () => {
  it("should add reward XP when eligible", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 50,
    });

    const { claimQuestReward } = await import("@/actions/quest-rewards");

    const result = await claimQuestReward(50, 10);

    expect(result).toEqual({ success: true, newPoints: 60 });
    expect(setSpy).toHaveBeenCalledWith({ points: 60 });
    // Should also insert into questClaims
    expect(insertSpy).toHaveBeenCalled();
  });

  it("should reject when points < threshold", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 30,
    });

    const { claimQuestReward } = await import("@/actions/quest-rewards");

    const result = await claimQuestReward(50, 10);

    expect(result).toEqual({ error: "not_eligible" });
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("should prevent duplicate quest claims server-side", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 100,
    });
    // Already claimed
    questClaimsFindFirstSpy.mockResolvedValue({
      id: 1,
      userId: "user_a",
      questValue: 50,
    });

    const { claimQuestReward } = await import("@/actions/quest-rewards");

    const result = await claimQuestReward(50, 10);

    expect(result).toEqual({ error: "already_claimed" });
    expect(updateSpy).not.toHaveBeenCalled();
    expect(insertSpy).not.toHaveBeenCalled();
  });
});
