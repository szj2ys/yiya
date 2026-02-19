import { describe, expect, it, vi, beforeEach } from "vitest";

const lessonCompletionsFindManySpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    query: {
      lessonCompletions: {
        findMany: lessonCompletionsFindManySpy,
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

describe("getWeeklyActivity", () => {
  beforeEach(() => {
    lessonCompletionsFindManySpy.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-19T12:00:00.000Z")); // Thursday
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return daily lesson counts for last 7 days", async () => {
    lessonCompletionsFindManySpy.mockResolvedValue([
      { completedAt: new Date("2026-02-16T10:00:00.000Z") },
      { completedAt: new Date("2026-02-16T14:00:00.000Z") },
      { completedAt: new Date("2026-02-18T09:00:00.000Z") },
    ]);

    const { getWeeklyActivity } = await import("@/db/queries");

    const result = await getWeeklyActivity();

    expect(result).toHaveLength(7);

    // Check that each entry has date and count
    for (const day of result) {
      expect(day).toHaveProperty("date");
      expect(day).toHaveProperty("count");
      expect(typeof day.date).toBe("string");
      expect(typeof day.count).toBe("number");
    }

    // Feb 16 should have 2 completions
    const feb16 = result.find((d) => d.date === "2026-02-16");
    expect(feb16?.count).toBe(2);

    // Feb 18 should have 1 completion
    const feb18 = result.find((d) => d.date === "2026-02-18");
    expect(feb18?.count).toBe(1);

    // Other days should have 0
    const feb17 = result.find((d) => d.date === "2026-02-17");
    expect(feb17?.count).toBe(0);
  });

  it("should return 7 days of zeros when no completions", async () => {
    lessonCompletionsFindManySpy.mockResolvedValue([]);

    const { getWeeklyActivity } = await import("@/db/queries");

    const result = await getWeeklyActivity();

    expect(result).toHaveLength(7);
    for (const day of result) {
      expect(day.count).toBe(0);
    }
  });

  it("should return array structure from the query", async () => {
    lessonCompletionsFindManySpy.mockResolvedValue([]);

    const { getWeeklyActivity } = await import("@/db/queries");

    const result = await getWeeklyActivity();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(7);
    // Each item should have date and count
    for (const day of result) {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof day.count).toBe("number");
    }
  });
});
