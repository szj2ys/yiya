import { PostHog } from "posthog-node";

import type { TrackDispatcher } from "@/lib/analytics";

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

let client: PostHog | null = null;

function getClient(): PostHog | null {
  if (client) return client;

  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) return null;

  const host = process.env.POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST;

  client = new PostHog(apiKey, { host });
  return client;
}

/**
 * Server-side PostHog dispatcher.
 *
 * Sends analytics events to PostHog from server actions, API routes, and
 * other Node.js / edge contexts. Gracefully degrades to console when
 * `POSTHOG_API_KEY` is not set.
 */
export const serverPosthogDispatcher: TrackDispatcher = (payload) => {
  const ph = getClient();

  if (!ph) {
    // eslint-disable-next-line no-console
    console.info("[analytics:server]", payload.event, payload.properties);
    return;
  }

  ph.capture({
    distinctId: "server",
    event: payload.event,
    properties: payload.properties,
  });
};

/**
 * Flush pending events. Call during server shutdown or after critical events
 * to ensure delivery.
 */
export async function flushServerAnalytics(): Promise<void> {
  const ph = getClient();
  if (ph) {
    await ph.flush();
  }
}
