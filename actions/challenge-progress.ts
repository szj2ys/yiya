"use server";

import { getAuthUserId } from "@/lib/auth-utils";
import { and, eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { getUserProgress, getUserSubscription, getStreakFreezeForDate } from "@/db/queries";
import { challengeProgress, challenges, lessonCompletions, userProgress } from "@/db/schema";
import { createReviewCard } from "@/actions/review";
import { computeNextStreak, toLocalDateString } from "@/lib/streak";
import { computeWeeklyXp } from "@/lib/weekly-xp";
import { DAY_IN_MS, MAX_HEARTS, XP_PER_CHALLENGE, ACTIVATION_LESSON_COUNT } from "@/constants";
import { track } from "@/lib/analytics";
import { getServerReferralData } from "@/lib/referral";
import { cookies } from "next/headers";

export const upsertChallengeProgress = async (
  challengeId: number,
  timezoneOffset?: number,
) => {
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

    const practiceWeekly = computeWeeklyXp(currentWeeklyXp, currentWeeklyXpResetAt, XP_PER_CHALLENGE);

    await db.update(userProgress).set({
      hearts: Math.min(currentUserProgress.hearts + 1, MAX_HEARTS),
      points: currentUserProgress.points + XP_PER_CHALLENGE,
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

  const weekly = computeWeeklyXp(currentWeeklyXp, currentWeeklyXpResetAt, XP_PER_CHALLENGE);

  await db.transaction(async (tx) => {
    await tx.insert(challengeProgress).values({
      challengeId,
      userId,
      completed: true,
    });

    await tx.update(userProgress)
      .set({
        points: currentUserProgress.points + XP_PER_CHALLENGE,
        weeklyXp: weekly.weeklyXp,
        weeklyXpResetAt: weekly.weeklyXpResetAt,
      })
      .where(eq(userProgress.userId, userId));

    // Check if all challenges in the lesson are now completed; if so, log lesson completion
    const [totalResult] = await tx
      .select({ value: count() })
      .from(challenges)
      .where(eq(challenges.lessonId, lessonId));

    const [completedResult] = await tx
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
      const offset = timezoneOffset ?? 0;
      const yesterdayLocal = toLocalDateString(
        new Date(now.getTime() - DAY_IN_MS),
        offset,
      );
      const freezeForYesterday = await getStreakFreezeForDate(yesterdayLocal);

      const { streak: nextStreak, shouldUpdateStreak, longestStreak } = computeNextStreak({
        currentStreak: currentUserProgress.streak ?? 0,
        lastLessonAt: currentUserProgress.lastLessonAt ?? null,
        now,
        currentLongestStreak: currentUserProgress.longestStreak ?? 0,
        hasFreezeForMissedDay: !!freezeForYesterday,
        userTimezoneOffset: timezoneOffset,
      });

      await tx.update(userProgress)
        .set({
          ...(shouldUpdateStreak ? { streak: nextStreak, longestStreak } : {}),
          lastLessonAt: now,
        })
        .where(eq(userProgress.userId, userId));

      await tx.insert(lessonCompletions).values({
        userId,
        lessonId,
        completedAt: now,
      });
    }
  });

  await createReviewCard(userId, challengeId, "correct");

  // Fire user_activated event when user completes their first lesson
  const [lessonCountResult] = await db
    .select({ value: count() })
    .from(lessonCompletions)
    .where(eq(lessonCompletions.userId, userId));

  if (lessonCountResult.value === ACTIVATION_LESSON_COUNT) {
    const cookieStore = cookies();
    const refCookie = cookieStore.get("yiya_ref")?.value;
    const referral = getServerReferralData(refCookie);
    track("user_activated", {
      user_id: userId,
      lesson_count: lessonCountResult.value,
      ...referral,
    });
  }

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};
