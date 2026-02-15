import { describe, expect, it, vi, beforeEach } from "vitest";

const authSpy = vi.fn().mockResolvedValue({ userId: "user_a" });

const reviewCardsFindManySpy = vi.fn();
const reviewCardsFindFirstSpy = vi.fn();
const reviewCardsUpdateReturningSpy = vi.fn();
const reviewCardsUpdateWhereSpy = vi.fn(() => ({ returning: reviewCardsUpdateReturningSpy }));
const reviewCardsUpdateSetSpy = vi.fn(() => ({ where: reviewCardsUpdateWhereSpy }));
const reviewCardsUpdateSpy = vi.fn(() => ({ set: reviewCardsUpdateSetSpy }));
const reviewCardsInsertOnConflictSpy = vi.fn().mockResolvedValue(undefined);
const reviewCardsInsertValuesSpy = vi.fn(() => ({ onConflictDoNothing: reviewCardsInsertOnConflictSpy }));
const reviewCardsInsertSpy = vi.fn(() => ({ values: reviewCardsInsertValuesSpy }));
const selectWhereSpy = vi.fn();
const selectFromSpy = vi.fn(() => ({ where: selectWhereSpy }));
const selectSpy = vi.fn(() => ({ from: selectFromSpy }));

vi.mock("@clerk/nextjs", () => ({ auth: () => authSpy() }));

vi.mock("@/db/drizzle", () => ({
  default: {
    query: {
      reviewCards: {
        findMany: reviewCardsFindManySpy,
        findFirst: reviewCardsFindFirstSpy,
      },
    },
    update: reviewCardsUpdateSpy,
    insert: reviewCardsInsertSpy,
    select: selectSpy,
  },
}));

vi.mock("ts-fsrs", () => ({
  fsrs: () => ({
    repeat: () => ({
      3: {
        card: {
          due: new Date("2026-02-13T12:00:00.000Z"),
          stability: 2,
          difficulty: 4,
          elapsed_days: 1,
          scheduled_days: 2,
          reps: 1,
          lapses: 0,
          state: 2,
          last_review: new Date("2026-02-12T12:00:00.000Z"),
        },
      },
      1: {
        card: {
          due: new Date("2026-02-12T12:10:00.000Z"),
          stability: 0,
          difficulty: 6,
          elapsed_days: 0,
          scheduled_days: 0,
          reps: 1,
          lapses: 1,
          state: 3,
          last_review: new Date("2026-02-12T12:00:00.000Z"),
        },
      },
    }),
  }),
  Rating: { Again: 1, Hard: 2, Good: 3, Easy: 4 },
  State: { New: 0, Learning: 1, Review: 2, Relearning: 3 },
}));

beforeEach(() => {
  reviewCardsFindManySpy.mockReset();
  reviewCardsFindFirstSpy.mockReset();
  reviewCardsUpdateSpy.mockClear();
  reviewCardsUpdateSetSpy.mockClear();
  reviewCardsUpdateWhereSpy.mockClear();
  reviewCardsUpdateReturningSpy.mockReset();
  reviewCardsInsertSpy.mockClear();
  reviewCardsInsertValuesSpy.mockClear();
  reviewCardsInsertOnConflictSpy.mockReset();
  selectSpy.mockClear();
  selectFromSpy.mockClear();
  selectWhereSpy.mockReset();
  selectWhereSpy.mockResolvedValue([{ value: 5 }]);
});

describe("review actions", () => {
  it("should return due cards sorted by urgency", async () => {
    reviewCardsFindManySpy.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const { getReviewSession } = await import("@/actions/review");

    const items = await getReviewSession();

    expect(items).toHaveLength(2);
    expect(reviewCardsFindManySpy).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20 }),
    );
  });

  it("should update card params on Good rating", async () => {
    reviewCardsFindFirstSpy.mockResolvedValue({
      id: 9,
      userId: "user_a",
      due: new Date("2026-02-12T12:00:00.000Z"),
      stability: 0,
      difficulty: 5,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: "new",
      lastReview: null,
    });
    reviewCardsUpdateReturningSpy.mockResolvedValue([{ id: 9, stability: 2 }]);

    const { submitReview } = await import("@/actions/review");

    await expect(submitReview(9, 3)).resolves.toMatchObject({ id: 9, stability: 2 });
  });

  it("should set relearning state on Again rating", async () => {
    reviewCardsFindFirstSpy.mockResolvedValue({
      id: 9,
      userId: "user_a",
      due: new Date("2026-02-12T12:00:00.000Z"),
      stability: 0,
      difficulty: 5,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: "review",
      lastReview: null,
    });
    reviewCardsUpdateReturningSpy.mockResolvedValue([{ id: 9, state: "relearning" }]);

    const { submitReview } = await import("@/actions/review");

    await expect(submitReview(9, 1)).resolves.toMatchObject({ state: "relearning" });
  });

  it("should create card with correct initial state", async () => {
    const { createReviewCard } = await import("@/actions/review");

    await createReviewCard("user_a", 1, "wrong");

    const inserted = reviewCardsInsertValuesSpy.mock.calls[0][0];
    expect(inserted).toMatchObject({ userId: "user_a", challengeId: 1, state: "relearning" });
  });

  it("should return due count", async () => {
    const { getReviewDueCount } = await import("@/actions/review");

    await expect(getReviewDueCount()).resolves.toBe(5);
  });
});
