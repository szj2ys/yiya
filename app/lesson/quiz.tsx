"use client";

import { toast } from "sonner";
import Image from "next/image";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useAudio, useWindowSize, useMount } from "react-use";

import { reduceHearts } from "@/actions/user-progress";
import { speak } from "@/lib/tts";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { challengeOptions, challenges, userSubscription } from "@/db/schema";
import { usePracticeModal } from "@/store/use-practice-modal";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { buildTrackPayload, trackPayload } from "@/lib/analytics";
import { submitReview } from "@/actions/review";
import type { ExplanationResult } from "@/lib/ai/explain";
import { ExplanationPanel } from "@/components/explanation-panel";

import { Header } from "./header";
import { Footer } from "./footer";
import { Challenge } from "./challenge";
import { ResultCard } from "./result-card";
import { QuestionBubble } from "./question-bubble";

type WrongAnswer = {
  challengeId: number;
  question: string;
  correctAnswer: string;
};

type Props = {
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialStreak: number;
  courseLanguage: string;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: typeof challengeOptions.$inferSelect[];
  })[];
  reviewCardId?: number;
  userSubscription: typeof userSubscription.$inferSelect & {
    isActive: boolean;
  } | null;
  nextLessonId?: number | null;
  nextLessonTitle?: string | null;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  initialStreak,
  courseLanguage,
  reviewCardId,
  userSubscription,
  nextLessonId,
  nextLessonTitle,
}: Props) => {
  const { open: openHeartsModal } = useHeartsModal();
  const { open: openPracticeModal } = usePracticeModal();

  useMount(() => {
    if (initialPercentage === 100) {
      openPracticeModal();
    }
  });

  const { width, height } = useWindowSize();

  const router = useRouter();

  const [finishAudio] = useAudio({ src: "/finish.mp3", autoPlay: true });
  const [correctAudio, , correctControls] = useAudio({ src: "/correct.wav" });
  const [incorrectAudio, , incorrectControls] = useAudio({ src: "/incorrect.wav" });
  const [pending, startTransition] = useTransition();

  const [lessonId] = useState(initialLessonId);
  const [streak] = useState(initialStreak);
  const [hearts, setHearts] = useState(initialHearts);
  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  const [challenges] = useState(initialLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompletedIndex = challenges.findIndex((challenge) => !challenge.completed);
    return uncompletedIndex === -1 ? 0 : uncompletedIndex;
  });

  const [selectedOption, setSelectedOption] = useState<number>();
  const [typedAnswer, setTypedAnswer] = useState("");
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);

  const [reviewSessionStartedAtMs] = useState<number>(() => Date.now());
  const [reviewedCount, setReviewedCount] = useState(0);
  const [againCount, setAgainCount] = useState(0);

  const [questionStartedAtMs, setQuestionStartedAtMs] = useState<number>(() => Date.now());

  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationData, setExplanationData] = useState<ExplanationResult | null>(null);

  const isPractice = initialPercentage === 100;

  const submitReviewIfNeeded = async (params: { correct: boolean }) => {
    if (!isPractice || !reviewCardId) {
      return;
    }

    const durationMs = Date.now() - questionStartedAtMs;
    const rating = params.correct ? (durationMs <= 10_000 ? 4 : 3) : 1;

    await submitReview(reviewCardId, rating);

    setReviewedCount((prev) => prev + 1);
    if (rating === 1) {
      setAgainCount((prev) => prev + 1);
    }
  };

  useMount(() => {
    trackPayload(
      buildTrackPayload(isPractice ? "practice_start" : "lesson_start", {
        lesson_id: lessonId,
      }),
    ).catch(() => undefined);

    if (isPractice) {
      trackPayload(
        buildTrackPayload("review_session_start", {
          due_count: 1,
        }),
      ).catch(() => undefined);
    }
  });

  const challenge = challenges[activeIndex];
  const options = challenge?.challengeOptions ?? [];

  // Auto-speak question text for ASSIST and TYPE challenges (target-language prompts).
  // SELECT questions use English prompts ("Which one of these is ..."), so skip those.
  useEffect(() => {
    if (!challenge) return;
    if (challenge.type === "ASSIST" || challenge.type === "TYPE") {
      speak(challenge.question, courseLanguage);
    }
  }, [activeIndex, challenge, courseLanguage]);

  const onNext = () => {
    setActiveIndex((current) => current + 1);
    setQuestionStartedAtMs(Date.now());
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;

    setSelectedOption(id);
  };

  const resetSelection = () => {
    setStatus("none");
    setSelectedOption(undefined);
    setTypedAnswer("");
    setExplanationData(null);
    setExplanationLoading(false);
  };

  /**
   * Normalize a string for comparison: trim, lowercase, and strip combining
   * diacritical marks so accented characters match their base form.
   */
  const normalizeForComparison = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const onContinue = () => {
    const isType = challenge.type === "TYPE";

    // For SELECT/ASSIST we need a selectedOption; for TYPE we need typed text
    if (!isType && !selectedOption) return;
    if (isType && typedAnswer.trim().length === 0) return;

    if (status === "wrong") {
      resetSelection();
      return;
    }

    if (status === "correct") {
      onNext();
      resetSelection();
      return;
    }

    const correctOption = options.find((option) => option.correct);

    if (!correctOption) {
      return;
    }

    // Determine whether the answer is correct
    const isCorrect = isType
      ? normalizeForComparison(typedAnswer) === normalizeForComparison(correctOption.text)
      : correctOption.id === selectedOption;

    if (isCorrect) {
      startTransition(() => {
        upsertChallengeProgress(challenge.id)
          .then((response) => {
            if (response?.error === "hearts") {
              openHeartsModal();
              return;
            }

            correctControls.play();
            setStatus("correct");
            setPercentage((prev) => prev + 100 / challenges.length);
            setCorrectCount((prev) => prev + 1);

            submitReviewIfNeeded({ correct: true }).catch(() => undefined);

            // This is a practice
            if (initialPercentage === 100) {
              setHearts((prev) => Math.min(prev + 1, 5));
            }
          })
          .catch(() => toast.error("Something went wrong. Please try again."))
      });
    } else {
      startTransition(() => {
        reduceHearts(challenge.id)
          .then((response) => {
            if (response?.error === "hearts") {
              openHeartsModal();
              trackPayload(buildTrackPayload("hearts_empty", { lesson_id: lessonId })).catch(
                () => undefined,
              );
              return;
            }

            incorrectControls.play();
            setStatus("wrong");
            setWrongAnswers((prev) => {
              if (prev.some((entry) => entry.challengeId === challenge.id)) {
                return prev;
              }

              return [
                ...prev,
                {
                  challengeId: challenge.id,
                  question: challenge.question,
                  correctAnswer: correctOption.text,
                },
              ];
            });

            submitReviewIfNeeded({ correct: false }).catch(() => undefined);

            // Fetch explain only for non-practice mode.
            if (!isPractice) {
              const userAnswer = isType
                ? typedAnswer.trim()
                : (options.find((o) => o.id === selectedOption)?.text ?? "");
              setExplanationLoading(true);
              setExplanationData(null);

              fetch("/api/ai/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  challengeId: challenge.id,
                  question: challenge.question,
                  userAnswer,
                  correctAnswer: correctOption.text,
                  challengeType: challenge.type,
                  courseLanguage,
                }),
              })
                .then(async (res) => {
                  if (!res.ok) return null;
                  return (await res.json()) as ExplanationResult;
                })
                .then((data) => {
                  if (data) setExplanationData(data);
                })
                .catch(() => undefined)
                .finally(() => setExplanationLoading(false));
            }

            if (!response?.error) {
              setHearts((prev) => Math.max(prev - 1, 0));
            }

            if (!response?.error && hearts - 1 === 0) {
              trackPayload(buildTrackPayload("hearts_empty", { lesson_id: lessonId })).catch(
                () => undefined,
              );
            }
          })
          .catch(() => toast.error("Something went wrong. Please try again."))
      });
    }
  };

  if (!challenge) {
    if (isPractice) {
      trackPayload(
        buildTrackPayload("review_session_complete", {
          reviewed_count: reviewedCount,
          again_count: againCount,
          duration_ms: Date.now() - reviewSessionStartedAtMs,
        }),
      ).catch(() => undefined);
    }

    trackPayload(
      isPractice
        ? buildTrackPayload("practice_complete", { lesson_id: lessonId })
        : buildTrackPayload("lesson_complete", {
            lesson_id: lessonId,
            hearts_remaining: hearts,
          }),
    ).catch(() => undefined);

    const isPerfect = wrongAnswers.length === 0;

    return (
      <>
        {finishAudio}
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={isPerfect ? 800 : 500}
          tweenDuration={10000}
        />
        <div className="flex flex-col max-w-lg mx-auto items-center h-full px-6 lg:px-0 pb-40 lg:pb-6 pt-6 lg:pt-0 lg:justify-center">
          {/* 1. Achievement / Celebration */}
          {isPerfect && (
            <div className="w-full mb-5">
              <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white p-5 flex items-center gap-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
                  <span role="img" aria-label="trophy">&#x1F3C6;</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-700">Perfect!</p>
                  <p className="text-sm text-amber-600">Zero mistakes — outstanding work.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center text-center gap-y-3 mb-5">
            <Image
              src="/finish.svg"
              alt="Finish"
              height={80}
              width={80}
              className="w-16 h-16 lg:w-20 lg:h-20"
            />
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-700">
              Lesson complete
            </h1>
            <p className="text-base lg:text-lg text-neutral-600">
              {isPerfect
                ? "Perfect run — nice work."
                : "Here’s what you nailed and what to review."}
            </p>
          </div>

          {/* 2. Core Stats */}
          <div className="w-full rounded-2xl bg-white/70 border border-neutral-200 p-5 lg:p-6 flex flex-col gap-y-5 mb-5">
            <div className="flex flex-col gap-y-2">
              <p className="text-sm font-medium text-neutral-500">Accuracy</p>
              <p className="text-xl font-semibold text-neutral-700">
                {correctCount}/{challenges.length} correct
              </p>
              <p className="text-sm text-neutral-600">
                {wrongAnswers.length} wrong • {challenges.length} total challenges
              </p>
            </div>

            <div className="flex flex-col gap-y-3">
              <p className="text-sm font-medium text-neutral-500">Stats</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center">
                  <p className="text-sm text-neutral-500">Streak</p>
                  <p className="text-lg font-semibold text-neutral-700">
                    {streak > 0 ? `🔥 ${streak}` : "—"}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center">
                  <p className="text-sm text-neutral-500">Hearts</p>
                  <p className="text-lg font-semibold text-neutral-700">{hearts}</p>
                </div>
              </div>

              <div className="flex items-center gap-x-4 w-full">
                <ResultCard variant="points" value={challenges.length * 10} />
                <ResultCard variant="hearts" value={hearts} />
              </div>
            </div>

            {/* 3. Wrong Answers Review */}
            {wrongAnswers.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <p className="text-sm font-medium text-neutral-500">Review these</p>
                <div className="flex flex-col gap-y-3">
                  {wrongAnswers.map((item) => (
                    <div
                      key={item.challengeId}
                      className="rounded-2xl border border-neutral-200 bg-white p-4"
                    >
                      <p className="text-base font-semibold text-neutral-700">{item.question}</p>
                      <p className="text-sm text-neutral-600 mt-1">
                        Correct: <span className="font-medium text-emerald-700">{item.correctAnswer}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. All Lessons Complete celebration (inline, non-sticky) */}
          {!nextLessonId && (
            <div className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center mb-5">
              <p className="text-lg font-bold text-emerald-700">All lessons complete!</p>
              <p className="text-sm text-emerald-600 mt-1">
                You&apos;ve finished every lesson. Amazing dedication!
              </p>
            </div>
          )}
        </div>

        {/* 4. Sticky bottom CTAs on mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-neutral-200 p-4 lg:static lg:border-t-0 lg:bg-transparent lg:backdrop-blur-none lg:p-0 z-10">
          <div className="max-w-lg mx-auto flex flex-col gap-y-3 lg:px-0">
            {nextLessonId ? (
              <button
                type="button"
                className="w-full rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition py-3"
                onClick={() => router.push(`/lesson/${nextLessonId}`)}
              >
                <span>Next Lesson</span>
                {nextLessonTitle && (
                  <span className="block text-sm text-emerald-200 font-normal mt-0.5">{nextLessonTitle}</span>
                )}
              </button>
            ) : (
              <button
                type="button"
                className="w-full h-12 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition"
                onClick={() => router.push("/learn")}
              >
                Back to Learn
              </button>
            )}

            {wrongAnswers.length > 0 && (
              <button
                type="button"
                className="w-full h-12 rounded-2xl bg-white border border-neutral-200 text-neutral-700 font-semibold hover:bg-neutral-50 active:bg-neutral-100 transition"
                onClick={() => openPracticeModal()}
              >
                Practice weak items
              </button>
            )}

            {nextLessonId && (
              <button
                type="button"
                className="w-full h-12 rounded-2xl bg-white border border-neutral-200 text-neutral-700 font-semibold hover:bg-neutral-50 active:bg-neutral-100 transition"
                onClick={() => router.push("/learn")}
              >
                Back to Learn
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  // Note: lesson_fail isn't tracked yet. Only hearts_empty is required in Phase 0.

  const title = challenge.type === "ASSIST"
    ? "Select the correct meaning"
    : challenge.type === "TYPE"
      ? "Type the translation"
      : challenge.question;

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubscription={!!userSubscription?.isActive}
      />
      <div className="flex-1">
        <div className="h-full flex items-center justify-center">
          <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12">
            <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700">
              {title}
            </h1>
            <div>
              {(challenge.type === "ASSIST" || challenge.type === "TYPE") && (
                <QuestionBubble question={challenge.question} courseLanguage={courseLanguage} />
              )}
              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                type={challenge.type}
                typedAnswer={typedAnswer}
                onTypedAnswerChange={setTypedAnswer}
                courseLanguage={courseLanguage}
                onSubmit={onContinue}
              />
            </div>
          </div>
        </div>
      </div>

      {!isPractice && status === "wrong" && (
        <ExplanationPanel
          challengeId={challenge.id}
          explanation={explanationData}
          loading={explanationLoading}
          onDismiss={() => {
            setExplanationData(null);
            setExplanationLoading(false);
          }}
          onPractice={openPracticeModal}
        />
      )}

      <Footer
        disabled={pending || (challenge.type === "TYPE" ? typedAnswer.trim().length === 0 : !selectedOption)}
        status={status}
        onCheck={onContinue}
        correctAnswerText={
          status === "wrong" ? options.find((o) => o.correct)?.text : undefined
        }
        reserveBottomSpacePx={!isPractice && status === "wrong" ? 340 : 0}
      />
    </>
  );
};
