import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { StreakMilestone } from "@/app/lesson/streak-milestone";

describe("StreakMilestone", () => {
  it("should render milestone card when streak is 7", () => {
    render(<StreakMilestone streak={7} />);
    expect(screen.getByTestId("streak-milestone-card")).toBeInTheDocument();
    expect(screen.getByText("7-Day Streak!")).toBeInTheDocument();
    expect(screen.getByText("One week strong!")).toBeInTheDocument();
  });

  it("should render milestone card when streak is 30", () => {
    render(<StreakMilestone streak={30} />);
    expect(screen.getByText("30-Day Streak!")).toBeInTheDocument();
    expect(screen.getByText("A whole month!")).toBeInTheDocument();
  });

  it("should render milestone card when streak is 365", () => {
    render(<StreakMilestone streak={365} />);
    expect(screen.getByText("365-Day Streak!")).toBeInTheDocument();
    expect(screen.getByText("One full year — legendary!")).toBeInTheDocument();
  });

  it("should not render when streak is not a milestone", () => {
    const { container } = render(<StreakMilestone streak={5} />);
    expect(container.innerHTML).toBe("");
  });

  it("should not render when streak is 0", () => {
    const { container } = render(<StreakMilestone streak={0} />);
    expect(container.innerHTML).toBe("");
  });

  it("should render share button when onShare is provided", () => {
    const onShare = vi.fn();
    render(<StreakMilestone streak={14} onShare={onShare} />);
    const btn = screen.getByText("Share Milestone");
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onShare).toHaveBeenCalledOnce();
  });

  it("should not render share button when onShare is not provided", () => {
    render(<StreakMilestone streak={14} />);
    expect(screen.queryByText("Share Milestone")).not.toBeInTheDocument();
  });
});
