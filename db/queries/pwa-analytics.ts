import db from "@/db/drizzle";
import { pushSubscriptions, userProgress } from "@/db/schema";
import { count, sql } from "drizzle-orm";

/**
 * Get PWA installation funnel metrics
 * Used for analytics dashboard to track install conversion
 */
export async function getPwaInstallFunnel() {
  // Get total users with push subscriptions (proxy for PWA-capable users)
  const [{ value: totalSubscribedUsers }] = await db
    .select({ value: count() })
    .from(pushSubscriptions);

  // Get unique users with subscriptions
  const uniqueUsersResult = await db.execute(sql`
    SELECT COUNT(DISTINCT user_id) as count FROM push_subscriptions
  `);
  const uniqueUsers = Number(uniqueUsersResult.rows[0]?.count ?? 0);

  // Note: Actual install tracking requires analytics data
  // These metrics are derived from available data
  return {
    // Users who have push subscriptions (PWA-capable)
    pushSubscribedUsers: totalSubscribedUsers,
    uniqueUsersWithPush: uniqueUsers,
    // Placeholder for install metrics (would need analytics table)
    installPromptShown: null as number | null,
    installClicked: null as number | null,
    installCompleted: null as number | null,
  };
}

/**
 * Get users who are eligible for PWA install
 * (Have used the app at least 2 times but not installed)
 */
export async function getPwaEligibleUsers() {
  // This would require tracking session count in database
  // Currently tracked in localStorage only
  // Future: sync localStorage data to server for analytics
  return [];
}
