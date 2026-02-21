import { beforeEach, describe, expect, it, vi } from "vitest";

const initSpy = vi.fn();
const captureExceptionSpy = vi.fn();
const replayIntegrationSpy = vi.fn().mockReturnValue({ name: "Replay" });

vi.mock("@sentry/nextjs", () => ({
  init: initSpy,
  captureException: captureExceptionSpy,
  replayIntegration: replayIntegrationSpy,
  captureRequestError: vi.fn(),
}));

describe("Sentry configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    initSpy.mockClear();
    captureExceptionSpy.mockClear();
  });

  it("should capture unhandled server error in Sentry", async () => {
    process.env.SENTRY_DSN = "https://examplePublicKey@o0.ingest.sentry.io/0";

    await import("../../sentry.server.config");

    expect(initSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
        enabled: true,
      }),
    );
  });

  it("should disable Sentry when DSN is not set", async () => {
    delete process.env.SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    await import("../../sentry.server.config");

    expect(initSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      }),
    );
  });

  it("should use NEXT_PUBLIC_SENTRY_DSN as fallback when SENTRY_DSN is not set", async () => {
    delete process.env.SENTRY_DSN;
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://publicKey@o0.ingest.sentry.io/1";

    await import("../../sentry.server.config");

    expect(initSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://publicKey@o0.ingest.sentry.io/1",
        enabled: true,
      }),
    );
  });
});
