"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { getAuthUserId } from "@/lib/auth-utils";
import { getUserProgress } from "@/db/queries";
import { streakFreezes, userProgress } from "@/db/schema";
import { STREAK_FREEZE_COST } from "@/constants";

/**
 * Purchase a streak freeze for today.
 * Deducts STREAK_FREEZE_COST points and inserts a freeze record for today's date.
 */
export const buyStreakFreeze = async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  if (currentUserProgress.points < STREAK_FREEZE_COST) {
    throw new Error("Not enough points");
  }

  const today = new Date().toISOString().slice(0, 10);

  // Check if freeze already exists for today
  const existing = await db.query.streakFreezes.findFirst({
    where: and(
      eq(streakFreezes.userId, userId),
      eq(streakFreezes.usedDate, today),
    ),
  });

  if (existing) {
    throw new Error("Freeze already active for today");
  }

  // Deduct points and insert freeze atomically
  await db.transaction(async (tx: typeof db) => {
    await tx
      .update(userProgress)
      .set({
        points: currentUserProgress.points - STREAK_FREEZE_COST,
      })
      .where(eq(userProgress.userId, userId));

    await tx.insert(streakFreezes).values({
      userId,
      usedDate: today,
    });
  });

  revalidatePath("/shop");
  revalidatePath("/learn");
};

/**
 * Check if the current user has an active freeze for today.
 */
export const getActiveFreeze = async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);

  const freeze = await db.query.streakFreezes.findFirst({
    where: and(
      eq(streakFreezes.userId, userId),
      eq(streakFreezes.usedDate, today),
    ),
  });

  return freeze ?? null;
};
