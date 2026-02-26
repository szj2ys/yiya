import { NextResponse } from "next/server";
import { and, gt, lt, eq, isNotNull } from "drizzle-orm";

import db from "@/db/drizzle";
import { userProgress, streakFreezes } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import {
  buildStreakReminderSubject,
  buildStreakReminderHtml,
} from "@/lib/email/templates/streak-reminder";

const MAX_EMAILS_PER_RUN = 100;
const REMINDER_HOUR = 19;

function isLocalHourInWindow(timezone: string, targetHour: number): boolean {
  try {
    const localHour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false,
      }).format(new Date()),
    );
    return localHour === targetHour;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);

    const todayDateStr = now.toISOString().slice(0, 10);

    const atRiskUsers = await db
      .select({
        userId: userProgress.userId,
        streak: userProgress.streak,
        timezone: userProgress.timezone,
      })
      .from(userProgress)
      .where(
        and(
          gt(userProgress.streak, 0),
          eq(userProgress.emailReminders, true),
          isNotNull(userProgress.lastLessonAt),
          lt(userProgress.lastLessonAt, startOfToday),
        ),
      )
      .limit(MAX_EMAILS_PER_RUN);

    const timezoneFiltered = atRiskUsers.filter((u) => {
      if (!u.timezone) return true;
      return isLocalHourInWindow(u.timezone, REMINDER_HOUR);
    });

    const freezes = timezoneFiltered.length > 0
      ? await db
          .select({ userId: streakFreezes.userId })
          .from(streakFreezes)
          .where(eq(streakFreezes.usedDate, todayDateStr))
      : [];

    const frozenUserIds = new Set(freezes.map((f) => f.userId));
    const eligibleUsers = timezoneFiltered.filter((u) => !frozenUserIds.has(u.userId));

    let sent = 0;
    let failed = 0;

    const { clerkClient } = await import("@clerk/nextjs");

    for (const user of eligibleUsers) {
      try {
        const clerkUser = await clerkClient.users.getUser(user.userId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress;

        if (!email) continue;

        const success = await sendEmail({
          to: email,
          subject: buildStreakReminderSubject(user.streak),
          html: buildStreakReminderHtml({
            streakCount: user.streak,
            userId: user.userId,
          }),
        });

        if (success) sent++;
        else failed++;
      } catch (error) {
        console.error(`[streak-reminder] Failed for user ${user.userId}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      atRisk: atRiskUsers.length,
      timezoneFiltered: timezoneFiltered.length,
      frozen: frozenUserIds.size,
      eligible: eligibleUsers.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error("[streak-reminder] Cron failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
