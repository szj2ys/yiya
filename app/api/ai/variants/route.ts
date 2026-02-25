import { NextResponse } from "next/server";

import { getAuthUserId } from "@/lib/auth-utils";
import { getVariantQuestion } from "@/lib/ai/variants";
import { isNonEmptyString } from "@/lib/utils";

type VariantsRequestBody = {
  challengeId: number;
  originalQuestion: string;
  correctAnswer: string;
  challengeType: "SELECT" | "ASSIST" | "TYPE";
  courseLanguage: string;
};

function isValidBody(value: unknown): value is VariantsRequestBody {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj.challengeId === "number" &&
    isNonEmptyString(obj.originalQuestion) &&
    isNonEmptyString(obj.correctAnswer) &&
    (obj.challengeType === "SELECT" ||
      obj.challengeType === "ASSIST" ||
      obj.challengeType === "TYPE") &&
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

    const variant = await getVariantQuestion({
      userId,
      challengeId: body.challengeId,
      originalQuestion: body.originalQuestion,
      correctAnswer: body.correctAnswer,
      challengeType: body.challengeType,
      courseLanguage: body.courseLanguage,
    });

    return NextResponse.json({ variant });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("/api/ai/variants failed", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
