import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import MainAreaError from "@/app/(main)/error";

describe("app/(main)/error.tsx", () => {
  it("should render main area error with courses fallback", () => {
    const reset = vi.fn();

    render(
      <MainAreaError
        error={new Error("Boom")}
        reset={reset}
      />
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    const coursesLink = screen.getByRole("link", { name: "Go to courses" });
    expect(coursesLink).toHaveAttribute("href", "/courses");

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
