import { cache } from "react";
import { and, count, countDistinct, eq, gte, gt, inArray, lte, sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { getAuthUserId } from "@/lib/auth-utils";
import {
  challengeProgress,
  courses,
  challenges,
  lessonCompletions,
  lessons,
  questClaims,
  reviewCards,
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
const MAX_LOOKBACK_ITEMS = 50;

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

  return rows.map((r) => r.questValue);
});

export const getUnits = cache(async () => {
  const userId = await getAuthUserId();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) {
    return [];
  }

  const data = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
            with: {
              challengeProgress: {
                where: eq(
                  challengeProgress.userId,
                  userId,
                ),
              },
            },
          },
        },
      },
    },
  });

  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      if (
        lesson.challenges.length === 0
      ) {
        return { ...lesson, completed: false };
      }

      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return challenge.challengeProgress
          && challenge.challengeProgress.length > 0
          && challenge.challengeProgress.every((progress) => progress.completed);
      });

      return { ...lesson, completed: allCompletedChallenges };
    });

    return { ...unit, lessons: lessonsWithCompletedStatus };
  });

  return normalizedData;
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
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          },
        },
      },
    },
  });

  return data;
});

export const getCourseProgress = cache(async () => {
  const userId = await getAuthUserId();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) {
    return null;
  }

  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          unit: true,
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

  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      return lesson.challenges.some((challenge) => {
        return !challenge.challengeProgress 
          || challenge.challengeProgress.length === 0 
          || challenge.challengeProgress.some((progress) => progress.completed === false)
      });
    });

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

export const getLesson = cache(async (id?: number) => {
  const userId = await getAuthUserId();

  if (!userId) {
    return null;
  }

  const courseProgress = await getCourseProgress();

  const lessonId = id || courseProgress?.activeLessonId;

  if (!lessonId) {
    return null;
  }

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
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

  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed = challenge.challengeProgress 
      && challenge.challengeProgress.length > 0
      && challenge.challengeProgress.every((progress) => progress.completed)

    return { ...challenge, completed };
  });

  return { ...data, challenges: normalizedChallenges }
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) {
    return 0;
  }

  const lesson = await getLesson(courseProgress.activeLessonId);

  if (!lesson) {
    return 0;
  }

  const completedChallenges = lesson.challenges
    .filter((challenge) => challenge.completed);
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
    orderBy: (reviewCards, { asc }) => [asc(reviewCards.due)],
    limit: MAX_REVIEW_ITEMS,
    columns: {
      id: true,
      challengeId: true,
    },
  });

  if (dueCards.length > 0) {
    const dueChallengeIds = dueCards.map((c) => c.challengeId);
    const challengeIdToReviewCardId = new Map(
      dueCards.map((c) => [c.challengeId, c.id] as const),
    );
    const dueChallenges = await db.query.challenges.findMany({
      where: inArray(challenges.id, dueChallengeIds),
      columns: { id: true, lessonId: true },
    });

    const challengeIdToLessonId = new Map(
      dueChallenges.map((c) => [c.id, c.lessonId] as const),
    );

    return dueChallengeIds.flatMap((challengeId) => {
      const lessonId = challengeIdToLessonId.get(challengeId);
      if (!lessonId) return [];
      return [
        {
          type: "challenge",
          challengeId,
          lessonId,
          reviewCardId: challengeIdToReviewCardId.get(challengeId),
        },
      ];
    });
  }

  // 1) Recently-wrong challenges first (most recent attempt first)
  const wrongChallengeProgress = await db.query.challengeProgress.findMany({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.completed, false),
    ),
    orderBy: (challengeProgress, { desc }) => [desc(challengeProgress.id)],
    limit: MAX_REVIEW_ITEMS,
    columns: {
      challengeId: true,
    },
  });

  const wrongChallengeIds = wrongChallengeProgress.map((row) => row.challengeId);

  const wrongChallenges = wrongChallengeIds.length
    ? await db.query.challenges.findMany({
        where: inArray(challenges.id, wrongChallengeIds),
        columns: { id: true, lessonId: true },
      })
    : [];

  const challengeIdToLessonId = new Map(
    wrongChallenges.map((challenge) => [challenge.id, challenge.lessonId] as const),
  );

  const challengeItems: ReviewItem[] = wrongChallengeIds.flatMap((challengeId) => {
    const lessonId = challengeIdToLessonId.get(challengeId);
    if (!lessonId) return [];
    return [{ type: "challenge", challengeId, lessonId }];
  });

  // 2) Recently completed lessons for recap (by most recent completed challenge)
  const completedChallengeProgress = await db.query.challengeProgress.findMany({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.completed, true),
    ),
    orderBy: (challengeProgress, { desc }) => [desc(challengeProgress.id)],
    limit: MAX_LOOKBACK_ITEMS,
    columns: {
      challengeId: true,
    },
  });

  const completedChallengeIds = completedChallengeProgress.map((row) => row.challengeId);

  const completedChallenges = completedChallengeIds.length
    ? await db.query.challenges.findMany({
        where: inArray(challenges.id, completedChallengeIds),
        columns: { id: true, lessonId: true },
      })
    : [];

  const completedChallengeIdToLessonId = new Map(
    completedChallenges.map((challenge) => [challenge.id, challenge.lessonId] as const),
  );

  const recapLessonIds: number[] = [];
  const recapLessonIdsSet = new Set<number>();
  const wrongLessonSet = new Set<number>(challengeItems.map((i) => i.lessonId));

  for (const challengeId of completedChallengeIds) {
    const lessonId = completedChallengeIdToLessonId.get(challengeId);
    if (!lessonId) continue;
    if (wrongLessonSet.has(lessonId)) continue;
    if (recapLessonIdsSet.has(lessonId)) continue;

    recapLessonIdsSet.add(lessonId);
    recapLessonIds.push(lessonId);

    if (recapLessonIds.length >= MAX_REVIEW_ITEMS) break;
  }

  const recapItems: ReviewItem[] = recapLessonIds.map((lessonId) => ({
    type: "lesson",
    lessonId,
  }));

  return [...challengeItems, ...recapItems];
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

  const allLessons = unitsInCourse.flatMap((unit) => unit.lessons);
  const allChallenges = allLessons.flatMap((lesson) => lesson.challenges);

  const totalLessons = allLessons.length;
  const totalChallenges = allChallenges.length;

  const completedLessons = allLessons.filter((lesson) => {
    if (lesson.challenges.length === 0) return false;
    return lesson.challenges.every(
      (challenge) =>
        challenge.challengeProgress &&
        challenge.challengeProgress.length > 0 &&
        challenge.challengeProgress.every((p) => p.completed),
    );
  }).length;

  const completedChallenges = allChallenges.filter(
    (challenge) =>
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((p) => p.completed),
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

export const getTopTenUsers = cache(async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    return [];
  }

  const data = await db.query.userProgress.findMany({
    orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
    },
  });

  return data;
});

/**
 * Find the next lesson after the given lesson ID.
 *
 * Strategy:
 * 1. Look for the next lesson in the same unit (by order).
 * 2. If the current unit is complete, find the first lesson of the next unit
 *    (within the same course).
 * 3. If all units/lessons are done, return null.
 */
export const getNextLesson = cache(async (currentLessonId: number) => {
  // 1. Fetch the current lesson to get its unitId and order
  const currentLesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, currentLessonId),
    columns: { id: true, unitId: true, order: true },
  });

  if (!currentLesson) {
    return null;
  }

  // 2. Try to find the next lesson in the same unit (order > current order)
  const nextInUnit = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, currentLesson.unitId),
      gt(lessons.order, currentLesson.order),
    ),
    orderBy: (lessons, { asc }) => [asc(lessons.order)],
    columns: { id: true },
  });

  if (nextInUnit) {
    return { id: nextInUnit.id };
  }

  // 3. Get the current unit to find the next unit in the same course
  const currentUnit = await db.query.units.findFirst({
    where: eq(units.id, currentLesson.unitId),
    columns: { id: true, courseId: true, order: true },
  });

  if (!currentUnit) {
    return null;
  }

  // 4. Find the next unit in the same course
  const nextUnit = await db.query.units.findFirst({
    where: and(
      eq(units.courseId, currentUnit.courseId),
      gt(units.order, currentUnit.order),
    ),
    orderBy: (units, { asc }) => [asc(units.order)],
    columns: { id: true },
  });

  if (!nextUnit) {
    return null;
  }

  // 5. Get the first lesson of the next unit
  const firstLessonOfNextUnit = await db.query.lessons.findFirst({
    where: eq(lessons.unitId, nextUnit.id),
    orderBy: (lessons, { asc }) => [asc(lessons.order)],
    columns: { id: true },
  });

  return firstLessonOfNextUnit ? { id: firstLessonOfNextUnit.id } : null;
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
