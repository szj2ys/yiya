import { createHash } from "crypto";

type CacheEntry<T> = {
  value: T;
  expiresAtMs: number;
};

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CAPACITY = 1000;

const cache = new Map<string, CacheEntry<unknown>>();

function nowMs(): number {
  return Date.now();
}

function isExpired(entry: CacheEntry<unknown>): boolean {
  return entry.expiresAtMs <= nowMs();
}

function touch(key: string, entry: CacheEntry<unknown>): void {
  cache.delete(key);
  cache.set(key, entry);
}

function evictIfNeeded(capacity: number): void {
  while (cache.size > capacity) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (!oldestKey) return;
    cache.delete(oldestKey);
  }
}

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function makeCacheKey(prompt: string, model: string): string {
  return sha256(`${prompt}${model}`);
}

export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: { ttlMs?: number; capacity?: number } = {},
): Promise<T> {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const capacity = options.capacity ?? DEFAULT_CAPACITY;

  const existing = cache.get(key);
  if (existing) {
    if (isExpired(existing)) {
      cache.delete(key);
    } else {
      touch(key, existing);
      return existing.value as T;
    }
  }

  const value = await fetchFn();
  cache.set(key, { value, expiresAtMs: nowMs() + ttlMs });
  evictIfNeeded(capacity);
  return value;
}

export function __testing__resetCache(): void {
  cache.clear();
}

export function __testing__getCacheSize(): number {
  return cache.size;
}

