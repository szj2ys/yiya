"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import db from "@/db/drizzle";
import { referrals, userProgress } from "@/db/schema";
import { REFERRAL_REWARD_XP, REFERRAL_REWARD_HEARTS } from "@/constants";
import { track } from "@/lib/analytics";

export async function grantReferralRewards(
  referrerId: string,
  referredUserId: string,
) {
  if (referrerId === referredUserId) return;

  const existing = await db.query.referrals.findFirst({
    where: and(
      eq(referrals.referrerId, referrerId),
      eq(referrals.referredUserId, referredUserId),
    ),
  });

  if (existing?.rewardedAt) return;

  await db.transaction(async (tx) => {
    if (existing) {
      await tx
        .update(referrals)
        .set({ rewardedAt: new Date() })
        .where(eq(referrals.id, existing.id));
    } else {
      await tx.insert(referrals).values({
        referrerId,
        referredUserId,
        rewardedAt: new Date(),
      });
    }

    await tx
      .update(userProgress)
      .set({
        points: sql`${userProgress.points} + ${REFERRAL_REWARD_XP}`,
        hearts: REFERRAL_REWARD_HEARTS,
      })
      .where(eq(userProgress.userId, referrerId));

    await tx
      .update(userProgress)
      .set({
        points: sql`${userProgress.points} + ${REFERRAL_REWARD_XP}`,
        hearts: REFERRAL_REWARD_HEARTS,
      })
      .where(eq(userProgress.userId, referredUserId));
  });

  track("referral_reward_granted", {
    referrer_id: referrerId,
    referred_user_id: referredUserId,
    xp_reward: REFERRAL_REWARD_XP,
  });
}

export async function getAndMarkUnnotifiedReferrals(userId: string) {
  const unnotified = await db
    .select({ id: referrals.id })
    .from(referrals)
    .where(
      and(
        eq(referrals.referrerId, userId),
        sql`${referrals.rewardedAt} IS NOT NULL`,
        isNull(referrals.notifiedAt),
      ),
    );

  if (unnotified.length > 0) {
    await db
      .update(referrals)
      .set({ notifiedAt: new Date() })
      .where(
        and(
          eq(referrals.referrerId, userId),
          sql`${referrals.rewardedAt} IS NOT NULL`,
          isNull(referrals.notifiedAt),
        ),
      );
  }

  return unnotified.length;
}
