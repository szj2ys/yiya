import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTrackPayload } from "@/lib/analytics";

// Mock posthog-node
const captureSpy = vi.fn();
const flushSpy = vi.fn().mockResolvedValue(undefined);
const PostHogMock = vi.fn();

vi.mock("posthog-node", () => ({
  PostHog: PostHogMock,
}));

describe("serverPosthogDispatcher", () => {
  beforeEach(() => {
    vi.resetModules();
    captureSpy.mockClear();
    flushSpy.mockClear();
    PostHogMock.mockClear();
    PostHogMock.mockImplementation(function (this: any) {
      this.capture = captureSpy;
      this.flush = flushSpy;
    });
  });

  afterEach(() => {
    delete process.env.POSTHOG_API_KEY;
    delete process.env.POSTHOG_HOST;
  });

  it("should dispatch analytics event via server-side PostHog when running on server", async () => {
    process.env.POSTHOG_API_KEY = "phx_test_key";

    const { serverPosthogDispatcher } = await import("@/lib/analytics-server");

    const payload = buildTrackPayload("checkout_complete", { surface: "paywall" });

    serverPosthogDispatcher(payload);

    expect(captureSpy).toHaveBeenCalledWith({
      distinctId: "server",
      event: "checkout_complete",
      properties: payload.properties,
    });
  });

  it("should fall back to console when POSTHOG_API_KEY is not set", async () => {
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    const { serverPosthogDispatcher } = await import("@/lib/analytics-server");

    const payload = buildTrackPayload("lesson_start", { lesson_id: 42 });

    serverPosthogDispatcher(payload);

    expect(captureSpy).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      "[analytics:server]",
      "lesson_start",
      payload.properties,
    );

    consoleSpy.mockRestore();
  });

  it("should use custom POSTHOG_HOST when provided", async () => {
    process.env.POSTHOG_API_KEY = "phx_test_key";
    process.env.POSTHOG_HOST = "https://custom.posthog.host";

    const { serverPosthogDispatcher } = await import("@/lib/analytics-server");

    const payload = buildTrackPayload("session_start", {});
    serverPosthogDispatcher(payload);

    expect(PostHogMock).toHaveBeenCalledWith("phx_test_key", {
      host: "https://custom.posthog.host",
    });
  });

  it("should flush pending events when flushServerAnalytics is called", async () => {
    process.env.POSTHOG_API_KEY = "phx_test_key";

    const { serverPosthogDispatcher, flushServerAnalytics } = await import(
      "@/lib/analytics-server"
    );

    // Trigger client creation
    const payload = buildTrackPayload("session_start", {});
    serverPosthogDispatcher(payload);

    await flushServerAnalytics();

    expect(flushSpy).toHaveBeenCalled();
  });
});
