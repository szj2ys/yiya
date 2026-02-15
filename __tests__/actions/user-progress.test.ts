import { describe, expect, it, vi, beforeEach } from "vitest";

const now = new Date("2026-02-12T12:00:00.000Z");

const whereSpy = vi.fn().mockResolvedValue(undefined);
const setSpy = vi.fn(() => ({ where: whereSpy }));
const updateSpy = vi.fn(() => ({ set: setSpy }));

const getUserProgressSpy = vi.fn();
const getUserSubscriptionSpy = vi.fn();
const challengesFindFirstSpy = vi.fn();
const challengeProgressFindFirstSpy = vi.fn();

const createReviewCardSpy = vi.fn().mockResolvedValue(undefined);

vi.mock("@/db/drizzle", () => ({
  default: {
    update: updateSpy,
    query: {
      challenges: { findFirst: challengesFindFirstSpy },
      challengeProgress: { findFirst: challengeProgressFindFirstSpy },
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

  getUserProgressSpy.mockReset();
  getUserSubscriptionSpy.mockReset();
  challengesFindFirstSpy.mockReset();
  challengeProgressFindFirstSpy.mockReset();
  createReviewCardSpy.mockReset();

  getUserProgressSpy.mockResolvedValue({ userId: "user_a", hearts: 5, points: 0 });
  getUserSubscriptionSpy.mockResolvedValue({ isActive: false });
  challengesFindFirstSpy.mockResolvedValue({ id: 1, lessonId: 10 });
  challengeProgressFindFirstSpy.mockResolvedValue(null);
});

describe("reduceHearts review card", () => {
  it("should create relearning card on wrong answer", async () => {
    const { reduceHearts } = await import("@/actions/user-progress");

    await reduceHearts(1);

    expect(createReviewCardSpy).toHaveBeenCalledWith("user_a", 1, "wrong");
  });
});

