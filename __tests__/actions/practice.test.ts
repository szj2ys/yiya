import { describe, expect, it, vi, beforeEach } from "vitest";

const getTodayReviewItemsSpy = vi.fn();

vi.mock("@/db/queries", () => ({
  getTodayReviewItems: getTodayReviewItemsSpy,
}));

vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "user_a" }),
}));

describe("startPractice", () => {
  beforeEach(() => {
    getTodayReviewItemsSpy.mockReset();
  });

  it("should return next practice item when practice starts", async () => {
    getTodayReviewItemsSpy.mockResolvedValue([
      { type: "challenge", challengeId: 99, lessonId: 10 },
      { type: "lesson", lessonId: 12 },
    ]);

    const { startPractice } = await import("@/actions/practice");

    await expect(startPractice()).resolves.toEqual({
      type: "challenge",
      challengeId: 99,
      lessonId: 10,
    });
  });
});
