import { cache } from "react";
import { and, desc, eq, inArray, lte } from "drizzle-orm";
import { auth } from "@clerk/nextjs";

import db from "@/db/drizzle";
import { 
  challengeProgress,
  courses, 
  challenges,
  lessons, 
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
  const { userId } = await auth();

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
  const { userId } = await auth();

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

export const getUnits = cache(async () => {
  const { userId } = await auth();
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
  const { userId } = await auth();
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
  const { userId } = await auth();

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
  const { userId } = await auth();

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
  const { userId } = await auth();

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

export const getTopTenUsers = cache(async () => {
  const { userId } = await auth();

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
