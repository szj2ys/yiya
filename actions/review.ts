"use server";

import { and, count, eq, lte } from "drizzle-orm";
import { getAuthUserId } from "@/lib/auth-utils";
import { State, fsrs } from "ts-fsrs";

import db from "@/db/drizzle";
import { reviewCards } from "@/db/schema";
import { DAY_IN_MS } from "@/constants";
import { invalidateDashboardCache } from "@/lib/learn-cache";

const MAX_SESSION_SIZE = 20;

export type ReviewRating = 1 | 2 | 3 | 4;

type ReviewCardState = typeof reviewCards.$inferSelect.state;

const toFsrsStateMap: Record<ReviewCardState, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

const fromFsrsStateMap: Record<State, ReviewCardState> = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
};

const toFsrsState = (state: ReviewCardState): State => toFsrsStateMap[state];
const fromFsrsState = (state: State): ReviewCardState => fromFsrsStateMap[state];

export const getReviewSession = async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const now = new Date();

  const cards = await db.query.reviewCards.findMany({
    where: and(eq(reviewCards.userId, userId), lte(reviewCards.due, now)),
    orderBy: (reviewCards: any, { asc }: any) => [asc(reviewCards.due)],
    limit: MAX_SESSION_SIZE,
    with: {
      challenge: {
        with: {
          challengeOptions: true,
        },
      },
    },
  });

  return cards;
};

export const getReviewDueCount = async () => {
  const userId = await getAuthUserId();

  if (!userId) {
    return 0;
  }

  const now = new Date();

  const result = await db
    .select({ value: count() })
    .from(reviewCards)
    .where(and(eq(reviewCards.userId, userId), lte(reviewCards.due, now)));

  return result[0]?.value ?? 0;
};

type CreateReviewCardInitial = "correct" | "wrong";

export const createReviewCard = async (
  userId: string,
  challengeId: number,
  initial: CreateReviewCardInitial,
) => {
  const now = new Date();
  const isCorrect = initial === "correct";
  const due = new Date(now.getTime() + (isCorrect ? DAY_IN_MS : 10 * 60_000));

  const values: typeof reviewCards.$inferInsert = {
    userId,
    challengeId,
    state: isCorrect ? "review" : "relearning",
    stability: isCorrect ? 1 : 0,
    difficulty: 5.0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    due,
    lastReview: now,
  };

  // idempotent (unique userId+challengeId)
  await db
    .insert(reviewCards)
    .values(values)
    .onConflictDoNothing({
      target: [reviewCards.userId, reviewCards.challengeId],
    });
};

export const submitReview = async (cardId: number, rating: ReviewRating) => {
  const userId = await getAuthUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const existing = await db.query.reviewCards.findFirst({
    where: and(eq(reviewCards.id, cardId), eq(reviewCards.userId, userId)),
  });

  if (!existing) {
    throw new Error("Review card not found");
  }

  const scheduler = fsrs();
  const fsrsCard = {
    due: existing.due,
    stability: existing.stability,
    difficulty: existing.difficulty,
    elapsed_days: existing.elapsedDays,
    scheduled_days: existing.scheduledDays,
    learning_steps: 0,
    reps: existing.reps,
    lapses: existing.lapses,
    state: toFsrsState(existing.state),
    last_review: existing.lastReview ?? undefined,
  };

  const preview = scheduler.repeat(fsrsCard, now) as unknown as Record<ReviewRating, { card: any }>;
  const next = preview[rating].card;

  const [updated] = await db
    .update(reviewCards)
    .set({
      due: next.due,
      stability: next.stability,
      difficulty: next.difficulty,
      elapsedDays: next.elapsed_days,
      scheduledDays: next.scheduled_days,
      reps: next.reps,
      lapses: next.lapses,
      state: fromFsrsState(next.state),
      lastReview: next.last_review ?? now,
    })
    .where(eq(reviewCards.id, existing.id))
    .returning();

  await invalidateDashboardCache(userId);

  return updated;
};
