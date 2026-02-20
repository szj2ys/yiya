import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Loading from "./loading";

describe("Quests loading skeleton", () => {
  it("should render quests skeleton layout", () => {
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

    // Should render image placeholder (h-[90px] w-[90px] rounded-full)
    const imageBlock = container.querySelector(".h-\\[90px\\].w-\\[90px\\].rounded-full");
    expect(imageBlock).toBeInTheDocument();

    // Should render title placeholder (h-8 w-40)
    const titleBlock = container.querySelector(".h-8.w-40");
    expect(titleBlock).toBeInTheDocument();

    // Should render 5 quest item placeholders (h-16 rounded-xl)
    const questItems = container.querySelectorAll(".h-16.rounded-xl");
    expect(questItems.length).toBe(5);
  });
});
