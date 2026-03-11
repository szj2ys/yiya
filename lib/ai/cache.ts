import { createHash } from "crypto";
import { isKvConfigured, getKv } from "@/lib/kv";

type CacheEntry<T> = {
  value: T;
  expiresAtMs: number;
};

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CAPACITY = 1000;
const KV_KEY_PREFIX = "cache:";

/* ---------------------------------------------------------------------------
 * In-memory LRU fallback (used when KV env vars are not set, e.g. local dev)
 * --------------------------------------------------------------------------- */

const memCache = new Map<string, CacheEntry<unknown>>();

function nowMs(): number {
  return Date.now();
}

function isExpired(entry: CacheEntry<unknown>): boolean {
  return entry.expiresAtMs <= nowMs();
}

function touch(key: string, entry: CacheEntry<unknown>): void {
  memCache.delete(key);
  memCache.set(key, entry);
}

function evictIfNeeded(capacity: number): void {
  while (memCache.size > capacity) {
    const oldestKey = memCache.keys().next().value as string | undefined;
    if (!oldestKey) return;
    memCache.delete(oldestKey);
  }
}

/* ---------------------------------------------------------------------------
 * Public API
 * --------------------------------------------------------------------------- */

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: { ttlMs?: number; capacity?: number } = {},
): Promise<T> {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;

  if (isKvConfigured()) {
    return getCachedOrFetchKv<T>(key, fetchFn, ttlMs);
  }

  return getCachedOrFetchMemory<T>(key, fetchFn, ttlMs, options.capacity ?? DEFAULT_CAPACITY);
}

/* KV path */
async function getCachedOrFetchKv<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  const kv = await getKv();
  const kvKey = `${KV_KEY_PREFIX}${key}`;

  const cached = await kv.get<T>(kvKey);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const value = await fetchFn();
  const ttlSeconds = Math.max(1, Math.ceil(ttlMs / 1000));
  await kv.set(kvKey, value, { ex: ttlSeconds });
  return value;
}

/* In-memory path */
async function getCachedOrFetchMemory<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number,
  capacity: number,
): Promise<T> {
  const existing = memCache.get(key);
  if (existing) {
    if (isExpired(existing)) {
      memCache.delete(key);
    } else {
      touch(key, existing);
      return existing.value as T;
    }
  }

  const value = await fetchFn();
  memCache.set(key, { value, expiresAtMs: nowMs() + ttlMs });
  evictIfNeeded(capacity);
  return value;
}

/* ---------------------------------------------------------------------------
 * Testing helpers
 * --------------------------------------------------------------------------- */

export function __testing__resetCache(): void {
  memCache.clear();
}

export function __testing__getCacheSize(): number {
  return memCache.size;
}
