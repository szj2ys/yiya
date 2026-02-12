import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import Page from "../page";

describe("Marketing page", () => {
  it("should render hero with CTA visible on mobile viewport", () => {
    render(<Page />);

    expect(
      screen.getByRole("button", { name: /get started free/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/speak confidently/i)).toBeInTheDocument();
  });

  it("should render feature cards", () => {
    render(<Page />);

    expect(screen.getByRole("heading", { name: /5 languages/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /interactive lessons/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /track progress/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /free to start/i })).toBeInTheDocument();
  });

  it("should render all 5 language options", () => {
    render(<Page />);

    expect(screen.getByText("Croatian")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("French")).toBeInTheDocument();
    expect(screen.getByText("Italian")).toBeInTheDocument();
    expect(screen.getByText("Japanese")).toBeInTheDocument();
  });
});
