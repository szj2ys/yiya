import { redirect } from "next/navigation";

import { getLesson, getUserProgress, getUserSubscription, getUserStreak } from "@/db/queries";
import { startPractice } from "@/actions/practice";

export async function getQuizProps(lessonId?: number) {
  const [practiceStart, lesson, userProgress, userSubscription, userStreak] =
    await Promise.all([
      startPractice().catch(() => null),
      getLesson(lessonId),
      getUserProgress(),
      getUserSubscription(),
      getUserStreak(),
    ]);

  if (!lesson || !userProgress) {
    redirect("/learn");
  }

  const reviewCardId =
    practiceStart?.type === "challenge" &&
    practiceStart.lessonId === lesson.id &&
    practiceStart.reviewCardId
      ? practiceStart.reviewCardId
      : undefined;

  const initialPercentage =
    (lesson.challenges.filter((c) => c.completed).length /
      lesson.challenges.length) *
    100;

  return {
    initialLessonId: lesson.id,
    initialLessonChallenges: lesson.challenges,
    initialHearts: userProgress.hearts,
    initialPercentage,
    initialStreak: userStreak?.streak ?? 0,
    courseLanguage: userProgress.activeCourse?.title ?? "English",
    reviewCardId,
    userSubscription,
  };
}
