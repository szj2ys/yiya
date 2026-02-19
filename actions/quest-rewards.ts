"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { getAuthUserId } from "@/lib/auth-utils";
import { getUserProgress } from "@/db/queries";
import { userProgress } from "@/db/schema";

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

  const newPoints = currentUserProgress.points + reward;

  await db
    .update(userProgress)
    .set({ points: newPoints })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");

  return { success: true, newPoints };
};
