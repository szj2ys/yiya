import { describe, expect, it, vi } from "vitest";

// Regression guard: the original bug was an UPDATE without a WHERE clause.
// This test ensures `upsertUserProgress` uses `.where(...)` when updating.

const whereSpy = vi.fn().mockResolvedValue(undefined);
const setSpy = vi.fn(() => ({ where: whereSpy }));
const updateSpy = vi.fn(() => ({ set: setSpy }));

vi.mock("@/db/drizzle", () => ({
  default: {
    update: updateSpy,
    insert: vi.fn(() => ({ values: vi.fn() })),
    query: { challenges: {}, challengeProgress: {} },
  },
}));

vi.mock("@/db/queries", () => ({
  getCourseById: vi.fn().mockResolvedValue({
    units: [{ lessons: [{}] }],
  }),
  getUserProgress: vi.fn().mockResolvedValue({ userId: "user_a" }),
  getUserSubscription: vi.fn(),
}));

vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "user_a" }),
  currentUser: vi.fn().mockResolvedValue({
    firstName: "A",
    imageUrl: "https://example.com/a.png",
  }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

describe("upsertUserProgress", () => {
  it("should only update current user's progress when switching course", async () => {
    const { upsertUserProgress } = await import("@/actions/user-progress");

    await upsertUserProgress(123);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(whereSpy).toHaveBeenCalledTimes(1);
  });
});
