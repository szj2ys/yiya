/**
 * Viral Challenge feature — data model, KV storage, and question selection.
 *
 * Challenges are stored in Vercel KV with a 7-day TTL (no DB migration needed).
 * Questions are selected statically from the DB — no AI calls.
 */

import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { units } from "@/db/schema";
import { getKv } from "@/lib/kv";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChallengeQuestion = {
  id: number;
  question: string;
  options: { id: number; text: string; imageSrc: string | null }[];
};

/** Stored in KV — contains answers (server-only). */
export type ChallengeSession = {
  id: string;
  challengerId: string;
  challengerName: string;
  language: string;
  questions: ChallengeQuestion[];
  /** Map of question id → correct option id */
  answers: Record<number, number>;
  challengerScore: number;
  createdAt: number;
};

/** Returned to the public client — no answers. */
export type ChallengePublic = {
  id: string;
  challengerName: string;
  language: string;
  questions: ChallengeQuestion[];
  challengerScore: number;
};

export type ChallengeResult = {
  friendScore: number;
  challengerScore: number;
  totalQuestions: number;
  correctAnswers: number[];
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const KV_PREFIX = "challenge:";
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;
const CHALLENGE_QUESTION_COUNT = 5;

// ---------------------------------------------------------------------------
// KV Helpers
// ---------------------------------------------------------------------------

function kvKey(id: string): string {
  return `${KV_PREFIX}${id}`;
}

export async function storeChallenge(session: ChallengeSession): Promise<void> {
  const kv = await getKv();
  await kv.set(kvKey(session.id), JSON.stringify(session), {
    ex: SEVEN_DAYS_SECONDS,
  });
}

export async function getChallenge(id: string): Promise<ChallengeSession | null> {
  const kv = await getKv();
  const raw = await kv.get<string>(kvKey(id));
  if (!raw) return null;
  // kv.get may already parse JSON if stored as string
  if (typeof raw === "object") return raw as unknown as ChallengeSession;
  try {
    return JSON.parse(raw) as ChallengeSession;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Question Selector
// ---------------------------------------------------------------------------

/**
 * Select `count` random SELECT-type challenges from the given course.
 * Returns both the public questions and the answer map.
 */
export async function selectChallengeQuestions(
  courseId: number,
  count: number = CHALLENGE_QUESTION_COUNT,
): Promise<{
  questions: ChallengeQuestion[];
  answers: Record<number, number>;
} | null> {
  // Get all units for the course
  const courseUnits = await db.query.units.findMany({
    where: eq(units.courseId, courseId),
    columns: { id: true },
  });

  if (courseUnits.length === 0) return null;

  const unitIds = courseUnits.map((u) => u.id);

  // Get all lessons in those units
  const courseLessons = await db.query.lessons.findMany({
    where: (lessons: any, { inArray }: any) => inArray(lessons.unitId, unitIds),
    columns: { id: true },
  });

  if (courseLessons.length === 0) return null;

  const lessonIds = courseLessons.map((l) => l.id);

  // Get all SELECT-type challenges in those lessons, with their options
  const selectChallenges = await db.query.challenges.findMany({
    where: (challenges: any, { inArray, eq, and }: any) =>
      and(inArray(challenges.lessonId, lessonIds), eq(challenges.type, "SELECT")),
    with: {
      challengeOptions: true,
    },
  });

  // Filter to challenges with at least 2 options (one correct)
  const validChallenges = selectChallenges.filter(
    (c) =>
      c.challengeOptions.length >= 2 &&
      c.challengeOptions.some((o: { correct: boolean }) => o.correct),
  );

  if (validChallenges.length < count) return null;

  // Shuffle and pick `count` challenges
  const shuffled = [...validChallenges].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  const questions: ChallengeQuestion[] = [];
  const answers: Record<number, number> = {};

  for (const ch of selected) {
    const opts = ch.challengeOptions.map((o: any) => ({
      id: o.id,
      text: o.text,
      imageSrc: o.imageSrc,
    }));

    questions.push({
      id: ch.id,
      question: ch.question,
      options: opts,
    });

    const correctOpt = ch.challengeOptions.find((o: { correct: boolean }) => o.correct);
    if (correctOpt) {
      answers[ch.id] = correctOpt.id;
    }
  }

  return { questions, answers };
}

// ---------------------------------------------------------------------------
// Score Calculation
// ---------------------------------------------------------------------------

export function calculateScore(
  session: ChallengeSession,
  submittedAnswers: Record<number, number>,
): ChallengeResult {
  let friendScore = 0;
  const correctAnswers: number[] = [];

  for (const q of session.questions) {
    const correctOptionId = session.answers[q.id];
    const submittedOptionId = submittedAnswers[q.id];

    if (submittedOptionId === correctOptionId) {
      friendScore++;
      correctAnswers.push(q.id);
    }
  }

  return {
    friendScore,
    challengerScore: session.challengerScore,
    totalQuestions: session.questions.length,
    correctAnswers,
  };
}

// ---------------------------------------------------------------------------
// ID Generation
// ---------------------------------------------------------------------------

export function generateChallengeId(): string {
  // URL-safe base36 id, short enough for sharing
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

export { CHALLENGE_QUESTION_COUNT };
