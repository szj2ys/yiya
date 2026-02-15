import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import RootError from "@/app/error";

describe("app/error.tsx", () => {
  it("should render error message and retry button", () => {
    const reset = vi.fn();

    render(
      <RootError
        error={new Error("Boom")}
        reset={reset}
      />
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("Please try again. If this keeps happening, come back later.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
