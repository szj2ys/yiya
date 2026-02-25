import { DAY_IN_MS } from "@/constants";

export { DAY_IN_MS };
export const TWO_DAYS_IN_MS = 172_800_000;

/**
 * Convert a Date to a "YYYY-MM-DD" string in the user's local timezone.
 * `offsetMinutes` follows the `Date.getTimezoneOffset()` convention:
 *   positive = west of UTC (e.g. 480 for UTC-8),
 *   negative = east of UTC (e.g. -540 for UTC+9).
 */
export const toLocalDateString = (
  date: Date,
  offsetMinutes: number,
): string => {
  // getTimezoneOffset returns minutes *behind* UTC, so subtract to get local time.
  const localMs = date.getTime() - offsetMinutes * 60_000;
  const local = new Date(localMs);
  // Use UTC methods on the shifted date to extract year/month/day.
  const y = local.getUTCFullYear();
  const m = String(local.getUTCMonth() + 1).padStart(2, "0");
  const d = String(local.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Return the number of calendar days between two dates in the user's timezone.
 * Result is always >= 0 (assumes `now >= lastLessonAt`).
 */
const calendarDayDiff = (
  now: Date,
  lastLessonAt: Date,
  offsetMinutes: number,
): number => {
  const nowDateStr = toLocalDateString(now, offsetMinutes);
  const lastDateStr = toLocalDateString(lastLessonAt, offsetMinutes);

  // Parse YYYY-MM-DD to epoch-day for simple integer diff.
  const toEpochDay = (ds: string) => {
    const [y, m, d] = ds.split("-").map(Number);
    return Math.floor(Date.UTC(y, m - 1, d) / DAY_IN_MS);
  };

  return toEpochDay(nowDateStr) - toEpochDay(lastDateStr);
};

export const computeNextStreak = (params: {
  currentStreak: number;
  lastLessonAt: Date | null;
  now: Date;
  currentLongestStreak?: number;
  hasFreezeForMissedDay?: boolean;
  userTimezoneOffset?: number;
}) => {
  const {
    currentStreak,
    lastLessonAt,
    now,
    currentLongestStreak = 0,
    hasFreezeForMissedDay = false,
    userTimezoneOffset,
  } = params;

  if (!lastLessonAt) {
    const streak = 1;
    return {
      streak,
      shouldUpdateStreak: true,
      longestStreak: Math.max(streak, currentLongestStreak),
    };
  }

  // When a timezone offset is provided, use calendar-day comparison.
  // Otherwise fall back to the legacy millisecond-based logic for backward compatibility.
  if (userTimezoneOffset !== undefined) {
    const dayDiff = calendarDayDiff(now, lastLessonAt, userTimezoneOffset);

    if (dayDiff === 0) {
      // Same local day — no streak change.
      return {
        streak: currentStreak,
        shouldUpdateStreak: false,
        longestStreak: currentLongestStreak,
      };
    }

    if (dayDiff === 1) {
      // Consecutive local day — increment streak.
      const streak = currentStreak + 1;
      return {
        streak,
        shouldUpdateStreak: true,
        longestStreak: Math.max(streak, currentLongestStreak),
      };
    }

    if (dayDiff === 2 && hasFreezeForMissedDay) {
      // Missed exactly 1 day but freeze protects it.
      return {
        streak: currentStreak,
        shouldUpdateStreak: false,
        longestStreak: currentLongestStreak,
      };
    }

    // Gap of 2+ days (without applicable freeze) — reset.
    const streak = 1;
    return {
      streak,
      shouldUpdateStreak: true,
      longestStreak: Math.max(streak, currentLongestStreak),
    };
  }

  // --- Legacy path (no timezone offset) ---
  const elapsedMs = now.getTime() - lastLessonAt.getTime();

  if (elapsedMs > TWO_DAYS_IN_MS) {
    const streak = 1;
    return {
      streak,
      shouldUpdateStreak: true,
      longestStreak: Math.max(streak, currentLongestStreak),
    };
  }

  if (elapsedMs >= DAY_IN_MS) {
    if (elapsedMs > DAY_IN_MS && hasFreezeForMissedDay) {
      return {
        streak: currentStreak,
        shouldUpdateStreak: false,
        longestStreak: currentLongestStreak,
      };
    }

    const streak = currentStreak + 1;
    return {
      streak,
      shouldUpdateStreak: true,
      longestStreak: Math.max(streak, currentLongestStreak),
    };
  }

  return {
    streak: currentStreak,
    shouldUpdateStreak: false,
    longestStreak: currentLongestStreak,
  };
};
