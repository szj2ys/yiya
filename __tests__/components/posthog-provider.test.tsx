import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const initSpy = vi.fn();

const posthogInitSpy = vi.fn();
const identifySpy = vi.fn();
const resetSpy = vi.fn();

vi.mock("@/lib/analytics-init", () => ({
  initAnalytics: initSpy,
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

describe("PostHogProvider", () => {
  beforeEach(() => {
    posthogInitSpy.mockReset();
    identifySpy.mockReset();
    resetSpy.mockReset();
    initSpy.mockReset();

    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
  });

  it("should render children when PostHog key is missing", async () => {
    const { PostHogProvider } = await import("@/components/posthog-provider");

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

    const { PostHogProvider } = await import("@/components/posthog-provider");

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

    expect(initSpy).toHaveBeenCalledTimes(1);
  });
});
