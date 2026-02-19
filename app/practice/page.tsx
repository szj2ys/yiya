import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { getReviewSession } from "@/actions/review";
import { getUserProgress, getUserSubscription, getUserStreak } from "@/db/queries";
import { Quiz } from "@/app/lesson/quiz";
import { absoluteUrl } from "@/lib/utils";
import type { VariantQuestion } from "@/lib/ai/variants";

type ReviewCard = Awaited<ReturnType<typeof getReviewSession>>[number];

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
  const initialLessonChallenges = cards.map((card: ReviewCard) => {
    reviewCardIds[card.challenge.id] = card.id;

    return {
      ...card.challenge,
      completed: true, // Mark all as completed to trigger practice mode behavior
      challengeOptions: card.challenge.challengeOptions,
    };
  });

  // Use the first card's challenge lessonId as the lesson ID (for tracking)
  const lessonId = cards[0].challenge.lessonId;

  const courseLanguage = userProgress.activeCourse?.title ?? "English";

  // Prefetch AI variants for a subset of cards (~30%), gracefully degrading on failures.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const shouldAttemptVariants = !!appUrl;

  const cookieHeader = cookies().toString();

  const variantSettled = await Promise.allSettled(
    cards.map(async (card: ReviewCard) => {
      // Roughly 30% of questions show variants.
      if (!shouldAttemptVariants || Math.random() > 0.3) {
        return { challengeId: card.challenge.id, variant: null as VariantQuestion | null };
      }

      const correctOption = card.challenge.challengeOptions.find(
        (o: { correct: boolean }) => o.correct,
      );
      if (!correctOption) {
        return { challengeId: card.challenge.id, variant: null as VariantQuestion | null };
      }

      const res = await fetch(absoluteUrl("/api/ai/variants"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Ensure the API route can authenticate via Clerk cookies.
          cookie: cookieHeader,
        },
        body: JSON.stringify({
          challengeId: card.challenge.id,
          originalQuestion: card.challenge.question,
          correctAnswer: correctOption.text,
          challengeType: card.challenge.type,
          courseLanguage,
        }),
        cache: "no-store",
      });

      if (!res.ok) {
        return { challengeId: card.challenge.id, variant: null as VariantQuestion | null };
      }

      const data = (await res.json()) as { variant: VariantQuestion | null };
      return { challengeId: card.challenge.id, variant: data.variant };
    }),
  );

  const variantData: Record<number, VariantQuestion> = {};
  for (const item of variantSettled) {
    if (item.status !== "fulfilled") continue;
    const { challengeId, variant } = item.value;
    if (variant) {
      variantData[challengeId] = variant;
    }
  }

  return (
    <Quiz
      initialPercentage={100}
      initialHearts={userProgress.hearts}
      initialLessonId={lessonId}
      initialLessonChallenges={initialLessonChallenges}
      initialStreak={userStreak?.streak ?? 0}
      courseLanguage={courseLanguage}
      reviewCardIds={reviewCardIds}
      variantData={Object.keys(variantData).length > 0 ? variantData : undefined}
      userSubscription={userSubscriptionData}
      nextLessonId={null}
      nextLessonTitle={null}
    />
  );
};

export default PracticePage;
