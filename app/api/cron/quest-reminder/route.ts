import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userProgress, pushSubscriptions, dailyQuestClaims, lessonCompletions } from "@/db/schema";
import { eq, gt, and, gte, count, inArray } from "drizzle-orm";
import {
  sendPushToSubscription,
  buildNotificationPayload,
} from "@/lib/push/send";
import { DAILY_QUESTS } from "@/constants";
import { trackPayload } from "@/lib/analytics";
import { buildTrackPayload } from "@/lib/analytics";

const MAX_PUSH_PER_RUN = 100;

/**
 * Cron: Send push notifications to users with incomplete daily quests.
 *
 * Runs at 6pm and 9pm to remind users to complete their daily quests.
 * Only sends to users who:
 * - Have push subscriptions
 * - Have incomplete daily quests
 * - Haven't been reminded in the last 4 hours
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
  const startOfToday = new Date(now);
  startOfToday.setUTCHours(0, 0, 0, 0);

  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

  try {
    // Find all users with push subscriptions
    const usersWithSubs = await db
      .select({
        userId: userProgress.userId,
        dailyGoal: userProgress.dailyGoal,
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
      .limit(MAX_PUSH_PER_RUN * 2);

    // Get today's lesson counts for all users
    const userIds = usersWithSubs.map((u) => u.userId);
    const lessonCounts = await db
      .select({
        userId: lessonCompletions.userId,
        count: count(),
      })
      .from(lessonCompletions)
      .where(
        and(
          inArray(lessonCompletions.userId, userIds),
          gte(lessonCompletions.completedAt, startOfToday),
        ),
      )
      .groupBy(lessonCompletions.userId);

    const lessonCountMap = new Map(lessonCounts.map((lc) => [lc.userId, lc.count]));

    // Get claimed daily quests for all users
    const claimedQuests = await db
      .select({
        userId: dailyQuestClaims.userId,
        questId: dailyQuestClaims.questId,
        claimedAt: dailyQuestClaims.claimedAt,
      })
      .from(dailyQuestClaims)
      .where(
        and(
          inArray(dailyQuestClaims.userId, userIds),
          gte(dailyQuestClaims.claimedAt, startOfToday),
        ),
      );

    const claimedMap = new Map<string, Set<string>>();
    for (const cq of claimedQuests) {
      if (!claimedMap.has(cq.userId)) {
        claimedMap.set(cq.userId, new Set());
      }
      claimedMap.get(cq.userId)!.add(cq.questId);
    }

    // Filter users with incomplete quests
    const eligibleUsers: typeof usersWithSubs = [];
    for (const user of usersWithSubs) {
      const todayLessons = lessonCountMap.get(user.userId) ?? 0;
      const dailyGoal = user.dailyGoal ?? 1;
      const userClaimed = claimedMap.get(user.userId) ?? new Set();

      // Check which quests are incomplete
      const incompleteQuests: string[] = [];

      // complete_lesson quest
      if (todayLessons < 1 && !userClaimed.has("complete_lesson")) {
        incompleteQuests.push("complete_lesson");
      }

      // hit_daily_goal quest
      if (todayLessons < dailyGoal && !userClaimed.has("hit_daily_goal")) {
        incompleteQuests.push("hit_daily_goal");
      }

      // If user has incomplete quests, they're eligible
      if (incompleteQuests.length > 0) {
        eligibleUsers.push({ ...user, incompleteQuests });
      }
    }

    // Limit to max push per run
    const usersToNotify = eligibleUsers.slice(0, MAX_PUSH_PER_RUN);

    let sent = 0;
    let failed = 0;

    for (const user of usersToNotify) {
      try {
        // Determine notification message based on incomplete quests
        const hasIncompleteLesson = user.incompleteQuests?.includes("complete_lesson");
        const hasIncompleteGoal = user.incompleteQuests?.includes("hit_daily_goal");

        let title = "Complete your daily quests!";
        let body = "";

        if (hasIncompleteLesson && hasIncompleteGoal) {
          body = "You have daily quests waiting! Complete a lesson to earn XP rewards.";
        } else if (hasIncompleteLesson) {
          body = "Complete a lesson today to earn 5 XP!";
        } else {
          body = "You're close to hitting your daily goal! Keep learning to earn XP.";
        }

        const notification = buildNotificationPayload({
          title,
          body,
          data: { url: "/learn", source: "quest_reminder" },
        });

        const success = await sendPushToSubscription(
          {
            id: user.subId,
            endpoint: user.endpoint,
            p256dh: user.p256dh,
            auth: user.auth,
          },
          notification,
        );

        if (success) {
          sent++;
          // Track quest reminder sent
          for (const questId of user.incompleteQuests ?? []) {
            trackPayload(
              buildTrackPayload("quest_reminder_sent", {
                quest_id: questId,
                user_id: user.userId,
                channel: "push",
              }),
            ).catch(() => undefined);
          }
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`[quest-reminder] Failed for user ${user.userId}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      sent,
      failed,
      eligible: eligibleUsers.length,
      checked: usersWithSubs.length,
    });
  } catch (error) {
    console.error("[quest-reminder] Cron failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
