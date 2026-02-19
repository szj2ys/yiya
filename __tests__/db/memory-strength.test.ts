import { describe, expect, it, vi, beforeEach } from "vitest";

const reviewCardsFindManySpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    query: {
      reviewCards: {
        findMany: reviewCardsFindManySpy,
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

describe("getMemoryStrength", () => {
  beforeEach(() => {
    reviewCardsFindManySpy.mockReset();
  });

  it("should return zeroes when no review cards exist", async () => {
    reviewCardsFindManySpy.mockResolvedValue([]);

    const { getMemoryStrength } = await import("@/db/queries");

    const result = await getMemoryStrength();

    expect(result).toEqual({
      total: 0,
      mastered: 0,
      strong: 0,
      weak: 0,
      newCount: 0,
    });
  });

  it("should categorize cards by stability thresholds", async () => {
    reviewCardsFindManySpy.mockResolvedValue([
      { state: "new", stability: 0 },
      { state: "learning", stability: 0 },
      { state: "relearning", stability: 0 },
      { state: "review", stability: 12 },
      { state: "review", stability: 3 },
      { state: "review", stability: 9 },
      { state: "review", stability: 2.9 },
      { state: "review", stability: 0 },
    ]);

    const { getMemoryStrength } = await import("@/db/queries");

    const result = await getMemoryStrength();

    expect(result.total).toBe(8);
    expect(result.mastered).toBe(1);
    expect(result.strong).toBe(2);
    expect(result.weak).toBe(4);
    expect(result.newCount).toBe(1);
  });
});
