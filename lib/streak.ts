export const DAY_IN_MS = 86_400_000;
export const TWO_DAYS_IN_MS = 172_800_000;

export const computeNextStreak = (params: {
  currentStreak: number;
  lastLessonAt: Date | null;
  now: Date;
  currentLongestStreak?: number;
  hasFreezeForMissedDay?: boolean;
}) => {
  const {
    currentStreak,
    lastLessonAt,
    now,
    currentLongestStreak = 0,
    hasFreezeForMissedDay = false,
  } = params;

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
    // More than 2 days: freeze can only protect 1 missed day,
    // so if elapsed > 2 days the streak resets regardless.
    const streak = 1;
    return {
      streak,
      shouldUpdateStreak: true,
      longestStreak: Math.max(streak, currentLongestStreak),
    };
  }

  if (elapsedMs >= DAY_IN_MS) {
    // Between 1 and 2 days elapsed.
    // If the user missed a day AND has a freeze, preserve the streak
    // (don't increment, just maintain). Otherwise, increment normally
    // because the user completed within the next-day window.
    if (elapsedMs > DAY_IN_MS && hasFreezeForMissedDay) {
      // Freeze protects the missed day: maintain current streak, don't increment.
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
