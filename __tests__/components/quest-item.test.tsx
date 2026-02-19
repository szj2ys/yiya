import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/actions/quest-rewards", () => ({
  claimQuestReward: vi.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

import { QuestItem } from "@/components/quest-item";

beforeEach(() => {
  localStorageMock.clear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
});

describe("QuestItem (quests page)", () => {
  it("should display claimed state with reward amount", () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "yiya_claimed_quests_20") return "true";
      return null;
    });

    render(
      <QuestItem
        title="Earn 20 XP"
        value={20}
        reward={5}
        points={100}
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
      />,
    );

    const progressBar = document.querySelector('[role="progressbar"]');
    const valueNow = Number(progressBar?.getAttribute("aria-valuenow"));
    expect(valueNow).toBeLessThanOrEqual(100);
  });
});
