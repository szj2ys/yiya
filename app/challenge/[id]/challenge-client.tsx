"use client";

import { useEffect, useState } from "react";

import type { ChallengePublic, ChallengeResult } from "@/lib/challenge";
import { syncReferralCookie } from "@/lib/referral";

import { ChallengeQuiz } from "./quiz";
import { ChallengeResults } from "./results";

type Props = {
  challengeId: string;
};

type State =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "playing"; challenge: ChallengePublic }
  | { phase: "results"; challenge: ChallengePublic; result: ChallengeResult };

export function ChallengeClient({ challengeId }: Props) {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    try {
      localStorage.setItem("yiya_ref_challenge", challengeId);
      syncReferralCookie();
    } catch {}

    fetch(`/api/challenge/${challengeId}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          setState({ phase: "error", message: text || "Challenge not found" });
          return;
        }
        const data = (await res.json()) as ChallengePublic;
        setState({ phase: "playing", challenge: data });
      })
      .catch(() => {
        setState({ phase: "error", message: "Failed to load challenge" });
      });
  }, [challengeId]);

  if (state.phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <p className="text-4xl">:(</p>
          <h1 className="text-xl font-bold text-neutral-700">{state.message}</h1>
          <p className="text-neutral-500 text-sm">
            This challenge may have expired or the link may be incorrect.
          </p>
          <a
            href="/"
            className="mt-4 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
          >
            Go to Yiya
          </a>
        </div>
      </div>
    );
  }

  if (state.phase === "results") {
    return (
      <ChallengeResults
        challenge={state.challenge}
        result={state.result}
      />
    );
  }

  return (
    <ChallengeQuiz
      challenge={state.challenge}
      onComplete={(result) =>
        setState({ phase: "results", challenge: state.challenge, result })
      }
    />
  );
}
