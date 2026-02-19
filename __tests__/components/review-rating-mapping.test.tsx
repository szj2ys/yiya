import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";

import { Quiz } from "@/app/lesson/quiz";

const submitReviewSpy = vi.fn().mockResolvedValue({});
const upsertChallengeProgressSpy = vi.fn().mockResolvedValue(undefined);
const reduceHeartsSpy = vi.fn().mockResolvedValue(undefined);

vi.mock("sonner", () => ({ toast: { error: vi.fn(), message: vi.fn() } }));

vi.mock("@/actions/challenge-progress", () => ({
  upsertChallengeProgress: (...args: unknown[]) => upsertChallengeProgressSpy(...args),
}));
vi.mock("@/actions/user-progress", () => ({
  reduceHearts: (...args: unknown[]) => reduceHeartsSpy(...args),
}));
vi.mock("@/actions/review", () => ({
  submitReview: (...args: unknown[]) => submitReviewSpy(...args),
}));

vi.mock("@/store/use-practice-modal", () => ({ usePracticeModal: () => ({ open: vi.fn() }) }));
vi.mock("@/store/use-hearts-modal", () => ({ useHeartsModal: () => ({ open: vi.fn() }) }));
vi.mock("@/lib/analytics", () => ({
  buildTrackPayload: (event: string, properties: any) => ({ event, properties }),
  trackPayload: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/image", () => ({ default: (props: any) => <img {...props} /> }));
vi.mock("react-confetti", () => ({ default: () => null }));

vi.mock("react-use", () => ({
  useMount: (fn: any) => fn(),
  useWindowSize: () => ({ width: 0, height: 0 }),
  useAudio: () => [null, null, { play: vi.fn() }],
  useKey: vi.fn(),
  useMedia: () => false,
}));

vi.mock("@/app/lesson/header", () => ({ Header: () => null }));
vi.mock("@/app/lesson/footer", () => ({
  Footer: ({ onCheck, disabled }: any) => (
    <button type="button" disabled={disabled} onClick={onCheck}>
      Check
    </button>
  ),
}));
vi.mock("@/app/lesson/question-bubble", () => ({ QuestionBubble: () => null }));
vi.mock("@/app/lesson/result-card", () => ({ ResultCard: () => null }));

vi.mock("@/app/lesson/challenge", () => ({
  Challenge: ({ options, onSelect, disabled }: any) => (
    <div>
      {options.map((o: any) => (
        <button
          key={o.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(o.id)}
        >
          {o.text}
        </button>
      ))}
    </div>
  ),
}));

const buildBaseProps = () => ({
  initialPercentage: 100,
  initialHearts: 5,
  initialLessonId: 1,
  initialStreak: 0,
  courseLanguage: "Spanish",
  userSubscription: null,
  reviewCardId: 123,
});

describe("Quiz review rating mapping", () => {
  it("should map fast correct to Easy rating", async () => {
    render(
      <Quiz
        {...buildBaseProps()}
        initialLessonChallenges={[
          {
            id: 1,
            lessonId: 1,
            type: "SELECT" as any,
            question: "Q",
            order: 1,
            completed: false,
            challengeOptions: [
              { id: 1, challengeId: 1, text: "A", correct: true },
              { id: 2, challengeId: 1, text: "B", correct: false },
            ],
          } as any,
        ]}
      />,
    );

    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("Check"));

    await waitFor(() => {
      expect(submitReviewSpy).toHaveBeenCalledWith(123, 4);
    });
  });

  it("should map slow correct to Good rating", async () => {
    const nowSpy = vi.spyOn(Date, "now");
    let now = 1_000;
    nowSpy.mockImplementation(() => now);

    try {
      render(
        <Quiz
          {...buildBaseProps()}
          initialLessonChallenges={[
            {
              id: 1,
              lessonId: 1,
              type: "SELECT" as any,
              question: "Q",
              order: 1,
              completed: false,
              challengeOptions: [
                { id: 1, challengeId: 1, text: "A", correct: true },
                { id: 2, challengeId: 1, text: "B", correct: false },
              ],
            } as any,
          ]}
        />,
      );

      fireEvent.click(screen.getByText("A"));
      now += 11_000;
      fireEvent.click(screen.getByText("Check"));

      await waitFor(() => {
        expect(submitReviewSpy).toHaveBeenCalledWith(123, 3);
      });
    } finally {
      nowSpy.mockRestore();
    }
  });

  it("should map wrong to Again rating", async () => {
    render(
      <Quiz
        {...buildBaseProps()}
        initialLessonChallenges={[
          {
            id: 1,
            lessonId: 1,
            type: "SELECT" as any,
            question: "Q",
            order: 1,
            completed: false,
            challengeOptions: [
              { id: 1, challengeId: 1, text: "A", correct: true },
              { id: 2, challengeId: 1, text: "B", correct: false },
            ],
          } as any,
        ]}
      />,
    );

    fireEvent.click(screen.getByText("B"));
    fireEvent.click(screen.getByText("Check"));

    await waitFor(() => {
      expect(submitReviewSpy).toHaveBeenCalledWith(123, 1);
    });
  });
});
