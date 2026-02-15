import { describe, expect, it } from "vitest";

import { getReviewSummary } from "./practice-summary";

describe("PracticeEntry", () => {
  it("should display dynamic time estimate based on item count", () => {
    expect(getReviewSummary(8)).toBe("8 items · ~2 min");
  });

  it("should show empty state when no items", () => {
    expect(getReviewSummary(0)).toBe("No items to review");
  });

  it("should round up to at least one minute", () => {
    expect(getReviewSummary(1)).toBe("1 items · ~1 min");
  });
});
