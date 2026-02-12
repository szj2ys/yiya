import { describe, expect, it } from "vitest";

import { buildTrackPayload } from "@/lib/analytics";

describe("analytics contract", () => {
  it("should enforce event payload types when tracking", () => {
    const payload = buildTrackPayload("lesson_complete", {
      lesson_id: 123,
      hearts_remaining: 3,
    });

    expect(payload.event).toBe("lesson_complete");
    expect(payload.properties).toMatchObject({
      schema_version: 1,
      lesson_id: 123,
      hearts_remaining: 3,
    });
    expect(typeof payload.properties.ts).toBe("number");
  });
});

