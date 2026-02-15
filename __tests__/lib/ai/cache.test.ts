import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  __testing__getCacheSize,
  __testing__resetCache,
  getCachedOrFetch,
} from "@/lib/ai/cache";

describe("getCachedOrFetch", () => {
  beforeEach(() => {
    __testing__resetCache();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-15T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should cache response by key", async () => {
    const fetchFn = vi.fn(async () => "v1");

    const first = await getCachedOrFetch("k1", fetchFn);
    const second = await getCachedOrFetch("k1", fetchFn);

    expect(first).toBe("v1");
    expect(second).toBe("v1");
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("should evict oldest when capacity exceeded", async () => {
    await getCachedOrFetch("a", async () => "A", { capacity: 2 });
    await getCachedOrFetch("b", async () => "B", { capacity: 2 });
    await getCachedOrFetch("c", async () => "C", { capacity: 2 });

    expect(__testing__getCacheSize()).toBe(2);

    const fetchA = vi.fn(async () => "A2");
    const value = await getCachedOrFetch("a", fetchA, { capacity: 2 });
    expect(value).toBe("A2");
    expect(fetchA).toHaveBeenCalledTimes(1);
  });

  it("should expire entries after TTL", async () => {
    const fetchFn = vi.fn(async () => "v1");
    await getCachedOrFetch("k1", fetchFn, { ttlMs: 1000 });

    vi.advanceTimersByTime(999);
    await getCachedOrFetch("k1", fetchFn, { ttlMs: 1000 });
    expect(fetchFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2);
    await getCachedOrFetch("k1", fetchFn, { ttlMs: 1000 });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
