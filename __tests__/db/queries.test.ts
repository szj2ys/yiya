import { describe, expect, it, vi, beforeEach } from "vitest";

const userProgressFindFirstSpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    query: {
      userProgress: {
        findFirst: userProgressFindFirstSpy,
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

describe("getUserStreak", () => {
  beforeEach(() => {
    userProgressFindFirstSpy.mockReset();
  });

  it("should return streak data for authenticated user", async () => {
    userProgressFindFirstSpy.mockResolvedValue({
      streak: 7,
      lastLessonAt: new Date("2026-02-10T00:00:00.000Z"),
    });

    const { getUserStreak } = await import("@/db/queries");

    const data = await getUserStreak();

    expect(data).toMatchObject({ streak: 7 });
    expect(data?.lastLessonAt).toBeInstanceOf(Date);
  });
});
