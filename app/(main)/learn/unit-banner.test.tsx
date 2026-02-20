import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { UnitBanner } from "./unit-banner";

describe("UnitBanner", () => {
  it("should show correct percentage in ring", () => {
    render(
      <UnitBanner
        title="Unit 1"
        description="Learn basics"
        completedLessons={3}
        totalLessons={5}
      />
    );

    const label = screen.getByTestId("progress-label");
    expect(label).toHaveTextContent("3/5");
  });

  it("should show checkmark at 100%", () => {
    const { container } = render(
      <UnitBanner
        title="Unit 1"
        description="Learn basics"
        completedLessons={5}
        totalLessons={5}
      />
    );

    const label = screen.getByTestId("progress-label");
    expect(label).toHaveTextContent("5/5");

    // The SVG should contain a check icon (rendered as <svg> with class containing check attributes)
    // The Check icon from lucide-react renders as an SVG with specific paths
    const desktopRing = screen.getByTestId("progress-ring-desktop");
    const svgElement = desktopRing.querySelector("svg");
    expect(svgElement).toBeTruthy();
    // When complete, the first circle should have a green fill
    const circles = svgElement!.querySelectorAll("circle");
    expect(circles[0]).toHaveAttribute("fill", "#22c55e");
  });

  it("should show completion badge when all lessons done", () => {
    render(
      <UnitBanner
        title="Unit 1"
        description="Learn basics"
        completedLessons={5}
        totalLessons={5}
      />
    );

    const badge = screen.getByTestId("unit-complete-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("Unit Complete!");
  });

  it("should not show badge when lessons remain", () => {
    render(
      <UnitBanner
        title="Unit 1"
        description="Learn basics"
        completedLessons={3}
        totalLessons={5}
      />
    );

    expect(screen.queryByTestId("unit-complete-badge")).not.toBeInTheDocument();
  });

  it("should not show badge when totalLessons is 0", () => {
    render(
      <UnitBanner
        title="Unit 1"
        description="Empty unit"
        completedLessons={0}
        totalLessons={0}
      />
    );

    expect(screen.queryByTestId("unit-complete-badge")).not.toBeInTheDocument();
    const label = screen.getByTestId("progress-label");
    expect(label).toHaveTextContent("0/0");
  });

  it("should render title and description", () => {
    render(
      <UnitBanner
        title="Unit 1"
        description="Learn basics"
        completedLessons={0}
        totalLessons={5}
      />
    );

    expect(screen.getByText("Unit 1")).toBeInTheDocument();
    expect(screen.getByText("Learn basics")).toBeInTheDocument();
  });

  it("should show 0% progress when no lessons completed", () => {
    const { container } = render(
      <UnitBanner
        title="Unit 1"
        description="Learn basics"
        completedLessons={0}
        totalLessons={5}
      />
    );

    const label = screen.getByTestId("progress-label");
    expect(label).toHaveTextContent("0/5");

    // First circle should not have a green fill (not complete)
    const desktopRing = screen.getByTestId("progress-ring-desktop");
    const circles = desktopRing.querySelectorAll("circle");
    expect(circles[0]).toHaveAttribute("fill", "none");
  });

  it("should have mobile and desktop progress rings", () => {
    render(
      <UnitBanner
        title="Unit 1"
        description="Learn basics"
        completedLessons={2}
        totalLessons={5}
      />
    );

    expect(screen.getByTestId("progress-ring-mobile")).toBeInTheDocument();
    expect(screen.getByTestId("progress-ring-desktop")).toBeInTheDocument();
  });
});
