import { and, eq, gte, lt, sql, desc } from "drizzle-orm";
import db from "@/db/drizzle";
import { userChurnRisk, userProgress, lessonCompletions } from "@/db/schema";

export type RiskLevel = "low" | "medium" | "high";

export interface RiskUser {
  userId: string;
  riskLevel: RiskLevel;
  riskReasons: string[];
  currentStreak: number;
  daysSinceLastLesson: number;
}

/**
 * Identify users at risk of churning
 * - High risk: 3+ days without learning
 * - Medium risk: 2 days without learning OR low completion rate
 * - Low risk: 1 day without learning (missed daily goal)
 */
export async function getAtRiskUsers(): Promise<RiskUser[]> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  // Get all active users with their progress
  const users = await db.query.userProgress.findMany({
    where: gte(userProgress.streak, 0),
  });

  const atRiskUsers: RiskUser[] = [];

  for (const user of users) {
    const riskReasons: string[] = [];
    let riskLevel: RiskLevel | null = null;

    // Check days since last lesson
    const daysSinceLastLesson = user.lastLessonAt
      ? Math.floor((now.getTime() - user.lastLessonAt.getTime()) / (24 * 60 * 60 * 1000))
      : 999;

    // High risk: 3+ days without learning
    if (daysSinceLastLesson >= 3) {
      riskLevel = "high";
      riskReasons.push("no_learning_3_days");
    }
    // Medium risk: 2 days without learning
    else if (daysSinceLastLesson >= 2) {
      riskLevel = "medium";
      riskReasons.push("no_learning_2_days");
    }
    // Low risk: 1 day without learning (streak at risk)
    else if (daysSinceLastLesson >= 1 && user.streak > 0) {
      riskLevel = "low";
      riskReasons.push("streak_at_risk");
    }

    // Additional: Check if hearts empty (paid conversion risk)
    if (user.hearts === 0) {
      riskReasons.push("hearts_empty");
    }

    if (riskLevel) {
      atRiskUsers.push({
        userId: user.userId,
        riskLevel,
        riskReasons,
        currentStreak: user.streak,
        daysSinceLastLesson,
      });
    }
  }

  return atRiskUsers;
}

/**
 * Save churn risk assessment for a user
 */
export async function saveChurnRisk(
  userId: string,
  riskLevel: RiskLevel,
  riskReasons: string[]
) {
  // Check if already exists for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await db.query.userChurnRisk.findFirst({
    where: and(
      eq(userChurnRisk.userId, userId),
      gte(userChurnRisk.detectedAt, today)
    ),
  });

  if (existing) {
    // Update existing record
    return await db
      .update(userChurnRisk)
      .set({
        riskLevel,
        riskReasons,
        detectedAt: new Date(),
      })
      .where(eq(userChurnRisk.id, existing.id));
  }

  // Create new record
  return await db.insert(userChurnRisk).values({
    userId,
    riskLevel,
    riskReasons,
    detectedAt: new Date(),
    intervened: false,
  });
}

/**
 * Mark user as intervened
 */
export async function markAsIntervened(userId: string) {
  return await db
    .update(userChurnRisk)
    .set({
      intervened: true,
      intervenedAt: new Date(),
    })
    .where(
      and(
        eq(userChurnRisk.userId, userId),
        eq(userChurnRisk.intervened, false)
      )
    );
}

/**
 * Get high risk users for intervention
 */
export async function getHighRiskUsers(limit: number = 100) {
  return await db.query.userChurnRisk.findMany({
    where: and(
      eq(userChurnRisk.riskLevel, "high"),
      eq(userChurnRisk.intervened, false)
    ),
    orderBy: [desc(userChurnRisk.detectedAt)],
    limit,
  });
}
