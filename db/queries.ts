import { cache } from "react";
import { and, count, countDistinct, eq, gte, gt, inArray, isNotNull, lte, max, sum } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import db from "@/db/drizzle";
import { getAuthUserId } from "@/lib/auth-utils";
import { getStartOfWeek } from "@/lib/weekly-xp";
import {
  challengeProgress,
  courses,
  challenges,
  dailyQuestClaims,
  lessonCompletions,
  lessons,
  questClaims,
  reviewCards,
  streakFreezes,
  units,
  userProgress,
  userSubscription
} from "@/db/schema";

type ReviewItem =
  | {
      type: "challenge";
      challengeId: number;
      lessonId: number;
      reviewCardId?: number;
    }
  | {
      type: "lesson";
      lessonId: number;
    };

const MAX_REVIEW_ITEMS = 10;

export const getUserProgress = cache(async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    return null;
  }

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
    },
  });

	return data;
});

export const getUserStreak = cache(async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    return null;
  }

  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    columns: {
      streak: true,
      lastLessonAt: true,
    },
  });

  return data;
});

export const getTodayLessonCount = cache(async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    return 0;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [result] = await db
    .select({ value: count() })
    .from(lessonCompletions)
    .where(
      and(
        eq(lessonCompletions.userId, userId),
        gte(lessonCompletions.completedAt, startOfToday),
      ),
    );

  return result?.value ?? 0;
});

export const getClaimedQuests = cache(async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    return [] as number[];
  }

  const rows = await db
    .select({ questValue: questClaims.questValue })
    .from(questClaims)
    .where(eq(questClaims.userId, userId));

  return rows.map((r: typeof rows[number]) => r.questValue);
});

/**
 * Fetch the full challenge graph once and derive:
 *   - `units`: unit list with per-lesson completion status
 *   - `activeLesson` / `activeLessonId`: first uncompleted lesson
 */
export const getUnitsWithProgress = cache(async () => {
  const userId = await getAuthUserId();
  const userProgressData = await getUserProgress();

  if (!userId || !userProgressData?.activeCourseId) {
    return { units: [], activeLesson: undefined, activeLessonId: undefined };
  }

  // Single query: units -> lessons (with unit relation) -> challenges -> challengeProgress
  const data = await db.query.units.findMany({
    orderBy: (units: any, { asc }: any) => [asc(units.order)],
    where: eq(units.courseId, userProgressData.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons: any, { asc }: any) => [asc(lessons.order)],
        with: {
          unit: true,
          challenges: {
            orderBy: (challenges: any, { asc }: any) => [asc(challenges.order)],
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  // Derive units with completion status
  let firstUncompletedLesson: (typeof data)[number]["lessons"][number] | undefined;

  const normalizedUnits = data.map((unit: typeof data[number]) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson: typeof unit.lessons[number]) => {
      if (lesson.challenges.length === 0) {
        if (!firstUncompletedLesson) {
          firstUncompletedLesson = lesson;
        }
        return { ...lesson, completed: false };
      }

      const allCompleted = lesson.challenges.every((challenge: typeof lesson.challenges[number]) => {
        return challenge.challengeProgress
          && challenge.challengeProgress.length > 0
          && challenge.challengeProgress.every((progress: typeof challenge.challengeProgress[number]) => progress.completed);
      });

      // Track first uncompleted lesson
      if (!allCompleted && !firstUncompletedLesson) {
        firstUncompletedLesson = lesson;
      }

      return { ...lesson, completed: allCompleted };
    });

    return { ...unit, lessons: lessonsWithCompletedStatus };
  });

  return {
    units: normalizedUnits,
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

export const getCourses = cache(async () => {
  const data = await db.query.courses.findMany();

  return data;
});

export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      units: {
        orderBy: (units: any, { asc }: any) => [asc(units.order)],
        with: {
          lessons: {
            orderBy: (lessons: any, { asc }: any) => [asc(lessons.order)],
          },
        },
      },
    },
  });

  return data;
});

export const getLesson = cache(async (id?: number) => {
  const userId = await getAuthUserId();

  if (!userId) {
    return null;
  }

  const { activeLessonId } = await getUnitsWithProgress();

  const lessonId = id || activeLessonId;

  if (!lessonId) {
    return null;
  }

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges: any, { asc }: any) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
        },
      },
    },
  });

  if (!data || !data.challenges) {
    return null;
  }

  const normalizedChallenges = data.challenges.map((challenge: typeof data.challenges[number]) => {
    const completed = challenge.challengeProgress
      && challenge.challengeProgress.length > 0
      && challenge.challengeProgress.every((progress: typeof challenge.challengeProgress[number]) => progress.completed)

    return { ...challenge, completed };
  });

  return { ...data, challenges: normalizedChallenges }
});

export const getLessonPercentage = cache(async () => {
  const { activeLessonId } = await getUnitsWithProgress();

  if (!activeLessonId) {
    return 0;
  }

  const lesson = await getLesson(activeLessonId);

  if (!lesson) {
    return 0;
  }

  const completedChallenges = lesson.challenges
    .filter((challenge: typeof lesson.challenges[number]) => challenge.completed);
  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100,
  );

  return percentage;
});

export const getTodayReviewItems = cache(async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    return [] as ReviewItem[];
  }

  // FSRS-driven due cards (Phase 2)
  const now = new Date();
  const dueCards = await db.query.reviewCards.findMany({
    where: and(eq(reviewCards.userId, userId), lte(reviewCards.due, now)),
    orderBy: (reviewCards: any, { asc }: any) => [asc(reviewCards.due)],
    limit: MAX_REVIEW_ITEMS,
    columns: {
      id: true,
      challengeId: true,
    },
  });

  if (dueCards.length === 0) {
    return [] as ReviewItem[];
  }

  const dueChallengeIds = dueCards.map((c: typeof dueCards[number]) => c.challengeId);
  const challengeIdToReviewCardId = new Map(
    dueCards.map((c: typeof dueCards[number]) => [c.challengeId, c.id] as const),
  );
  const dueChallenges = await db.query.challenges.findMany({
    where: inArray(challenges.id, dueChallengeIds),
    columns: { id: true, lessonId: true },
  });

  const challengeIdToLessonId = new Map(
    dueChallenges.map((c: typeof dueChallenges[number]) => [c.id, c.lessonId] as const),
  );

  return dueChallengeIds.flatMap((challengeId: number) => {
    const lessonId = challengeIdToLessonId.get(challengeId);
    if (!lessonId) return [];
    return [
      {
        type: "challenge" as const,
        challengeId,
        lessonId,
        reviewCardId: challengeIdToReviewCardId.get(challengeId),
      },
    ];
  });
});

const DAY_IN_MS = 86_400_000;
export const getUserSubscription = cache(async () => {
  const userId = await getAuthUserId();

  if (!userId) return null;

  const data = await db.query.userSubscription.findFirst({
    where: eq(userSubscription.userId, userId),
  });

  if (!data) return null;

  const isActive =
    data.stripePriceId &&
    data.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return {
    ...data,
    isActive: !!isActive,
  };
});

export const getCourseStats = cache(async () => {
  const userId = await getAuthUserId();
  const userProgressData = await getUserProgress();

  if (!userId || !userProgressData?.activeCourseId) {
    return null;
  }

  const unitsInCourse = await db.query.units.findMany({
    where: eq(units.courseId, userProgressData.activeCourseId),
    with: {
      lessons: {
        with: {
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  const allLessons = unitsInCourse.flatMap((unit: typeof unitsInCourse[number]) => unit.lessons);
  const allChallenges = allLessons.flatMap((lesson: typeof allLessons[number]) => lesson.challenges);

  const totalLessons = allLessons.length;
  const totalChallenges = allChallenges.length;

  const completedLessons = allLessons.filter((lesson: typeof allLessons[number]) => {
    if (lesson.challenges.length === 0) return false;
    return lesson.challenges.every(
      (challenge: typeof lesson.challenges[number]) =>
        challenge.challengeProgress &&
        challenge.challengeProgress.length > 0 &&
        challenge.challengeProgress.every((p: typeof challenge.challengeProgress[number]) => p.completed),
    );
  }).length;

  const completedChallenges = allChallenges.filter(
    (challenge: typeof allChallenges[number]) =>
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((p: typeof challenge.challengeProgress[number]) => p.completed),
  ).length;

  // Approximate words learned: count unique completed challenges
  const wordsLearned = completedChallenges;

  return {
    totalLessons,
    completedLessons,
    totalChallenges,
    completedChallenges,
    wordsLearned,
  };
});

export const getTopTenWeekly = cache(async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    return [];
  }

  const weekStart = getStartOfWeek();

  const data = await db.query.userProgress.findMany({
    where: and(
      isNotNull(userProgress.weeklyXpResetAt),
      gte(userProgress.weeklyXpResetAt, weekStart),
      gt(userProgress.weeklyXp, 0),
    ),
    orderBy: (userProgress: any, { desc }: any) => [desc(userProgress.weeklyXp)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImageSrc: true,
      weeklyXp: true,
    },
  });

  return data;
});

/**
 * Find the next lesson after the given lesson ID.
 *
 * Optimized: uses 2 queries instead of 5.
 * 1. Fetch current lesson with its unit (gives us unitId, order, courseId, unit order).
 * 2. Fetch ALL lessons in the course (ordered by unit order, then lesson order),
 *    and return the first one that comes after the current lesson.
 */
export const getNextLesson = cache(async (currentLessonId: number) => {
  // Query 1: Get current lesson with its unit info
  const currentLesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, currentLessonId),
    columns: { id: true, unitId: true, order: true },
    with: {
      unit: {
        columns: { id: true, courseId: true, order: true },
      },
    },
  });

  if (!currentLesson) {
    return null;
  }

  // Query 2: Get all units with their lessons for this course, ordered correctly
  const courseUnits = await db.query.units.findMany({
    where: eq(units.courseId, currentLesson.unit.courseId),
    orderBy: (units: any, { asc }: any) => [asc(units.order)],
    columns: { id: true, order: true },
    with: {
      lessons: {
        orderBy: (lessons: any, { asc }: any) => [asc(lessons.order)],
        columns: { id: true, title: true, order: true, unitId: true },
      },
    },
  });

  // Flatten all lessons in course order and find the one after current
  const allLessons = courseUnits.flatMap((u: typeof courseUnits[number]) => u.lessons);
  const currentIndex = allLessons.findIndex((l: typeof allLessons[number]) => l.id === currentLessonId);

  if (currentIndex === -1 || currentIndex === allLessons.length - 1) {
    return null;
  }

  const next = allLessons[currentIndex + 1];
  return { id: next.id, title: next.title };
});

export type WeeklyActivityDay = {
  date: string; // YYYY-MM-DD
  count: number;
};

export const getWeeklyActivity = cache(async (): Promise<WeeklyActivityDay[]> => {
  const userId = await getAuthUserId();

  if (!userId) {
    return [];
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const completions = await db.query.lessonCompletions.findMany({
    where: and(
      eq(lessonCompletions.userId, userId),
      gte(lessonCompletions.completedAt, sevenDaysAgo),
    ),
    columns: {
      completedAt: true,
    },
  });

  // Build a map of date -> count
  const countsByDate = new Map<string, number>();
  for (const row of completions) {
    const dateStr = row.completedAt.toISOString().slice(0, 10);
    countsByDate.set(dateStr, (countsByDate.get(dateStr) ?? 0) + 1);
  }

  // Generate all 7 days
  const result: WeeklyActivityDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    result.push({
      date: dateStr,
      count: countsByDate.get(dateStr) ?? 0,
    });
  }

  return result;
});

export type LearningStatsData = {
  currentStreak: number;
  longestStreak: number;
  totalWordsLearned: number;
  totalLessonsCompleted: number;
  averageAccuracy: number;
};

export const getLearningStats = cache(async (): Promise<LearningStatsData | null> => {
  const userId = await getAuthUserId();

  if (!userId) {
    return null;
  }

  // Get current streak and longest streak
  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    columns: { streak: true, longestStreak: true },
  });

  const currentStreak = progress?.streak ?? 0;
  const longestStreak = progress?.longestStreak ?? 0;

  // Total distinct challenges completed (words learned)
  const [wordsResult] = await db
    .select({ value: countDistinct(challengeProgress.challengeId) })
    .from(challengeProgress)
    .where(
      and(
        eq(challengeProgress.userId, userId),
        eq(challengeProgress.completed, true),
      ),
    );

  const totalWordsLearned = wordsResult?.value ?? 0;

  // Total lesson completions
  const [lessonsResult] = await db
    .select({ value: count() })
    .from(lessonCompletions)
    .where(eq(lessonCompletions.userId, userId));

  const totalLessonsCompleted = lessonsResult?.value ?? 0;

  // Average accuracy: completed / (completed + wrong attempts)
  const [completedCount] = await db
    .select({ value: count() })
    .from(challengeProgress)
    .where(
      and(
        eq(challengeProgress.userId, userId),
        eq(challengeProgress.completed, true),
      ),
    );

  const [wrongCount] = await db
    .select({ value: count() })
    .from(challengeProgress)
    .where(
      and(
        eq(challengeProgress.userId, userId),
        eq(challengeProgress.completed, false),
      ),
    );

  const totalAttempts = (completedCount?.value ?? 0) + (wrongCount?.value ?? 0);
  const averageAccuracy =
    totalAttempts > 0
      ? Math.round(((completedCount?.value ?? 0) / totalAttempts) * 100)
      : 0;

  return {
    currentStreak,
    longestStreak,
    totalWordsLearned,
    totalLessonsCompleted,
    averageAccuracy,
  };
});

export type MemoryStrengthData = {
  total: number;
  mastered: number;
  strong: number;
  weak: number;
  newCount: number;
};

export const getMemoryStrength = cache(async (): Promise<MemoryStrengthData> => {
  const userId = await getAuthUserId();

  if (!userId) {
    return { total: 0, mastered: 0, strong: 0, weak: 0, newCount: 0 };
  }

  const cards = await db.query.reviewCards.findMany({
    where: eq(reviewCards.userId, userId),
    columns: {
      state: true,
      stability: true,
    },
  });

  let mastered = 0;
  let strong = 0;
  let weak = 0;
  let newCount = 0;

  for (const card of cards) {
    if (card.state === "new") {
      newCount++;
    } else if (card.state === "learning" || card.state === "relearning") {
      weak++;
    } else if (card.state === "review") {
      if (card.stability >= 10) {
        mastered++;
      } else if (card.stability >= 3) {
        strong++;
      } else {
        weak++;
      }
    }
  }

  return {
    total: cards.length,
    mastered,
    strong,
    weak,
    newCount,
  };
});

export const getUserRank = cache(async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    return null;
  }

  // Get the current user's points
  const currentUser = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    columns: { points: true },
  });

  if (!currentUser) {
    return null;
  }

  // Count users with more points (rank = that count + 1)
  const [usersAbove] = await db
    .select({ value: count() })
    .from(userProgress)
    .where(gt(userProgress.points, currentUser.points));

  const rank = (usersAbove?.value ?? 0) + 1;

  // Count total users with an active course
  const [totalResult] = await db
    .select({ value: count() })
    .from(userProgress)
    .where(isNotNull(userProgress.activeCourseId));

  const totalUsers = totalResult?.value ?? 0;

  return { rank, totalUsers };
});

export const getUserWeeklyRank = cache(async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    return null;
  }

  const weekStart = getStartOfWeek();

  // Get the current user's weeklyXp
  const currentUser = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    columns: { weeklyXp: true, weeklyXpResetAt: true },
  });

  if (!currentUser) {
    return null;
  }

  const currentUserWeeklyXp =
    currentUser.weeklyXpResetAt && currentUser.weeklyXpResetAt >= weekStart
      ? currentUser.weeklyXp
      : 0;

  // Count users with more weeklyXp (rank = that count + 1)
  const [usersAbove] = await db
    .select({ value: count() })
    .from(userProgress)
    .where(
      and(
        isNotNull(userProgress.weeklyXpResetAt),
        gte(userProgress.weeklyXpResetAt, weekStart),
        gt(userProgress.weeklyXp, currentUserWeeklyXp),
      ),
    );

  const rank = (usersAbove?.value ?? 0) + 1;

  // Count total users with an active course
  const [totalResult] = await db
    .select({ value: count() })
    .from(userProgress)
    .where(isNotNull(userProgress.activeCourseId));

  const totalUsers = totalResult?.value ?? 0;

  return { rank, totalUsers };
});

export type GlobalStats = {
  totalLessonsCompleted: number;
  activeLearnersCount: number;
  totalStreakDays: number;
};

async function fetchGlobalStats(): Promise<GlobalStats> {
  const [lessonsResult] = await db
    .select({ value: count() })
    .from(lessonCompletions);

  const [learnersResult] = await db
    .select({ value: countDistinct(userProgress.userId) })
    .from(userProgress)
    .where(isNotNull(userProgress.activeCourseId));

  const [streakResult] = await db
    .select({ value: sum(userProgress.streak) })
    .from(userProgress);

  return {
    totalLessonsCompleted: lessonsResult?.value ?? 0,
    activeLearnersCount: learnersResult?.value ?? 0,
    totalStreakDays: Number(streakResult?.value) || 0,
  };
}

export const getGlobalStats = unstable_cache(
  fetchGlobalStats,
  ["global-stats"],
  { revalidate: 3600 },
);

export type DailyQuestProgress = {
  complete_lesson: boolean;
  hit_daily_goal: boolean;
  practice_review: boolean;
};

export const getDailyQuestProgress = cache(async (): Promise<DailyQuestProgress> => {
  const userId = await getAuthUserId();

  if (!userId) {
    return { complete_lesson: false, hit_daily_goal: false, practice_review: false };
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Lesson count today (reuse logic from getTodayLessonCount)
  const [lessonCountResult] = await db
    .select({ value: count() })
    .from(lessonCompletions)
    .where(
      and(
        eq(lessonCompletions.userId, userId),
        gte(lessonCompletions.completedAt, startOfToday),
      ),
    );

  const todayLessonCount = lessonCountResult?.value ?? 0;

  // User's daily goal
  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    columns: { dailyGoal: true },
  });

  const dailyGoal = progress?.dailyGoal ?? 1;

  // Check if any review cards have been reviewed today
  const [reviewResult] = await db
    .select({ value: count() })
    .from(reviewCards)
    .where(
      and(
        eq(reviewCards.userId, userId),
        gte(reviewCards.lastReview, startOfToday),
      ),
    );

  const hasReviewedToday = (reviewResult?.value ?? 0) >= 1;

  return {
    complete_lesson: todayLessonCount >= 1,
    hit_daily_goal: todayLessonCount >= dailyGoal,
    practice_review: hasReviewedToday,
  };
});

export const getClaimedDailyQuests = cache(async (): Promise<string[]> => {
  const userId = await getAuthUserId();

  if (!userId) {
    return [];
  }

  const today = new Date().toISOString().slice(0, 10);

  const rows = await db
    .select({ questId: dailyQuestClaims.questId })
    .from(dailyQuestClaims)
    .where(
      and(
        eq(dailyQuestClaims.userId, userId),
        eq(dailyQuestClaims.claimedDate, today),
      ),
    );

  return rows.map((r: typeof rows[number]) => r.questId);
});

export type UnitInfoForLesson = {
  unitTitle: string;
  unitOrder: number;
  isLastLesson: boolean;
  totalLessonsInUnit: number;
};

/**
 * Given a lessonId, return info about the unit it belongs to and
 * whether this lesson is the last one (highest order) in that unit.
 */
export const getUnitInfoForLesson = cache(async (lessonId: number): Promise<UnitInfoForLesson | null> => {
  // 1. Find the lesson to get its unitId
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    columns: { id: true, unitId: true, order: true },
  });

  if (!lesson) {
    return null;
  }

  // 2. Get the unit info
  const unit = await db.query.units.findFirst({
    where: eq(units.id, lesson.unitId),
    columns: { id: true, title: true, order: true },
  });

  if (!unit) {
    return null;
  }

  // 3. Count total lessons in this unit
  const [totalResult] = await db
    .select({ value: count() })
    .from(lessons)
    .where(eq(lessons.unitId, unit.id));

  const totalLessonsInUnit = totalResult?.value ?? 0;

  // 4. Find the highest order lesson in this unit
  const [maxOrderResult] = await db
    .select({ value: max(lessons.order) })
    .from(lessons)
    .where(eq(lessons.unitId, unit.id));

  const maxOrder = maxOrderResult?.value ?? 0;
  const isLastLesson = lesson.order === maxOrder;

  return {
    unitTitle: unit.title,
    unitOrder: unit.order,
    isLastLesson,
    totalLessonsInUnit,
  };
});

/**
 * Check if a streak freeze exists for a given date (YYYY-MM-DD).
 * Defaults to today.
 */
export const getStreakFreezeForDate = cache(async (date?: string) => {
  const userId = await getAuthUserId();

  if (!userId) {
    return null;
  }

  const targetDate = date ?? new Date().toISOString().slice(0, 10);

  const freeze = await db.query.streakFreezes.findFirst({
    where: and(
      eq(streakFreezes.userId, userId),
      eq(streakFreezes.usedDate, targetDate),
    ),
  });

  return freeze ?? null;
});
