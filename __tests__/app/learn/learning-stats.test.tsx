import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { LearningStats } from "@/app/(main)/learn/learning-stats";

const mockStats = {
  currentStreak: 7,
  longestStreak: 7,
  totalWordsLearned: 42,
  totalLessonsCompleted: 10,
  averageAccuracy: 85,
};

describe("LearningStats", () => {
  it("should display all stats metrics", () => {
    render(<LearningStats stats={mockStats} />);

    expect(screen.getByText("Learning stats")).toBeInTheDocument();
    expect(screen.getByText("7 days")).toBeInTheDocument();
    expect(screen.getByText("Streak")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Words")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Lessons")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("Accuracy")).toBeInTheDocument();
  });

  it("should show '0' for streak when currentStreak is 0", () => {
    render(
      <LearningStats
        stats={{ ...mockStats, currentStreak: 0 }}
      />,
    );

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should be collapsible", () => {
    render(<LearningStats stats={mockStats} />);

    // Initially expanded
    expect(screen.getByText("42")).toBeInTheDocument();

    // Click to collapse
    const header = screen.getByRole("button", { name: /learning stats/i });
    fireEvent.click(header);

    // Should hide stats
    expect(screen.queryByText("42")).not.toBeInTheDocument();
  });

  it("should expand again after collapse", () => {
    render(<LearningStats stats={mockStats} />);

    const header = screen.getByRole("button", { name: /learning stats/i });

    // Collapse
    fireEvent.click(header);
    expect(screen.queryByText("42")).not.toBeInTheDocument();

    // Expand
    fireEvent.click(header);
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
