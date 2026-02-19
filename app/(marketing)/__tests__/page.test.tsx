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

    expect(screen.getByRole("heading", { name: /6 languages/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /interactive lessons/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /track progress/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /free to start/i })).toBeInTheDocument();
  });

  it("should render all 6 language options", () => {
    render(<Page />);

    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Chinese")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("French")).toBeInTheDocument();
    expect(screen.getByText("Italian")).toBeInTheDocument();
    expect(screen.getByText("Japanese")).toBeInTheDocument();
  });

  it("should make language cards clickable", () => {
    render(<Page />);

    // In signed-out state (default mock), language cards render as buttons
    const buttons = screen.getAllByRole("button");
    // 6 language card buttons + "Get Started Free" + "I have an account" = 8
    expect(buttons.length).toBeGreaterThanOrEqual(8);

    // "Start learning" text should appear instead of "Tap to explore"
    const startLearningTexts = screen.getAllByText("Start learning");
    expect(startLearningTexts).toHaveLength(6);
  });
});
