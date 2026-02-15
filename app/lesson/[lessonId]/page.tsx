import { redirect } from "next/navigation";

import { getLesson, getUserProgress, getUserSubscription, getUserStreak } from "@/db/queries";

import { startPractice } from "@/actions/practice";

import { Quiz } from "../quiz";

type Props = {
  params: {
    lessonId: number;
  };
};

const LessonIdPage = async ({
  params,
}: Props) => {
  const practiceStartData = startPractice().catch(() => null);
  const lessonData = getLesson(params.lessonId);
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();
  const userStreakData = getUserStreak();

  const [
    practiceStart,
    lesson,
    userProgress,
    userSubscription,
    userStreak,
  ] = await Promise.all([
    practiceStartData,
    lessonData,
    userProgressData,
    userSubscriptionData,
    userStreakData,
  ]);

  if (!lesson || !userProgress) {
    redirect("/learn");
  }

  const reviewCardId = practiceStart?.type === "challenge"
    && practiceStart.lessonId === lesson.id
    && practiceStart.reviewCardId
      ? practiceStart.reviewCardId
      : undefined;

  const initialPercentage = lesson.challenges
    .filter((challenge) => challenge.completed)
    .length / lesson.challenges.length * 100;

  return ( 
    <Quiz
      initialLessonId={lesson.id}
      initialLessonChallenges={lesson.challenges}
      initialHearts={userProgress.hearts}
      initialPercentage={initialPercentage}
      initialStreak={userStreak?.streak ?? 0}
      reviewCardId={reviewCardId}
      userSubscription={userSubscription}
    />
  );
};
 
export default LessonIdPage;
