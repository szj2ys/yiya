import { describe, expect, it, vi, beforeEach } from "vitest";

const reviewCardsFindManySpy = vi.fn();
const challengesFindManySpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    query: {
      reviewCards: {
        findMany: reviewCardsFindManySpy,
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
    reviewCardsFindManySpy.mockReset();
    challengesFindManySpy.mockReset();
  });

  it("should return empty array when no FSRS cards are due", async () => {
    reviewCardsFindManySpy.mockResolvedValue([]);
    challengesFindManySpy.mockResolvedValue([]);

    const { getTodayReviewItems } = await import("@/db/queries");
    const items = await getTodayReviewItems();

    expect(items).toEqual([]);
  }, 10_000);

  it("should handle FSRS due cards correctly", async () => {
    reviewCardsFindManySpy.mockResolvedValue([
      { id: 100, challengeId: 1 },
      { id: 101, challengeId: 2 },
    ]);

    challengesFindManySpy.mockResolvedValue([
      { id: 1, lessonId: 10 },
      { id: 2, lessonId: 11 },
    ]);

    const { getTodayReviewItems } = await import("@/db/queries");
    const items = await getTodayReviewItems();

    expect(items).toEqual([
      { type: "challenge", challengeId: 1, lessonId: 10, reviewCardId: 100 },
      { type: "challenge", challengeId: 2, lessonId: 11, reviewCardId: 101 },
    ]);
  });

  it("should skip challenges without a matching lesson", async () => {
    reviewCardsFindManySpy.mockResolvedValue([
      { id: 100, challengeId: 1 },
      { id: 101, challengeId: 2 },
    ]);

    // Only challenge 1 has a matching lesson; challenge 2 is orphaned
    challengesFindManySpy.mockResolvedValue([
      { id: 1, lessonId: 10 },
    ]);

    const { getTodayReviewItems } = await import("@/db/queries");
    const items = await getTodayReviewItems();

    expect(items).toEqual([
      { type: "challenge", challengeId: 1, lessonId: 10, reviewCardId: 100 },
    ]);
  });
});
