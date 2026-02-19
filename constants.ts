export const POINTS_TO_REFILL = 10;

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

/** localStorage key for tracking claimed quest rewards */
export const getQuestClaimedKey = (questValue: number) =>
  `yiya_claimed_quests_${questValue}`;
