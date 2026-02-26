import { describe, it, expect } from "vitest";
import { STREAK_MILESTONES } from "@/constants";

describe("STREAK_MILESTONES", () => {
  it("should have milestones sorted by days ascending", () => {
    const days = STREAK_MILESTONES.map((m) => m.days);
    const sorted = [...days].sort((a, b) => a - b);
    expect(days).toEqual(sorted);
  });

  it("should have 6 milestones", () => {
    expect(STREAK_MILESTONES).toHaveLength(6);
  });

  it("should grant shield at day 7 only", () => {
    const shieldMilestones = STREAK_MILESTONES.filter(
      (m) => "grantsShield" in m && m.grantsShield,
    );
    expect(shieldMilestones).toHaveLength(1);
    expect(shieldMilestones[0].days).toBe(7);
  });
});
