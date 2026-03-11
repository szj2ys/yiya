"use server";

import { isKvConfigured, getKv } from "@/lib/kv";

const DASHBOARD_TTL_SECONDS = 300;

function dashboardKey(userId: string): string {
  return `learn:dashboard:${userId}`;
}

export async function getCachedDashboard<T>(
  userId: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  if (!isKvConfigured()) {
    return fetcher();
  }

  const kv = await getKv();
  const key = dashboardKey(userId);

  try {
    const cached = await kv.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch {
    return fetcher();
  }

  const data = await fetcher();

  try {
    await kv.set(key, data, { ex: DASHBOARD_TTL_SECONDS });
  } catch {}

  return data;
}

export async function invalidateDashboardCache(userId: string): Promise<void> {
  if (!isKvConfigured()) return;

  try {
    const kv = await getKv();
    await kv.del(dashboardKey(userId));
  } catch {}
}
