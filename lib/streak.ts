export const DAY_IN_MS = 86_400_000;
export const TWO_DAYS_IN_MS = 172_800_000;

export const computeNextStreak = (params: {
  currentStreak: number;
  lastLessonAt: Date | null;
  now: Date;
}) => {
  const { currentStreak, lastLessonAt, now } = params;

  if (!lastLessonAt) {
    return { streak: 1, shouldUpdateStreak: true };
  }

  const elapsedMs = now.getTime() - lastLessonAt.getTime();

  if (elapsedMs > TWO_DAYS_IN_MS) {
    return { streak: 1, shouldUpdateStreak: true };
  }

  if (elapsedMs >= DAY_IN_MS) {
    return { streak: currentStreak + 1, shouldUpdateStreak: true };
  }

  return { streak: currentStreak, shouldUpdateStreak: false };
};
