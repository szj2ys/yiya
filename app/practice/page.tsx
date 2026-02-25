import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";

import { getReviewSession, getReviewDueCount } from "@/actions/review";
import { getUserProgress, getUserSubscription, getUserStreak } from "@/db/queries";
import { Quiz } from "@/app/lesson/quiz";
import { getVariantQuestion } from "@/lib/ai/variants";
import { getAuthUserId } from "@/lib/auth-utils";
import type { VariantQuestion } from "@/lib/ai/variants";

type ReviewCard = Awaited<ReturnType<typeof getReviewSession>>[number];

const PracticePage = async () => {
  const [cards, userProgress, userSubscriptionData, userStreak, totalDueCount] =
    await Promise.all([
      getReviewSession(),
      getUserProgress(),
      getUserSubscription(),
      getUserStreak(),
      getReviewDueCount(),
    ]);

  if (!userProgress) {
    redirect("/learn");
  }

  if (cards.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-12" data-testid="practice-empty">
        <div className="flex max-w-md flex-col items-center text-center gap-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <Sparkles className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-700 dark:text-neutral-200">
            All caught up!
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-300">
            You&apos;ve reviewed all your cards for today. Great work keeping up with your reviews!
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            New review cards will appear as your memory needs refreshing.
          </p>
          <Link
            href="/learn"
            className="mt-4 inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-600 px-8 font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800 transition"
          >
            Back to Learn
          </Link>
        </div>
      </div>
    );
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

  const userId = await getAuthUserId();

  // Prefetch AI variants for a subset of cards (~30%), calling the function directly
  // instead of going through the HTTP API route (avoids server-to-self fetch loop).
  const variantSettled = await Promise.allSettled(
    cards.map(async (card: ReviewCard) => {
      if (!userId || Math.random() > 0.3) {
        return { challengeId: card.challenge.id, variant: null as VariantQuestion | null };
      }

      const correctOption = card.challenge.challengeOptions.find(
        (o: { correct: boolean }) => o.correct,
      );
      if (!correctOption) {
        return { challengeId: card.challenge.id, variant: null as VariantQuestion | null };
      }

      const variant = await getVariantQuestion({
        userId,
        challengeId: card.challenge.id,
        originalQuestion: card.challenge.question,
        correctAnswer: correctOption.text,
        challengeType: card.challenge.type,
        courseLanguage,
      });

      return { challengeId: card.challenge.id, variant };
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

  // How many due items remain beyond this session
  const remainingDueCount = Math.max(0, totalDueCount - cards.length);

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
      remainingDueCount={remainingDueCount}
    />
  );
};

export default PracticePage;
