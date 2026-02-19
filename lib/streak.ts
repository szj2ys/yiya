export const DAY_IN_MS = 86_400_000;
export const TWO_DAYS_IN_MS = 172_800_000;

export const computeNextStreak = (params: {
  currentStreak: number;
  lastLessonAt: Date | null;
  now: Date;
  currentLongestStreak?: number;
}) => {
  const { currentStreak, lastLessonAt, now, currentLongestStreak = 0 } = params;

  if (!lastLessonAt) {
    const streak = 1;
    return {
      streak,
      shouldUpdateStreak: true,
      longestStreak: Math.max(streak, currentLongestStreak),
    };
  }

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
