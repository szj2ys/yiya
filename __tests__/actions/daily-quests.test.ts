import { describe, expect, it, vi, beforeEach } from "vitest";

const whereSpy = vi.fn().mockResolvedValue(undefined);
const setSpy = vi.fn(() => ({ where: whereSpy }));
const updateSpy = vi.fn(() => ({ set: setSpy }));
const insertValuesSpy = vi.fn().mockResolvedValue(undefined);
const insertSpy = vi.fn(() => ({ values: insertValuesSpy }));
const selectWhereSpy = vi.fn().mockResolvedValue([]);
const selectFromSpy = vi.fn(() => ({ where: selectWhereSpy }));
const selectSpy = vi.fn(() => ({ from: selectFromSpy }));

const getDailyQuestProgressSpy = vi.fn();
const dailyQuestClaimsFindFirstSpy = vi.fn();
const userProgressFindFirstSpy = vi.fn();

// Shared tx mock used inside transactions
const txMock = {
  update: updateSpy,
  insert: insertSpy,
  query: {
    userProgress: { findFirst: userProgressFindFirstSpy },
  },
};

const transactionSpy = vi.fn(async (cb: (tx: typeof txMock) => Promise<void>) => {
  await cb(txMock);
});

vi.mock("@/db/drizzle", () => ({
  default: {
    update: updateSpy,
    insert: insertSpy,
    select: selectSpy,
    transaction: transactionSpy,
    query: {
      dailyQuestClaims: { findFirst: dailyQuestClaimsFindFirstSpy },
      userProgress: { findFirst: userProgressFindFirstSpy },
    },
  },
}));

vi.mock("@/db/queries", () => ({
  getDailyQuestProgress: getDailyQuestProgressSpy,
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
  transactionSpy.mockClear();
  getDailyQuestProgressSpy.mockReset();
  dailyQuestClaimsFindFirstSpy.mockReset();
  userProgressFindFirstSpy.mockReset();

  // Default: no existing claim
  dailyQuestClaimsFindFirstSpy.mockResolvedValue(null);
  // Default: user has 50 points
  userProgressFindFirstSpy.mockResolvedValue({ points: 50 });
  // Restore default transaction behavior
  transactionSpy.mockImplementation(async (cb: (tx: typeof txMock) => Promise<void>) => {
    await cb(txMock);
  });
});

describe("claimDailyQuest", () => {
  it("should award XP when claiming completed quest", async () => {
    getDailyQuestProgressSpy.mockResolvedValue({
      complete_lesson: true,
      hit_daily_goal: false,
      practice_review: false,
    });

    const { claimDailyQuest } = await import("@/actions/daily-quests");
    const result = await claimDailyQuest("complete_lesson");

    expect(result).toEqual({ success: true });
    expect(transactionSpy).toHaveBeenCalledOnce();
    expect(insertSpy).toHaveBeenCalled();
    expect(setSpy).toHaveBeenCalledWith({ points: 55 }); // 50 + 5 xpReward
  });

  it("should reject duplicate claim", async () => {
    getDailyQuestProgressSpy.mockResolvedValue({
      complete_lesson: true,
      hit_daily_goal: false,
      practice_review: false,
    });

    // Already claimed
    dailyQuestClaimsFindFirstSpy.mockResolvedValue({
      id: 1,
      userId: "user_a",
      questId: "complete_lesson",
      claimedDate: new Date().toISOString().slice(0, 10),
    });

    const { claimDailyQuest } = await import("@/actions/daily-quests");
    const result = await claimDailyQuest("complete_lesson");

    expect(result).toEqual({ error: "already_claimed" });
    expect(transactionSpy).not.toHaveBeenCalled();
  });

  it("should reject claim for incomplete quest", async () => {
    getDailyQuestProgressSpy.mockResolvedValue({
      complete_lesson: false,
      hit_daily_goal: false,
      practice_review: false,
    });

    const { claimDailyQuest } = await import("@/actions/daily-quests");
    const result = await claimDailyQuest("complete_lesson");

    expect(result).toEqual({ error: "not_completed" });
    expect(transactionSpy).not.toHaveBeenCalled();
  });

  it("should reject invalid quest id", async () => {
    const { claimDailyQuest } = await import("@/actions/daily-quests");
    const result = await claimDailyQuest("nonexistent_quest");

    expect(result).toEqual({ error: "invalid" });
    expect(transactionSpy).not.toHaveBeenCalled();
  });

  it("should award correct XP for practice_review quest", async () => {
    getDailyQuestProgressSpy.mockResolvedValue({
      complete_lesson: false,
      hit_daily_goal: false,
      practice_review: true,
    });

    const { claimDailyQuest } = await import("@/actions/daily-quests");
    const result = await claimDailyQuest("practice_review");

    expect(result).toEqual({ success: true });
    expect(setSpy).toHaveBeenCalledWith({ points: 60 }); // 50 + 10 xpReward
  });

  it("should rollback claim when points update fails", async () => {
    getDailyQuestProgressSpy.mockResolvedValue({
      complete_lesson: true,
      hit_daily_goal: false,
      practice_review: false,
    });

    // Make the update (points) fail inside the transaction
    // insert succeeds, then findFirst succeeds, then update.set.where rejects
    whereSpy.mockRejectedValueOnce(new Error("DB update failed"));

    const { claimDailyQuest } = await import("@/actions/daily-quests");

    await expect(claimDailyQuest("complete_lesson")).rejects.toThrow("DB update failed");

    // Transaction was called, but since cb threw, Drizzle would rollback
    expect(transactionSpy).toHaveBeenCalledOnce();
  });
});
