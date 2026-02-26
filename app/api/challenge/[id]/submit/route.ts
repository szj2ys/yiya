import { NextResponse } from "next/server";

import { getChallenge, calculateScore } from "@/lib/challenge";
import { checkRateLimit } from "@/lib/ai/rate-limit";

const CHALLENGE_SUBMIT_HOURLY_LIMIT = 20;
const ONE_HOUR_MS = 60 * 60 * 1000;

export const POST = async (
  req: Request,
  { params }: { params: { id: string } },
) => {
  const { id } = params;

  if (!id || typeof id !== "string") {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // Rate limit by IP: 20 submissions per hour
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

  const rl = await checkRateLimit(`ip:${ip}`, "challenge_submit", {
    limits: {
      default: CHALLENGE_SUBMIT_HOURLY_LIMIT,
      byFeature: { challenge_submit: CHALLENGE_SUBMIT_HOURLY_LIMIT },
    },
    windowMs: ONE_HOUR_MS,
  });
  if (!rl.allowed) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  try {
    const body = (await req.json()) as { answers?: Record<string, number> };

    if (!body.answers || typeof body.answers !== "object") {
      return new NextResponse("Bad Request: answers required", { status: 400 });
    }

    const session = await getChallenge(id);
    if (!session) {
      return new NextResponse("Challenge not found", { status: 404 });
    }

    // Convert string keys to numbers (JSON serialization quirk)
    const submittedAnswers: Record<number, number> = {};
    for (const [key, value] of Object.entries(body.answers)) {
      submittedAnswers[Number(key)] = Number(value);
    }

    const result = calculateScore(session, submittedAnswers);

    return NextResponse.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("/api/challenge/[id]/submit failed", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
