import { describe, expect, it, vi } from "vitest";

import { buildTrackPayload } from "@/lib/analytics";

const captureSpy = vi.fn();

vi.mock("posthog-js", () => ({
  default: {
    capture: captureSpy,
  },
}));

describe("posthogDispatcher", () => {
  it("should call posthog.capture with correct event name and properties", async () => {
    const { posthogDispatcher } = await import("@/lib/analytics-posthog");

    const payload = buildTrackPayload("lesson_start", { lesson_id: 123 });

    posthogDispatcher(payload);

    expect(captureSpy).toHaveBeenCalledWith(payload.event, payload.properties);
  });
});
