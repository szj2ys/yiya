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
});
