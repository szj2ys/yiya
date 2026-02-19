import { redirect } from "next/navigation";

import { getReviewSession } from "@/actions/review";
import { getUserProgress, getUserSubscription, getUserStreak } from "@/db/queries";
import { Quiz } from "@/app/lesson/quiz";

const PracticePage = async () => {
  const [cards, userProgress, userSubscriptionData, userStreak] =
    await Promise.all([
      getReviewSession(),
      getUserProgress(),
      getUserSubscription(),
      getUserStreak(),
    ]);

  if (!userProgress) {
    redirect("/learn");
  }

  if (cards.length === 0) {
    redirect("/learn");
  }

  // Build the challengeId → reviewCardId mapping for multi-card support
  const reviewCardIds: Record<number, number> = {};
  const initialLessonChallenges = cards.map((card) => {
    reviewCardIds[card.challenge.id] = card.id;

    return {
      ...card.challenge,
      completed: true, // Mark all as completed to trigger practice mode behavior
      challengeOptions: card.challenge.challengeOptions,
    };
  });

  // Use the first card's challenge lessonId as the lesson ID (for tracking)
  const lessonId = cards[0].challenge.lessonId;

  return (
    <Quiz
      initialPercentage={100}
      initialHearts={userProgress.hearts}
      initialLessonId={lessonId}
      initialLessonChallenges={initialLessonChallenges}
      initialStreak={userStreak?.streak ?? 0}
      courseLanguage={userProgress.activeCourse?.title ?? "English"}
      reviewCardIds={reviewCardIds}
      userSubscription={userSubscriptionData}
      nextLessonId={null}
      nextLessonTitle={null}
    />
  );
};

export default PracticePage;
