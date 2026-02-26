import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock getGlobalStats before importing the page
const mockGetGlobalStats = vi.fn();

vi.mock("@/db/queries", () => ({
  getGlobalStats: (...args: unknown[]) => mockGetGlobalStats(...args),
}));

// The page is an async server component — we await it then render the result.
async function renderPage() {
  const { default: Page } = await import("../page");
  const jsx = await Page();
  render(jsx);
}

describe("Marketing page", () => {
  beforeEach(() => {
    mockGetGlobalStats.mockReset();
    mockGetGlobalStats.mockResolvedValue({
      totalLessonsCompleted: 150,
      activeLearnersCount: 42,
      totalStreakDays: 300,
    });
  });

  it("should render hero with CTA visible on mobile viewport", async () => {
    await renderPage();

    expect(
      screen.getByRole("button", { name: /get started free/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/speak confidently/i)).toBeInTheDocument();
  });

  it("should render feature cards", async () => {
    await renderPage();

    expect(screen.getByRole("heading", { name: /6 languages/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /interactive lessons/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /track progress/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /free to start/i })).toBeInTheDocument();
  });

  it("should render all 6 language options", async () => {
    await renderPage();

    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Chinese")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("French")).toBeInTheDocument();
    expect(screen.getByText("Italian")).toBeInTheDocument();
    expect(screen.getByText("Japanese")).toBeInTheDocument();
  });

  it("should make language cards clickable", async () => {
    await renderPage();

    // In signed-out state (default mock), language cards render as buttons
    const buttons = screen.getAllByRole("button");
    // 6 language card buttons + "Get Started Free" + "I have an account" = 8
    expect(buttons.length).toBeGreaterThanOrEqual(8);

    // "Start learning" text should appear instead of "Tap to explore"
    const startLearningTexts = screen.getAllByText("Start learning");
    expect(startLearningTexts).toHaveLength(6);
  });

  // Task 2 tests
  it("should render social proof stats when data is available", async () => {
    await renderPage();

    const section = screen.getByTestId("social-proof-stats");
    expect(section).toBeInTheDocument();

    expect(screen.getByText("150+")).toBeInTheDocument();
    expect(screen.getByText("Lessons Completed")).toBeInTheDocument();

    expect(screen.getByText("42+")).toBeInTheDocument();
    expect(screen.getByText("Active Learners")).toBeInTheDocument();

    expect(screen.getByText("300+")).toBeInTheDocument();
    expect(screen.getByText("Streak Days")).toBeInTheDocument();
  });

  it("should handle zero stats gracefully by hiding the section", async () => {
    mockGetGlobalStats.mockResolvedValue({
      totalLessonsCompleted: 0,
      activeLearnersCount: 0,
      totalStreakDays: 0,
    });

    await renderPage();

    expect(screen.queryByTestId("social-proof-stats")).not.toBeInTheDocument();
  });

  it("should show social proof section when at least one stat is nonzero", async () => {
    mockGetGlobalStats.mockResolvedValue({
      totalLessonsCompleted: 0,
      activeLearnersCount: 5,
      totalStreakDays: 0,
    });

    await renderPage();

    expect(screen.getByTestId("social-proof-stats")).toBeInTheDocument();
    expect(screen.getByText("Active Learners")).toBeInTheDocument();
  });

  it("should not render fake testimonials", async () => {
    await renderPage();

    expect(screen.queryByTestId("testimonials")).not.toBeInTheDocument();
    expect(screen.queryByText("Maria K.")).not.toBeInTheDocument();
  });
});
