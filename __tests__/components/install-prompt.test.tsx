import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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

  it("should show install prompt on 2nd session when beforeinstallprompt fires", () => {
    // Simulate 1st session was already counted
    localStorage.setItem("yiya_session_count", "1");

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

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Add Yiya to Home Screen")).toBeInTheDocument();
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

  it("should not show if previously dismissed", () => {
    localStorage.setItem("yiya_session_count", "5");
    localStorage.setItem("yiya_install_dismissed", "1");

    render(<InstallPrompt />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should track analytics events when prompt shown", async () => {
    const { track } = await import("@/lib/analytics");
    localStorage.setItem("yiya_session_count", "1");

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

    expect(track).toHaveBeenCalledWith("pwa_install_prompt_shown", {});
  });

  it("should dismiss when Not now is clicked", () => {
    localStorage.setItem("yiya_session_count", "1");
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

    fireEvent.click(screen.getByText("Not now"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem("yiya_install_dismissed")).toBe("1");
  });
});
