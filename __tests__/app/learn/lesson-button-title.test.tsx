import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("react-circular-progressbar", () => ({
  CircularProgressbarWithChildren: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="circular-progress">{children}</div>
  ),
}));

import { LessonButton } from "@/app/(main)/learn/lesson-button";

const defaultProps = {
  id: 1,
  index: 0,
  totalCount: 5,
  percentage: 0,
  title: "Colors",
};

describe("LessonButton – title display", () => {
  it("should display lesson title below the button circle", () => {
    render(<LessonButton {...defaultProps} current />);
    expect(screen.getByText("Colors")).toBeInTheDocument();
  });

  it("should apply semibold styling for current lessons", () => {
    render(<LessonButton {...defaultProps} current />);
    const titleEl = screen.getByText("Colors");
    expect(titleEl.className).toContain("font-semibold");
    expect(titleEl.className).toContain("text-neutral-700");
  });

  it("should apply medium styling for locked lessons", () => {
    render(<LessonButton {...defaultProps} locked />);
    const titleEl = screen.getByText("Colors");
    expect(titleEl.className).toContain("font-medium");
    expect(titleEl.className).toContain("text-neutral-500");
  });

  it("should apply semibold styling for completed lessons", () => {
    // Not current, not locked = completed
    render(<LessonButton {...defaultProps} />);
    const titleEl = screen.getByText("Colors");
    expect(titleEl.className).toContain("font-semibold");
    expect(titleEl.className).toContain("text-neutral-700");
  });

  it("should truncate long titles", () => {
    render(<LessonButton {...defaultProps} current />);
    const titleEl = screen.getByText("Colors");
    expect(titleEl.className).toContain("truncate");
    expect(titleEl.className).toContain("max-w-[100px]");
  });
});
