import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { initSpy, posthogInitSpy, identifySpy, resetSpy, trackSpy, useUserMock } = vi.hoisted(() => ({
  initSpy: vi.fn(),
  posthogInitSpy: vi.fn(),
  identifySpy: vi.fn(),
  resetSpy: vi.fn(),
  trackSpy: vi.fn().mockResolvedValue(undefined),
  useUserMock: vi.fn(),
}));

vi.mock("@/lib/analytics-init", () => ({
  initAnalytics: initSpy,
}));

vi.mock("@/lib/analytics", () => ({
  track: (...args: unknown[]) => trackSpy(...args),
}));

vi.mock("posthog-js", () => ({
  default: {
    init: posthogInitSpy,
    identify: identifySpy,
    reset: resetSpy,
    capture: vi.fn(),
    __loaded: true,
  },
}));

vi.mock("posthog-js/react", () => ({
  PostHogProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@clerk/nextjs", async () => {
  const actual = await vi.importActual("@clerk/nextjs");
  return {
    ...actual as Record<string, unknown>,
    useUser: (...args: unknown[]) => useUserMock(...args),
  };
});

import { PostHogProvider } from "@/components/posthog-provider";

describe("PostHogProvider", () => {
  beforeEach(() => {
    posthogInitSpy.mockReset();
    identifySpy.mockReset();
    resetSpy.mockReset();
    initSpy.mockReset();
    trackSpy.mockClear();
    useUserMock.mockReset();

    // Default: signed out
    useUserMock.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    });

    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
  });

  afterEach(() => {
    cleanup();
  });

  it("should render children when PostHog key is missing", () => {
    render(
      <PostHogProvider>
        <div>child</div>
      </PostHogProvider>,
    );

    expect(screen.getByText("child")).toBeInTheDocument();
    expect(posthogInitSpy).not.toHaveBeenCalled();
    expect(initSpy).not.toHaveBeenCalled();
  });

  it("should initialize PostHog when key is provided", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "test-key";
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://posthog.example";

    render(
      <PostHogProvider>
        <div>child</div>
      </PostHogProvider>,
    );

    expect(screen.getByText("child")).toBeInTheDocument();

    await waitFor(() => {
      expect(posthogInitSpy).toHaveBeenCalledWith(
        "test-key",
        expect.objectContaining({
          api_host: "https://posthog.example",
          capture_pageview: true,
        }),
      );
    });
  });

  it("should fire session_start when user is signed in", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "test-key";

    useUserMock.mockReturnValue({
      user: {
        id: "user-123",
        primaryEmailAddress: { emailAddress: "a@b.com" },
        fullName: "Test User",
        createdAt: new Date("2024-01-01"),
      },
      isLoaded: true,
      isSignedIn: true,
    });

    render(
      <PostHogProvider>
        <div>child</div>
      </PostHogProvider>,
    );

    await waitFor(() => {
      expect(trackSpy).toHaveBeenCalledWith("session_start", {});
    });
  });

  it("should identify with user traits when signed in", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "test-key";

    const createdAt = new Date("2024-01-01");
    useUserMock.mockReturnValue({
      user: {
        id: "user-456",
        primaryEmailAddress: { emailAddress: "a@b.com" },
        fullName: "Test User",
        createdAt,
      },
      isLoaded: true,
      isSignedIn: true,
    });

    render(
      <PostHogProvider>
        <div>child</div>
      </PostHogProvider>,
    );

    await waitFor(() => {
      expect(identifySpy).toHaveBeenCalledWith("user-456", {
        email: "a@b.com",
        name: "Test User",
        created_at: createdAt,
      });
    });
  });
});
