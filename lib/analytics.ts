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
  subscription_activated: BaseProperties & { provider: string; subscription_id: string };
  subscription_payment_failed: BaseProperties & { provider: string; subscription_id: string };
  subscription_payment_success: BaseProperties & { provider: string; subscription_id: string };
  subscription_cancelled: BaseProperties & { provider: string; subscription_id: string; reason?: string };
  explanation_view: BaseProperties & { challenge_id: number; cached: boolean };
  explanation_practice_click: BaseProperties & { challenge_id: number };
  signup_completed: BaseProperties & { user_id: string; ref_source?: string; ref_id?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string };
  first_lesson_started: BaseProperties & { user_id: string; lesson_id: number; course_id: number };
  user_activated: BaseProperties & { user_id: string; lesson_count: number; ref_source?: string; ref_id?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string };
  pwa_install_prompt_shown: BaseProperties & { platform: 'ios' | 'android' | 'desktop' };
  pwa_install_clicked: BaseProperties & { platform: 'ios' | 'android' | 'desktop' };
  pwa_installed: BaseProperties & { platform: 'ios' | 'android' | 'desktop' };
  pwa_install_dismissed: BaseProperties & { platform: 'ios' | 'android' | 'desktop' };
  pwa_install_never: BaseProperties & { platform: 'ios' | 'android' | 'desktop' };
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
  lesson_share_prompt_shown: BaseProperties & { lesson_id: number; accuracy: number };
  lesson_share_clicked: BaseProperties & { lesson_id: number; method: "native" | "clipboard" | "card"; accuracy: number };
  milestone_share_clicked: BaseProperties & { type: string; value: number; method: string };
  share_card_opened: BaseProperties & { type: string; streak?: number; accuracy?: number };
  share_attempted: BaseProperties & { type: string; method: "native" | "clipboard" | "download" };
  share_completed: BaseProperties & { type: string; method: "native" | "clipboard" | "download"; success: boolean };
  onboarding_step_viewed: BaseProperties & { step: number; total_steps: number };
  onboarding_step_completed: BaseProperties & { step: number; duration_seconds?: number };
  onboarding_step_skipped: BaseProperties & { step: number; reason?: string };
  onboarding_abandon: BaseProperties & { last_step: number; exit_reason?: string };
  onboarding_course_selected: BaseProperties & { course_id: number };
  onboarding_goal_selected: BaseProperties & { goal: number };
  onboarding_try_it_result: BaseProperties & { correct: boolean };
  onboarding_try_it_variant_shown: BaseProperties & { variant: string };
  onboarding_quick_start_selected: BaseProperties & { course_id: number };
  // Streak risk intervention events
  streak_risk_shown: BaseProperties & { streak: number; has_freeze: boolean };
  streak_risk_clicked: BaseProperties & { streak: number; has_freeze: boolean };
  streak_saved: BaseProperties & { streak: number; lessons_completed: number };
  // Quest reminder events
  quest_reminder_sent: BaseProperties & { quest_id: string; user_id: string; channel: "push" | "email" };
  quest_reminder_clicked: BaseProperties & { quest_id: string; user_id: string };
  quest_completed_via_reminder: BaseProperties & { quest_id: string; user_id: string };
  // A/B test analytics for paywall
  paywall_variant_shown: BaseProperties & { variant: "a" | "b" | "c"; surface: string };
  paywall_conversion_by_variant: BaseProperties & { variant: "a" | "b" | "c"; surface: string; converted: boolean };
  // Paywall conversion funnel events
  paywall_start_checkout: BaseProperties & { variant: "a" | "b" | "c"; surface: string };
  paywall_complete: BaseProperties & { variant: "a" | "b" | "c"; surface: string; provider: string; subscription_id: string };
  paywall_cancel: BaseProperties & { variant: "a" | "b" | "c"; surface: string; step: "checkout" | "payment" };
  // App engagement for retention tracking
  app_open: BaseProperties & { user_id: string; session_count?: number };
  user_returned: BaseProperties & { user_id: string; days_since_last_session: number };
  streak_started: BaseProperties & { user_id: string };
  // Empty state events
  empty_state_shown: BaseProperties & { state_type: "new_user" | "no_progress" | "first_lesson"; user_id: string };
  empty_state_cta_clicked: BaseProperties & { state_type: "new_user" | "no_progress" | "first_lesson"; user_id: string; cta_action: string };
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

/**
 * Helper type for A/B test variants.
 */
export type Variant = "a" | "b" | "c";

/**
 * Track paywall conversion funnel events.
 * Use this to track the full paywall-to-purchase funnel with A/B variant.
 */
export async function trackPaywallConversion(
  variant: Variant,
  surface: string,
  outcome: "start" | "complete" | "cancel",
  details?: { provider?: string; subscription_id?: string; step?: "checkout" | "payment" },
) {
  const baseProps = { variant, surface };

  switch (outcome) {
    case "start":
      return track("paywall_start_checkout", baseProps);
    case "complete":
      if (!details?.provider || !details?.subscription_id) {
        throw new Error("provider and subscription_id required for complete event");
      }
      return track("paywall_complete", {
        ...baseProps,
        provider: details.provider,
        subscription_id: details.subscription_id,
      });
    case "cancel":
      return track("paywall_cancel", {
        ...baseProps,
        step: details?.step ?? "checkout",
      });
  }
}

/**
 * Track onboarding step completion.
 */
export async function trackOnboardingStep(
  step: number,
  totalSteps: number,
  action: "view" | "complete" | "skip",
) {
  switch (action) {
    case "view":
      return track("onboarding_step_viewed", { step, total_steps: totalSteps });
    case "complete":
      return track("onboarding_step_completed", { step });
    case "skip":
      return track("onboarding_step_skipped", { step });
  }
}

/**
 * Track user activation events.
 */
export async function trackActivationEvent(
  event: "first_lesson_complete" | "streak_started" | "daily_goal_set",
  userId: string,
) {
  const ts = Date.now();
  switch (event) {
    case "first_lesson_complete":
      return trackPayload({
        event: "user_activated",
        properties: {
          ts,
          schema_version: 1,
          user_id: userId,
          lesson_count: 1,
        },
      });
    case "streak_started":
      return track("streak_started", { user_id: userId });
    case "daily_goal_set":
      return track("onboarding_goal_selected", { goal: 1 });
  }
}

/**
 * Track app open for retention analytics.
 */
export async function trackAppOpen(userId: string, sessionCount?: number) {
  return track("app_open", { user_id: userId, session_count: sessionCount });
}

/**
 * Track user return after absence.
 */
export async function trackUserReturned(userId: string, daysSinceLastSession: number) {
  return track("user_returned", { user_id: userId, days_since_last_session: daysSinceLastSession });
}

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
