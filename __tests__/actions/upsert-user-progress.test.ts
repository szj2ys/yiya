import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules before importing the action
const valuesSpy = vi.fn().mockResolvedValue(undefined);
const insertSpy = vi.fn(() => ({ values: valuesSpy }));

const updateWhereSpy = vi.fn().mockResolvedValue(undefined);
const updateSetSpy = vi.fn(() => ({ where: updateWhereSpy }));
const updateSpy = vi.fn(() => ({ set: updateSetSpy }));

const getUserProgressSpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    insert: (...args: any[]) => insertSpy(...args),
    update: (...args: any[]) => updateSpy(...args),
  },
}));

vi.mock("@/lib/auth-utils", () => ({
  getAuthUserId: vi.fn().mockResolvedValue("test-user-id"),
}));

vi.mock("@clerk/nextjs", () => ({
  currentUser: vi.fn().mockResolvedValue({
    firstName: "Test",
    imageUrl: "/test.png",
  }),
  auth: vi.fn(),
}));

vi.mock("@/db/queries", () => ({
  getCourseById: vi.fn().mockResolvedValue({
    id: 1,
    title: "Spanish",
    imageSrc: "/es.svg",
    units: [{ lessons: [{ id: 1 }] }],
  }),
  getUserProgress: (...args: any[]) => getUserProgressSpy(...args),
  getUserSubscription: vi.fn().mockResolvedValue(null),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock redirect to throw NEXT_REDIRECT so we can test the flow
const redirectError = new Error("NEXT_REDIRECT");
vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation(() => {
    throw redirectError;
  }),
}));

vi.mock("@/actions/review", () => ({
  createReviewCard: vi.fn(),
}));

describe("upsertUserProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUserProgressSpy.mockResolvedValue(null);
    insertSpy.mockReturnValue({ values: valuesSpy });
  });

  it("should save dailyGoal when provided on insert", async () => {
    const { upsertUserProgress } = await import("@/actions/user-progress");

    await expect(upsertUserProgress(1, 3)).rejects.toThrow("NEXT_REDIRECT");

    expect(valuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        dailyGoal: 3,
      }),
    );
  });

  it("should keep default when dailyGoal not provided on insert", async () => {
    const { upsertUserProgress } = await import("@/actions/user-progress");

    await expect(upsertUserProgress(1)).rejects.toThrow("NEXT_REDIRECT");

    // When dailyGoal is not provided, the spread should not add it
    const callArg = valuesSpy.mock.calls[0][0];
    expect(callArg).not.toHaveProperty("dailyGoal");
  });

  it("should update dailyGoal on existing user when provided", async () => {
    getUserProgressSpy.mockResolvedValue({
      userId: "test-user-id",
      userName: "Test",
      userImageSrc: "/test.png",
      activeCourseId: 1,
      hearts: 5,
      points: 0,
      streak: 0,
      dailyGoal: 1,
      lastLessonAt: null,
    });

    const { upsertUserProgress } = await import("@/actions/user-progress");

    await expect(upsertUserProgress(1, 5)).rejects.toThrow("NEXT_REDIRECT");

    expect(updateSetSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        dailyGoal: 5,
      }),
    );
  });
});
