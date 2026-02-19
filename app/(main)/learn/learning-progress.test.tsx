import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { LearningProgress } from "./learning-progress";

describe("LearningProgress", () => {
  it("should display words learned count", () => {
    render(
      <LearningProgress
        courseStats={{
          wordsLearned: 12,
          completedLessons: 3,
          totalLessons: 10,
          completedChallenges: 20,
          totalChallenges: 50,
        }}
        memoryStrength={{ total: 10, mastered: 5, strong: 3, weak: 2, newCount: 0 }}
        accuracyPercent={88}
      />,
    );

    expect(screen.getByText("Words Learned")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("should render memory strength bar with correct proportions", () => {
    render(
      <LearningProgress
        courseStats={{
          wordsLearned: 12,
          completedLessons: 3,
          totalLessons: 10,
          completedChallenges: 20,
          totalChallenges: 50,
        }}
        memoryStrength={{ total: 10, mastered: 5, strong: 3, weak: 2, newCount: 0 }}
        accuracyPercent={88}
      />,
    );

    expect(screen.getByTestId("memory-segment-mastered")).toHaveStyle(
      "width: 50%",
    );
    expect(screen.getByTestId("memory-segment-strong")).toHaveStyle("width: 30%");
    expect(screen.getByTestId("memory-segment-weak")).toHaveStyle("width: 20%");
    expect(screen.getByTestId("memory-segment-new")).toHaveStyle("width: 0%");
  });

  it("should show empty state for new users", () => {
    render(
      <LearningProgress
        courseStats={{
          wordsLearned: 0,
          completedLessons: 0,
          totalLessons: 10,
          completedChallenges: 0,
          totalChallenges: 50,
        }}
        memoryStrength={{ total: 0, mastered: 0, strong: 0, weak: 0, newCount: 0 }}
        accuracyPercent={0}
      />,
    );

    expect(screen.getByText(/Start your first lesson!/)).toBeInTheDocument();
  });
});
