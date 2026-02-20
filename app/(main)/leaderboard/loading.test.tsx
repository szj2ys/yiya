import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Loading from "./loading";

describe("Leaderboard loading skeleton", () => {
  it("should render leaderboard skeleton layout", () => {
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

    // Should render title placeholder (h-8 w-48)
    const titleBlock = container.querySelector(".h-8.w-48");
    expect(titleBlock).toBeInTheDocument();

    // Should render subtitle placeholder (h-5 w-64)
    const subtitleBlock = container.querySelector(".h-5.w-64");
    expect(subtitleBlock).toBeInTheDocument();

    // Should render podium grid with 3 cards
    const podiumGrid = container.querySelector(".grid-cols-3");
    expect(podiumGrid).toBeInTheDocument();
    const podiumCards = podiumGrid?.querySelectorAll(".rounded-2xl");
    expect(podiumCards?.length).toBe(3);

    // Should render 7 list row placeholders (h-14 rounded-xl)
    const listRows = container.querySelectorAll(".h-14.rounded-xl");
    expect(listRows.length).toBe(7);
  });
});
