import { describe, expect, it, vi, beforeEach } from "vitest";

const userProgressFindManySpy = vi.fn();
const userProgressFindFirstSpy = vi.fn();
const selectSpy = vi.fn();
const fromSpy = vi.fn();
const whereSpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    query: {
      userProgress: {
        findFirst: userProgressFindFirstSpy,
        findMany: userProgressFindManySpy,
      },
    },
    select: selectSpy,
  },
}));

vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "user_a" }),
}));

vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}));

describe("getTopTenWeekly", () => {
  beforeEach(() => {
    vi.resetModules();
    userProgressFindManySpy.mockReset();
    userProgressFindFirstSpy.mockReset();
    selectSpy.mockReset();
    fromSpy.mockReset();
    whereSpy.mockReset();
  });

  it("should return users ordered by weeklyXp descending", async () => {
    const mockData = [
      { userId: "u1", userName: "Alice", userImageSrc: "/a.svg", weeklyXp: 50 },
      { userId: "u2", userName: "Bob", userImageSrc: "/b.svg", weeklyXp: 30 },
      { userId: "u3", userName: "Charlie", userImageSrc: "/c.svg", weeklyXp: 10 },
    ];

    userProgressFindManySpy.mockResolvedValue(mockData);

    const { getTopTenWeekly } = await import("@/db/queries");
    const result = await getTopTenWeekly();

    expect(result).toEqual(mockData);
    expect(result[0].weeklyXp).toBe(50);
    expect(result[1].weeklyXp).toBe(30);
    expect(result[2].weeklyXp).toBe(10);
  });

  it("should return empty array when user is not authenticated", async () => {
    const { auth } = await import("@clerk/nextjs");
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ userId: null });

    const { getTopTenWeekly } = await import("@/db/queries");
    const result = await getTopTenWeekly();

    expect(result).toEqual([]);
  });

  it("should return at most 10 users", async () => {
    const mockData = Array.from({ length: 10 }, (_, i) => ({
      userId: `u${i}`,
      userName: `User ${i}`,
      userImageSrc: "/img.svg",
      weeklyXp: (10 - i) * 10,
    }));

    userProgressFindManySpy.mockResolvedValue(mockData);

    const { getTopTenWeekly } = await import("@/db/queries");
    const result = await getTopTenWeekly();

    expect(result.length).toBe(10);
  });

  it("should treat users with expired weeklyXpResetAt as 0 XP", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-19T12:00:00.000Z")); // Thursday

    try {
      userProgressFindManySpy.mockResolvedValue([]);

      const { getTopTenWeekly } = await import("@/db/queries");
      await getTopTenWeekly();

      expect(userProgressFindManySpy).toHaveBeenCalledTimes(1);

      const [findManyArgs] = userProgressFindManySpy.mock.calls[0];
      const where = findManyArgs?.where as any;

      // Assert the query filters out:
      //   - users with resetAt before weekStart
      //   - users with 0 weekly XP
      const expectedWeekStart = "2026-02-16T00:00:00.000Z";

      const params: unknown[] = [];
      const columns = new Set<string>();
      const stringChunks: string[] = [];

      const collectParams = (node: any) => {
        if (!node) return;
        if (Array.isArray(node)) {
          for (const n of node) collectParams(n);
          return;
        }
        if (typeof node === "object") {
          if (node.constructor?.name === "Param") {
            params.push(node.value);
          }
          if ("queryChunks" in node) {
            collectParams(node.queryChunks);
          }
        }
      };

      const collectColumns = (node: any) => {
        if (!node) return;
        if (Array.isArray(node)) {
          for (const n of node) collectColumns(n);
          return;
        }
        if (typeof node === "object") {
          if ("table" in node && typeof node.name === "string") {
            columns.add(node.name);
          }
          if ("queryChunks" in node) {
            collectColumns(node.queryChunks);
          }
        }
      };

      const collectStringChunks = (node: any) => {
        if (!node) return;
        if (Array.isArray(node)) {
          for (const n of node) collectStringChunks(n);
          return;
        }
        if (typeof node === "object") {
          if (node.constructor?.name === "StringChunk" && Array.isArray(node.value)) {
            stringChunks.push(...node.value);
          }
          if ("queryChunks" in node) {
            collectStringChunks(node.queryChunks);
          }
        }
      };

      collectParams(where);
      collectColumns(where);
      collectStringChunks(where);

      const whereString = stringChunks.join("");

      expect(columns.has("weekly_xp_reset_at")).toBe(true);
      expect(columns.has("weekly_xp")).toBe(true);

      expect(whereString).toContain(">=");
      expect(whereString).toContain("is not null");
      expect(whereString).toContain(">");

      expect(
        params.some((p) => p instanceof Date && p.toISOString() === expectedWeekStart),
      ).toBe(true);
      expect(params).toContain(0);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("getUserWeeklyRank", () => {
  beforeEach(() => {
    vi.resetModules();
    userProgressFindManySpy.mockReset();
    userProgressFindFirstSpy.mockReset();
    selectSpy.mockReset();
    fromSpy.mockReset();
    whereSpy.mockReset();
  });

  it("should return correct weekly rank for user", async () => {
    // User has 30 weeklyXp, 2 users have more
    userProgressFindFirstSpy.mockResolvedValue({ weeklyXp: 30 });

    let selectCallCount = 0;
    selectSpy.mockImplementation(() => {
      selectCallCount++;
      return {
        from: () => ({
          where: vi.fn().mockImplementation(() => {
            if (selectCallCount === 1) {
              return Promise.resolve([{ value: 2 }]);
            }
            return Promise.resolve([{ value: 15 }]);
          }),
        }),
      };
    });

    const { getUserWeeklyRank } = await import("@/db/queries");
    const result = await getUserWeeklyRank();

    expect(result).toEqual({ rank: 3, totalUsers: 15 });
  });

  it("should return rank 1 for user with highest weeklyXp", async () => {
    userProgressFindFirstSpy.mockResolvedValue({ weeklyXp: 100 });

    let selectCallCount = 0;
    selectSpy.mockImplementation(() => {
      selectCallCount++;
      return {
        from: () => ({
          where: vi.fn().mockImplementation(() => {
            if (selectCallCount === 1) {
              return Promise.resolve([{ value: 0 }]);
            }
            return Promise.resolve([{ value: 10 }]);
          }),
        }),
      };
    });

    const { getUserWeeklyRank } = await import("@/db/queries");
    const result = await getUserWeeklyRank();

    expect(result).toEqual({ rank: 1, totalUsers: 10 });
  });

  it("should return null when user has no progress", async () => {
    userProgressFindFirstSpy.mockResolvedValue(null);

    const { getUserWeeklyRank } = await import("@/db/queries");
    const result = await getUserWeeklyRank();

    expect(result).toBeNull();
  });

  it("should return null when user is not authenticated", async () => {
    const { auth } = await import("@clerk/nextjs");
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ userId: null });

    const { getUserWeeklyRank } = await import("@/db/queries");
    const result = await getUserWeeklyRank();

    expect(result).toBeNull();
  });
});
