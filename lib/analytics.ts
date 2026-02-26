type BaseProperties = {
  /**
   * The schema version for the payload, for safe evolution.
   */
  schema_version: 1;
  /**
   * Unix timestamp in milliseconds.
   */
  ts: number;
};

export type AnalyticsEventMap = {
  page_view: BaseProperties & { page: string };
  session_start: BaseProperties;
  lesson_start: BaseProperties & { lesson_id: number };
  lesson_complete: BaseProperties & { lesson_id: number; hearts_remaining: number };
  lesson_fail: BaseProperties & {
    lesson_id: number;
    hearts_remaining: number;
    challenges_completed: number;
  };
  hearts_empty: BaseProperties & { lesson_id?: number };
  practice_start: BaseProperties & { lesson_id: number };
  practice_complete: BaseProperties & { lesson_id: number };
  review_session_start: BaseProperties & { due_count: number };
  review_session_complete: BaseProperties & {
    reviewed_count: number;
    again_count: number;
    duration_ms: number;
  };
  paywall_view: BaseProperties & { surface: string };
  checkout_start: BaseProperties & { surface: string };
  checkout_complete: BaseProperties & { surface: string };
  explanation_view: BaseProperties & { challenge_id: number; cached: boolean };
  explanation_practice_click: BaseProperties & { challenge_id: number };
  signup_completed: BaseProperties & { user_id: string; ref_source?: string; ref_id?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string };
  first_lesson_started: BaseProperties & { user_id: string; lesson_id: number; course_id: number };
  user_activated: BaseProperties & { user_id: string; lesson_count: number; ref_source?: string; ref_id?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string };
  pwa_install_prompt_shown: BaseProperties;
  pwa_installed: BaseProperties;
  push_subscribed: BaseProperties;
  push_declined: BaseProperties;
  challenge_created: BaseProperties & { challenge_id: string; language: string };
  challenge_completed: BaseProperties & { challenge_id: string; friend_score: number; challenger_score: number };
  challenge_signup_click: BaseProperties & { challenge_id: string };
  challenge_share: BaseProperties & { challenge_id: string };
  landing_cta_click: BaseProperties & { cta_location: string };
  landing_language_click: BaseProperties & { language: string };
  landing_demo_interaction: BaseProperties & { correct: boolean; language: string };
  referral_reward_granted: BaseProperties & { referrer_id: string; referred_user_id: string; xp_reward: number };
  referral_invite_shared: BaseProperties & { user_id: string; method: string };
  lesson_share: BaseProperties & { lesson_id: number; method: "native" | "clipboard"; accuracy: number };
};

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type TrackPayload<E extends AnalyticsEventName> = {
  event: E;
  properties: AnalyticsEventMap[E];
};

function nowMs() {
  return Date.now();
}

type PropertiesInput<E extends AnalyticsEventName> = Omit<AnalyticsEventMap[E], keyof BaseProperties>;

export function buildTrackPayload<E extends AnalyticsEventName>(
  event: E,
  properties: PropertiesInput<E>,
): TrackPayload<E> {
  return {
    event,
    properties: {
      ts: nowMs(),
      schema_version: 1,
      ...(properties as PropertiesInput<E>),
    } as AnalyticsEventMap[E],
  };
}

export type TrackDispatcher = (payload: TrackPayload<AnalyticsEventName>) => void | Promise<void>;

function consoleDispatcher(payload: TrackPayload<AnalyticsEventName>) {
  // eslint-disable-next-line no-console
  console.info("[analytics]", payload.event, payload.properties);
}

/**
 * Environment-aware default dispatcher.
 *
 * - **Server** (Node.js / Edge): delegates to `serverPosthogDispatcher` which
 *   sends events to PostHog via `posthog-node`, or falls back to console when
 *   `POSTHOG_API_KEY` is not set.
 * - **Client** (browser): console-only until `setTrackDispatcher` is called
 *   with the PostHog JS dispatcher (via `initAnalytics`).
 */
function defaultDispatcher(payload: TrackPayload<AnalyticsEventName>) {
  if (typeof window === "undefined") {
    // Server-side: dynamically import to avoid bundling posthog-node on client
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { serverPosthogDispatcher } = require("@/lib/analytics-server") as {
      serverPosthogDispatcher: TrackDispatcher;
    };
    serverPosthogDispatcher(payload);
    return;
  }
  consoleDispatcher(payload);
}

let dispatcher: TrackDispatcher = defaultDispatcher;

/**
 * Swap tracking sink (useful for tests or wiring a vendor SDK).
 */
export function setTrackDispatcher(next: TrackDispatcher) {
  dispatcher = next;
}

/**
 * Type-safe analytics tracking.
 */
export async function track<E extends AnalyticsEventName>(
  event: E,
  properties: PropertiesInput<E>,
) {
  const payload = buildTrackPayload(event, properties);
  await dispatcher(payload as TrackPayload<AnalyticsEventName>);
  return payload;
}

/**
 * Useful when `event` is a union (e.g. conditional operator) and you
 * want type-checking for the exact event payload.
 */
export async function trackPayload(payload: TrackPayload<AnalyticsEventName>) {
  await dispatcher(payload);
  return payload;
}
