import { describe, expect, it, vi, beforeEach } from "vitest";

const lessonsFindFirstSpy = vi.fn();
const unitsFindFirstSpy = vi.fn();

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
    unitsFindFirstSpy.mockReset();
  });

  it("should return next lesson in same unit", async () => {
    // 1st call: current lesson lookup
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 1,
      unitId: 10,
      order: 1,
    });

    // 2nd call: next lesson in same unit
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 2,
      title: "Colors",
    });

    const { getNextLesson } = await import("@/db/queries");
    const result = await getNextLesson(1);

    expect(result).toEqual({ id: 2, title: "Colors" });
    expect(lessonsFindFirstSpy).toHaveBeenCalledTimes(2);
  });

  it("should return first lesson of next unit when current unit done", async () => {
    // 1st call: current lesson
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 3,
      unitId: 10,
      order: 3,
    });

    // 2nd call: no next lesson in same unit
    lessonsFindFirstSpy.mockResolvedValueOnce(undefined);

    // 3rd call (units): current unit
    unitsFindFirstSpy.mockResolvedValueOnce({
      id: 10,
      courseId: 100,
      order: 1,
    });

    // 4th call (units): next unit
    unitsFindFirstSpy.mockResolvedValueOnce({
      id: 11,
    });

    // 5th call: first lesson of next unit
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 4,
      title: "Animals",
    });

    const { getNextLesson } = await import("@/db/queries");
    const result = await getNextLesson(3);

    expect(result).toEqual({ id: 4, title: "Animals" });
  });

  it("should return null when all done", async () => {
    // current lesson
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 5,
      unitId: 20,
      order: 2,
    });

    // no next lesson in same unit
    lessonsFindFirstSpy.mockResolvedValueOnce(undefined);

    // current unit
    unitsFindFirstSpy.mockResolvedValueOnce({
      id: 20,
      courseId: 100,
      order: 3,
    });

    // no next unit
    unitsFindFirstSpy.mockResolvedValueOnce(undefined);

    const { getNextLesson } = await import("@/db/queries");
    const result = await getNextLesson(5);

    expect(result).toBeNull();
  });

  it("should return id and title for the next lesson", async () => {
    // current lesson
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 1,
      unitId: 10,
      order: 1,
    });

    // next lesson in same unit
    lessonsFindFirstSpy.mockResolvedValueOnce({
      id: 2,
      title: "Greetings",
    });

    const { getNextLesson } = await import("@/db/queries");
    const result = await getNextLesson(1);

    expect(result).toEqual({ id: 2, title: "Greetings" });
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("title");
  });

  it("should return null when lesson not found", async () => {
    lessonsFindFirstSpy.mockResolvedValueOnce(undefined);

    const { getNextLesson } = await import("@/db/queries");
    const result = await getNextLesson(999);

    expect(result).toBeNull();
  });
});
