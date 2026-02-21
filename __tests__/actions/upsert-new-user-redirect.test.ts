import { describe, expect, it, vi } from "vitest";

// Integration test: new user onboarding should redirect to first lesson

const valuesSpy = vi.fn().mockResolvedValue(undefined);
const insertSpy = vi.fn(() => ({ values: valuesSpy }));

const redirectSpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
    insert: insertSpy,
    query: { challenges: {}, challengeProgress: {} },
  },
}));

vi.mock("@/db/queries", () => ({
  getCourseById: vi.fn().mockResolvedValue({
    units: [{ lessons: [{ id: 42 }, { id: 43 }] }],
  }),
  getUserProgress: vi.fn().mockResolvedValue(null), // new user — no existing progress
  getUserSubscription: vi.fn(),
}));

vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "new_user_1" }),
  currentUser: vi.fn().mockResolvedValue({
    firstName: "New",
    imageUrl: "https://example.com/new.png",
  }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: redirectSpy }));

describe("upsertUserProgress — new user", () => {
  it("should redirect new user to first lesson after onboarding", async () => {
    const { upsertUserProgress } = await import("@/actions/user-progress");

    await upsertUserProgress(1, 3);

    expect(insertSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith("/lesson/42");
  });

  it("should use the first lesson from the first unit", async () => {
    // The mock returns units[0].lessons[0].id = 42
    // This verifies we pick the correct lesson, not a later one
    const { upsertUserProgress } = await import("@/actions/user-progress");

    await upsertUserProgress(1);

    expect(redirectSpy).toHaveBeenCalledWith("/lesson/42");
  });
});
