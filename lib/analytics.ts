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
  session_start: BaseProperties;
  lesson_start: BaseProperties & { lesson_id: number };
  lesson_complete: BaseProperties & { lesson_id: number; hearts_remaining: number };
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

function defaultDispatcher(payload: TrackPayload<AnalyticsEventName>) {
  // Phase 0: console-only. Production can swap to Segment/PostHog/etc.
  // eslint-disable-next-line no-console
  console.info("[analytics]", payload.event, payload.properties);
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
