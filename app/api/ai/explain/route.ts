import { NextResponse } from "next/server";

import { getAuthUserId } from "@/lib/auth-utils";
import { getExplanation } from "@/lib/ai/explain";
import { isNonEmptyString } from "@/lib/utils";

type ExplainRequestBody = {
  challengeId: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  challengeType: string;
  courseLanguage: string;
};

function isValidBody(value: unknown): value is ExplainRequestBody {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.challengeId === "number" &&
    isNonEmptyString(obj.question) &&
    isNonEmptyString(obj.userAnswer) &&
    isNonEmptyString(obj.correctAnswer) &&
    isNonEmptyString(obj.challengeType) &&
    isNonEmptyString(obj.courseLanguage)
  );
}

export const POST = async (req: Request) => {
  const userId = await getAuthUserId();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = (await req.json()) as unknown;
    if (!isValidBody(body)) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const explanation = await getExplanation({
      userId,
      challengeId: body.challengeId,
      question: body.question,
      userAnswer: body.userAnswer,
      correctAnswer: body.correctAnswer,
      challengeType: body.challengeType,
      courseLanguage: body.courseLanguage,
    });

    if (!explanation) {
      // Rate limit is currently the only expected reason for null.
      return new NextResponse("Too Many Requests", { status: 429 });
    }

    return NextResponse.json(explanation);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("/api/ai/explain failed", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
