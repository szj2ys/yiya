"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getAuthUserId } from "@/lib/auth-utils";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";

export async function updateEmailReminders(enabled: boolean): Promise<void> {
  const userId = await getAuthUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(userProgress)
    .set({ emailReminders: enabled })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/settings");
}
