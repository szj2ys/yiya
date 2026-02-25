"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { getAuthUserId } from "@/lib/auth-utils";
import { getUserProgress } from "@/db/queries";
import { questClaims, userProgress } from "@/db/schema";

export const claimQuestReward = async (
  questValue: number,
  reward: number,
): Promise<{ success: true; newPoints: number } | { error: string }> => {
  const userId = await getAuthUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  if (currentUserProgress.points < questValue) {
    return { error: "not_eligible" };
  }

  // Check if already claimed
  const existingClaim = await db.query.questClaims.findFirst({
    where: and(
      eq(questClaims.userId, userId),
      eq(questClaims.questValue, questValue),
    ),
  });

  if (existingClaim) {
    return { error: "already_claimed" };
  }

  const newPoints = currentUserProgress.points + reward;

  await db.transaction(async (tx) => {
    await tx
      .update(userProgress)
      .set({ points: newPoints })
      .where(eq(userProgress.userId, userId));

    await tx.insert(questClaims).values({
      userId,
      questValue,
    });
  });

  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");

  return { success: true, newPoints };
};
