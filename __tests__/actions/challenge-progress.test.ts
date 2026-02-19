import { describe, expect, it, vi, beforeEach } from "vitest";

const now = new Date("2026-02-12T12:00:00.000Z");

const whereSpy = vi.fn().mockResolvedValue(undefined);
const setSpy = vi.fn(() => ({ where: whereSpy }));
const updateSpy = vi.fn(() => ({ set: setSpy }));
const insertValuesSpy = vi.fn().mockResolvedValue(undefined);
const insertSpy = vi.fn(() => ({ values: insertValuesSpy }));

const getUserProgressSpy = vi.fn();
const getUserSubscriptionSpy = vi.fn();
const createReviewCardSpy = vi.fn().mockResolvedValue(undefined);

const challengeProgressFindFirstSpy = vi.fn();
const challengesFindFirstSpy = vi.fn();

// select().from().where() chain for lesson completion count queries
// Each .where() returns a thenable that also has .innerJoin()
let selectQueryIndex = 0;
const selectQueryResults: Array<Array<{ value: number }>> = [];

function createWhereResult() {
  const idx = selectQueryIndex++;
  const result = selectQueryResults[idx] ?? [{ value: 0 }];
  // Return a thenable that also has innerJoin method
  return {
    then: (resolve: (v: any) => void, reject?: (e: any) => void) =>
      Promise.resolve(result).then(resolve, reject),
    innerJoin: () => Promise.resolve(result),
  };
}

const selectWhereSpy = vi.fn(() => createWhereResult());
const selectFromSpy = vi.fn(() => ({ where: selectWhereSpy }));
const selectSpy = vi.fn(() => ({ from: selectFromSpy }));

vi.mock("@/db/drizzle", () => ({
  default: {
    update: updateSpy,
    insert: insertSpy,
    select: selectSpy,
    query: {
      challengeProgress: { findFirst: challengeProgressFindFirstSpy },
      challenges: { findFirst: challengesFindFirstSpy },
    },
  },
}));

vi.mock("@/db/queries", () => ({
  getUserProgress: getUserProgressSpy,
  getUserSubscription: getUserSubscriptionSpy,
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

  getUserProgressSpy.mockReset();
  getUserSubscriptionSpy.mockReset();
  challengeProgressFindFirstSpy.mockReset();
  challengesFindFirstSpy.mockReset();
  createReviewCardSpy.mockReset();

  selectQueryIndex = 0;
  selectQueryResults.length = 0;
  // Default: 0 total challenges, 0 completed (lesson completion won't trigger)
  selectQueryResults.push([{ value: 0 }], [{ value: 0 }]);

  // defaults: non-practice run, active subscription irrelevant
  challengeProgressFindFirstSpy.mockResolvedValue(null);
  challengesFindFirstSpy.mockResolvedValue({ id: 1, lessonId: 10 });
  getUserSubscriptionSpy.mockResolvedValue({ isActive: true });
});

describe("upsertChallengeProgress review card", () => {
  it("should create review card on challenge completion", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 0,
      streak: 0,
      longestStreak: 0,
      lastLessonAt: null,
    });

    const { upsertChallengeProgress } = await import("@/actions/challenge-progress");

    await upsertChallengeProgress(1);

    expect(createReviewCardSpy).toHaveBeenCalledWith("user_a", 1, "correct");
  });
});

describe("upsertChallengeProgress streak timing", () => {
  it("should only update streak when lesson is fully completed, not per challenge", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 0,
      streak: 3,
      longestStreak: 5,
      lastLessonAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
    });

    // Lesson is NOT complete: 5 total, only 3 completed
    selectQueryResults.length = 0;
    selectQueryResults.push([{ value: 5 }], [{ value: 3 }]);

    const { upsertChallengeProgress } = await import("@/actions/challenge-progress");

    await upsertChallengeProgress(1);

    // Per-challenge: only points should be updated, no streak or lastLessonAt
    const setCalls = setSpy.mock.calls.map((c) => c[0]);
    expect(setCalls.length).toBe(1); // only one update call (points only)
    expect(setCalls[0]).toEqual({ points: 10 });
    expect(setCalls[0]).not.toHaveProperty("streak");
    expect(setCalls[0]).not.toHaveProperty("lastLessonAt");
  });

  it("should update streak and lastLessonAt when lesson is fully completed", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 0,
      streak: 3,
      longestStreak: 5,
      lastLessonAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
    });

    // Lesson IS complete: 5 total, 5 completed
    selectQueryResults.length = 0;
    selectQueryResults.push([{ value: 5 }], [{ value: 5 }]);

    const { upsertChallengeProgress } = await import("@/actions/challenge-progress");

    await upsertChallengeProgress(1);

    // Two update calls: first for points, second for streak + lastLessonAt
    const setCalls = setSpy.mock.calls.map((c) => c[0]);
    expect(setCalls.length).toBe(2);

    // First call: points only
    expect(setCalls[0]).toEqual({ points: 10 });

    // Second call: streak + lastLessonAt
    expect(setCalls[1]).toMatchObject({ streak: 4, longestStreak: 5 });
    expect(setCalls[1].lastLessonAt).toBeInstanceOf(Date);
  });

  it("should increment streak when last lesson was 24-48h ago and lesson completes", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 0,
      streak: 3,
      longestStreak: 3,
      lastLessonAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
    });

    // Lesson IS complete
    selectQueryResults.length = 0;
    selectQueryResults.push([{ value: 5 }], [{ value: 5 }]);

    const { upsertChallengeProgress } = await import("@/actions/challenge-progress");

    await upsertChallengeProgress(1);

    const setCalls = setSpy.mock.calls.map((c) => c[0]);
    const lastSet = setCalls[setCalls.length - 1];

    expect(lastSet).toMatchObject({ streak: 4, longestStreak: 4 });
    expect(lastSet.lastLessonAt).toBeInstanceOf(Date);
  });

  it("should reset streak when last lesson was more than 48h ago and lesson completes", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 0,
      streak: 9,
      longestStreak: 15,
      lastLessonAt: new Date(now.getTime() - 49 * 60 * 60 * 1000),
    });

    // Lesson IS complete
    selectQueryResults.length = 0;
    selectQueryResults.push([{ value: 5 }], [{ value: 5 }]);

    const { upsertChallengeProgress } = await import("@/actions/challenge-progress");

    await upsertChallengeProgress(1);

    const setCalls = setSpy.mock.calls.map((c) => c[0]);
    const lastSet = setCalls[setCalls.length - 1];

    expect(lastSet).toMatchObject({ streak: 1, longestStreak: 15 });
    expect(lastSet.lastLessonAt).toBeInstanceOf(Date);
  });

  it("should not change streak when last lesson was within 24h and lesson completes", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 0,
      streak: 5,
      longestStreak: 10,
      lastLessonAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    });

    // Lesson IS complete
    selectQueryResults.length = 0;
    selectQueryResults.push([{ value: 5 }], [{ value: 5 }]);

    const { upsertChallengeProgress } = await import("@/actions/challenge-progress");

    await upsertChallengeProgress(1);

    const setCalls = setSpy.mock.calls.map((c) => c[0]);
    const lastSet = setCalls[setCalls.length - 1];

    // shouldUpdateStreak is false, so no streak/longestStreak in set
    expect(lastSet).not.toHaveProperty("streak");
    expect(lastSet.lastLessonAt).toBeInstanceOf(Date);
  });
});
