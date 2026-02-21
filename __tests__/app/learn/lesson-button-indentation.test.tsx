import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { LessonButton } from "@/app/(main)/learn/lesson-button";

const defaultProps = {
  id: 1,
  totalCount: 10,
  percentage: 0,
  title: "Colors",
};

describe("LessonButton – indentation clamping", () => {
  it("should clamp indentation offset for small screens", () => {
    // cycleIndex 2 → indentationLevel = 2 → unclamped would be 80px
    // With the clamp, it should be capped at 60px
    const { container } = render(
      <LessonButton {...defaultProps} index={2} current />
    );

    const innerDiv = container.querySelector("a > div") as HTMLElement;
    expect(innerDiv).not.toBeNull();
    expect(innerDiv.style.right).toBe("60px");
  });

  it("should not alter indentation when already within bounds", () => {
    // cycleIndex 1 → indentationLevel = 1 → 40px (within 60px cap)
    const { container } = render(
      <LessonButton {...defaultProps} index={1} current />
    );

    const innerDiv = container.querySelector("a > div") as HTMLElement;
    expect(innerDiv).not.toBeNull();
    expect(innerDiv.style.right).toBe("40px");
  });

  it("should handle zero indentation", () => {
    // cycleIndex 0 → indentationLevel = 0 → 0px
    const { container } = render(
      <LessonButton {...defaultProps} index={0} current />
    );

    const innerDiv = container.querySelector("a > div") as HTMLElement;
    expect(innerDiv).not.toBeNull();
    expect(innerDiv.style.right).toBe("0px");
  });

  it("should handle negative indentation levels without clamping to positive", () => {
    // cycleIndex 5 → indentationLevel = 4 - 5 = -1 → -1 * 40 = -40
    // Math.min(-40, 60) = -40, so negative values pass through
    const { container } = render(
      <LessonButton {...defaultProps} index={5} current />
    );

    const innerDiv = container.querySelector("a > div") as HTMLElement;
    expect(innerDiv).not.toBeNull();
    expect(innerDiv.style.right).toBe("-40px");
  });
});
