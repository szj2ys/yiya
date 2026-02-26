# Sentry Error Alerting Configuration

## Current SDK Setup

Sentry is initialized in three config files:

- `sentry.client.config.ts` — Browser errors, Session Replay
- `sentry.server.config.ts` — Server-side (Node.js) errors
- `sentry.edge.config.ts` — Edge runtime errors

All configs use `tracesSampleRate: 0.1` in production and `1.0` in development.
Source maps are uploaded in CI via `withSentryConfig` in `next.config.mjs`.

## Recommended Alert Rules

Configure these alerts in **Sentry > Alerts > Create Alert Rule**:

### 1. Error Rate Spike (> 5x baseline)

- **Alert type**: Issue alert
- **Conditions**:
  - When: An event is seen more than 5x the baseline in 5 minutes
  - Or use: **Metric Alert** with `count()` of events, threshold = 5x the average over the past 24 hours
- **Filter**: All error events (no filter)
- **Action**: Notify via Slack channel and email (see Notification section below)
- **Frequency**: Alert at most once every 30 minutes

### 2. Response Time p95 > 3 seconds

- **Alert type**: Metric alert
- **Metric**: `p95(transaction.duration)`
- **Threshold**: Critical if > 3000ms for 5 minutes
- **Warning**: If > 2000ms for 5 minutes
- **Filter**: Transaction type = `pageload` or `api`
- **Action**: Notify via Slack channel and email
- **Frequency**: Alert at most once every 30 minutes

### 3. New Issue Alert (recommended addition)

- **Alert type**: Issue alert
- **Conditions**: When a new issue is first seen
- **Filter**: Error level = `error` or `fatal`
- **Action**: Notify via Slack channel
- **Frequency**: Every occurrence

## Notification Channels

### Slack Integration

1. Go to **Sentry > Settings > Integrations > Slack**
2. Install the Sentry Slack app
3. Configure a channel (e.g., `#alerts-prod`) for alert delivery
4. Add the Slack action to each alert rule above

### Email Notification

1. Go to **Sentry > Settings > Integrations > Email**
2. Ensure team members are subscribed to alert emails
3. Add email action to critical alert rules (error spike, p95)

## Verification

- **Error spike**: Deploy a test error (e.g., throw in a dev route), confirm alert fires within 5 minutes
- **p95 latency**: Simulate a slow API route, confirm the metric alert triggers
- **Uncaught exception**: Any unhandled error reaching Sentry should trigger the new issue alert

## Environment Configuration

Required environment variables:

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | Client + Server | Sentry project DSN |
| `SENTRY_DSN` | Server only | Server-side DSN (falls back to `NEXT_PUBLIC_SENTRY_DSN`) |
| `SENTRY_AUTH_TOKEN` | CI only | Source map upload authentication |
