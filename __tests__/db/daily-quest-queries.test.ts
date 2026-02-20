import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}));

const selectWhereSpy = vi.fn().mockResolvedValue([{ value: 0 }]);
const selectFromSpy = vi.fn(() => ({ where: selectWhereSpy }));
const selectSpy = vi.fn(() => ({ from: selectFromSpy }));

const userProgressFindFirstSpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    select: selectSpy,
    query: {
      userProgress: { findFirst: userProgressFindFirstSpy },
    },
  },
}));

vi.mock("@/lib/auth-utils", () => ({
  getAuthUserId: vi.fn().mockResolvedValue("user_a"),
}));

beforeEach(() => {
  vi.resetModules();
  selectWhereSpy.mockReset().mockResolvedValue([{ value: 0 }]);
  selectFromSpy.mockReset().mockReturnValue({ where: selectWhereSpy });
  selectSpy.mockReset().mockReturnValue({ from: selectFromSpy });
  userProgressFindFirstSpy.mockReset();
});

describe("getDailyQuestProgress", () => {
  it("should return correct quest progress for user with activity", async () => {
    // First call: lesson count => 2, Second call: review count => 1
    let callCount = 0;
    selectWhereSpy.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return [{ value: 2 }]; // lesson count
      return [{ value: 1 }]; // review count
    });

    // User has dailyGoal of 3
    userProgressFindFirstSpy.mockResolvedValue({ dailyGoal: 3 });

    const { getDailyQuestProgress } = await import("@/db/queries");
    const result = await getDailyQuestProgress();

    expect(result.complete_lesson).toBe(true);  // 2 >= 1
    expect(result.hit_daily_goal).toBe(false);   // 2 < 3
    expect(result.practice_review).toBe(true);   // 1 >= 1
  });

  it("should return all incomplete for new user", async () => {
    selectWhereSpy.mockResolvedValue([{ value: 0 }]);
    userProgressFindFirstSpy.mockResolvedValue({ dailyGoal: 1 });

    const { getDailyQuestProgress } = await import("@/db/queries");
    const result = await getDailyQuestProgress();

    expect(result.complete_lesson).toBe(false);
    expect(result.hit_daily_goal).toBe(false);
    expect(result.practice_review).toBe(false);
  });

  it("should return all false when user is not authenticated", async () => {
    const { getAuthUserId } = await import("@/lib/auth-utils");
    vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

    const { getDailyQuestProgress } = await import("@/db/queries");
    const result = await getDailyQuestProgress();

    expect(result).toEqual({
      complete_lesson: false,
      hit_daily_goal: false,
      practice_review: false,
    });
  });
});

describe("getClaimedDailyQuests", () => {
  it("should return claimed quest ids for today", async () => {
    selectWhereSpy.mockResolvedValue([
      { questId: "complete_lesson" },
      { questId: "practice_review" },
    ]);

    const { getClaimedDailyQuests } = await import("@/db/queries");
    const result = await getClaimedDailyQuests();

    expect(result).toEqual(["complete_lesson", "practice_review"]);
  });

  it("should return empty array when no quests claimed", async () => {
    selectWhereSpy.mockResolvedValue([]);

    const { getClaimedDailyQuests } = await import("@/db/queries");
    const result = await getClaimedDailyQuests();

    expect(result).toEqual([]);
  });

  it("should return empty array when user is not authenticated", async () => {
    const { getAuthUserId } = await import("@/lib/auth-utils");
    vi.mocked(getAuthUserId).mockResolvedValueOnce(null);

    const { getClaimedDailyQuests } = await import("@/db/queries");
    const result = await getClaimedDailyQuests();

    expect(result).toEqual([]);
  });
});
