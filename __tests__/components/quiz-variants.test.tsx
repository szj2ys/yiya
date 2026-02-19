import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import type { challenges } from "@/db/schema";
import type { VariantQuestion } from "@/lib/ai/variants";

import { Quiz } from "@/app/lesson/quiz";

// Mocks
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("next/image", () => ({ default: (props: any) => <img {...props} /> }));
vi.mock("react-confetti", () => ({ default: () => null }));
vi.mock("react-use", () => ({
  useMount: (fn: any) => fn(),
  useWindowSize: () => ({ width: 0, height: 0 }),
  useAudio: () => [null, null, { play: vi.fn() }],
  useKey: vi.fn(),
  useMedia: () => false,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/store/use-practice-modal", () => ({ usePracticeModal: () => ({ open: vi.fn() }) }));
vi.mock("@/store/use-hearts-modal", () => ({ useHeartsModal: () => ({ open: vi.fn() }) }));
vi.mock("@/actions/challenge-progress", () => ({ upsertChallengeProgress: vi.fn() }));
vi.mock("@/actions/user-progress", () => ({ reduceHearts: vi.fn().mockResolvedValue({}) }));
vi.mock("@/actions/review", () => ({ submitReview: vi.fn().mockResolvedValue({}) }));
vi.mock("@/lib/analytics", () => ({
  buildTrackPayload: (event: string, properties: any) => ({ event, properties }),
  trackPayload: vi.fn().mockResolvedValue(undefined),
}));

// keep UI shallow
vi.mock("@/app/lesson/header", () => ({ Header: () => null }));
vi.mock("@/app/lesson/footer", () => ({ Footer: () => null }));
vi.mock("@/app/lesson/challenge", () => ({
  Challenge: ({ options }: any) => (
    <div>
      {options.map((o: any) => (
        <div key={o.id}>{o.text}</div>
      ))}
    </div>
  ),
}));

const baseProps = {
  initialPercentage: 100,
  initialHearts: 5,
  initialLessonId: 1,
  initialStreak: 0,
  courseLanguage: "Spanish",
  userSubscription: null,
};

describe("Quiz variants", () => {
  it("should render variant question when variantData is provided", () => {
    const variantData: Record<number, VariantQuestion> = {
      10: {
        question: "Variant prompt?",
        type: "SELECT",
        options: [
          { text: "CA", correct: true },
          { text: "D1", correct: false },
          { text: "D2", correct: false },
          { text: "D3", correct: false },
        ],
      },
    };

    render(
      <Quiz
        {...baseProps}
        variantData={variantData}
        initialLessonChallenges={[
          {
            id: 10,
            lessonId: 1,
            type: "SELECT" as (typeof challenges.$inferSelect)["type"],
            question: "Original question?",
            order: 1,
            completed: false,
            challengeOptions: [
              { id: 1, challengeId: 10, text: "OrigA", correct: true, imageSrc: null, audioSrc: null },
              { id: 2, challengeId: 10, text: "OrigB", correct: false, imageSrc: null, audioSrc: null },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("Variant prompt?")).toBeInTheDocument();
    expect(screen.getByText("Variant")).toBeInTheDocument();
    expect(screen.getByText("CA")).toBeInTheDocument();
  });

  it("should fall back to original when variant is null", () => {
    render(
      <Quiz
        {...baseProps}
        initialLessonChallenges={[
          {
            id: 10,
            lessonId: 1,
            type: "SELECT" as (typeof challenges.$inferSelect)["type"],
            question: "Original question?",
            order: 1,
            completed: false,
            challengeOptions: [
              { id: 1, challengeId: 10, text: "OrigA", correct: true, imageSrc: null, audioSrc: null },
              { id: 2, challengeId: 10, text: "OrigB", correct: false, imageSrc: null, audioSrc: null },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("Original question?")).toBeInTheDocument();
    expect(screen.queryByText("Variant")).toBeNull();
  });
});
