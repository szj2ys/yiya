import { describe, expect, it, vi, beforeEach } from "vitest";

const challengeProgressFindManySpy = vi.fn();
const challengesFindManySpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    query: {
      challengeProgress: {
        findMany: challengeProgressFindManySpy,
      },
      challenges: {
        findMany: challengesFindManySpy,
      },
    },
  },
}));

vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "user_a" }),
}));

vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}));

describe("getTodayReviewItems", () => {
  beforeEach(() => {
    challengeProgressFindManySpy.mockReset();
    challengesFindManySpy.mockReset();
  });

  it("should return review items when user has previous progress", async () => {
    // first call: wrong challenges
    challengeProgressFindManySpy
      .mockResolvedValueOnce([{ challengeId: 1 }, { challengeId: 2 }])
      // second call: completed challenges
      .mockResolvedValueOnce([{ challengeId: 3 }, { challengeId: 4 }, { challengeId: 2 }]);

    // first call: fetch challenges for wrong ids
    challengesFindManySpy
      .mockResolvedValueOnce([
        { id: 1, lessonId: 10 },
        { id: 2, lessonId: 11 },
      ])
      // second call: fetch challenges for completed ids
      .mockResolvedValueOnce([
        { id: 3, lessonId: 12 },
        { id: 4, lessonId: 11 },
        { id: 2, lessonId: 11 },
      ]);

    const { getTodayReviewItems } = await import("@/db/queries");

    const items = await getTodayReviewItems();

    expect(items).toEqual([
      { type: "challenge", challengeId: 1, lessonId: 10 },
      { type: "challenge", challengeId: 2, lessonId: 11 },
      { type: "lesson", lessonId: 12 },
    ]);
  });
});
