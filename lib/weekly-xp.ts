/**
 * Returns Monday 00:00:00 UTC of the current week.
 * ISO weeks start on Monday.
 */
export function getStartOfWeek(now: Date = new Date()): Date {
  const d = new Date(now);
  const day = d.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? 6 : day - 1; // days since Monday
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Compute the new weeklyXp value and whether weeklyXpResetAt should be updated.
 * If the user's weeklyXpResetAt is before the current week's Monday 00:00 UTC
 * (or null), reset weeklyXp to the XP amount. Otherwise, increment.
 */
export function computeWeeklyXp(
  currentWeeklyXp: number,
  weeklyXpResetAt: Date | null,
  xpGain: number,
  now: Date = new Date(),
): { weeklyXp: number; weeklyXpResetAt: Date } {
  const weekStart = getStartOfWeek(now);
  const needsReset = !weeklyXpResetAt || weeklyXpResetAt < weekStart;

  return {
    weeklyXp: needsReset ? xpGain : currentWeeklyXp + xpGain,
    weeklyXpResetAt: needsReset ? now : weeklyXpResetAt,
  };
}
