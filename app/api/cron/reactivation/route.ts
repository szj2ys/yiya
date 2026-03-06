import { NextResponse } from "next/server";
import { and, eq, gt, isNotNull, lt } from "drizzle-orm";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { DAY_IN_MS } from "@/constants";

const MAX_EMAILS_PER_RUN = 100;
const INACTIVE_DAYS = 7;

/**
 * Cron: Send reactivation emails to inactive users.
 *
 * "Inactive" = hasn't learned for 7+ days, but had previous activity.
 *
 * Protected by CRON_SECRET header (Bearer token).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoffDate = new Date(Date.now() - INACTIVE_DAYS * DAY_IN_MS);
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    // Find users who:
    // 1. Have previous activity (lastLessonAt is not null)
    // 2. Haven't learned for 7+ days
    // 3. Have email reminders enabled
    const inactiveUsers = await db
      .select({
        userId: userProgress.userId,
        streak: userProgress.streak,
        points: userProgress.points,
        lastLessonAt: userProgress.lastLessonAt,
      })
      .from(userProgress)
      .where(
        and(
          isNotNull(userProgress.lastLessonAt),
          lt(userProgress.lastLessonAt, cutoffDate),
          gt(userProgress.lastLessonAt, new Date(Date.now() - 30 * DAY_IN_MS)), // Haven't been gone too long
          eq(userProgress.emailReminders, true)
        )
      )
      .limit(MAX_EMAILS_PER_RUN);

    let sent = 0;
    let failed = 0;

    const { clerkClient } = await import("@clerk/nextjs");

    for (const user of inactiveUsers) {
      try {
        const clerkUser = await clerkClient.users.getUser(user.userId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress;

        if (!email) continue;

        // Simple reactivation email
        const success = await sendEmail({
          to: email,
          subject: "We miss you on Yiya! Come back for 2x XP",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #16a34a;">We miss you!</h1>
              <p>Hi there,</p>
              <p>It's been ${INACTIVE_DAYS} days since your last lesson on Yiya. Your ${user.streak}-day streak is waiting for you!</p>
              <p><strong>Come back today and get 2x XP on your first lesson!</strong></p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="https://yiya.app/learn"
                   style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Continue Learning
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">You've earned ${user.points} XP so far. Keep it going!</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">
                You're receiving this because you have email reminders enabled.
                <a href="https://yiya.app/settings">Manage preferences</a>
              </p>
            </div>
          `,
        });

        if (success) sent++;
        else failed++;
      } catch (error) {
        console.error(`[reactivation] Failed for user ${user.userId}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      inactive: inactiveUsers.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error("[reactivation] Cron failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
