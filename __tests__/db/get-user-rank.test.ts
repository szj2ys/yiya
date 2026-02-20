import { describe, expect, it, vi, beforeEach } from "vitest";

const userProgressFindFirstSpy = vi.fn();
const selectSpy = vi.fn();
const fromSpy = vi.fn();
const whereSpy = vi.fn();
const findManySpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    query: {
      userProgress: {
        findFirst: userProgressFindFirstSpy,
        findMany: findManySpy,
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

// Chain mock: db.select().from().where()
function setupSelectChain(returnValue: unknown) {
  whereSpy.mockResolvedValue(returnValue);
  fromSpy.mockReturnValue({ where: whereSpy });
  selectSpy.mockReturnValue({ from: fromSpy });
}

describe("getUserRank", () => {
  beforeEach(() => {
    vi.resetModules();
    userProgressFindFirstSpy.mockReset();
    selectSpy.mockReset();
    fromSpy.mockReset();
    whereSpy.mockReset();
    findManySpy.mockReset();
  });

  it("should return correct rank for user", async () => {
    // User has 100 points, 5 users have more
    userProgressFindFirstSpy.mockResolvedValue({ points: 100 });

    // We need to handle two chained select calls:
    // 1st: count users with more points -> 5
    // 2nd: count total users with active course -> 20
    let selectCallCount = 0;
    selectSpy.mockImplementation(() => {
      selectCallCount++;
      return {
        from: () => ({
          where: vi.fn().mockImplementation(() => {
            if (selectCallCount === 1) {
              return Promise.resolve([{ value: 5 }]);
            }
            return Promise.resolve([{ value: 20 }]);
          }),
        }),
      };
    });

    // findMany for counting total users is not used anymore since we use select count
    findManySpy.mockResolvedValue([]);

    const { getUserRank } = await import("@/db/queries");
    const result = await getUserRank();

    expect(result).toEqual({ rank: 6, totalUsers: 20 });
  });

  it("should return rank 1 for top user", async () => {
    // Top user: no one has more points
    userProgressFindFirstSpy.mockResolvedValue({ points: 500 });

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

    findManySpy.mockResolvedValue([]);

    const { getUserRank } = await import("@/db/queries");
    const result = await getUserRank();

    expect(result).toEqual({ rank: 1, totalUsers: 10 });
  });

  it("should return null when user has no progress", async () => {
    userProgressFindFirstSpy.mockResolvedValue(null);

    const { getUserRank } = await import("@/db/queries");
    const result = await getUserRank();

    expect(result).toBeNull();
  });

  it("should return null when user is not authenticated", async () => {
    const { auth } = await import("@clerk/nextjs");
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ userId: null });

    const { getUserRank } = await import("@/db/queries");
    const result = await getUserRank();

    expect(result).toBeNull();
  });
});
