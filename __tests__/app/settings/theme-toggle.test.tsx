import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ThemeToggle } from "@/app/(main)/settings/theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("should render Light and Dark buttons", () => {
    render(<ThemeToggle />);

    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });

  it("should toggle dark class on html element when clicked", () => {
    render(<ThemeToggle />);

    const darkButton = screen.getByText("Dark");
    fireEvent.click(darkButton);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should remove dark class when Light is clicked", () => {
    document.documentElement.classList.add("dark");

    render(<ThemeToggle />);

    const lightButton = screen.getByText("Light");
    fireEvent.click(lightButton);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should persist theme choice to localStorage", () => {
    render(<ThemeToggle />);

    const darkButton = screen.getByText("Dark");
    fireEvent.click(darkButton);

    expect(localStorage.getItem("theme")).toBe("dark");

    const lightButton = screen.getByText("Light");
    fireEvent.click(lightButton);

    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("should read initial theme from html class list", () => {
    document.documentElement.classList.add("dark");

    render(<ThemeToggle />);

    // Dark button should have active styling (green border)
    const darkButton = screen.getByText("Dark");
    expect(darkButton.className).toContain("border-green-600");
  });
});
