import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Loading from "./loading";

describe("Learn loading skeleton", () => {
  it("should render skeleton blocks instead of spinner", () => {
    const { container } = render(<Loading />);

    // Should contain animate-pulse skeleton blocks
    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);

    // Should NOT contain the old Loader spinner
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeNull();

    // Should have the page wrapper with px-6 padding
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("px-6");

    // Should render header placeholder (h-8 w-48)
    const headerBlock = container.querySelector(".h-8.w-48");
    expect(headerBlock).toBeInTheDocument();

    // Should render ContinueCta placeholder (h-24 rounded-2xl)
    const ctaBlock = container.querySelector(".h-24.rounded-2xl");
    expect(ctaBlock).toBeInTheDocument();

    // Should render DailyGoal placeholder (h-16 rounded-2xl)
    const goalBlock = container.querySelector(".h-16.rounded-2xl");
    expect(goalBlock).toBeInTheDocument();

    // Should render DailyQuestsCard placeholder (h-32 rounded-2xl)
    const questsBlock = container.querySelector(".h-32.rounded-2xl");
    expect(questsBlock).toBeInTheDocument();

    // Should render LearningProgress placeholder (h-28 rounded-2xl)
    const progressBlock = container.querySelector(".h-28.rounded-2xl");
    expect(progressBlock).toBeInTheDocument();

    // Should render 3 unit placeholders (h-40 rounded-2xl)
    const unitBlocks = container.querySelectorAll(".h-40.rounded-2xl");
    expect(unitBlocks.length).toBe(3);
  });
});
