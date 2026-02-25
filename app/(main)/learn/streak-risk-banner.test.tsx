import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { StreakRiskBanner } from "./streak-risk-banner";

describe("StreakRiskBanner", () => {
  it("should show streak risk banner when todayLessonCount is 0 and streak > 0", () => {
    render(
      <StreakRiskBanner streak={5} todayLessonCount={0} hasFreezeToday={false} />,
    );

    expect(screen.getByTestId("streak-risk-banner")).toBeInTheDocument();
    expect(
      screen.getByText("你的 5 天连胜还差今天的课程！"),
    ).toBeInTheDocument();
  });

  it("should not render when todayLessonCount > 0", () => {
    const { container } = render(
      <StreakRiskBanner streak={5} todayLessonCount={1} hasFreezeToday={false} />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("should not render when streak is 0", () => {
    const { container } = render(
      <StreakRiskBanner streak={0} todayLessonCount={0} hasFreezeToday={false} />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("should show freeze message when hasFreezeToday is true", () => {
    render(
      <StreakRiskBanner streak={10} todayLessonCount={0} hasFreezeToday={true} />,
    );

    const banner = screen.getByTestId("streak-risk-banner");
    expect(banner).toBeInTheDocument();
    expect(
      screen.getByText("冻结保护中，但今天学习可以延续 10 天连胜"),
    ).toBeInTheDocument();
    // Freeze uses sky color scheme
    expect(banner.className).toContain("border-sky-200");
    expect(banner.className).toContain("bg-sky-50");
  });

  it("should use amber color scheme when no freeze is active", () => {
    render(
      <StreakRiskBanner streak={3} todayLessonCount={0} hasFreezeToday={false} />,
    );

    const banner = screen.getByTestId("streak-risk-banner");
    expect(banner.className).toContain("border-amber-200");
    expect(banner.className).toContain("bg-amber-50");
  });
});
