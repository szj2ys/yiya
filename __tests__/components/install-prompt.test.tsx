import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { InstallPrompt } from "@/components/install-prompt";

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
}));

describe("InstallPrompt", () => {
  beforeEach(() => {
    localStorage.clear();

    // Mock matchMedia for display-mode check
    Object.defineProperty(window, "matchMedia", {
      value: vi.fn().mockReturnValue({ matches: false }),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not show install prompt on 1st session", () => {
    render(<InstallPrompt />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should show install prompt on 2nd session when beforeinstallprompt fires", async () => {
    localStorage.setItem("yiya_session_count", "1");
    localStorage.setItem("yiya_first_lesson_completed", "true");

    render(<InstallPrompt />);

    // Fire the beforeinstallprompt event
    const event = new Event("beforeinstallprompt");
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });
    Object.defineProperty(event, "prompt", { value: vi.fn().mockResolvedValue(undefined) });
    Object.defineProperty(event, "userChoice", {
      value: Promise.resolve({ outcome: "dismissed" as const }),
    });

    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText("Install Yiya App")).toBeInTheDocument();
  });

  it("should not show if already installed (standalone mode)", () => {
    Object.defineProperty(window, "matchMedia", {
      value: vi.fn().mockReturnValue({ matches: true }),
      writable: true,
      configurable: true,
    });
    localStorage.setItem("yiya_session_count", "5");

    render(<InstallPrompt />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should not show if recently dismissed (within 7 days)", () => {
    localStorage.setItem("yiya_session_count", "5");
    localStorage.setItem("yiya_install_dismissed", Date.now().toString());

    render(<InstallPrompt />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should show if dismissed more than 7 days ago", () => {
    localStorage.setItem("yiya_session_count", "1");
    localStorage.setItem("yiya_first_lesson_completed", "true");
    // Dismissed 8 days ago
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    localStorage.setItem("yiya_install_dismissed", eightDaysAgo.toString());

    render(<InstallPrompt />);

    const event = new Event("beforeinstallprompt");
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });
    Object.defineProperty(event, "prompt", { value: vi.fn().mockResolvedValue(undefined) });
    Object.defineProperty(event, "userChoice", {
      value: Promise.resolve({ outcome: "dismissed" as const }),
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should track analytics events when prompt shown", async () => {
    const { track } = await import("@/lib/analytics");
    localStorage.setItem("yiya_session_count", "1");
    localStorage.setItem("yiya_first_lesson_completed", "true");

    render(<InstallPrompt />);

    const event = new Event("beforeinstallprompt");
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });
    Object.defineProperty(event, "prompt", { value: vi.fn().mockResolvedValue(undefined) });
    Object.defineProperty(event, "userChoice", {
      value: Promise.resolve({ outcome: "dismissed" as const }),
    });

    act(() => {
      window.dispatchEvent(event);
    });

    expect(track).toHaveBeenCalledWith("pwa_install_prompt_shown", { platform: "desktop" });
  });

  it("should dismiss when Not now is clicked and set timestamp", async () => {
    localStorage.setItem("yiya_session_count", "1");
    localStorage.setItem("yiya_first_lesson_completed", "true");
    render(<InstallPrompt />);

    const event = new Event("beforeinstallprompt");
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });
    Object.defineProperty(event, "prompt", { value: vi.fn().mockResolvedValue(undefined) });
    Object.defineProperty(event, "userChoice", {
      value: Promise.resolve({ outcome: "dismissed" as const }),
    });

    act(() => {
      window.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Not now"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Should store timestamp (not just "1")
    const dismissed = localStorage.getItem("yiya_install_dismissed");
    expect(dismissed).not.toBe("1");
    expect(parseInt(dismissed || "0")).toBeGreaterThan(Date.now() - 10000);
  });
});
