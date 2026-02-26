import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PushPrompt } from "@/components/push-prompt";

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
}));

// Mock push utilities
vi.mock("@/lib/push", () => ({
  subscribeToPush: vi.fn().mockResolvedValue({
    toJSON: () => ({ endpoint: "https://example.com", keys: { p256dh: "a", auth: "b" } }),
  }),
  saveSubscriptionToServer: vi.fn().mockResolvedValue(true),
}));

describe("PushPrompt", () => {
  beforeEach(() => {
    localStorage.clear();

    // Mock Notification API
    Object.defineProperty(window, "Notification", {
      value: { permission: "default", requestPermission: vi.fn().mockResolvedValue("granted") },
      writable: true,
      configurable: true,
    });

    // Mock PushManager
    Object.defineProperty(window, "PushManager", {
      value: class {},
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not prompt before 3rd lesson", () => {
    render(<PushPrompt lessonCompletionCount={2} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should show prompt when lessonCompletionCount >= 3", () => {
    render(<PushPrompt lessonCompletionCount={3} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Never lose your streak!")).toBeInTheDocument();
  });

  it("should not show prompt when already dismissed", () => {
    localStorage.setItem("yiya_push_prompted", "1");
    render(<PushPrompt lessonCompletionCount={5} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should not show prompt when permission already granted", () => {
    Object.defineProperty(window, "Notification", {
      value: { permission: "granted", requestPermission: vi.fn() },
      writable: true,
      configurable: true,
    });
    render(<PushPrompt lessonCompletionCount={5} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should handle permission denied", async () => {
    const { track } = await import("@/lib/analytics");
    Object.defineProperty(window, "Notification", {
      value: { permission: "default", requestPermission: vi.fn().mockResolvedValue("denied") },
      writable: true,
      configurable: true,
    });
    render(<PushPrompt lessonCompletionCount={3} />);
    fireEvent.click(screen.getByText("Enable"));
    // After clicking, the dialog should be hidden
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should dismiss and track analytics when Not now is clicked", async () => {
    const { track } = await import("@/lib/analytics");
    render(<PushPrompt lessonCompletionCount={3} />);
    fireEvent.click(screen.getByText("Not now"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem("yiya_push_prompted")).toBe("1");
    expect(track).toHaveBeenCalledWith("push_declined", {});
  });
});
