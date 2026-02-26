# PostHog Conversion Funnel Dashboard

## Funnel: Signup to Retained User (DAL)

This funnel tracks users from first landing page visit through to 7-day retention.

### Funnel Steps

| Step | Event Name | Filter / Property | Source |
|------|-----------|-------------------|--------|
| 1. Landing page view | `$pageview` | `$current_url` contains `/` (root) | PostHog auto-capture (`capture_pageview: true`) |
| 2. Signup completed | `signup_completed` | `user_id` | `actions/user-progress.ts` — fired on first course selection |
| 3. First lesson started | `first_lesson_started` | `user_id`, `lesson_id`, `course_id` | `actions/user-progress.ts` — fired immediately after signup |
| 4. User activated | `user_activated` | `user_id`, `lesson_count` | `actions/challenge-progress.ts` — fired when lesson count reaches `ACTIVATION_LESSON_COUNT` |
| 5. Day-2 return | `session_start` | `$timestamp` >= signup + 1 day | `components/posthog-provider.tsx` — fired on each authenticated session |
| 6. Day-7 return | `session_start` | `$timestamp` >= signup + 6 days | Same as above |

### PostHog Dashboard Setup

1. Go to **PostHog > Insights > New insight > Funnel**.
2. Add the six steps above in order.
3. For steps 5 and 6, use the **Funnel time window** to set the conversion window to 7 days.
4. For day-2/day-7 retention, use PostHog's **Retention** insight type with:
   - **Cohort**: Users who performed `signup_completed`
   - **Returning event**: `session_start`
   - **Period**: Day
   - This gives a standard retention curve showing day-1 through day-7+ return rates.

### Event Audit

All funnel events are currently fired in the codebase:

| Event | Fired? | Location |
|-------|--------|----------|
| `$pageview` (landing) | Yes | PostHog auto-capture in `components/posthog-provider.tsx` |
| `signup_completed` | Yes | `actions/user-progress.ts:67` |
| `first_lesson_started` | Yes | `actions/user-progress.ts:70` |
| `user_activated` | Yes | `actions/challenge-progress.ts:170` |
| `session_start` | Yes | `components/posthog-provider.tsx:52` |

### Event Schemas

All custom events use the typed `AnalyticsEventMap` in `lib/analytics.ts` with:
- `schema_version: 1` — for safe schema evolution
- `ts` — Unix timestamp in milliseconds

### Breakdowns

Recommended breakdowns for the funnel:
- **By course**: Add `course_id` property breakdown on `first_lesson_started`
- **By referral source**: Use PostHog's `$referring_domain` property on `$pageview`
- **By device**: Use PostHog's `$device_type` property
