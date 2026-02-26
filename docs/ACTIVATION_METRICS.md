# Activation Metrics Guide

## Definitions

| Metric | Definition | Event |
|--------|-----------|-------|
| **Signup** | User creates account and completes onboarding | `signup_completed` |
| **Activated** | User completes their first full lesson (not onboarding sample) | `user_activated` |
| **DAL** | Daily Active Learners — unique users completing at least one lesson per day | `lesson_complete` (deduplicated daily) |

## Activation Funnel

```
signup_completed → first_lesson_started → user_activated
```

- `signup_completed`: Fires once when a new user row is created via onboarding
- `first_lesson_started`: Fires when a user with 0 completed lessons starts a quiz
- `user_activated`: Fires when the user's first lesson_completion row is inserted

## PostHog Setup

### 1. Create Activation Funnel

1. Go to PostHog → Insights → New Insight → Funnel
2. Steps:
   - Step 1: `signup_completed`
   - Step 2: `first_lesson_started`
   - Step 3: `user_activated`
3. Window: 7 days
4. Breakdown: by `course_id` (to see which language converts best)
5. Save as "Activation Funnel"

### 2. Create DAL Metric

1. Go to PostHog → Insights → New Insight → Trends
2. Event: `lesson_complete`
3. Math: Unique users (DAU)
4. Date range: Last 30 days
5. Save as "DAL (Daily Active Learners)"

### 3. Create Retention Cohort

1. Go to PostHog → Insights → New Insight → Retention
2. Cohort entry: `user_activated`
3. Return event: `lesson_complete`
4. Period: Day
5. Date range: Last 30 days
6. Save as "Activated User Retention"

### 4. Compare Activated vs Non-Activated Retention

1. Create a Cohort: users who have event `user_activated` at least once
2. Create another Cohort: users who have event `signup_completed` but NOT `user_activated`
3. Use Retention insight with filter by these cohorts to compare D1/D7/D30 retention

## Key Questions This Answers

- What % of signups become activated users?
- How long does activation take (time from signup to first lesson)?
- Which language has the highest activation rate?
- Do activated users retain better than non-activated? (validates the metric)
- What's our DAL trend? (North Star)
