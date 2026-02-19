import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/actions/quest-rewards", () => ({
  claimQuestReward: vi.fn(),
}));

import { Quests } from "@/components/quests";

describe("Quests sidebar", () => {
  it("should show claim button when quest is complete", () => {
    render(<Quests points={100} claimedQuestValues={[]} />);

    // "Earn 20 XP", "Earn 50 XP", "Earn 100 XP" are all complete
    const claimButtons = screen.getAllByRole("button", { name: /claim/i });
    expect(claimButtons.length).toBe(3);
  });

  it("should cap progress at 100%", () => {
    render(<Quests points={200} claimedQuestValues={[]} />);

    // The "Earn 20 XP" quest has 1000% raw progress — should be capped
    // The "Earn 100 XP" quest has 200% raw progress — should be capped
    // Check that no progress bar exceeds 100 by inspecting rendered values
    const progressBars = Array.from(document.querySelectorAll('[role="progressbar"]'));
    for (const bar of progressBars) {
      const valueNow = Number(bar.getAttribute("aria-valuenow"));
      expect(valueNow).toBeLessThanOrEqual(100);
    }
  });

  it("should show checkmark for already claimed quests from server", () => {
    render(<Quests points={100} claimedQuestValues={[20]} />);

    // "Earn 20 XP" is claimed, so only 2 claim buttons remain
    const claimButtons = screen.getAllByRole("button", { name: /claim/i });
    expect(claimButtons.length).toBe(2);
  });

  it("should not show claim button for incomplete quests", () => {
    render(<Quests points={10} claimedQuestValues={[]} />);

    const claimButtons = screen.queryAllByRole("button", { name: /claim/i });
    expect(claimButtons.length).toBe(0);
  });
});
