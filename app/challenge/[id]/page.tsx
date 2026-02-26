import type { Metadata } from "next";

import { getChallenge } from "@/lib/challenge";
import { ChallengeClient } from "./challenge-client";

type Props = {
  params: { id: string };
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yiya.app";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await getChallenge(params.id);

  if (!session) {
    return {
      title: "Challenge | Yiya",
      description: "Your friend challenged you! Play 5 questions and compare scores.",
    };
  }

  const { challengerName, challengerScore, language, questions } = session;
  const total = questions.length;
  const title = `Can you beat ${challengerName}'s ${challengerScore}/${total} in ${language}?`;
  const description = `${challengerName} scored ${challengerScore}/${total} on a ${language} challenge. Play now and compare!`;
  const ogUrl = `${BASE_URL}/api/og/challenge?name=${encodeURIComponent(challengerName)}&score=${challengerScore}&total=${total}&language=${encodeURIComponent(language)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default function ChallengePage({ params }: Props) {
  return <ChallengeClient challengeId={params.id} />;
}
