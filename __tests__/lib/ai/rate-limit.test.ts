import { beforeEach, describe, expect, it } from "vitest";

import { __testing__resetRateLimit, checkRateLimit } from "@/lib/ai/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    __testing__resetRateLimit();
  });

  it("should allow requests within limit", async () => {
    const now = () => new Date("2026-02-15T00:00:00.000Z").getTime();

    const r1 = await checkRateLimit("u1", "explain", {
      now,
      limits: { byFeature: { explain: 2 } },
    });
    const r2 = await checkRateLimit("u1", "explain", {
      now,
      limits: { byFeature: { explain: 2 } },
    });

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(0);
  });

  it("should deny requests exceeding limit", async () => {
    const now = () => new Date("2026-02-15T00:00:00.000Z").getTime();

    await checkRateLimit("u1", "explain", { now, limits: { byFeature: { explain: 2 } } });
    await checkRateLimit("u1", "explain", { now, limits: { byFeature: { explain: 2 } } });
    const r3 = await checkRateLimit("u1", "explain", {
      now,
      limits: { byFeature: { explain: 2 } },
    });

    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("should reset after window expires", async () => {
    const t0 = new Date("2026-02-15T00:00:00.000Z").getTime();
    const now = () => current;
    let current = t0;

    const config = { now, limits: { byFeature: { explain: 1 } }, windowMs: 1000 };
    const r1 = await checkRateLimit("u1", "explain", config);
    const r2 = await checkRateLimit("u1", "explain", config);
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(false);

    current = t0 + 1001;
    const r3 = await checkRateLimit("u1", "explain", config);
    expect(r3.allowed).toBe(true);
  });
});
