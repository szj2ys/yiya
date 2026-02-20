import { describe, expect, it, vi, beforeEach } from "vitest";

const lessonsFindFirstSpy = vi.fn();
const unitsFindFirstSpy = vi.fn();
const selectSpy = vi.fn();
const fromSpy = vi.fn();
const whereSpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    query: {
      lessons: {
        findFirst: (...args: any[]) => lessonsFindFirstSpy(...args),
      },
      units: {
        findFirst: (...args: any[]) => unitsFindFirstSpy(...args),
      },
    },
    select: (...args: any[]) => {
      selectSpy(...args);
      return {
        from: (...fArgs: any[]) => {
          fromSpy(...fArgs);
          return {
            where: (...wArgs: any[]) => whereSpy(...wArgs),
          };
        },
      };
    },
  },
}));

vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "user_a" }),
}));

vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}));

describe("getUnitInfoForLesson", () => {
  beforeEach(() => {
    lessonsFindFirstSpy.mockReset();
    unitsFindFirstSpy.mockReset();
    selectSpy.mockReset();
    fromSpy.mockReset();
    whereSpy.mockReset();
  });

  it("should return isLastLesson true for highest-order lesson in unit", async () => {
    // Lesson lookup
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 5,
      unitId: 10,
      order: 5,
    });

    // Unit lookup
    unitsFindFirstSpy.mockResolvedValueOnce({
      id: 10,
      title: "Unit 1",
      order: 1,
    });

    // Count of lessons in unit
    whereSpy.mockResolvedValueOnce([{ value: 5 }]);

    // Max order in unit
    whereSpy.mockResolvedValueOnce([{ value: 5 }]);

    const { getUnitInfoForLesson } = await import("@/db/queries");
    const result = await getUnitInfoForLesson(5);

    expect(result).toEqual({
      unitTitle: "Unit 1",
      unitOrder: 1,
      isLastLesson: true,
      totalLessonsInUnit: 5,
    });
  });

  it("should return isLastLesson false for a mid-unit lesson", async () => {
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 3,
      unitId: 10,
      order: 3,
    });

    unitsFindFirstSpy.mockResolvedValueOnce({
      id: 10,
      title: "Unit 2",
      order: 2,
    });

    // Count: 5 lessons
    whereSpy.mockResolvedValueOnce([{ value: 5 }]);

    // Max order: 5 (lesson 3 is not the last)
    whereSpy.mockResolvedValueOnce([{ value: 5 }]);

    const { getUnitInfoForLesson } = await import("@/db/queries");
    const result = await getUnitInfoForLesson(3);

    expect(result).toEqual({
      unitTitle: "Unit 2",
      unitOrder: 2,
      isLastLesson: false,
      totalLessonsInUnit: 5,
    });
  });

  it("should return null when lesson is not found", async () => {
    lessonsFindFirstSpy.mockResolvedValueOnce(undefined);

    const { getUnitInfoForLesson } = await import("@/db/queries");
    const result = await getUnitInfoForLesson(999);

    expect(result).toBeNull();
  });

  it("should return null when unit is not found", async () => {
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 1,
      unitId: 99,
      order: 1,
    });

    unitsFindFirstSpy.mockResolvedValueOnce(undefined);

    const { getUnitInfoForLesson } = await import("@/db/queries");
    const result = await getUnitInfoForLesson(1);

    expect(result).toBeNull();
  });

  it("should return isLastLesson true for single-lesson unit", async () => {
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 1,
      unitId: 10,
      order: 1,
    });

    unitsFindFirstSpy.mockResolvedValueOnce({
      id: 10,
      title: "Solo Unit",
      order: 3,
    });

    // Count: 1 lesson
    whereSpy.mockResolvedValueOnce([{ value: 1 }]);

    // Max order: 1
    whereSpy.mockResolvedValueOnce([{ value: 1 }]);

    const { getUnitInfoForLesson } = await import("@/db/queries");
    const result = await getUnitInfoForLesson(1);

    expect(result).toEqual({
      unitTitle: "Solo Unit",
      unitOrder: 3,
      isLastLesson: true,
      totalLessonsInUnit: 1,
    });
  });
});
