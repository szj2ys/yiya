export const POINTS_TO_REFILL = 10;
export const STREAK_FREEZE_COST = 50;
export const MAX_HEARTS = 5;
export const XP_PER_CHALLENGE = 10;
export const DAY_IN_MS = 86_400_000;

export const DAILY_QUESTS = [
  { id: "complete_lesson", title: "Complete a lesson", description: "Finish any lesson today", xpReward: 5 },
  { id: "hit_daily_goal", title: "Hit your daily goal", description: "Complete your daily lesson target", xpReward: 10 },
  { id: "practice_review", title: "Review your cards", description: "Do at least one practice review session", xpReward: 10 },
] as const;

/**
 * Number of completed lessons required to consider a user "activated".
 * Activation = the user has completed their first full lesson (not the
 * onboarding sample challenge). Used to fire the `user_activated` analytics
 * event exactly once per user.
 */
export const ACTIVATION_LESSON_COUNT = 1;

export const STREAK_MILESTONES = [
  { days: 3, xpReward: 10, label: "3-day streak" },
  { days: 7, xpReward: 25, label: "1-week streak", grantsShield: true },
  { days: 14, xpReward: 50, label: "2-week streak" },
  { days: 30, xpReward: 100, label: "1-month streak" },
  { days: 60, xpReward: 200, label: "2-month streak" },
  { days: 100, xpReward: 500, label: "100-day streak" },
] as const;

export const quests = [
  {
    title: "Earn 20 XP",
    value: 20,
    reward: 5,
  },
  {
    title: "Earn 50 XP",
    value: 50,
    reward: 10,
  },
  {
    title: "Earn 100 XP",
    value: 100,
    reward: 25,
  },
  {
    title: "Earn 500 XP",
    value: 500,
    reward: 50,
  },
  {
    title: "Earn 1000 XP",
    value: 1000,
    reward: 100,
  },
];
