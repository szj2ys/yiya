"use client";

import { toast } from "sonner";
import Image from "next/image";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useAudio, useWindowSize, useMount } from "react-use";

import { reduceHearts } from "@/actions/user-progress";
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

type Props = {
  initialPercentage: number;
  initialHearts: number;
  initialLessonId: number;
  initialStreak: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: typeof challengeOptions.$inferSelect[];
  })[];
  reviewCardId?: number;
  userSubscription: typeof userSubscription.$inferSelect & {
    isActive: boolean;
  } | null;
};

export const Quiz = ({
  initialPercentage,
  initialHearts,
  initialLessonId,
  initialLessonChallenges,
  initialStreak,
  reviewCardId,
  userSubscription,
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
  const [
    correctAudio,
    _c,
    correctControls,
  ] = useAudio({ src: "/correct.wav" });
  const [
    incorrectAudio,
    _i,
    incorrectControls,
  ] = useAudio({ src: "/incorrect.wav" });
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
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");

  const [reviewSessionStartedAtMs] = useState<number>(() => Date.now());
  const [reviewedCount, setReviewedCount] = useState(0);
  const [againCount, setAgainCount] = useState(0);

  const [questionStartedAtMs, setQuestionStartedAtMs] = useState<number>(() => Date.now());

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

  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationData, setExplanationData] = useState<ExplanationResult | null>(null);

  const isPractice = initialPercentage === 100;

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

  const onNext = () => {
    setActiveIndex((current) => current + 1);
    setQuestionStartedAtMs(Date.now());
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;

    setSelectedOption(id);
  };

  const onContinue = () => {
    if (!selectedOption) return;

    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      setExplanationData(null);
      setExplanationLoading(false);
      return;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      setExplanationData(null);
      setExplanationLoading(false);
      return;
    }

    const correctOption = options.find((option) => option.correct);

    if (!correctOption) {
      return;
    }

    if (correctOption.id === selectedOption) {
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

            submitReviewIfNeeded({ correct: false }).catch(() => undefined);

            // Fetch explain only for non-practice mode.
            if (!isPractice) {
              const selectedText =
                options.find((o) => o.id === selectedOption)?.text ?? "";
              setExplanationLoading(true);
              setExplanationData(null);

              fetch("/api/ai/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  challengeId: challenge.id,
                  question: challenge.question,
                  userAnswer: selectedText,
                  correctAnswer: correctOption.text,
                  challengeType: challenge.type,
                  courseLanguage: "English",
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

    return (
      <>
        {finishAudio}
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          tweenDuration={10000}
        />
        <div className="flex flex-col gap-y-4 lg:gap-y-8 max-w-lg mx-auto text-center items-center justify-center h-full">
          <Image
            src="/finish.svg"
            alt="Finish"
            className="hidden lg:block"
            height={100}
            width={100}
          />
          <Image
            src="/finish.svg"
            alt="Finish"
            className="block lg:hidden"
            height={50}
            width={50}
          />
          <h1 className="text-xl lg:text-3xl font-bold text-neutral-700">
            Great job! <br /> You&apos;ve completed the lesson.
          </h1>
          <p className="text-sm lg:text-base text-neutral-600">
            {streak > 0 ? `🔥 ${streak} day streak` : "Start your streak!"}
          </p>
          <div className="flex items-center gap-x-4 w-full">
            <ResultCard
              variant="points"
              value={challenges.length * 10}
            />
            <ResultCard
              variant="hearts"
              value={hearts}
            />
          </div>
        </div>
        <Footer
          lessonId={lessonId}
          status="completed"
          onCheck={() => router.push("/learn")}
        />
      </>
    );
  }

  // Note: lesson_fail isn't tracked yet. Only hearts_empty is required in Phase 0.

  const title = challenge.type === "ASSIST" 
    ? "Select the correct meaning"
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
              {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )}
              <Challenge
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                type={challenge.type}
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
          onPractice={() => {
            openPracticeModal();
          }}
        />
      )}

      <Footer
        disabled={pending || !selectedOption}
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
