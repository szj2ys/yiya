import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { DailyQuestsCard, DailyQuestItem } from "@/app/(main)/learn/daily-quests-card";

// Mock the server action
vi.mock("@/actions/daily-quests", () => ({
  claimDailyQuest: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const baseQuests: DailyQuestItem[] = [
  {
    id: "complete_lesson",
    title: "Complete a lesson",
    description: "Finish any lesson today",
    xpReward: 5,
    completed: false,
    claimed: false,
  },
  {
    id: "hit_daily_goal",
    title: "Hit your daily goal",
    description: "Complete your daily lesson target",
    xpReward: 10,
    completed: false,
    claimed: false,
  },
  {
    id: "practice_review",
    title: "Review your cards",
    description: "Do at least one practice review session",
    xpReward: 10,
    completed: false,
    claimed: false,
  },
];

describe("DailyQuestsCard", () => {
  it("should render all 3 quests", () => {
    render(<DailyQuestsCard quests={baseQuests} />);

    expect(screen.getByText("Complete a lesson")).toBeInTheDocument();
    expect(screen.getByText("Hit your daily goal")).toBeInTheDocument();
    expect(screen.getByText("Review your cards")).toBeInTheDocument();
  });

  it("should render the header", () => {
    render(<DailyQuestsCard quests={baseQuests} />);

    expect(screen.getByText("Today's Quests")).toBeInTheDocument();
  });

  it("should show claim button for completed unclaimed quest", () => {
    const quests: DailyQuestItem[] = [
      { ...baseQuests[0], completed: true },
      baseQuests[1],
      baseQuests[2],
    ];

    render(<DailyQuestsCard quests={quests} />);

    expect(screen.getByText("Claim +5 XP")).toBeInTheDocument();
  });

  it("should show checkmark for claimed quest", () => {
    const quests: DailyQuestItem[] = [
      { ...baseQuests[0], completed: true, claimed: true },
      baseQuests[1],
      baseQuests[2],
    ];

    render(<DailyQuestsCard quests={quests} />);

    expect(screen.getByText("Claimed")).toBeInTheDocument();
    expect(screen.queryByText("Claim +5 XP")).not.toBeInTheDocument();
  });

  it("should show grayed out XP for incomplete quest", () => {
    render(<DailyQuestsCard quests={baseQuests} />);

    // All quests are incomplete, so we should see the XP text but not claim buttons
    const xpTexts = screen.getAllByText(/\+\d+ XP/);
    expect(xpTexts.length).toBe(3);

    // None should be claim buttons
    expect(screen.queryByText("Claim +5 XP")).not.toBeInTheDocument();
    expect(screen.queryByText("Claim +10 XP")).not.toBeInTheDocument();
  });

  it("should show descriptions for each quest", () => {
    render(<DailyQuestsCard quests={baseQuests} />);

    expect(screen.getByText("Finish any lesson today")).toBeInTheDocument();
    expect(screen.getByText("Complete your daily lesson target")).toBeInTheDocument();
    expect(screen.getByText("Do at least one practice review session")).toBeInTheDocument();
  });

  it("should show multiple claim buttons when multiple quests are completed", () => {
    const quests: DailyQuestItem[] = [
      { ...baseQuests[0], completed: true },
      { ...baseQuests[1], completed: true },
      baseQuests[2],
    ];

    render(<DailyQuestsCard quests={quests} />);

    expect(screen.getByText("Claim +5 XP")).toBeInTheDocument();
    expect(screen.getByText("Claim +10 XP")).toBeInTheDocument();
  });
});
