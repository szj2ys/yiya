"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { getAuthUserId } from "@/lib/auth-utils";
import { getDailyQuestProgress } from "@/db/queries";
import { dailyQuestClaims, userProgress } from "@/db/schema";
import { DAILY_QUESTS } from "@/constants";

export const claimDailyQuest = async (
  questId: string,
): Promise<{ success: true } | { error: "already_claimed" | "not_completed" | "invalid" }> => {
  const userId = await getAuthUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Validate questId
  const quest = DAILY_QUESTS.find((q) => q.id === questId);
  if (!quest) {
    return { error: "invalid" };
  }

  // Verify the quest is actually completed
  const progress = await getDailyQuestProgress();
  const isCompleted = progress[questId as keyof typeof progress];
  if (!isCompleted) {
    return { error: "not_completed" };
  }

  // Check not already claimed today
  const today = new Date().toISOString().slice(0, 10);
  const existingClaim = await db.query.dailyQuestClaims.findFirst({
    where: and(
      eq(dailyQuestClaims.userId, userId),
      eq(dailyQuestClaims.questId, questId),
      eq(dailyQuestClaims.claimedDate, today),
    ),
  });

  if (existingClaim) {
    return { error: "already_claimed" };
  }

  // Insert claim and award XP atomically
  await db.transaction(async (tx: typeof db) => {
    await tx.insert(dailyQuestClaims).values({
      userId,
      questId,
      claimedDate: today,
    });

    const currentProgress = await tx.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
      columns: { points: true },
    });

    const newPoints = (currentProgress?.points ?? 0) + quest.xpReward;

    await tx
      .update(userProgress)
      .set({ points: newPoints })
      .where(eq(userProgress.userId, userId));
  });

  revalidatePath("/learn");

  return { success: true };
};
