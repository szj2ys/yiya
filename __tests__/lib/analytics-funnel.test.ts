import { describe, expect, it, beforeEach } from "vitest";

import {
  buildTrackPayload,
  setTrackDispatcher,
  track,
  type AnalyticsEventName,
  type TrackPayload,
} from "@/lib/analytics";

describe("analytics funnel events", () => {
  const captured: TrackPayload<AnalyticsEventName>[] = [];

  beforeEach(() => {
    captured.length = 0;
    setTrackDispatcher((payload) => {
      captured.push(payload);
    });
  });

  it("should fire all funnel events in correct order", async () => {
    // Step 1: page_view (landing)
    await track("page_view", { page: "/" });

    // Step 2: signup_completed
    await track("signup_completed", { user_id: "u_123" });

    // Step 3: first_lesson_started
    await track("first_lesson_started", {
      user_id: "u_123",
      lesson_id: 1,
      course_id: 1,
    });

    // Step 4: user_activated
    await track("user_activated", { user_id: "u_123", lesson_count: 1 });

    // Step 5 & 6: session_start (day 2 and day 7 — same event, different timestamps)
    await track("session_start", {});
    await track("session_start", {});

    // Verify all 6 events fired
    expect(captured).toHaveLength(6);

    // Verify correct event order
    const eventNames = captured.map((p) => p.event);
    expect(eventNames).toEqual([
      "page_view",
      "signup_completed",
      "first_lesson_started",
      "user_activated",
      "session_start",
      "session_start",
    ]);

    // Verify each payload has required base properties
    for (const payload of captured) {
      expect(payload.properties.schema_version).toBe(1);
      expect(typeof payload.properties.ts).toBe("number");
    }
  });

  it("should include correct properties for page_view event", () => {
    const payload = buildTrackPayload("page_view", { page: "/" });
    expect(payload.event).toBe("page_view");
    expect(payload.properties.page).toBe("/");
  });

  it("should include correct properties for first_lesson_started event", () => {
    const payload = buildTrackPayload("first_lesson_started", {
      user_id: "u_456",
      lesson_id: 42,
      course_id: 7,
    });
    expect(payload.event).toBe("first_lesson_started");
    expect(payload.properties.user_id).toBe("u_456");
    expect(payload.properties.lesson_id).toBe(42);
    expect(payload.properties.course_id).toBe(7);
  });
});
