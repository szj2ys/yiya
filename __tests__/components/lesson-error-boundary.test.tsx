import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import LessonError from "@/app/lesson/error";

describe("app/lesson/error.tsx", () => {
  it("should render lesson-specific error with back link", () => {
    const reset = vi.fn();

    render(
      <LessonError
        error={new Error("Boom")}
        reset={reset}
      />
    );

    expect(
      screen.getByText("Oops! This lesson hit a snag.")
    ).toBeInTheDocument();

    const backLink = screen.getByRole("link", { name: "Back to lessons" });
    expect(backLink).toHaveAttribute("href", "/learn");

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
