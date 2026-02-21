"use server";

import { getAuthUserId } from "@/lib/auth-utils";
import { and, eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { getUserProgress, getUserSubscription, getStreakFreezeForDate } from "@/db/queries";
import { challengeProgress, challenges, lessonCompletions, userProgress } from "@/db/schema";
import { createReviewCard } from "@/actions/review";
import { computeNextStreak } from "@/lib/streak";
import { computeWeeklyXp } from "@/lib/weekly-xp";

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

  const currentWeeklyXp = currentUserProgress.weeklyXp ?? 0;
  const currentWeeklyXpResetAt = currentUserProgress.weeklyXpResetAt ?? null;

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

    const practiceWeekly = computeWeeklyXp(currentWeeklyXp, currentWeeklyXpResetAt, 10);

    await db.update(userProgress).set({
      hearts: Math.min(currentUserProgress.hearts + 1, 5),
      points: currentUserProgress.points + 10,
      weeklyXp: practiceWeekly.weeklyXp,
      weeklyXpResetAt: practiceWeekly.weeklyXpResetAt,
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

  const weekly = computeWeeklyXp(currentWeeklyXp, currentWeeklyXpResetAt, 10);

  await db.update(userProgress)
    .set({
      points: currentUserProgress.points + 10,
      weeklyXp: weekly.weeklyXp,
      weeklyXpResetAt: weekly.weeklyXpResetAt,
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
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
    const freezeForYesterday = await getStreakFreezeForDate(yesterday);

    const { streak: nextStreak, shouldUpdateStreak, longestStreak } = computeNextStreak({
      currentStreak: currentUserProgress.streak ?? 0,
      lastLessonAt: currentUserProgress.lastLessonAt ?? null,
      now,
      currentLongestStreak: currentUserProgress.longestStreak ?? 0,
      hasFreezeForMissedDay: !!freezeForYesterday,
    });

    await db.update(userProgress)
      .set({
        ...(shouldUpdateStreak ? { streak: nextStreak, longestStreak } : {}),
        lastLessonAt: now,
      })
      .where(eq(userProgress.userId, userId));

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
