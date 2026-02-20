import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Loading from "./loading";

describe("Shop loading skeleton", () => {
  it("should render shop skeleton layout", () => {
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

    // Should render title placeholder (h-8 w-32)
    const titleBlock = container.querySelector(".h-8.w-32");
    expect(titleBlock).toBeInTheDocument();

    // Should render 2 shop item card placeholders (h-24 rounded-2xl)
    const shopCards = container.querySelectorAll(".h-24.rounded-2xl");
    expect(shopCards.length).toBe(2);
  });
});
