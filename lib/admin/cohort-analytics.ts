/**
 * Cohort retention analytics utilities for admin dashboard.
 * Provides functions to calculate retention rates by user cohort.
 */

export type Granularity = "week" | "month";

export type RetentionPoint = {
  day: number;
  rate: number; // 0-1
  activeUsers: number;
};

export type CohortData = {
  cohortDate: string; // ISO date string (YYYY-MM-DD for week/month start)
  cohortLabel: string; // Display label like "2025-W10" or "2025-Mar"
  size: number; // Total users in cohort
  retention: RetentionPoint[];
};

export type CohortSummary = {
  avgDay1Retention: number;
  avgDay7Retention: number;
  avgDay30Retention: number;
  trendDay1: "up" | "down" | "neutral";
  trendDay7: "up" | "down" | "neutral";
  trendDay30: "up" | "down" | "neutral";
};

// Standard retention checkpoints
export const RETENTION_DAYS = [0, 1, 3, 7, 14, 30, 60, 90];

/**
 * Format date to cohort label based on granularity
 */
export function formatCohortLabel(date: Date, granularity: Granularity): string {
  if (granularity === "week") {
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, "0")}`;
  } else {
    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "short" });
    return `${year}-${month}`;
  }
}

/**
 * Get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Get start of week (Monday) for a date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get start of month for a date
 */
export function getMonthStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get cohort start date based on granularity
 */
export function getCohortStart(date: Date, granularity: Granularity): Date {
  return granularity === "week" ? getWeekStart(date) : getMonthStart(date);
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((date2.getTime() - date1.getTime()) / oneDay);
}

/**
 * Mock user activity data for demonstration.
 * In production, this would query PostHog or database.
 */
export type UserActivity = {
  userId: string;
  signupDate: Date;
  activeDates: Date[]; // Dates when user had app_open or lesson_start
};

/**
 * Generate mock cohort data for demonstration
 */
export function generateMockCohortData(
  startDate: Date,
  endDate: Date,
  granularity: Granularity,
): CohortData[] {
  const cohorts: CohortData[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const cohortStart = getCohortStart(currentDate, granularity);
    const cohortLabel = formatCohortLabel(cohortStart, granularity);
    const cohortKey = cohortStart.toISOString().split("T")[0];

    // Generate mock cohort size (30-100 users)
    const size = Math.floor(Math.random() * 70) + 30;

    // Generate retention curve with realistic decay
    // Day 0: 100%, Day 1: 40-60%, Day 7: 20-35%, Day 30: 10-20%
    const baseRetention = 0.5 + Math.random() * 0.2; // Random base retention quality
    const retention: RetentionPoint[] = RETENTION_DAYS.map((day) => {
      let rate: number;
      if (day === 0) {
        rate = 1.0;
      } else if (day === 1) {
        rate = baseRetention * (0.8 + Math.random() * 0.2);
      } else if (day === 3) {
        rate = baseRetention * (0.5 + Math.random() * 0.15);
      } else if (day === 7) {
        rate = baseRetention * (0.35 + Math.random() * 0.15);
      } else if (day === 14) {
        rate = baseRetention * (0.25 + Math.random() * 0.1);
      } else if (day === 30) {
        rate = baseRetention * (0.15 + Math.random() * 0.1);
      } else if (day === 60) {
        rate = baseRetention * (0.08 + Math.random() * 0.07);
      } else {
        // Day 90
        rate = baseRetention * (0.05 + Math.random() * 0.05);
      }

      // Ensure realistic bounds
      rate = Math.max(0.01, Math.min(1.0, rate));
      const activeUsers = Math.round(size * rate);

      return { day, rate, activeUsers };
    });

    cohorts.push({
      cohortDate: cohortKey,
      cohortLabel,
      size,
      retention,
    });

    // Move to next period
    if (granularity === "week") {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return cohorts;
}

/**
 * Calculate cohort retention from user activity data
 */
export function calculateCohortRetention(
  userActivities: UserActivity[],
  startDate: Date,
  endDate: Date,
  granularity: Granularity,
): CohortData[] {
  // Group users by cohort
  const cohortMap = new Map<string, { users: UserActivity[]; cohortStart: Date }>();

  for (const user of userActivities) {
    const cohortStart = getCohortStart(user.signupDate, granularity);
    const cohortKey = cohortStart.toISOString().split("T")[0];

    if (!cohortMap.has(cohortKey)) {
      cohortMap.set(cohortKey, { users: [], cohortStart });
    }
    cohortMap.get(cohortKey)!.users.push(user);
  }

  // Calculate retention for each cohort
  const cohorts: CohortData[] = [];

  for (const [cohortKey, cohortInfo] of Array.from(cohortMap.entries())) {
    const { users, cohortStart } = cohortInfo;
    const cohortLabel = formatCohortLabel(cohortStart, granularity);
    const size = users.length;

    const retention: RetentionPoint[] = RETENTION_DAYS.map((day) => {
      const activeUsers = users.filter((user) =>
        user.activeDates.some((activeDate) => {
          const daysSinceSignup = daysBetween(cohortStart, activeDate);
          return daysSinceSignup >= day && daysSinceSignup < day + 1;
        }),
      ).length;

      const rate = size > 0 ? activeUsers / size : 0;

      return { day, rate, activeUsers };
    });

    cohorts.push({
      cohortDate: cohortKey,
      cohortLabel,
      size,
      retention,
    });
  }

  // Sort by date descending (newest first)
  return cohorts.sort((a, b) =>
    new Date(b.cohortDate).getTime() - new Date(a.cohortDate).getTime(),
  );
}

/**
 * Calculate summary metrics from cohort data
 */
export function calculateCohortSummary(
  cohorts: CohortData[],
  previousCohorts?: CohortData[],
): CohortSummary {
  const avgRetention = (day: number): number => {
    const rates = cohorts
      .map((c) => c.retention.find((r) => r.day === day)?.rate)
      .filter((r): r is number => r !== undefined);
    return rates.length > 0
      ? rates.reduce((a, b) => a + b, 0) / rates.length
      : 0;
  };

  const avgDay1 = avgRetention(1);
  const avgDay7 = avgRetention(7);
  const avgDay30 = avgRetention(30);

  const calculateTrend = (
    current: number,
    previous: number,
  ): "up" | "down" | "neutral" => {
    const diff = current - previous;
    if (Math.abs(diff) < 0.02) return "neutral";
    return diff > 0 ? "up" : "down";
  };

  let trendDay1: "up" | "down" | "neutral" = "neutral";
  let trendDay7: "up" | "down" | "neutral" = "neutral";
  let trendDay30: "up" | "down" | "neutral" = "neutral";

  if (previousCohorts && previousCohorts.length > 0) {
    const prevAvgDay1 =
      previousCohorts
        .map((c) => c.retention.find((r) => r.day === 1)?.rate)
        .filter((r): r is number => r !== undefined)
        .reduce((a, b) => a + b, 0) / previousCohorts.length;

    const prevAvgDay7 =
      previousCohorts
        .map((c) => c.retention.find((r) => r.day === 7)?.rate)
        .filter((r): r is number => r !== undefined)
        .reduce((a, b) => a + b, 0) / previousCohorts.length;

    const prevAvgDay30 =
      previousCohorts
        .map((c) => c.retention.find((r) => r.day === 30)?.rate)
        .filter((r): r is number => r !== undefined)
        .reduce((a, b) => a + b, 0) / previousCohorts.length;

    trendDay1 = calculateTrend(avgDay1, prevAvgDay1);
    trendDay7 = calculateTrend(avgDay7, prevAvgDay7);
    trendDay30 = calculateTrend(avgDay30, prevAvgDay30);
  }

  return {
    avgDay1Retention: avgDay1,
    avgDay7Retention: avgDay7,
    avgDay30Retention: avgDay30,
    trendDay1,
    trendDay7,
    trendDay30,
  };
}

/**
 * Format retention rate as percentage string
 */
export function formatRetentionRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/**
 * Get color intensity class for retention rate (for heatmap display)
 */
export function getRetentionColorClass(rate: number): string {
  if (rate >= 0.5) return "bg-green-600 text-white";
  if (rate >= 0.35) return "bg-green-500 text-white";
  if (rate >= 0.25) return "bg-green-400 text-white";
  if (rate >= 0.15) return "bg-yellow-400 text-neutral-900";
  if (rate >= 0.08) return "bg-orange-400 text-white";
  return "bg-red-400 text-white";
}

/**
 * Get retention data for a specific day across all cohorts
 * Useful for line charts
 */
export function getRetentionByDay(
  cohorts: CohortData[],
  day: number,
): { cohortLabel: string; rate: number }[] {
  return cohorts
    .map((c) => ({
      cohortLabel: c.cohortLabel,
      rate: c.retention.find((r) => r.day === day)?.rate ?? 0,
    }))
    .reverse(); // Oldest first for chart
}

/**
 * Get average retention curve across all cohorts
 */
export function getAverageRetentionCurve(
  cohorts: CohortData[],
): { day: number; avgRate: number }[] {
  return RETENTION_DAYS.map((day) => {
    const rates = cohorts
      .map((c) => c.retention.find((r) => r.day === day)?.rate)
      .filter((r): r is number => r !== undefined);

    const avgRate =
      rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;

    return { day, avgRate };
  });
}
