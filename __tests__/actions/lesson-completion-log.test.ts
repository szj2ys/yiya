import { describe, expect, it, vi, beforeEach } from "vitest";

const now = new Date("2026-02-19T12:00:00.000Z");

const whereSpy = vi.fn().mockResolvedValue(undefined);
const setSpy = vi.fn(() => ({ where: whereSpy }));
const updateSpy = vi.fn(() => ({ set: setSpy }));
const insertValuesSpy = vi.fn().mockResolvedValue(undefined);
const insertSpy = vi.fn(() => ({ values: insertValuesSpy }));

// Track select query responses in order
let selectQueryIndex = 0;
const selectQueryResults: Array<Array<{ value: number }>> = [];

function createWhereResult() {
  const idx = selectQueryIndex++;
  const result = selectQueryResults[idx] ?? [{ value: 0 }];
  return {
    then: (resolve: (v: any) => void, reject?: (e: any) => void) =>
      Promise.resolve(result).then(resolve, reject),
    innerJoin: () => Promise.resolve(result),
  };
}

const selectWhereSpy = vi.fn(() => createWhereResult());
const selectFromSpy = vi.fn(() => ({ where: selectWhereSpy }));
const selectSpy = vi.fn(() => ({ from: selectFromSpy }));

const getUserProgressSpy = vi.fn();
const getUserSubscriptionSpy = vi.fn();
const createReviewCardSpy = vi.fn().mockResolvedValue(undefined);

const challengeProgressFindFirstSpy = vi.fn();
const challengesFindFirstSpy = vi.fn();

// Shared tx mock used inside transactions — delegates to the same spies
const txMock = {
  update: updateSpy,
  insert: insertSpy,
  select: selectSpy,
  query: {
    challengeProgress: { findFirst: challengeProgressFindFirstSpy },
    challenges: { findFirst: challengesFindFirstSpy },
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
      challengeProgress: { findFirst: challengeProgressFindFirstSpy },
      challenges: { findFirst: challengesFindFirstSpy },
    },
  },
}));

vi.mock("@/db/queries", () => ({
  getUserProgress: getUserProgressSpy,
  getUserSubscription: getUserSubscriptionSpy,
  getStreakFreezeForDate: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/actions/review", () => ({
  createReviewCard: (...args: unknown[]) => createReviewCardSpy(...args),
}));

vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "user_a" }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);

  whereSpy.mockClear();
  setSpy.mockClear();
  updateSpy.mockClear();
  insertSpy.mockClear();
  insertValuesSpy.mockClear();
  transactionSpy.mockClear();
  selectSpy.mockClear();
  selectFromSpy.mockClear();
  selectWhereSpy.mockClear();
  selectQueryIndex = 0;
  selectQueryResults.length = 0;

  getUserProgressSpy.mockReset();
  getUserSubscriptionSpy.mockReset();
  challengeProgressFindFirstSpy.mockReset();
  challengesFindFirstSpy.mockReset();
  createReviewCardSpy.mockReset();

  challengeProgressFindFirstSpy.mockResolvedValue(null);
  challengesFindFirstSpy.mockResolvedValue({ id: 1, lessonId: 10 });
  getUserSubscriptionSpy.mockResolvedValue({ isActive: true });
});

describe("upsertChallengeProgress lesson completion logging", () => {
  it("should log lesson completion when all challenges are done", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 0,
      streak: 0,
      lastLessonAt: null,
    });

    // First select: total challenges = 3, Second select: completed = 3
    selectQueryResults.push([{ value: 3 }], [{ value: 3 }]);

    const { upsertChallengeProgress } = await import("@/actions/challenge-progress");

    await upsertChallengeProgress(1);

    // Should have called insert twice: challengeProgress + lessonCompletions
    expect(insertSpy.mock.calls.length).toBe(2);
  });

  it("should not log lesson completion when not all challenges are done", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 0,
      streak: 0,
      lastLessonAt: null,
    });

    // total = 3, completed = 2 (not all done)
    selectQueryResults.push([{ value: 3 }], [{ value: 2 }]);

    const { upsertChallengeProgress } = await import("@/actions/challenge-progress");

    await upsertChallengeProgress(1);

    // Should have called insert exactly once (for challengeProgress only)
    expect(insertSpy.mock.calls.length).toBe(1);
  });
});
