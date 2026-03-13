"use client";

import { toast } from "sonner";
import Image from "next/image";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useAudio, useWindowSize, useMount } from "react-use";
import dynamic from "next/dynamic";
import { Share2 } from "lucide-react";

import { reduceHearts } from "@/actions/user-progress";
import { speak } from "@/lib/tts";
import { useHeartsModal } from "@/store/use-hearts-modal";
import { challengeOptions, challenges, userSubscription } from "@/db/schema";
import { usePracticeModal } from "@/store/use-practice-modal";
import { upsertChallengeProgress } from "@/actions/challenge-progress";
import { buildTrackPayload, trackPayload } from "@/lib/analytics";
import { submitReview } from "@/actions/review";
import type { ExplanationResult } from "@/lib/ai/explain";
import type { VariantQuestion } from "@/lib/ai/variants";
import { ExplanationPanel } from "@/components/explanation-panel";

const ShareCard = dynamic(() => import("@/components/share-card").then(m => ({ default: m.ShareCard })), { ssr: false });

import { Header } from "./header";
import { Footer } from "./footer";
import { Challenge } from "./challenge";
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
  /** Map of challengeId → reviewCardId for multi-card practice sessions */
  reviewCardIds?: Record<number, number>;
  /** Map of challengeId → AI-generated variant question (practice mode only). */
  variantData?: Record<number, VariantQuestion>;
  userSubscription: typeof userSubscription.$inferSelect & {
    isActive: boolean;
  } | null;
  nextLessonId?: number | null;
  nextLessonTitle?: string | null;
  todayLessonCount?: number;
  dailyGoal?: number;
  wordsLearned?: number;
  isLastLessonInUnit?: boolean;
  unitTitle?: string;
  unitOrder?: number;
  isCourseComplete?: boolean;
  courseName?: string;
  totalLessons?: number;
  /** Number of due review items remaining beyond this session (practice mode only). */
  remainingDueCount?: number;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  initialStreak,
  courseLanguage,
  reviewCardId,
  reviewCardIds,
  variantData,
  userSubscription,
  nextLessonId,
  nextLessonTitle,
  todayLessonCount,
  dailyGoal,
  wordsLearned,
  isLastLessonInUnit,
  unitTitle,
  unitOrder,
  isCourseComplete,
  courseName,
  totalLessons,
  remainingDueCount,
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
  const [showShareCard, setShowShareCard] = useState(false);
  const [challengeCreating, setChallengeCreating] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const isPractice = initialPercentage === 100;

  const handleShare = useCallback(async () => {
    const accuracy = challenges.length > 0 ? Math.round((correctCount / challenges.length) * 100) : 0;
    const shareText = `I just scored ${accuracy}% on a ${courseLanguage} lesson on Yiya! ${streak > 1 ? `${streak}-day streak!` : ""}`;
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://yiya.app";

    let method: "native" | "clipboard" = "clipboard";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Yiya", text: shareText, url: shareUrl });
        method = "native";
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
        trackPayload(buildTrackPayload("lesson_share", { lesson_id: lessonId, method, accuracy })).catch(() => undefined);
        return;
      } catch {
        // User cancelled or API unavailable, fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast.success("Copied to clipboard!");
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
      trackPayload(buildTrackPayload("lesson_share", { lesson_id: lessonId, method, accuracy })).catch(() => undefined);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }, [challenges.length, correctCount, courseLanguage, streak, lessonId]);

  const submitReviewIfNeeded = async (params: { correct: boolean }) => {
    if (!isPractice) return;

    // Resolve the reviewCardId for the current challenge:
    // prefer per-challenge map, fall back to single reviewCardId prop
    const currentChallengeId = challenges[activeIndex]?.id;
    const resolvedCardId =
      (currentChallengeId && reviewCardIds?.[currentChallengeId]) ||
      reviewCardId;

    if (!resolvedCardId) return;

    const durationMs = Date.now() - questionStartedAtMs;
    const rating = params.correct ? (durationMs <= 10_000 ? 4 : 3) : 1;

    await submitReview(resolvedCardId, rating);

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
          due_count: reviewCardIds
            ? Object.keys(reviewCardIds).length
            : 1,
        }),
      ).catch(() => undefined);
    }
  });

  const challenge = challenges[activeIndex];

  const activeVariant = isPractice && challenge ? variantData?.[challenge.id] : undefined;
  const isVariant = !!activeVariant;

  const questionText = activeVariant?.question ?? challenge?.question ?? "";

  const options = (() => {
    if (!challenge) return [];

    if (
      isPractice &&
      activeVariant?.type === "SELECT" &&
      Array.isArray(activeVariant.options) &&
      activeVariant.options.length === 4
    ) {
      return activeVariant.options.map((opt, index) => ({
        id: -(index + 1),
        challengeId: challenge.id,
        text: opt.text,
        correct: opt.correct,
        imageSrc: null,
        audioSrc: null,
      }));
    }

    return challenge.challengeOptions ?? [];
  })();

  const correctAnswerText =
    isPractice && activeVariant?.type === "TYPE" && activeVariant.expectedAnswer
      ? activeVariant.expectedAnswer
      : options.find((option) => option.correct)?.text;

  // Auto-speak question text for ASSIST and TYPE challenges (target-language prompts).
  // SELECT questions use English prompts ("Which one of these is ..."), so skip those.
  useEffect(() => {
    if (!challenge) return;
    if (challenge.type === "ASSIST" || challenge.type === "TYPE") {
      speak(questionText, courseLanguage);
    }
  }, [activeIndex, challenge, courseLanguage, questionText]);

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

    const expectedAnswer = correctAnswerText ?? correctOption.text;

    // Determine whether the answer is correct
    const isCorrect = isType
      ? normalizeForComparison(typedAnswer) === normalizeForComparison(expectedAnswer)
      : correctOption.id === selectedOption;

    if (isCorrect) {
      startTransition(() => {
        upsertChallengeProgress(challenge.id, new Date().getTimezoneOffset())
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
              trackPayload(buildTrackPayload("lesson_fail", {
                lesson_id: lessonId,
                hearts_remaining: 0,
                challenges_completed: correctCount,
              })).catch(() => undefined);
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
                  question: questionText,
                  correctAnswer: correctAnswerText ?? correctOption.text,
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
              trackPayload(buildTrackPayload("lesson_fail", {
                lesson_id: lessonId,
                hearts_remaining: 0,
                challenges_completed: correctCount,
              })).catch(() => undefined);
            }
          })
          .catch(() => toast.error("Something went wrong. Please try again."))
      });
    }
  };

  if (!challenge) {
    if (typeof window !== "undefined" && !localStorage.getItem("yiya_first_lesson_completed")) {
      localStorage.setItem("yiya_first_lesson_completed", "true");
    }

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

    // Track streak saved if user had 0 lessons today before this one
    if (!isPractice && (todayLessonCount ?? 0) === 0 && streak > 0) {
      trackPayload(
        buildTrackPayload("streak_saved", {
          streak: streak + 1, // New streak after completing this lesson
          lessons_completed: 1,
        }),
      ).catch(() => undefined);
    }

    const isPerfect = wrongAnswers.length === 0;
    const accuracyPercent = challenges.length > 0
      ? Math.round((correctCount / challenges.length) * 100)
      : 0;

    return (
      <>
        {finishAudio}
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={!isPractice && isLastLessonInUnit ? 1000 : isPerfect ? 800 : 500}
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

          {!isPractice && isLastLessonInUnit && (
            <div className="w-full mb-5" data-testid="unit-celebration-card">
              <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-50 to-sky-50 p-5 flex items-center gap-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">
                  <span role="img" aria-label="star">&#x2B50;</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-700">
                    Unit {unitOrder} Complete!
                  </p>
                  <p className="text-base font-medium text-emerald-600">{unitTitle}</p>
                  <p className="text-sm text-emerald-600">
                    You&apos;ve mastered all lessons in this unit. Keep going!
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isPractice && isCourseComplete && (
            <div className="w-full mb-5" data-testid="course-complete-card">
              <div className="rounded-2xl border-2 border-violet-300 dark:border-violet-600 bg-gradient-to-b from-violet-50 to-amber-50 dark:from-violet-900/40 dark:to-amber-900/30 p-6 flex flex-col items-center gap-y-3 text-center">
                <div className="text-5xl" role="img" aria-label="graduation cap">&#x1F393;</div>
                <h2 className="text-xl font-bold text-violet-700 dark:text-violet-300">Course Complete!</h2>
                <p className="text-sm text-violet-600 dark:text-violet-400">
                  You&apos;ve completed all lessons in {courseName ?? "this course"}. That&apos;s an incredible achievement.
                </p>

                {/* Learning stats */}
                <div className="grid grid-cols-3 gap-3 w-full mt-2" data-testid="course-complete-stats">
                  <div className="rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-violet-200 dark:border-violet-700 p-3 text-center">
                    <p className="text-lg font-bold text-violet-700 dark:text-violet-300">{totalLessons ?? 0}</p>
                    <p className="text-xs text-violet-500 dark:text-violet-400">Lessons</p>
                  </div>
                  <div className="rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-violet-200 dark:border-violet-700 p-3 text-center">
                    <p className="text-lg font-bold text-violet-700 dark:text-violet-300">{wordsLearned ?? 0}</p>
                    <p className="text-xs text-violet-500 dark:text-violet-400">Words</p>
                  </div>
                  <div className="rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-violet-200 dark:border-violet-700 p-3 text-center">
                    <p className="text-lg font-bold text-violet-700 dark:text-violet-300">{accuracyPercent}%</p>
                    <p className="text-xs text-violet-500 dark:text-violet-400">Accuracy</p>
                  </div>
                </div>

                <div className="flex flex-col gap-y-2 w-full mt-2">
                  <button
                    type="button"
                    className="w-full h-11 rounded-2xl bg-violet-600 text-white font-semibold hover:bg-violet-700 active:bg-violet-800 transition"
                    onClick={() => router.push("/practice")}
                  >
                    Continue Reviewing
                  </button>
                  <button
                    type="button"
                    className="w-full h-11 rounded-2xl bg-white dark:bg-neutral-800 border border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300 font-semibold hover:bg-violet-50 dark:hover:bg-neutral-700 active:bg-violet-100 dark:active:bg-neutral-600 transition"
                    onClick={() => setShowShareCard(true)}
                  >
                    Share Achievement
                  </button>
                  <button
                    type="button"
                    className="w-full h-11 rounded-2xl bg-white dark:bg-neutral-800 border border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300 font-semibold hover:bg-violet-50 dark:hover:bg-neutral-700 active:bg-violet-100 dark:active:bg-neutral-600 transition"
                    onClick={() => router.push("/onboarding")}
                  >
                    Try Another Language
                  </button>
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
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-700 dark:text-neutral-200">
              {isPractice ? "Review complete" : "Lesson complete"}
            </h1>
            <p className="text-base lg:text-lg text-neutral-600 dark:text-neutral-300">
              {isPractice
                ? isPerfect
                  ? "All cards reviewed — excellent memory."
                  : "Keep it up, spaced repetition works best with consistency."
                : isPerfect
                  ? "Perfect run — nice work."
                  : "Here’s what you nailed and what to review."}
            </p>
          </div>

          {/* 2. Core Stats */}
          <div className="w-full rounded-2xl bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 p-5 lg:p-6 flex flex-col gap-y-5 mb-5">
            {isPractice ? (
              <>
                {/* Practice-specific review stats */}
                <div className="flex flex-col gap-y-2">
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Review Summary</p>
                  <p className="text-xl font-semibold text-neutral-700 dark:text-neutral-200">
                    {reviewedCount} {reviewedCount === 1 ? "card" : "cards"} reviewed
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {accuracyPercent}% accuracy
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Correct</p>
                    <p className="text-lg font-semibold text-emerald-600">{correctCount}</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Again</p>
                    <p className="text-lg font-semibold text-amber-600">{againCount}</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Total</p>
                    <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">{challenges.length}</p>
                  </div>
                </div>

                {/* Next step indicator */}
                {(remainingDueCount ?? 0) > 0 ? (
                  <div
                    data-testid="remaining-due-indicator"
                    className="flex items-center gap-x-2 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 px-4 py-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 text-sky-500 shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-sky-700 dark:text-sky-300">
                      {remainingDueCount} more {remainingDueCount === 1 ? "item" : "items"} due for review
                    </p>
                  </div>
                ) : (
                  <div
                    data-testid="all-caught-up-indicator"
                    className="flex items-center gap-x-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 text-emerald-500 shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      All caught up! Check back tomorrow for new reviews.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-y-1">
                  <p className="text-xl font-semibold text-neutral-700 dark:text-neutral-200">
                    {correctCount}/{challenges.length} correct
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    +{challenges.length * 10} XP earned
                  </p>
                </div>
                <div className="text-3xl font-bold text-emerald-600">{accuracyPercent}%</div>
              </div>
            )}

            {/* 3. Review Queue Bridge */}
            {!isPractice && wrongAnswers.length > 0 && (
              <div
                data-testid="review-queue-stats"
                className="flex items-center gap-x-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5 text-amber-500 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {wrongAnswers.length} {wrongAnswers.length === 1 ? "item" : "items"} added to your review queue — they&apos;ll reappear at the best time for your memory
                </p>
              </div>
            )}

            {/* 3b. Wrong Answers Review */}
            {wrongAnswers.length > 0 && (
              <div className="flex flex-col gap-y-3">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Review these</p>
                <div className="flex flex-col gap-y-3">
                  {wrongAnswers.map((item) => (
                    <div
                      key={item.challengeId}
                      className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4"
                    >
                      <p className="text-base font-semibold text-neutral-700 dark:text-neutral-200">{item.question}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                        Correct: <span className="font-medium text-emerald-700">{item.correctAnswer}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* 5. Sticky bottom CTAs on mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-200 dark:border-neutral-700 p-4 lg:static lg:border-t-0 lg:bg-transparent lg:backdrop-blur-none lg:p-0 z-10">
          <div className="max-w-lg mx-auto flex flex-col gap-y-3 lg:px-0">
            {isPractice ? (
              <>
                {(remainingDueCount ?? 0) > 0 ? (
                  <>
                    <button
                      type="button"
                      data-testid="continue-review-btn"
                      className="w-full rounded-2xl bg-sky-600 text-white font-semibold hover:bg-sky-700 active:bg-sky-800 transition py-3"
                      onClick={() => router.push("/practice")}
                    >
                      <span>Continue Review</span>
                      <span className="block text-sm text-sky-200 font-normal mt-0.5">
                        {remainingDueCount} more {remainingDueCount === 1 ? "item" : "items"} due
                      </span>
                    </button>
                    <button
                      type="button"
                      className="w-full h-12 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 active:bg-neutral-100 dark:active:bg-neutral-600 transition"
                      onClick={() => setShowShareCard(true)}
                    >
                      Share your progress
                    </button>
                    <button
                      type="button"
                      className="w-full h-12 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 active:bg-neutral-100 dark:active:bg-neutral-600 transition"
                      onClick={() => router.push("/learn")}
                    >
                      Back to Learn
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="w-full h-12 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition"
                      onClick={() => router.push("/learn")}
                    >
                      Back to Learn
                    </button>
                    <button
                      type="button"
                      className="w-full h-12 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 active:bg-neutral-100 dark:active:bg-neutral-600 transition"
                      onClick={() => setShowShareCard(true)}
                    >
                      Share your progress
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
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

                {nextLessonId && (
                  <button
                    type="button"
                    className="w-full h-12 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 active:bg-neutral-100 dark:active:bg-neutral-600 transition"
                    onClick={() => router.push("/learn")}
                  >
                    Back to Learn
                  </button>
                )}

                <button
                  type="button"
                  className="w-full h-12 rounded-2xl bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-50 dark:hover:bg-neutral-700 active:bg-emerald-100 dark:active:bg-neutral-600 transition flex items-center justify-center gap-x-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  {shareSuccess ? "Shared!" : "Share Result"}
                </button>

                <button
                  type="button"
                  data-testid="challenge-friend-btn"
                  disabled={challengeCreating}
                  className="w-full h-12 rounded-2xl bg-violet-600 text-white font-semibold hover:bg-violet-700 active:bg-violet-800 transition disabled:opacity-50"
                  onClick={async () => {
                    setChallengeCreating(true);
                    try {
                      const res = await fetch("/api/challenge/create", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ challengerScore: correctCount }),
                      });
                      if (!res.ok) {
                        toast.error("Could not create challenge. Try again.");
                        return;
                      }
                      const { shareUrl, challengeId } = await res.json();
                      trackPayload(
                        buildTrackPayload("challenge_created", {
                          challenge_id: challengeId,
                          language: courseLanguage,
                        }),
                      ).catch(() => undefined);
                      if (typeof navigator !== "undefined" && navigator.share) {
                        try {
                          await navigator.share({
                            title: "Yiya Challenge",
                            text: `I scored ${correctCount}/${challenges.length} on a ${courseLanguage} quiz. Can you beat me?`,
                            url: shareUrl,
                          });
                          return;
                        } catch {
                          // fall through to clipboard
                        }
                      }
                      await navigator.clipboard.writeText(shareUrl);
                      toast.success("Challenge link copied!");
                    } catch {
                      toast.error("Something went wrong.");
                    } finally {
                      setChallengeCreating(false);
                    }
                  }}
                >
                  {challengeCreating ? "Creating..." : "Challenge a Friend"}
                </button>
              </>
            )}
          </div>
        </div>

        {showShareCard && (
          <ShareCard
            streak={streak}
            wordsLearned={wordsLearned ?? 0}
            language={courseLanguage}
            accuracy={accuracyPercent}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </>
    );
  }

  const title = challenge.type === "ASSIST"
    ? "Select the correct meaning"
    : challenge.type === "TYPE"
      ? "Type the translation"
      : questionText;

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
            <h1 className="text-lg lg:text-3xl text-center lg:text-start font-bold text-neutral-700 flex items-center justify-center lg:justify-start gap-x-2">
              <span>{title}</span>
              {isVariant && (
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                  Variant
                </span>
              )}
            </h1>
            <div>
              {(challenge.type === "ASSIST" || challenge.type === "TYPE") && (
                <QuestionBubble question={questionText} courseLanguage={courseLanguage} />
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

      {!isPractice && status === "wrong" && (
        <div
          data-testid="review-added-indicator"
          className="flex items-center justify-center gap-x-2 py-2 text-sm text-neutral-500 dark:text-neutral-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-amber-500 shrink-0"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
              clipRule="evenodd"
            />
          </svg>
          <span>Added to review &middot; will appear at the best time</span>
        </div>
      )}

      <Footer
        disabled={pending || (challenge.type === "TYPE" ? typedAnswer.trim().length === 0 : !selectedOption)}
        status={status}
        onCheck={onContinue}
        correctAnswerText={status === "wrong" ? correctAnswerText : undefined}
        reserveBottomSpacePx={!isPractice && status === "wrong" ? 340 : 0}
      />
    </>
  );
};
