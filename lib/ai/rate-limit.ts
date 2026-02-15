type Feature = "explain" | "review_variant" | (string & {});

type LimitConfig = {
  default: number;
  byFeature: Record<string, number>;
};

type Bucket = {
  windowStartMs: number;
  count: number;
};

const DEFAULT_LIMITS: LimitConfig = {
  default: 50,
  byFeature: {
    explain: 20,
    review_variant: 30,
  },
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
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

export function checkRateLimit(
  userId: string,
  feature: Feature,
  options: { limits?: Partial<LimitConfig>; windowMs?: number; now?: () => number } = {},
): { allowed: boolean; remaining: number } {
  const limits: LimitConfig = {
    ...DEFAULT_LIMITS,
    ...(options.limits ?? {}),
    byFeature: {
      ...DEFAULT_LIMITS.byFeature,
      ...((options.limits ?? {}).byFeature ?? {}),
    },
  };

  const windowMs = options.windowMs ?? ONE_DAY_MS;
  const clockNow = (options.now ?? nowMs)();
  const limit = getLimit(feature, limits);
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

export function __testing__resetRateLimit(): void {
  store.clear();
}

