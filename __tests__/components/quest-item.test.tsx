import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/actions/quest-rewards", () => ({
  claimQuestReward: vi.fn(),
}));

import { QuestItem } from "@/components/quest-item";

describe("QuestItem (quests page)", () => {
  it("should display claimed state with reward amount", () => {
    render(
      <QuestItem
        title="Earn 20 XP"
        value={20}
        reward={5}
        points={100}
        claimed={true}
      />,
    );

    expect(screen.getByText("Claimed +5 XP")).toBeInTheDocument();
  });

  it("should show claim button with reward when quest is complete and unclaimed", () => {
    render(
      <QuestItem
        title="Earn 50 XP"
        value={50}
        reward={10}
        points={100}
        claimed={false}
      />,
    );

    const claimButton = screen.getByRole("button", { name: /claim \+10 xp/i });
    expect(claimButton).toBeInTheDocument();
  });

  it("should not show claim button when quest is incomplete", () => {
    render(
      <QuestItem
        title="Earn 500 XP"
        value={500}
        reward={50}
        points={100}
        claimed={false}
      />,
    );

    const claimButton = screen.queryByRole("button", { name: /claim/i });
    expect(claimButton).not.toBeInTheDocument();
  });

  it("should cap progress at 100%", () => {
    render(
      <QuestItem
        title="Earn 20 XP"
        value={20}
        reward={5}
        points={200}
        claimed={false}
      />,
    );

    const progressBar = document.querySelector('[role="progressbar"]');
    const valueNow = Number(progressBar?.getAttribute("aria-valuenow"));
    expect(valueNow).toBeLessThanOrEqual(100);
  });
});
