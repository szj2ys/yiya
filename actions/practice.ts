"use server";

import { auth } from "@clerk/nextjs";

import { getTodayReviewItems } from "@/db/queries";

type PracticeStartResult =
  | { type: "challenge"; challengeId: number; lessonId: number }
  | { type: "lesson"; lessonId: number }
  | { type: "empty" };

export const startPractice = async (): Promise<PracticeStartResult> => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const items = await getTodayReviewItems();

  if (!items.length) {
    return { type: "empty" };
  }

  const next = items[0];

  if (next.type === "challenge") {
    return {
      type: "challenge",
      challengeId: next.challengeId,
      lessonId: next.lessonId,
    };
  }

  return { type: "lesson", lessonId: next.lessonId };
};
