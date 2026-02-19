"use server";

import { getAuthUserId } from "@/lib/auth-utils";
import { and, eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { challengeProgress, challenges, lessonCompletions, userProgress } from "@/db/schema";
import { createReviewCard } from "@/actions/review";
import { computeNextStreak } from "@/lib/streak";

export const upsertChallengeProgress = async (challengeId: number) => {
  const userId = await getAuthUserId();

  if (!userId) {
    throw new Error("Unauthorized"); 
  }

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId)
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId),
    ),
  });

  const isPractice = !!existingChallengeProgress;

  if (
    currentUserProgress.hearts === 0 && 
    !isPractice && 
    !userSubscription?.isActive
  ) {
    return { error: "hearts" };
  }

  if (isPractice) {
    await db.update(challengeProgress).set({
      completed: true,
    })
    .where(
      eq(challengeProgress.id, existingChallengeProgress.id)
    );

    await db.update(userProgress).set({
      hearts: Math.min(currentUserProgress.hearts + 1, 5),
      points: currentUserProgress.points + 10,
    }).where(eq(userProgress.userId, userId));

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
    return;
  }

  await db.insert(challengeProgress).values({
    challengeId,
    userId,
    completed: true,
  });

  await createReviewCard(userId, challengeId, "correct");

  const now = new Date();

  const { streak: nextStreak, shouldUpdateStreak } = computeNextStreak({
    currentStreak: currentUserProgress.streak ?? 0,
    lastLessonAt: currentUserProgress.lastLessonAt ?? null,
    now,
  });

  await db.update(userProgress)
    .set({
      points: currentUserProgress.points + 10,
      ...(shouldUpdateStreak ? { streak: nextStreak } : {}),
      lastLessonAt: now,
    })
    .where(eq(userProgress.userId, userId));

  // Check if all challenges in the lesson are now completed; if so, log lesson completion
  const [totalResult] = await db
    .select({ value: count() })
    .from(challenges)
    .where(eq(challenges.lessonId, lessonId));

  const [completedResult] = await db
    .select({ value: count() })
    .from(challengeProgress)
    .where(
      and(
        eq(challengeProgress.userId, userId),
        eq(challengeProgress.completed, true),
      ),
    )
    .innerJoin(challenges, and(
      eq(challengeProgress.challengeId, challenges.id),
      eq(challenges.lessonId, lessonId),
    ));

  if (
    totalResult.value > 0 &&
    completedResult.value >= totalResult.value
  ) {
    await db.insert(lessonCompletions).values({
      userId,
      lessonId,
      completedAt: now,
    });
  }

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};
