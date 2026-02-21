import { describe, expect, it, vi, beforeEach } from "vitest";

const lessonsFindFirstSpy = vi.fn();
const unitsFindManySpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    query: {
      lessons: {
        findFirst: (...args: any[]) => lessonsFindFirstSpy(...args),
      },
      units: {
        findMany: (...args: any[]) => unitsFindManySpy(...args),
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

describe("getNextLesson", () => {
  beforeEach(() => {
    lessonsFindFirstSpy.mockReset();
    unitsFindManySpy.mockReset();
  });

  it("should return next lesson in same unit", async () => {
    // Query 1: current lesson with unit
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 1,
      unitId: 10,
      order: 1,
      unit: { id: 10, courseId: 100, order: 1 },
    });

    // Query 2: all units with lessons in course
    unitsFindManySpy.mockResolvedValueOnce([
      {
        id: 10,
        order: 1,
        lessons: [
          { id: 1, title: "Greetings", order: 1, unitId: 10 },
          { id: 2, title: "Colors", order: 2, unitId: 10 },
        ],
      },
    ]);

    const { getNextLesson } = await import("@/db/queries");
    const result = await getNextLesson(1);

    expect(result).toEqual({ id: 2, title: "Colors" });
    expect(lessonsFindFirstSpy).toHaveBeenCalledTimes(1);
    expect(unitsFindManySpy).toHaveBeenCalledTimes(1);
  });

  it("should return first lesson of next unit when current unit done", async () => {
    // Query 1: current lesson (last in unit 10)
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 3,
      unitId: 10,
      order: 3,
      unit: { id: 10, courseId: 100, order: 1 },
    });

    // Query 2: all units with lessons
    unitsFindManySpy.mockResolvedValueOnce([
      {
        id: 10,
        order: 1,
        lessons: [
          { id: 1, title: "Greetings", order: 1, unitId: 10 },
          { id: 2, title: "Colors", order: 2, unitId: 10 },
          { id: 3, title: "Numbers", order: 3, unitId: 10 },
        ],
      },
      {
        id: 11,
        order: 2,
        lessons: [
          { id: 4, title: "Animals", order: 1, unitId: 11 },
        ],
      },
    ]);

    const { getNextLesson } = await import("@/db/queries");
    const result = await getNextLesson(3);

    expect(result).toEqual({ id: 4, title: "Animals" });
  });

  it("should return null when all done", async () => {
    // current lesson is the last in the last unit
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 5,
      unitId: 20,
      order: 2,
      unit: { id: 20, courseId: 100, order: 3 },
    });

    unitsFindManySpy.mockResolvedValueOnce([
      {
        id: 20,
        order: 3,
        lessons: [
          { id: 4, title: "Food", order: 1, unitId: 20 },
          { id: 5, title: "Drinks", order: 2, unitId: 20 },
        ],
      },
    ]);

    const { getNextLesson } = await import("@/db/queries");
    const result = await getNextLesson(5);

    expect(result).toBeNull();
  });

  it("should return id and title for the next lesson", async () => {
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 1,
      unitId: 10,
      order: 1,
      unit: { id: 10, courseId: 100, order: 1 },
    });

    unitsFindManySpy.mockResolvedValueOnce([
      {
        id: 10,
        order: 1,
        lessons: [
          { id: 1, title: "Greetings", order: 1, unitId: 10 },
          { id: 2, title: "Farewells", order: 2, unitId: 10 },
        ],
      },
    ]);

    const { getNextLesson } = await import("@/db/queries");
    const result = await getNextLesson(1);

    expect(result).toEqual({ id: 2, title: "Farewells" });
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("title");
  });

  it("should return null when lesson not found", async () => {
    lessonsFindFirstSpy.mockResolvedValueOnce(undefined);

    const { getNextLesson } = await import("@/db/queries");
    const result = await getNextLesson(999);

    expect(result).toBeNull();
  });

  it("should find next lesson in 1-2 queries", async () => {
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 1,
      unitId: 10,
      order: 1,
      unit: { id: 10, courseId: 100, order: 1 },
    });

    unitsFindManySpy.mockResolvedValueOnce([
      {
        id: 10,
        order: 1,
        lessons: [
          { id: 1, title: "Greetings", order: 1, unitId: 10 },
          { id: 2, title: "Colors", order: 2, unitId: 10 },
        ],
      },
    ]);

    const { getNextLesson } = await import("@/db/queries");
    await getNextLesson(1);

    // Should use exactly 2 queries: findFirst for current lesson, findMany for course units
    expect(lessonsFindFirstSpy).toHaveBeenCalledTimes(1);
    expect(unitsFindManySpy).toHaveBeenCalledTimes(1);
  });
});
