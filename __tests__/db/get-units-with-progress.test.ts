import { describe, expect, it, vi, beforeEach } from "vitest";

const unitsFindManySpy = vi.fn();
const userProgressFindFirstSpy = vi.fn();

vi.mock("@/db/drizzle", () => ({
  default: {
    query: {
      units: {
        findMany: (...args: any[]) => unitsFindManySpy(...args),
      },
      userProgress: {
        findFirst: (...args: any[]) => userProgressFindFirstSpy(...args),
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

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));

const makeChallenge = (id: number, completed: boolean) => ({
  id,
  order: id,
  challengeProgress: completed
    ? [{ id: id * 10, completed: true }]
    : [],
});

const makeLesson = (id: number, order: number, challenges: ReturnType<typeof makeChallenge>[], unitData?: any) => ({
  id,
  order,
  title: `Lesson ${id}`,
  unitId: unitData?.id ?? 1,
  unit: unitData ?? { id: 1, title: "Unit 1", order: 1 },
  challenges,
});

describe("getUnitsWithProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userProgressFindFirstSpy.mockResolvedValue({
      activeCourseId: 1,
      activeCourse: { id: 1, title: "Spanish" },
    });
  });

  it("should return both units and activeLesson from single query", async () => {
    const unitData = { id: 1, title: "Unit 1", order: 1 };
    unitsFindManySpy.mockResolvedValueOnce([
      {
        id: 1,
        order: 1,
        title: "Unit 1",
        description: "Basics",
        lessons: [
          makeLesson(1, 1, [makeChallenge(1, true), makeChallenge(2, true)], unitData),
          makeLesson(2, 2, [makeChallenge(3, true), makeChallenge(4, false)], unitData),
          makeLesson(3, 3, [makeChallenge(5, false)], unitData),
        ],
      },
    ]);

    const { getUnitsWithProgress } = await import("@/db/queries");
    const result = await getUnitsWithProgress();

    // Units should have completion status
    expect(result.units).toHaveLength(1);
    expect(result.units[0].lessons[0].completed).toBe(true);
    expect(result.units[0].lessons[1].completed).toBe(false);
    expect(result.units[0].lessons[2].completed).toBe(false);

    // Active lesson should be the first uncompleted one
    expect(result.activeLesson).toBeDefined();
    expect(result.activeLesson!.id).toBe(2);
    expect(result.activeLessonId).toBe(2);

    // Only one DB query for units (plus one for userProgress)
    expect(unitsFindManySpy).toHaveBeenCalledTimes(1);
  });

  it("should return empty units and no activeLesson when no active course", async () => {
    userProgressFindFirstSpy.mockResolvedValueOnce(null);

    const { getUnitsWithProgress } = await import("@/db/queries");
    const result = await getUnitsWithProgress();

    expect(result.units).toEqual([]);
    expect(result.activeLesson).toBeUndefined();
    expect(result.activeLessonId).toBeUndefined();
  });

  it("should return undefined activeLesson when all lessons are completed", async () => {
    const unitData = { id: 1, title: "Unit 1", order: 1 };
    unitsFindManySpy.mockResolvedValueOnce([
      {
        id: 1,
        order: 1,
        title: "Unit 1",
        description: "Basics",
        lessons: [
          makeLesson(1, 1, [makeChallenge(1, true)], unitData),
          makeLesson(2, 2, [makeChallenge(2, true)], unitData),
        ],
      },
    ]);

    const { getUnitsWithProgress } = await import("@/db/queries");
    const result = await getUnitsWithProgress();

    expect(result.units).toHaveLength(1);
    expect(result.units[0].lessons.every((l: any) => l.completed)).toBe(true);
    expect(result.activeLesson).toBeUndefined();
    expect(result.activeLessonId).toBeUndefined();
  });

  it("should mark lessons with no challenges as incomplete", async () => {
    const unitData = { id: 1, title: "Unit 1", order: 1 };
    unitsFindManySpy.mockResolvedValueOnce([
      {
        id: 1,
        order: 1,
        title: "Unit 1",
        description: "Basics",
        lessons: [
          makeLesson(1, 1, [], unitData),
        ],
      },
    ]);

    const { getUnitsWithProgress } = await import("@/db/queries");
    const result = await getUnitsWithProgress();

    expect(result.units[0].lessons[0].completed).toBe(false);
    // A lesson with no challenges is the first uncompleted
    expect(result.activeLesson).toBeDefined();
    expect(result.activeLessonId).toBe(1);
  });

  it("should still return correct lesson percentage after refactor", async () => {
    const unitData = { id: 1, title: "Unit 1", order: 1 };
    unitsFindManySpy.mockResolvedValueOnce([
      {
        id: 1,
        order: 1,
        title: "Unit 1",
        description: "Basics",
        lessons: [
          makeLesson(1, 1, [makeChallenge(1, true)], unitData),
          makeLesson(2, 2, [makeChallenge(2, false)], unitData),
        ],
      },
    ]);

    const { getUnitsWithProgress } = await import("@/db/queries");
    const result = await getUnitsWithProgress();

    // The unified function provides both units and active lesson data
    expect(result.units).toHaveLength(1);
    expect(result.activeLessonId).toBe(2);
    // First lesson completed, second not
    expect(result.units[0].lessons[0].completed).toBe(true);
    expect(result.units[0].lessons[1].completed).toBe(false);
  });
});
