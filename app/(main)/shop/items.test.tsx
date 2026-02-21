import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

vi.mock("@/actions/user-progress", () => ({
  refillHearts: vi.fn(),
}));

vi.mock("@/actions/user-subscription", () => ({
  createStripeUrl: vi.fn(),
}));

import { Items } from "./items";

describe("Shop Items", () => {
  it('should show "Full" when hearts are at max', () => {
    render(
      <Items hearts={5} points={100} hasActiveSubscription={false} />,
    );

    expect(screen.getByRole("button", { name: /full/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /full/i })).toBeDisabled();
  });

  it("should show refill cost when hearts are below max", () => {
    render(
      <Items hearts={3} points={100} hasActiveSubscription={false} />,
    );

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.queryByText(/full/i)).not.toBeInTheDocument();
  });

  it('should show "Manage" button for Pro subscribers', () => {
    render(
      <Items hearts={5} points={100} hasActiveSubscription={true} />,
    );

    expect(screen.getByRole("button", { name: /manage/i })).toBeInTheDocument();
  });

  it("should display Pro pricing for non-subscribers", () => {
    render(
      <Items hearts={3} points={100} hasActiveSubscription={false} />,
    );

    expect(screen.getByText("$20/month · Unlimited hearts")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upgrade/i })).toBeInTheDocument();
  });

  it("should not display Pro pricing for active subscribers", () => {
    render(
      <Items hearts={5} points={100} hasActiveSubscription={true} />,
    );

    expect(screen.queryByText("$20/month · Unlimited hearts")).not.toBeInTheDocument();
  });

  it("should disable refill button when not enough points", () => {
    render(
      <Items hearts={3} points={5} hasActiveSubscription={false} />,
    );

    // The refill button should be disabled because points (5) < POINTS_TO_REFILL (10)
    const buttons = screen.getAllByRole("button");
    const refillButton = buttons[0]; // first button is refill
    expect(refillButton).toBeDisabled();
  });
});
