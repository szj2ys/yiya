"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import type { ChallengePublic, ChallengeResult } from "@/lib/challenge";
import { buildTrackPayload, trackPayload } from "@/lib/analytics";

import { ChallengeShareCard } from "./challenge-share-card";

type Props = {
  challenge: ChallengePublic;
  result: ChallengeResult;
};

export function ChallengeResults({ challenge, result }: Props) {
  const [showShareCard, setShowShareCard] = useState(false);

  const friendPercent = Math.round(
    (result.friendScore / result.totalQuestions) * 100,
  );
  const challengerPercent = Math.round(
    (result.challengerScore / result.totalQuestions) * 100,
  );
  const didWin = result.friendScore > result.challengerScore;
  const didTie = result.friendScore === result.challengerScore;

  // Track challenge_completed on mount (fire once)
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackPayload(
      buildTrackPayload("challenge_completed", {
        challenge_id: challenge.id,
        friend_score: result.friendScore,
        challenger_score: result.challengerScore,
      }),
    ).catch(() => undefined);
  }, [challenge.id, result.friendScore, result.challengerScore]);

  const handleSignupClick = useCallback(() => {
    trackPayload(
      buildTrackPayload("challenge_signup_click", {
        challenge_id: challenge.id,
      }),
    ).catch(() => undefined);
    window.location.href = "/";
  }, [challenge.id]);

  const handleShare = useCallback(async () => {
    trackPayload(
      buildTrackPayload("challenge_share", {
        challenge_id: challenge.id,
      }),
    ).catch(() => undefined);

    const shareText = `I scored ${result.friendScore}/${result.totalQuestions} on a ${challenge.language} challenge on Yiya! Can you beat me?`;
    const shareUrl = window.location.href;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Yiya Challenge Results",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Could not share.");
    }
  }, [challenge.id, challenge.language, result.friendScore, result.totalQuestions]);

  const headlineEmoji = didWin
    ? "\uD83C\uDF89"
    : didTie
      ? "\uD83E\uDD1D"
      : "\uD83D\uDCAA";
  const headline = didWin
    ? "You won!"
    : didTie
      ? "It's a tie!"
      : "Nice try!";

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-violet-50 via-white to-white">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto w-full">
          {/* Headline */}
          <p className="text-5xl mb-2" role="img" aria-label="result emoji">
            {headlineEmoji}
          </p>
          <h1
            className="text-3xl font-extrabold text-neutral-800 mb-1"
            data-testid="challenge-headline"
          >
            {headline}
          </h1>
          <p className="text-neutral-500 text-sm mb-8">
            {challenge.language} challenge
          </p>

          {/* Score Comparison Card */}
          <div
            className="w-full rounded-3xl bg-white border border-neutral-200 shadow-lg p-6 mb-8"
            data-testid="score-comparison"
          >
            <div className="flex items-center justify-between gap-4">
              {/* You */}
              <div className="flex-1 text-center">
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
                  You
                </p>
                <p className="text-4xl font-extrabold text-emerald-600">
                  {result.friendScore}
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  {friendPercent}%
                </p>
              </div>

              {/* Divider */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-8 bg-neutral-200" />
                <p className="text-xs font-bold text-neutral-300">VS</p>
                <div className="w-px h-8 bg-neutral-200" />
              </div>

              {/* Challenger */}
              <div className="flex-1 text-center">
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">
                  {challenge.challengerName}
                </p>
                <p className="text-4xl font-extrabold text-violet-600">
                  {result.challengerScore}
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  {challengerPercent}%
                </p>
              </div>
            </div>

            {/* Progress bars */}
            <div className="mt-6 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>You</span>
                  <span>
                    {result.friendScore}/{result.totalQuestions}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${friendPercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                  <span>{challenge.challengerName}</span>
                  <span>
                    {result.challengerScore}/{result.totalQuestions}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-700"
                    style={{ width: `${challengerPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-4 rounded-2xl bg-violet-600 text-white font-bold text-lg hover:bg-violet-700 active:bg-violet-800 transition"
              data-testid="challenge-share-btn"
            >
              Share Your Score
            </button>

            <button
              type="button"
              onClick={() => setShowShareCard(true)}
              className="w-full py-4 rounded-2xl bg-white border-2 border-neutral-200 text-neutral-700 font-bold text-lg hover:bg-neutral-50 active:bg-neutral-100 transition"
            >
              Download Score Card
            </button>

            <button
              type="button"
              onClick={handleSignupClick}
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 active:bg-emerald-800 transition"
              data-testid="challenge-signup-btn"
            >
              Want to keep learning? Sign up free
            </button>
          </div>
        </div>

        {/* Footer branding */}
        <div className="text-center py-6">
          <p className="text-sm text-neutral-400">
            Powered by <span className="font-semibold text-emerald-600">Yiya</span>
          </p>
        </div>
      </div>

      {showShareCard && (
        <ChallengeShareCard
          challengerName={challenge.challengerName}
          language={challenge.language}
          friendScore={result.friendScore}
          challengerScore={result.challengerScore}
          totalQuestions={result.totalQuestions}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </>
  );
}
