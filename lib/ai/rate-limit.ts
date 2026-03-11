import { isKvConfigured, getKv } from "@/lib/kv";

type Feature = "explain" | "review_variant" | (string & {});

type LimitConfig = {
  default: number;
  byFeature: Record<string, number>;
};

type Bucket = {
  windowStartMs: number;
  count: number;
};

type RateLimitResult = { allowed: boolean; remaining: number };

const DEFAULT_LIMITS: LimitConfig = {
  default: 50,
  byFeature: {
    explain: 20,
    review_variant: 30,
  },
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const KV_KEY_PREFIX = "ratelimit:";

/* ---------------------------------------------------------------------------
 * In-memory fallback (used when KV env vars are not set)
 * --------------------------------------------------------------------------- */

const store = new Map<string, Bucket>();

function nowMs(): number {
  return Date.now();
}

function getLimit(feature: Feature, limits: LimitConfig): number {
  return limits.byFeature[feature] ?? limits.default;
}

function makeKey(userId: string, feature: Feature): string {
  return `${userId}:${feature}`;
}

/* ---------------------------------------------------------------------------
 * Public API
 * --------------------------------------------------------------------------- */

export async function checkRateLimit(
  userId: string,
  feature: Feature,
  options: { limits?: Partial<LimitConfig>; windowMs?: number; now?: () => number } = {},
): Promise<RateLimitResult> {
  const limits: LimitConfig = {
    ...DEFAULT_LIMITS,
    ...(options.limits ?? {}),
    byFeature: {
      ...DEFAULT_LIMITS.byFeature,
      ...((options.limits ?? {}).byFeature ?? {}),
    },
  };

  const windowMs = options.windowMs ?? ONE_DAY_MS;
  const limit = getLimit(feature, limits);

  if (isKvConfigured()) {
    return checkRateLimitKv(userId, feature, limit, windowMs);
  }

  return checkRateLimitMemory(userId, feature, limit, windowMs, options.now);
}

/* KV path — fixed-window counter via INCR + EXPIRE */
async function checkRateLimitKv(
  userId: string,
  feature: Feature,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const kv = await getKv();
  const kvKey = `${KV_KEY_PREFIX}${userId}:${feature}`;
  const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  const count = await kv.incr(kvKey);

  // First request in window — set the TTL
  if (count === 1) {
    await kv.expire(kvKey, ttlSeconds);
  }

  if (count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: Math.max(0, limit - count) };
}

/* In-memory path — preserves original synchronous logic */
async function checkRateLimitMemory(
  userId: string,
  feature: Feature,
  limit: number,
  windowMs: number,
  nowFn?: () => number,
): Promise<RateLimitResult> {
  const clockNow = (nowFn ?? nowMs)();
  const key = makeKey(userId, feature);

  const existing = store.get(key);
  if (!existing || clockNow - existing.windowStartMs >= windowMs) {
    const count = 1;
    store.set(key, { windowStartMs: clockNow, count });
    return { allowed: true, remaining: Math.max(0, limit - count) };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  store.set(key, existing);
  return { allowed: true, remaining: Math.max(0, limit - existing.count) };
}

/* ---------------------------------------------------------------------------
 * Testing helpers
 * --------------------------------------------------------------------------- */

export function __testing__resetRateLimit(): void {
  store.clear();
}
