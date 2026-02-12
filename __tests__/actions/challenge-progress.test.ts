import { describe, expect, it, vi, beforeEach } from "vitest";

const now = new Date("2026-02-12T12:00:00.000Z");

const whereSpy = vi.fn().mockResolvedValue(undefined);
const setSpy = vi.fn(() => ({ where: whereSpy }));
const updateSpy = vi.fn(() => ({ set: setSpy }));
const insertValuesSpy = vi.fn().mockResolvedValue(undefined);
const insertSpy = vi.fn(() => ({ values: insertValuesSpy }));

const getUserProgressSpy = vi.fn();
const getUserSubscriptionSpy = vi.fn();

const challengeProgressFindFirstSpy = vi.fn();
const challengesFindFirstSpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    update: updateSpy,
    insert: insertSpy,
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

  // defaults: non-practice run, active subscription irrelevant
  challengeProgressFindFirstSpy.mockResolvedValue(null);
  challengesFindFirstSpy.mockResolvedValue({ id: 1, lessonId: 10 });
  getUserSubscriptionSpy.mockResolvedValue({ isActive: true });
});

describe("upsertChallengeProgress streak", () => {
  it("should increment streak when last lesson was 24-48h ago", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 0,
      streak: 3,
      lastLessonAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
    });

    const { upsertChallengeProgress } = await import("@/actions/challenge-progress");

    await upsertChallengeProgress(1);

    // last update call sets streak to 4
    const setCalls = setSpy.mock.calls.map((c) => c[0]);
    const lastSet = setCalls[setCalls.length - 1];

    expect(lastSet).toMatchObject({ streak: 4 });
    expect(lastSet.lastLessonAt).toBeInstanceOf(Date);
  });

  it("should reset streak when last lesson was more than 48h ago", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 0,
      streak: 9,
      lastLessonAt: new Date(now.getTime() - 49 * 60 * 60 * 1000),
    });

    const { upsertChallengeProgress } = await import("@/actions/challenge-progress");

    await upsertChallengeProgress(1);

    const setCalls = setSpy.mock.calls.map((c) => c[0]);
    const lastSet = setCalls[setCalls.length - 1];

    expect(lastSet).toMatchObject({ streak: 1 });
    expect(lastSet.lastLessonAt).toBeInstanceOf(Date);
  });

  it("should not change streak when last lesson was within 24h", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "user_a",
      hearts: 5,
      points: 0,
      streak: 5,
      lastLessonAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    });

    const { upsertChallengeProgress } = await import("@/actions/challenge-progress");

    await upsertChallengeProgress(1);

    const setCalls = setSpy.mock.calls.map((c) => c[0]);
    const lastSet = setCalls[setCalls.length - 1];

    expect(lastSet).not.toHaveProperty("streak");
    expect(lastSet.lastLessonAt).toBeInstanceOf(Date);
  });
});
