import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Streak } from "@/components/streak";

describe("Streak", () => {
  it("should render streak count with fire icon", () => {
    render(<Streak streak={7} lastLessonAt={null} />);

    expect(screen.getByText("7 day streak")).toBeInTheDocument();
  });

  it("should show motivational text when streak is 0", () => {
    render(<Streak streak={0} lastLessonAt={null} />);

    expect(screen.getByText("Start your streak!")).toBeInTheDocument();
  });

  it("should show freeze badge when freeze is active", () => {
    render(<Streak streak={5} lastLessonAt={null} freezeActive={true} />);

    expect(screen.getByText("5 day streak")).toBeInTheDocument();
    expect(screen.getByText("Protected today")).toBeInTheDocument();
  });

  it("should not show reminder when freeze is active", () => {
    render(<Streak streak={5} lastLessonAt={null} freezeActive={true} />);

    expect(screen.queryByText("Don't forget to study today!")).not.toBeInTheDocument();
  });

  it("should show completed today when lastLessonAt is today", () => {
    const today = new Date();
    render(<Streak streak={3} lastLessonAt={today} freezeActive={false} />);

    expect(screen.getByText("Completed today")).toBeInTheDocument();
  });

  it("should prioritize completed today over freeze active", () => {
    const today = new Date();
    render(<Streak streak={3} lastLessonAt={today} freezeActive={true} />);

    expect(screen.getByText("Completed today")).toBeInTheDocument();
    expect(screen.queryByText("Protected today")).not.toBeInTheDocument();
  });
});
