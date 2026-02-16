# PRD: AI-Powered Learning Engine

> Product Requirements Document
> Version: 1.0
> Date: 2026-02-15
> Status: Draft

---

## 1. Background & Motivation

### 1.1 Current Product

Yiya is a Duolingo-style gamified language learning web app. Core flow:

```
Course Selection -> Unit/Lesson Progress -> Challenge Quiz -> Practice Review -> Paywall/Pro
```

Tech stack: Next.js 14 + Drizzle ORM + PostgreSQL (NeonDB) + Clerk Auth + Stripe.

### 1.2 Current Limitations

| Dimension | Current State | Problem |
|-----------|--------------|---------|
| Content | Static seed data, manually authored | Expensive to scale; one-size-fits-all |
| Challenge types | SELECT (multiple choice) + ASSIST (fill-blank) | Cannot train real output ability (speaking/writing) |
| Review | Simple "recent-wrong-first" query | No forgetting curve; no personalized intervals |
| Feedback | Binary correct/incorrect | User never learns *why* they were wrong |
| Interaction | Tap an option -> next question | Passive; no authentic conversation practice |
| Learning path | Linear Unit -> Lesson for all users | Wastes time on known material; no adaptive difficulty |

### 1.3 Opportunity

Every limitation above maps to a proven AI capability. The cost of LLM APIs has dropped to where per-interaction costs ($0.001 - $0.05) are commercially viable even on a $20/month subscription. This PRD defines how to systematically introduce AI to transform Yiya from a "static quiz app" into a "personalized AI learning engine."

---

## 2. Goals & Non-Goals

### Goals

- G1: Dramatically improve learning outcomes by making practice personalized and adaptive.
- G2: Unlock new interaction modalities (conversation, writing, pronunciation) that static quizzes cannot support.
- G3: Reduce content creation cost by 10x through AI-assisted generation.
- G4: Strengthen monetization with AI features as premium differentiators.
- G5: Build a data flywheel: user learning data improves AI recommendations, which improves retention, which generates more data.

### Non-Goals

- Full replacement of human-curated curriculum (AI augments, humans approve).
- Building a custom LLM or fine-tuned model (use commercial APIs: Claude, etc.).
- Native mobile app (remain web-first; responsive PWA is sufficient for now).
- Real-time multiplayer AI features.

---

## 3. Feature Specifications

### 3.1 F1 - AI Explanation on Wrong Answers

**Priority: P0 | Effort: S | Impact: High**

#### Problem
When users answer incorrectly, they see the correct answer but never understand *why* they were wrong. This leads to repeated mistakes and frustration.

#### Solution
After each wrong answer, generate a brief, contextual explanation using an LLM.

#### User Flow

```
User answers incorrectly
  |
  v
Show correct answer (existing)
  +
Show AI explanation panel:
  - Why the answer was wrong (1 sentence)
  - The grammar/vocabulary rule (1-2 sentences)
  - A memory tip or mnemonic (1 sentence)
  - 1-2 similar examples
  |
  v
[Got it] or [Practice this rule]
```

#### UI Spec

```
+-------------------------------------------+
|  x  Your answer: "Yo soy cansado"        |
|  v  Correct:     "Yo estoy cansado"      |
|                                           |
|  Why?                                     |
|  "Cansado" describes a temporary state,   |
|  so use "estar" instead of "ser."         |
|  Ser = identity. Estar = state/condition. |
|                                           |
|  Similar:                                 |
|  - Estoy feliz (I'm happy right now)     |
|  - Soy doctor (I am a doctor - identity) |
|                                           |
|  [Got it]  [Practice this rule ->]        |
+-------------------------------------------+
```

#### Technical Design

**API call:**
```
POST /api/ai/explain
Body: {
  challengeId: number,
  userAnswer: string,
  correctAnswer: string,
  challengeType: "SELECT" | "ASSIST",
  courseLanguage: string,
  userLanguage: "en"  // or detect
}
Response: {
  explanation: string,
  rule: string,
  tip: string,
  examples: { source: string, translation: string }[]
}
```

**LLM prompt structure:**
- System: "You are a language tutor. Explain errors concisely in the student's language. Always include the grammar rule and a memory aid."
- User: challenge context + user answer + correct answer

**Cost control:**
- Cache explanations by (challengeId, userAnswer) pair - most users make the same mistakes.
- Use Haiku-tier model for explanations (~$0.001 per call).
- Rate limit: max 20 explanation calls per user per day.

**DB changes:** None required. Cache in Redis/KV or in-memory LRU.

**New analytics events:**
```typescript
explanation_view: { challenge_id: number; cached: boolean };
explanation_practice_click: { challenge_id: number };
```

#### Acceptance Criteria
- [ ] Explanation appears within 2 seconds of wrong answer.
- [ ] Explanation is in the user's language, not the target language.
- [ ] Cached explanations serve in < 200ms.
- [ ] "Practice this rule" navigates to a related challenge set.
- [ ] Works for both SELECT and ASSIST challenge types.

---

### 3.2 F2 - Smart Spaced Repetition (FSRS)

**Priority: P1 | Effort: M | Impact: High**

#### Problem
Current review system (`getTodayReviewItems`) uses a naive "recent-wrong + recent-completed" approach. No forgetting curve modeling means users either:
- Over-review material they already know well.
- Under-review material at the critical forgetting point.

#### Solution
Replace the review algorithm with FSRS (Free Spaced Repetition Scheduler), an open-source algorithm that outperforms Anki's SM-2. Augment with LLM-generated variant questions to prevent pattern memorization.

#### How FSRS Works

```
Each review card maintains:
  - stability: how long the memory will last (days)
  - difficulty: inherent difficulty of the card (0-10)
  - elapsed_days: days since last review
  - scheduled_days: days until next review
  - reps: number of times reviewed
  - state: New | Learning | Review | Relearning

After each review, FSRS calculates:
  retrievability = e^(-elapsed_days / stability)

  If user answers correctly -> increase stability
  If user answers incorrectly -> decrease stability, set state to Relearning
```

#### Data Model Changes

New table: `review_cards`

```sql
CREATE TABLE review_cards (
  id            SERIAL PRIMARY KEY,
  user_id       TEXT NOT NULL,
  challenge_id  INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  state         TEXT NOT NULL DEFAULT 'new',       -- new|learning|review|relearning
  stability     REAL NOT NULL DEFAULT 0,
  difficulty    REAL NOT NULL DEFAULT 5.0,
  elapsed_days  INTEGER NOT NULL DEFAULT 0,
  scheduled_days INTEGER NOT NULL DEFAULT 0,
  reps          INTEGER NOT NULL DEFAULT 0,
  lapses        INTEGER NOT NULL DEFAULT 0,
  due           TIMESTAMP NOT NULL DEFAULT NOW(),
  last_review   TIMESTAMP,
  UNIQUE(user_id, challenge_id)
);
CREATE INDEX idx_review_cards_due ON review_cards(user_id, due);
```

#### Updated Review Flow

```
User opens "Today's Practice"
  |
  v
Query: SELECT * FROM review_cards
       WHERE user_id = ? AND due <= NOW()
       ORDER BY due ASC
       LIMIT 20
  |
  v
For each card:
  1. Present the challenge
  2. User answers
  3. Rate: Again(1) | Hard(2) | Good(3) | Easy(4)
     (auto-map: wrong = Again, correct = Good, fast correct = Easy)
  4. Run FSRS algorithm -> update card fields
  5. Save to DB
  |
  v
Session summary:
  "You reviewed 15 items. 3 need more work."
  "Next review: 5 items due tomorrow."
```

#### AI Enhancement: Variant Question Generation

To prevent users from memorizing answer positions rather than understanding:

```
When a card comes up for review:
  70% chance: show original challenge
  30% chance: generate AI variant
    - Same knowledge point
    - Different question phrasing / different options
    - Cached per challenge for reuse
```

**LLM prompt:** "Generate an alternative question testing the same concept as: [original question + answer]. Change the phrasing and options but keep the same difficulty."

#### Technical Design

- Use `ts-fsrs` npm package (MIT, TypeScript native).
- New server action: `actions/review.ts` with `getReviewSession()`, `submitReview()`.
- Replace `getTodayReviewItems()` with FSRS-based query.
- Migration: existing `challengeProgress` records seed initial review cards (wrong = state:relearning, completed = state:review).

#### Acceptance Criteria
- [ ] Review cards created automatically when user completes/fails a challenge.
- [ ] Due items sorted by urgency (most overdue first).
- [ ] FSRS parameters update correctly on each review.
- [ ] Review session shows progress bar and summary.
- [ ] AI variants generated for at least 30% of reviews (when enabled).
- [ ] "Today's Practice" badge shows count of due items.

---

### 3.3 F3 - Adaptive Placement Test & Personalized Path

**Priority: P2 | Effort: L | Impact: High**

#### Problem
All users start at Unit 1, Lesson 1 regardless of prior knowledge. Beginners feel overwhelmed; experienced learners are bored.

#### Solution
An AI-powered placement test that adaptively determines the user's CEFR level (A1-C2), then generates a personalized learning path that skips known material and targets weak areas.

#### Placement Test Flow

```
User selects a course (e.g., Spanish)
  |
  v
"Want to start from the beginning, or take a placement test?"
  [Start from scratch]  [Find my level]
  |                       |
  v                       v
Unit 1, Lesson 1       Placement Test
                         |
                         v
                       Round 1: Medium difficulty (A2)
                         -> Correct? Increase difficulty
                         -> Wrong? Decrease difficulty
                       Round 2-10: Adaptive (CAT algorithm)
                         |
                         v
                       Result:
                       "Your level: B1 (Intermediate)"
                       "Strong: vocabulary, greetings"
                       "Weak: verb conjugation, past tense"
                         |
                         v
                       Generate personalized path:
                       - Skip: Units 1-3 (marked as "mastered")
                       - Start: Unit 4 with extra conjugation drills
                       - Inject: remedial lessons for weak areas
```

#### Technical Design

**Adaptive question selection (CAT - Computerized Adaptive Testing):**

```typescript
type PlacementState = {
  currentLevel: number;     // 0-5 mapping to A1-C2
  confidence: number;       // 0-1, stop when > 0.8
  questionsAsked: number;
  history: { level: number; correct: boolean }[];
};

// After each answer:
if (correct) currentLevel += 0.5 * (1 - confidence);
if (wrong)   currentLevel -= 0.5 * (1 - confidence);
confidence += 0.1;

// Stop when confidence > 0.8 or questionsAsked >= 10
```

**LLM role:**
1. Generate placement questions at target CEFR level on-the-fly.
2. Analyze answer patterns to identify specific weak areas.
3. Generate a recommended learning path as ordered lesson IDs with rationale.

**DB changes:**

```sql
ALTER TABLE user_progress
  ADD COLUMN cefr_level TEXT,                    -- A1|A2|B1|B2|C1|C2
  ADD COLUMN weak_areas TEXT[] DEFAULT '{}',     -- e.g., {'verb_conjugation','past_tense'}
  ADD COLUMN learning_goal TEXT,                 -- e.g., 'travel','business','exam'
  ADD COLUMN placement_completed_at TIMESTAMP;
```

New table: `personalized_path`

```sql
CREATE TABLE personalized_path (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL,
  course_id  INTEGER NOT NULL REFERENCES courses(id),
  lesson_id  INTEGER NOT NULL REFERENCES lessons(id),
  status     TEXT NOT NULL DEFAULT 'pending',  -- pending|skipped|unlocked|completed
  reason     TEXT,                              -- 'placement_skip'|'weak_area'|'standard'
  sort_order INTEGER NOT NULL,
  UNIQUE(user_id, lesson_id)
);
```

#### Acceptance Criteria
- [ ] Placement test completes in 5-10 questions (under 3 minutes).
- [ ] CEFR level result displayed with visual breakdown of strengths/weaknesses.
- [ ] Personalized path visibly differs from default linear path.
- [ ] Skipped lessons marked as "Mastered" with option to "Review anyway."
- [ ] Weak-area lessons highlighted with a badge.
- [ ] User can retake placement test from settings.

---

### 3.4 F4 - AI Conversation Practice

**Priority: P3 | Effort: XL | Impact: Very High**

#### Problem
Language learning requires productive output (speaking/writing), but all current challenges are receptive (recognition-based). Users can pass every quiz yet fail to hold a basic conversation.

#### Solution
A new challenge type: CONVERSATION. AI plays a role in a real-world scenario, the user responds freely, and the AI provides real-time corrections and coaching.

#### New Challenge Type

```sql
-- Extend the existing enum
ALTER TYPE type ADD VALUE 'CONVERSATION';
```

#### Conversation Flow

```
User enters conversation practice
  |
  v
Scenario card:
  "You're at a cafe in Barcelona.
   Order a coffee and ask for the Wi-Fi password."
  [Start conversation]
  |
  v
+-------------------------------------------+
|  AI (Waiter):                              |
|  "Hola, bienvenido. Que desea tomar?"    |
|                        [play audio]       |
|                                           |
|  You:                                     |
|  [Type your response...         ] [Send]  |
|  or [Hold to speak]                       |
|                                           |
+-------------------------------------------+
  |
  v
After each user message, AI returns:
  1. In-character response (continue conversation)
  2. Inline corrections (if grammar/vocab errors)
  3. Naturalness score (1-10)
  4. Suggestion for more natural phrasing
  |
  v
After 4-6 exchanges:
+-------------------------------------------+
|  Conversation Complete!                    |
|                                           |
|  Score: 7/10                              |
|  - Grammar: 8/10                          |
|  - Vocabulary: 7/10                        |
|  - Naturalness: 6/10                      |
|                                           |
|  Key corrections:                          |
|  1. "Quiero cafe" -> "Quiero un cafe"    |
|     (articles are needed before nouns)     |
|  2. "Como es el wifi?" ->                 |
|     "Cual es la contrasena del wifi?"     |
|     ("cual" for specific items)           |
|                                           |
|  [Practice again] [Next scenario]          |
+-------------------------------------------+
```

#### Technical Design

**Conversation API:**

```
POST /api/ai/conversation
Body: {
  sessionId: string,          // conversation session UUID
  scenarioId?: string,        // predefined scenario (optional)
  courseLanguage: string,
  userLevel: string,          // CEFR level
  messages: Message[],        // conversation history
  userMessage: string         // latest user input
}

Response: {
  reply: string,              // AI's in-character response
  replyAudio?: string,        // TTS audio URL (optional)
  corrections: Correction[],
  naturalness: number,
  suggestion?: string,
  conversationComplete: boolean,
  summary?: ConversationSummary
}

type Correction = {
  original: string,
  corrected: string,
  rule: string
};

type ConversationSummary = {
  overallScore: number,
  grammarScore: number,
  vocabularyScore: number,
  naturalnessScore: number,
  keyCorrections: Correction[],
  newVocabulary: string[]
};
```

**LLM prompt architecture:**

```
System prompt (cached, reused per session):
  - Role: language tutor playing character in scenario
  - User's CEFR level -> adjust vocabulary complexity
  - Always respond in target language
  - After each user message, provide JSON with:
    reply, corrections, naturalness score, suggestion
  - After 4-6 exchanges, signal completion with summary

User prompt:
  - Scenario description
  - Conversation history
  - Latest user message
```

**Voice input (progressive enhancement):**
- Phase 1: Text-only input.
- Phase 2: Web Speech API (free, browser-native) for speech-to-text.
- Phase 3: Whisper API for higher accuracy + pronunciation scoring.

**Scenario management:**

```sql
CREATE TABLE conversation_scenarios (
  id           SERIAL PRIMARY KEY,
  course_id    INTEGER NOT NULL REFERENCES courses(id),
  cefr_level   TEXT NOT NULL,
  title        TEXT NOT NULL,       -- "At a cafe"
  description  TEXT NOT NULL,       -- "Order coffee and ask for Wi-Fi"
  system_prompt TEXT NOT NULL,      -- AI's role and constraints
  tags         TEXT[] DEFAULT '{}', -- ['food','travel','beginner']
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE conversation_sessions (
  id           TEXT PRIMARY KEY,    -- UUID
  user_id      TEXT NOT NULL,
  scenario_id  INTEGER REFERENCES conversation_scenarios(id),
  messages     JSONB NOT NULL DEFAULT '[]',
  summary      JSONB,
  score        REAL,
  completed_at TIMESTAMP,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Cost estimation:**
- Average conversation: 6 exchanges x ~500 tokens = ~3000 tokens/session
- Sonnet: ~$0.03/session, Haiku: ~$0.005/session
- At 5 conversations/user/day, 1000 DAU: $25-$150/day

**New analytics events:**
```typescript
conversation_start: { scenario_id: number; cefr_level: string };
conversation_message: { scenario_id: number; turn: number };
conversation_complete: { scenario_id: number; score: number; turns: number };
```

#### Acceptance Criteria
- [ ] AI responds within 3 seconds per turn.
- [ ] Corrections shown inline without breaking conversation flow.
- [ ] Summary shown at end with actionable feedback.
- [ ] Conversation history persisted for review.
- [ ] Scenario library with 5+ scenarios per language per CEFR level.
- [ ] Text input works on all devices; voice input as progressive enhancement.
- [ ] Pro-only or limited free (2 conversations/day free, unlimited for Pro).

---

### 3.5 F5 - AI Content Generation Pipeline

**Priority: P4 | Effort: L | Impact: Medium**

#### Problem
Adding a new language or topic requires hand-authoring every unit, lesson, challenge, and option in `seed.ts`. This makes expansion slow, expensive, and bottlenecked on content creators.

#### Solution
An AI content generation pipeline integrated into the Admin dashboard. Operators define high-level specs; AI generates full course structures; humans review and approve before publishing.

#### Admin Workflow

```
Admin Dashboard -> "Generate Course"
  |
  v
Form:
  Language: [Japanese]
  Topic: [Travel Japanese]
  CEFR level: [A1-A2]
  Units: [10]
  Lessons per unit: [5]
  Challenges per lesson: [10]
  |
  v
AI generates course structure (async job):
  Unit 1: Airport & Immigration
    Lesson 1: Basic Greetings
      Challenge 1 (SELECT): ...
      Challenge 2 (ASSIST): ...
      Challenge 3 (CONVERSATION): ...
    Lesson 2: Asking Directions
    ...
  Unit 2: Hotel Check-in
  ...
  |
  v
Admin review interface:
  [Approve all] [Edit] [Regenerate] [Reject]
  Per-item: [Approve] [Edit] [Regenerate]
  |
  v
Approved content -> Published (visible to users)
```

#### Technical Design

**Generation API:**

```
POST /api/admin/generate-course
Body: {
  language: string,
  topic: string,
  cefrLevel: string,
  units: number,
  lessonsPerUnit: number,
  challengesPerLesson: number
}

Response: {
  jobId: string,
  status: "queued"
}

GET /api/admin/generate-course/:jobId
Response: {
  status: "processing" | "completed" | "failed",
  progress: number,       // 0-100
  result?: GeneratedCourse
}
```

**Generation pipeline (multi-step):**

```
Step 1: Generate course outline (units + descriptions)
  -> LLM call with curriculum design prompt
  -> Output: JSON array of units with titles and themes

Step 2: For each unit, generate lessons
  -> LLM call with unit context
  -> Output: JSON array of lessons with learning objectives

Step 3: For each lesson, generate challenges
  -> LLM call with lesson context + challenge type distribution
  -> Output: JSON array of challenges with options
  -> Validation: ensure exactly 1 correct option per challenge

Step 4: Quality check pass
  -> LLM reviews generated content for:
     - Linguistic accuracy
     - CEFR level appropriateness
     - No duplicate questions
     - Cultural sensitivity
  -> Output: flagged items for human review
```

**DB changes:**

```sql
ALTER TABLE courses ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
  -- draft | review | published
ALTER TABLE units ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE lessons ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE challenges ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE challenges ADD COLUMN ai_generated BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE generation_jobs (
  id          TEXT PRIMARY KEY,
  admin_id    TEXT NOT NULL,
  spec        JSONB NOT NULL,
  status      TEXT NOT NULL DEFAULT 'queued',
  progress    INTEGER NOT NULL DEFAULT 0,
  result      JSONB,
  error       TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

**Cost estimation:**
- Full course (10 units x 5 lessons x 10 challenges = 500 challenges): ~$2-5 in API costs.
- Compared to human content creation: 50-100 hours of work saved per course.

#### Acceptance Criteria
- [ ] Admin can specify course parameters and trigger generation.
- [ ] Generation completes within 5 minutes for a standard course.
- [ ] Progress indicator shown during generation.
- [ ] Generated content enters "review" status (not auto-published).
- [ ] Per-item edit/regenerate/approve in review interface.
- [ ] Bulk approve action available.
- [ ] Generated challenges validated: exactly 1 correct option, no empty fields.
- [ ] AI-generated content flagged in DB for quality tracking.

---

## 4. Architecture Overview

### 4.1 System Architecture

```
                    +------------------+
                    |   Next.js App    |
                    |  (App Router)    |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
     +--------v--------+          +--------v--------+
     | Server Actions   |          |  API Routes     |
     | (lesson, review,  |         | (/api/ai/*)     |
     |  practice)        |         | (/api/admin/*)  |
     +--------+---------+         +--------+---------+
              |                             |
              +----------+------------------+
                         |
                +--------v--------+
                | AI Service Layer |
                | (lib/ai/)       |
                +--------+---------+
                         |
           +-------------+-------------+
           |             |             |
    +------v------+ +---v----+ +-----v------+
    | LLM Provider| | Cache  | | PostgreSQL |
    | (Claude API)| | (KV)   | | (NeonDB)   |
    +-------------+ +--------+ +------------+
```

### 4.2 New Modules

```
lib/
  ai/
    client.ts          -- LLM client wrapper (Claude SDK)
    explain.ts         -- F1: explanation generation
    conversation.ts    -- F4: conversation engine
    content-gen.ts     -- F5: course generation pipeline
    placement.ts       -- F3: adaptive test question generation
    variants.ts        -- F2: variant question generation
    prompts/
      explain.ts       -- Prompt templates for explanations
      conversation.ts  -- Prompt templates for conversations
      placement.ts     -- Prompt templates for placement
      content.ts       -- Prompt templates for content gen
    cache.ts           -- LLM response cache layer

actions/
  review.ts            -- F2: FSRS review session actions
  placement.ts         -- F3: placement test actions
  conversation.ts      -- F4: conversation session actions

db/
  schema.ts            -- Extended with new tables (review_cards, etc.)
```

### 4.3 LLM Cost Budget

| Feature | Model Tier | Cost/Call | Calls/User/Day | Daily Cost @1K DAU |
|---------|-----------|-----------|-----------------|-------------------|
| F1 Explanations | Haiku | $0.001 | 10 | $10 |
| F2 Variants | Haiku | $0.002 | 5 | $10 |
| F3 Placement | Sonnet | $0.01 | 0.05 (one-time) | $0.50 |
| F4 Conversations | Sonnet | $0.03 | 3 | $90 |
| F5 Content Gen | Opus | $0.50 | admin-only | negligible |
| **Total** | | | | **~$110/day** |

At $20/month/user with 1000 DAU and ~10% paying: $2000 MRR vs $3300/month API cost. This means:
- F1/F2/F3: viable for all users (low cost).
- F4 (Conversations): Pro-only or rate-limited for free users.
- F5: Admin tool, negligible cost.

---

## 5. Implementation Phases

### Phase 0: Foundation (Week 1-2)

| Task | Description |
|------|-------------|
| AI client setup | Create `lib/ai/client.ts` with Claude SDK, error handling, retry logic |
| Cache layer | KV/Redis cache for LLM responses with TTL |
| Analytics events | Add AI-related events to `AnalyticsEventMap` |
| Environment config | `ANTHROPIC_API_KEY`, feature flags for each AI feature |
| Rate limiting | Per-user rate limiter for AI endpoints |

### Phase 1: AI Explanations (Week 2-3) - F1

| Task | Description |
|------|-------------|
| Explain API | `/api/ai/explain` endpoint |
| Prompt engineering | Tune explanation prompts per language |
| UI component | `ExplanationPanel` shown after wrong answer in lesson |
| Caching | Cache by (challengeId, userAnswer) |
| Analytics | Track explanation views and engagement |

### Phase 2: Smart Review (Week 3-5) - F2

| Task | Description |
|------|-------------|
| DB migration | Create `review_cards` table |
| FSRS integration | Install `ts-fsrs`, implement scheduling logic |
| Data migration | Seed review cards from existing `challengeProgress` |
| Review session UI | Updated "Today's Practice" with FSRS-driven cards |
| Variant generation | AI variant questions (30% of reviews) |
| Due count badge | Show pending review count on learn page |

### Phase 3: Placement Test (Week 5-7) - F3

| Task | Description |
|------|-------------|
| DB migration | Extend `userProgress`, create `personalized_path` |
| CAT algorithm | Adaptive test engine in `lib/ai/placement.ts` |
| Question generation | LLM generates questions at target CEFR level |
| Placement UI | Full-screen test flow with progress and result |
| Path generation | Create personalized lesson ordering |
| Learn page update | Show skipped/mastered/weak-area badges |

### Phase 4: AI Conversation (Week 7-11) - F4

| Task | Description |
|------|-------------|
| DB migration | Create `conversation_scenarios`, `conversation_sessions` |
| Conversation engine | `lib/ai/conversation.ts` with streaming responses |
| Scenario library | Seed 5+ scenarios per language per CEFR level |
| Conversation UI | Chat interface with corrections overlay |
| Scoring system | Per-turn and session-level scoring |
| Voice input (v2) | Web Speech API integration |
| Paywall integration | Rate limit for free, unlimited for Pro |

### Phase 5: Content Generation (Week 11-13) - F5

| Task | Description |
|------|-------------|
| DB migration | Add status columns, create `generation_jobs` |
| Generation pipeline | Multi-step LLM content generation |
| Admin UI | Generate, review, approve workflow |
| Quality validation | Automated checks + LLM review pass |

---

## 6. Success Metrics

| Metric | Current Baseline | Target (90 days post-launch) |
|--------|-----------------|------------------------------|
| D7 retention | TBD (measure first) | +15% |
| Daily practice sessions / user | TBD | +30% |
| Wrong-answer repeat rate | TBD | -40% (with AI explanations) |
| Review efficiency (items/min) | TBD | +25% (with FSRS) |
| Pro conversion rate | TBD | +20% (AI features as premium) |
| Content creation time per course | ~80 hours | ~8 hours (with AI gen + review) |
| NPS / satisfaction score | TBD | +10 points |

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LLM generates incorrect grammar | Medium | High | Human review for content gen; community reporting for explanations; prompt engineering with native speaker validation |
| API costs exceed budget | Medium | Medium | Aggressive caching; Haiku for low-stakes calls; rate limiting; Pro-only for expensive features |
| Latency degrades UX | Low | High | Streaming responses; cache warm-up; fallback to static content if AI unavailable |
| User trusts AI blindly | Medium | Medium | Show "AI-generated" label; add "Report error" button; human review pipeline |
| Dependency on single LLM provider | Low | Medium | Abstract AI client behind interface; support multiple providers |
| Scope creep during development | High | Medium | Strict phase gating; each phase must ship and validate before starting next |

---

## 8. Open Questions

| # | Question | Decision Needed By |
|---|----------|--------------------|
| 1 | Should AI explanations be available to free users or Pro-only? | Phase 1 start |
| 2 | Which languages to prioritize for conversation scenarios? | Phase 4 start |
| 3 | Do we need a human reviewer pipeline for AI-generated content, or is the admin sufficient? | Phase 5 start |
| 4 | Should we use Claude exclusively or multi-provider (Claude + OpenAI) for redundancy? | Phase 0 |
| 5 | Voice input: Web Speech API (free, lower accuracy) vs Whisper API (paid, higher accuracy)? | Phase 4 v2 |

---

## Appendix A: New Analytics Events

```typescript
// Add to AnalyticsEventMap in lib/analytics.ts

// F1: AI Explanations
explanation_view: BaseProperties & {
  challenge_id: number;
  cached: boolean;
};
explanation_practice_click: BaseProperties & {
  challenge_id: number;
};
explanation_error_report: BaseProperties & {
  challenge_id: number;
  feedback: string;
};

// F2: Smart Review
review_session_start: BaseProperties & {
  due_count: number;
};
review_session_complete: BaseProperties & {
  reviewed_count: number;
  again_count: number;
  duration_ms: number;
};
review_variant_shown: BaseProperties & {
  challenge_id: number;
  variant_id: string;
};

// F3: Placement Test
placement_start: BaseProperties & {
  course_id: number;
};
placement_complete: BaseProperties & {
  course_id: number;
  cefr_level: string;
  questions_asked: number;
  duration_ms: number;
};

// F4: AI Conversation
conversation_start: BaseProperties & {
  scenario_id: number;
  cefr_level: string;
};
conversation_message: BaseProperties & {
  session_id: string;
  turn: number;
  corrections_count: number;
};
conversation_complete: BaseProperties & {
  session_id: string;
  score: number;
  turns: number;
  duration_ms: number;
};

// F5: Content Generation
content_generation_start: BaseProperties & {
  language: string;
  units: number;
};
content_generation_complete: BaseProperties & {
  job_id: string;
  challenges_generated: number;
  duration_ms: number;
};
content_review_action: BaseProperties & {
  job_id: string;
  action: 'approve' | 'edit' | 'regenerate' | 'reject';
  item_type: 'unit' | 'lesson' | 'challenge';
};
```

## Appendix B: LLM Prompt Examples

### Explanation Prompt (F1)

```
System:
You are a friendly language tutor helping a student learn {targetLanguage}.
The student speaks {userLanguage}.
When explaining errors:
- Be concise (max 3 sentences for the explanation)
- State the grammar rule clearly
- Give a memory tip or mnemonic
- Provide 2 similar examples with translations
- Never be condescending

Respond in JSON:
{
  "explanation": "...",
  "rule": "...",
  "tip": "...",
  "examples": [{ "source": "...", "translation": "..." }]
}

User:
Question: {question}
User answered: {userAnswer}
Correct answer: {correctAnswer}
Challenge type: {challengeType}
```

### Conversation Prompt (F4)

```
System:
You are playing the role of {character} in this scenario: {scenarioDescription}.
The student's level is {cefrLevel} in {targetLanguage}.

Rules:
- Stay in character. Speak only {targetLanguage}.
- Match vocabulary to student's level.
- Keep responses short (1-3 sentences).
- After the student speaks, respond in JSON:
{
  "reply": "your in-character response",
  "corrections": [
    { "original": "student error", "corrected": "...", "rule": "..." }
  ],
  "naturalness": 7,
  "suggestion": "a more natural phrasing (or null)",
  "complete": false
}
- Signal complete:true after 4-6 meaningful exchanges.
- On complete:true, add "summary" with scores and key corrections.
```
