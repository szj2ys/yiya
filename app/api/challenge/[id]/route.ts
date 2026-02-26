import { NextResponse } from "next/server";

import { getChallenge } from "@/lib/challenge";
import type { ChallengePublic } from "@/lib/challenge";

export const GET = async (
  _req: Request,
  { params }: { params: { id: string } },
) => {
  const { id } = params;

  if (!id || typeof id !== "string") {
    return new NextResponse("Bad Request", { status: 400 });
  }

  try {
    const session = await getChallenge(id);
    if (!session) {
      return new NextResponse("Challenge not found", { status: 404 });
    }

    // Return public data only — no answers
    const publicData: ChallengePublic = {
      id: session.id,
      challengerName: session.challengerName,
      language: session.language,
      questions: session.questions,
      challengerScore: session.challengerScore,
    };

    return NextResponse.json(publicData);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("/api/challenge/[id] failed", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
