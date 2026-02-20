import { describe, expect, it, vi, beforeEach } from "vitest";

const selectSpy = vi.fn();

const selectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
};

selectSpy.mockReturnValue(selectChain);

vi.mock("@/db/drizzle", () => ({
  default: {
    select: selectSpy,
    query: {},
  },
}));

vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn().mockResolvedValue({ userId: null }),
}));

vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}));

// Mock unstable_cache to just execute the underlying function directly
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

describe("getGlobalStats", () => {
  beforeEach(() => {
    selectSpy.mockClear();
    selectChain.from.mockClear();
    selectChain.where.mockClear();
    // Reset the chain to return itself
    selectChain.from.mockReturnThis();
    selectChain.where.mockReturnThis();
  });

  it("should return correct global stats", async () => {
    // The function makes 3 db.select() calls:
    // 1. count from lessonCompletions → totalLessonsCompleted
    // 2. countDistinct from userProgress WHERE activeCourseId IS NOT NULL → activeLearnersCount
    // 3. sum(streak) from userProgress → totalStreakDays

    let callIndex = 0;

    selectChain.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) {
        // First call: count of lessonCompletions (no .where needed)
        return Promise.resolve([{ value: 50 }]);
      }
      // Second and third calls go through .where
      return selectChain;
    });

    selectChain.where.mockImplementation(() => {
      if (callIndex === 2) {
        // Second call: countDistinct active learners
        return Promise.resolve([{ value: 12 }]);
      }
      return Promise.resolve([{ value: 0 }]);
    });

    // We need a more precise mock — reset and do clean setup
    callIndex = 0;
    selectChain.from.mockReset();
    selectChain.where.mockReset();

    // Each db.select({...}).from(table) chain:
    // Call 1: select().from(lessonCompletions) → resolves directly (no where)
    // Call 2: select().from(userProgress).where(isNotNull(...)) → resolves
    // Call 3: select().from(userProgress) → resolves directly (no where)

    const results = [
      [{ value: 50 }],   // totalLessonsCompleted
      [{ value: 12 }],   // activeLearnersCount (goes through .where)
      [{ value: "200" }], // totalStreakDays (sum returns string)
    ];

    let fromCallIndex = 0;
    selectChain.from.mockImplementation(() => {
      const idx = fromCallIndex++;
      if (idx === 0) {
        // lessonCompletions count — no .where call
        return Promise.resolve(results[0]);
      }
      if (idx === 1) {
        // userProgress countDistinct — has .where
        selectChain.where.mockReturnValueOnce(Promise.resolve(results[1]));
        return selectChain;
      }
      // userProgress sum(streak) — no .where
      return Promise.resolve(results[2]);
    });

    const { getGlobalStats } = await import("@/db/queries");
    const stats = await getGlobalStats();

    expect(stats).toEqual({
      totalLessonsCompleted: 50,
      activeLearnersCount: 12,
      totalStreakDays: 200,
    });
  });

  it("should return zeros when tables are empty", async () => {
    let fromCallIndex = 0;
    selectChain.from.mockReset();
    selectChain.where.mockReset();

    selectChain.from.mockImplementation(() => {
      const idx = fromCallIndex++;
      if (idx === 0) {
        return Promise.resolve([{ value: 0 }]);
      }
      if (idx === 1) {
        selectChain.where.mockReturnValueOnce(Promise.resolve([{ value: 0 }]));
        return selectChain;
      }
      return Promise.resolve([{ value: null }]);
    });

    const { getGlobalStats } = await import("@/db/queries");
    const stats = await getGlobalStats();

    expect(stats).toEqual({
      totalLessonsCompleted: 0,
      activeLearnersCount: 0,
      totalStreakDays: 0,
    });
  });
});
