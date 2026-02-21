import { redirect } from "next/navigation";

import { getCourseStats, getLesson, getNextLesson, getTodayLessonCount, getUnitInfoForLesson, getUserProgress, getUserSubscription, getUserStreak } from "@/db/queries";
import { startPractice } from "@/actions/practice";

export async function getQuizProps(lessonId?: number) {
  const [practiceStart, lesson, userProgress, userSubscription, userStreak, todayLessonCount, courseStats] =
    await Promise.all([
      startPractice().catch(() => null),
      getLesson(lessonId),
      getUserProgress(),
      getUserSubscription(),
      getUserStreak(),
      getTodayLessonCount(),
      getCourseStats(),
    ]);

  if (!lesson || !userProgress) {
    redirect("/learn");
  }

  // Fetch next lesson and unit info in parallel (after we know lesson.id)
  const [nextLesson, unitInfo] = await Promise.all([
    getNextLesson(lesson.id),
    getUnitInfoForLesson(lesson.id),
  ]);

  const reviewCardId =
    practiceStart?.type === "challenge" &&
    practiceStart.lessonId === lesson.id &&
    practiceStart.reviewCardId
      ? practiceStart.reviewCardId
      : undefined;

  const initialPercentage =
    (lesson.challenges.filter((c: typeof lesson.challenges[number]) => c.completed).length /
      lesson.challenges.length) *
    100;

  // Course is complete when there is no next lesson AND this is not a practice session
  const isCourseComplete = !nextLesson && initialPercentage < 100;

  return {
    initialLessonId: lesson.id,
    initialLessonChallenges: lesson.challenges,
    initialHearts: userProgress.hearts,
    initialPercentage,
    initialStreak: userStreak?.streak ?? 0,
    courseLanguage: userProgress.activeCourse?.title ?? "English",
    reviewCardId,
    userSubscription,
    nextLessonId: nextLesson?.id ?? null,
    nextLessonTitle: nextLesson?.title ?? null,
    todayLessonCount,
    dailyGoal: userProgress.dailyGoal ?? 1,
    wordsLearned: courseStats?.wordsLearned ?? 0,
    isLastLessonInUnit: unitInfo?.isLastLesson ?? false,
    unitTitle: unitInfo?.unitTitle ?? undefined,
    unitOrder: unitInfo?.unitOrder ?? undefined,
    isCourseComplete,
    courseName: userProgress.activeCourse?.title ?? undefined,
  };
}
