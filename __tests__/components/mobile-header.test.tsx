import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

let mockPathname = "/learn";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

import { MobileHeader } from "@/components/mobile-header";

describe("MobileHeader (bottom tab bar)", () => {
  beforeEach(() => {
    mockPathname = "/learn";
  });

  it("should render bottom tab bar on mobile viewport", () => {
    render(<MobileHeader />);

    expect(screen.getByText("Learn")).toBeInTheDocument();
    expect(screen.getByText("Leaderboard")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Shop")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("should render 5 navigation links", () => {
    render(<MobileHeader />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
  });

  it("should link to correct routes", () => {
    render(<MobileHeader />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/learn");
    expect(links[1]).toHaveAttribute("href", "/leaderboard");
    expect(links[2]).toHaveAttribute("href", "/practice");
    expect(links[3]).toHaveAttribute("href", "/shop");
    expect(links[4]).toHaveAttribute("href", "/settings");
  });

  it("should highlight active tab with green text", () => {
    mockPathname = "/learn";
    render(<MobileHeader />);

    const learnLabel = screen.getByText("Learn");
    expect(learnLabel.className).toContain("text-green-600");
  });

  it("should render review tab in mobile navigation", () => {
    render(<MobileHeader />);

    const reviewLink = screen.getByText("Review").closest("a");
    expect(reviewLink).toHaveAttribute("href", "/practice");
  });

  it("should have minimum 48px touch targets on tab links", () => {
    render(<MobileHeader />);

    const links = screen.getAllByRole("link");
    for (const link of links) {
      expect(link.className).toContain("min-w-[48px]");
      expect(link.className).toContain("min-h-[48px]");
    }
  });
});
