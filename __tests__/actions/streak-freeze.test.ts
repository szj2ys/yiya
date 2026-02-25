import { describe, expect, it, vi, beforeEach } from "vitest";

const whereSpy = vi.fn().mockResolvedValue(undefined);
const setSpy = vi.fn(() => ({ where: whereSpy }));
const updateSpy = vi.fn(() => ({ set: setSpy }));
const insertValuesSpy = vi.fn().mockResolvedValue(undefined);
const insertSpy = vi.fn(() => ({ values: insertValuesSpy }));

const getUserProgressSpy = vi.fn();
const streakFreezesFindFirstSpy = vi.fn();

// Shared tx mock used inside transactions
const txMock = {
  update: updateSpy,
  insert: insertSpy,
};

const transactionSpy = vi.fn(async (cb: (tx: typeof txMock) => Promise<void>) => {
  await cb(txMock);
});

vi.mock("@/db/drizzle", () => ({
  default: {
    update: updateSpy,
    insert: insertSpy,
    transaction: transactionSpy,
    query: {
      streakFreezes: { findFirst: streakFreezesFindFirstSpy },
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
  transactionSpy.mockClear();
  getUserProgressSpy.mockReset();
  streakFreezesFindFirstSpy.mockReset();

  // Default: no existing freeze
  streakFreezesFindFirstSpy.mockResolvedValue(null);
  // Restore default transaction behavior
  transactionSpy.mockImplementation(async (cb: (tx: typeof txMock) => Promise<void>) => {
    await cb(txMock);
  });
});

describe("buyStreakFreeze", () => {
  it("should deduct points and insert freeze when eligible", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 100,
    });

    const { buyStreakFreeze } = await import("@/actions/streak-freeze");
    await buyStreakFreeze();

    expect(transactionSpy).toHaveBeenCalledOnce();
    expect(setSpy).toHaveBeenCalledWith({ points: 50 }); // 100 - 50
    expect(insertSpy).toHaveBeenCalled();
  });

  it("should throw when not enough points", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 30,
    });

    const { buyStreakFreeze } = await import("@/actions/streak-freeze");

    await expect(buyStreakFreeze()).rejects.toThrow("Not enough points");
    expect(transactionSpy).not.toHaveBeenCalled();
  });

  it("should throw when freeze already exists for today", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 100,
    });
    streakFreezesFindFirstSpy.mockResolvedValue({
      id: 1,
      userId: "user_a",
      usedDate: new Date().toISOString().slice(0, 10),
    });

    const { buyStreakFreeze } = await import("@/actions/streak-freeze");

    await expect(buyStreakFreeze()).rejects.toThrow("Freeze already active for today");
    expect(transactionSpy).not.toHaveBeenCalled();
  });

  it("should rollback points when freeze insert fails", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 100,
    });

    // Make the insert fail inside the transaction
    insertValuesSpy.mockRejectedValueOnce(new Error("DB insert failed"));

    const { buyStreakFreeze } = await import("@/actions/streak-freeze");

    await expect(buyStreakFreeze()).rejects.toThrow("DB insert failed");

    // Transaction was called, but since cb threw, Drizzle would rollback
    expect(transactionSpy).toHaveBeenCalledOnce();
  });
});
