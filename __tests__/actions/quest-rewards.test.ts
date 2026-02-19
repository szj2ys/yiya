import { describe, expect, it, vi, beforeEach } from "vitest";

const whereSpy = vi.fn().mockResolvedValue(undefined);
const setSpy = vi.fn(() => ({ where: whereSpy }));
const updateSpy = vi.fn(() => ({ set: setSpy }));

const getUserProgressSpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    update: updateSpy,
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
  getUserProgressSpy.mockReset();
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
});
