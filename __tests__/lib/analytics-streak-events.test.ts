import { describe, it, expect } from "vitest";
import { buildTrackPayload } from "@/lib/analytics";

describe("streak and goal analytics events", () => {
  it("should build payload for daily_goal_achieved", () => {
    const payload = buildTrackPayload("daily_goal_achieved", {
      lesson_count: 3,
      daily_goal: 3,
    });
    expect(payload.event).toBe("daily_goal_achieved");
    expect(payload.properties.lesson_count).toBe(3);
    expect(payload.properties.daily_goal).toBe(3);
    expect(payload.properties.schema_version).toBe(1);
  });

  it("should build payload for streak_milestone", () => {
    const payload = buildTrackPayload("streak_milestone", {
      streak: 30,
      milestone: 30,
    });
    expect(payload.event).toBe("streak_milestone");
    expect(payload.properties.streak).toBe(30);
    expect(payload.properties.milestone).toBe(30);
    expect(payload.properties.schema_version).toBe(1);
  });
});
