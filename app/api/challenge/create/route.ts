import { NextResponse } from "next/server";

import { getAuthUserId } from "@/lib/auth-utils";
import { getUserProgress } from "@/db/queries";
import {
  generateChallengeId,
  selectChallengeQuestions,
  storeChallenge,
} from "@/lib/challenge";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { absoluteUrl } from "@/lib/utils";

const CHALLENGE_CREATE_DAILY_LIMIT = 10;

export const POST = async (req: Request) => {
  const userId = await getAuthUserId();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Rate limit: 10 creations per user per day
  const rl = await checkRateLimit(userId, "challenge_create", {
    limits: { default: CHALLENGE_CREATE_DAILY_LIMIT, byFeature: { challenge_create: CHALLENGE_CREATE_DAILY_LIMIT } },
  });
  if (!rl.allowed) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      challengerScore?: number;
    };

    const progress = await getUserProgress();
    if (!progress?.activeCourseId) {
      return new NextResponse("No active course", { status: 400 });
    }

    const result = await selectChallengeQuestions(progress.activeCourseId);
    if (!result) {
      return new NextResponse("Not enough questions available", { status: 400 });
    }

    const challengeId = generateChallengeId();
    const courseName =
      (progress as any).activeCourse?.title ?? "Language";

    await storeChallenge({
      id: challengeId,
      challengerId: userId,
      challengerName: progress.userName ?? "A friend",
      language: courseName,
      questions: result.questions,
      answers: result.answers,
      challengerScore: body.challengerScore ?? 0,
      createdAt: Date.now(),
    });

    const shareUrl = absoluteUrl(`/challenge/${challengeId}`);

    return NextResponse.json({ challengeId, shareUrl });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("/api/challenge/create failed", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
