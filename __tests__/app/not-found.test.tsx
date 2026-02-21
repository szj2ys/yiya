import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import NotFound from "@/app/not-found";

describe("NotFound (404 page)", () => {
  it("should render 404 page with navigation link", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("should contain a 'Back to Learn' link pointing to /learn", () => {
    render(<NotFound />);

    const link = screen.getByRole("link", { name: /back to learn/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/learn");
  });

  it("should display a helpful description", () => {
    render(<NotFound />);

    expect(
      screen.getByText(/couldn't find the page/i)
    ).toBeInTheDocument();
  });
});
