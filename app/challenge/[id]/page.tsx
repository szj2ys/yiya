import type { Metadata } from "next";

import { ChallengeClient } from "./challenge-client";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: "Challenge | Yiya",
    description: "Your friend challenged you! Play 5 questions and compare scores.",
    openGraph: {
      title: "Can you beat my score? | Yiya",
      description: "Your friend challenged you to a language quiz. Play now!",
    },
  };
}

export default function ChallengePage({ params }: Props) {
  return <ChallengeClient challengeId={params.id} />;
}
