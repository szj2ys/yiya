import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userProgress, pushSubscriptions } from "@/db/schema";
import { eq, gt } from "drizzle-orm";
import {
  sendPushToSubscription,
  buildNotificationPayload,
} from "@/lib/push/send";
import { DAY_IN_MS } from "@/constants";

/**
 * Cron: Send push notifications to users at risk of losing their streak.
 *
 * "At risk" = has a streak > 0, last lesson was between 16 and 48 hours ago
 * (haven't learned today but streak hasn't expired yet).
 *
 * Protected by CRON_SECRET header (Bearer token).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const sixteenHoursAgo = new Date(now.getTime() - 16 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * DAY_IN_MS);

  // Find users with active streaks and push subscriptions
  const usersWithSubs = await db
    .select({
      userId: userProgress.userId,
      streak: userProgress.streak,
      lastLessonAt: userProgress.lastLessonAt,
      subId: pushSubscriptions.id,
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
    })
    .from(userProgress)
    .innerJoin(
      pushSubscriptions,
      eq(userProgress.userId, pushSubscriptions.userId),
    )
    .where(gt(userProgress.streak, 0));

  const basePayload = buildNotificationPayload({
    title: "Don't lose your streak!",
    body: "",
    data: { url: "/learn" },
  });

  let sent = 0;
  for (const row of usersWithSubs) {
    if (!row.lastLessonAt) continue;

    const lastLessonTime = row.lastLessonAt.getTime();
    // Only send if last lesson was between 16h and 48h ago
    if (
      lastLessonTime > sixteenHoursAgo.getTime() ||
      lastLessonTime < twoDaysAgo.getTime()
    ) {
      continue;
    }

    const notification = {
      ...basePayload,
      body: `Your ${row.streak}-day streak is about to expire! Tap to continue learning.`,
    };

    const success = await sendPushToSubscription(
      {
        id: row.subId,
        endpoint: row.endpoint,
        p256dh: row.p256dh,
        auth: row.auth,
      },
      notification,
    );
    if (success) sent++;
  }

  return NextResponse.json({ sent, checked: usersWithSubs.length });
}
