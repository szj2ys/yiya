/**
 * Shared Vercel KV (Upstash Redis) lazy singleton.
 *
 * Used by both the AI cache and rate-limit modules.
 */

export function isKvConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

let _kv: import("@vercel/kv").VercelKV | null = null;

export async function getKv(): Promise<import("@vercel/kv").VercelKV> {
  if (!_kv) {
    const { createClient } = await import("@vercel/kv");
    _kv = createClient({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return _kv;
}
