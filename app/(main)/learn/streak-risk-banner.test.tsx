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
      screen.getByText("Your 5-day streak needs today's lesson!"),
    ).toBeInTheDocument();
  });

  it("should show progress banner when todayLessonCount > 0", () => {
    render(
      <StreakRiskBanner streak={5} todayLessonCount={2} hasFreezeToday={false} />,
    );

    expect(screen.getByTestId("streak-progress-banner")).toBeInTheDocument();
    expect(
      screen.getByText(/2 lessons done today/),
    ).toBeInTheDocument();
  });

  it("should not render when streak is 0 and no lessons today", () => {
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
      screen.getByText(/Freeze active.*10-day streak/),
    ).toBeInTheDocument();
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

  it("should show singular text for 1 lesson", () => {
    render(
      <StreakRiskBanner streak={0} todayLessonCount={1} hasFreezeToday={false} />,
    );

    expect(screen.getByText(/1 lesson done today/)).toBeInTheDocument();
  });
});
