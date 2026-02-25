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
