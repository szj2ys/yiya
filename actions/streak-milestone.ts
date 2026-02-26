"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { getAuthUserId } from "@/lib/auth-utils";
import { streakMilestoneClaims, streakFreezes, userProgress } from "@/db/schema";
import { STREAK_MILESTONES } from "@/constants";

export const getClaimableStreakMilestones = async (currentStreak: number) => {
  const userId = await getAuthUserId();
  if (!userId) return [];

  const eligible = STREAK_MILESTONES.filter((m) => m.days <= currentStreak);
  if (eligible.length === 0) return [];

  const claimed = await db
    .select({ milestoneDays: streakMilestoneClaims.milestoneDays })
    .from(streakMilestoneClaims)
    .where(
      and(
        eq(streakMilestoneClaims.userId, userId),
        inArray(
          streakMilestoneClaims.milestoneDays,
          eligible.map((m) => m.days),
        ),
      ),
    );

  const claimedSet = new Set(claimed.map((c) => c.milestoneDays));
  return eligible.filter((m) => !claimedSet.has(m.days));
};

export const claimStreakMilestone = async (milestoneDays: number) => {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");

  const milestone = STREAK_MILESTONES.find((m) => m.days === milestoneDays);
  if (!milestone) throw new Error("Invalid milestone");

  const existing = await db.query.streakMilestoneClaims?.findFirst?.({
    where: and(
      eq(streakMilestoneClaims.userId, userId),
      eq(streakMilestoneClaims.milestoneDays, milestoneDays),
    ),
  });
  if (existing) return { alreadyClaimed: true };

  await db.transaction(async (tx) => {
    await tx.insert(streakMilestoneClaims).values({
      userId,
      milestoneDays,
      xpRewarded: milestone.xpReward,
    });

    await tx.update(userProgress).set({
      points: await db.query.userProgress
        .findFirst({ where: eq(userProgress.userId, userId), columns: { points: true } })
        .then((r) => (r?.points ?? 0) + milestone.xpReward),
    }).where(eq(userProgress.userId, userId));

    if ("grantsShield" in milestone && milestone.grantsShield) {
      const today = new Date().toISOString().slice(0, 10);
      await tx.insert(streakFreezes).values({
        userId,
        usedDate: `shield-${today}`,
      }).onConflictDoNothing();
    }
  });

  revalidatePath("/learn");
  return { claimed: true, xpReward: milestone.xpReward, label: milestone.label };
};

export const getNextStreakMilestone = async (currentStreak: number) => {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const claimed = await db
    .select({ milestoneDays: streakMilestoneClaims.milestoneDays })
    .from(streakMilestoneClaims)
    .where(eq(streakMilestoneClaims.userId, userId));

  const claimedSet = new Set(claimed.map((c) => c.milestoneDays));

  const next = STREAK_MILESTONES.find(
    (m) => m.days > currentStreak || (m.days <= currentStreak && !claimedSet.has(m.days)),
  );

  if (!next) return null;

  return {
    days: next.days,
    xpReward: next.xpReward,
    daysUntil: Math.max(0, next.days - currentStreak),
  };
};
