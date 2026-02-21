import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

import { Quiz } from "@/app/lesson/quiz";

vi.mock("@/lib/analytics", async () => {
  const actual = await vi.importActual<typeof import("@/lib/analytics")>(
    "@/lib/analytics",
  );

  return {
    ...actual,
    trackPayload: vi.fn().mockResolvedValue(undefined),
  };
});

import { trackPayload } from "@/lib/analytics";

const trackPayloadSpy = vi.mocked(trackPayload);

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
vi.mock("@/store/use-practice-modal", () => ({
  usePracticeModal: () => ({ open: vi.fn() }),
}));
vi.mock("@/store/use-hearts-modal", () => ({
  useHeartsModal: () => ({ open: vi.fn() }),
}));
vi.mock("@/actions/challenge-progress", () => ({ upsertChallengeProgress: vi.fn() }));
vi.mock("@/actions/user-progress", () => ({
  reduceHearts: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/actions/review", () => ({ submitReview: vi.fn() }));

vi.mock("@/app/lesson/header", () => ({ Header: () => null }));
vi.mock("@/app/lesson/footer", () => ({
  Footer: ({ onCheck }: any) => (
    <button data-testid="check-btn" onClick={onCheck}>
      Check
    </button>
  ),
}));
vi.mock("@/app/lesson/challenge", () => ({
  Challenge: ({ options, onSelect }: any) => (
    <div data-testid="challenge">
      {options?.map((o: any) => (
        <button key={o.id} data-testid={`option-${o.id}`} onClick={() => onSelect(o.id)}>
          {o.text}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("@/app/lesson/result-card", () => ({ ResultCard: () => null }));
vi.mock("@/app/lesson/question-bubble", () => ({ QuestionBubble: () => null }));

const makeChallenges = () => [
  {
    id: 1,
    lessonId: 1,
    type: "SELECT" as const,
    order: 1,
    question: "What is 'hello' in Spanish?",
    completed: false,
    challengeOptions: [
      { id: 10, challengeId: 1, text: "hola", correct: true, imageSrc: null, audioSrc: null },
      { id: 11, challengeId: 1, text: "adios", correct: false, imageSrc: null, audioSrc: null },
    ],
  },
];

describe("lesson_fail analytics event", () => {
  beforeEach(() => {
    trackPayloadSpy.mockClear();
  });

  it("should fire lesson_fail event when hearts depleted via reduceHearts response", async () => {
    // Simulate hearts_empty response from server
    const { reduceHearts } = await import("@/actions/user-progress");
    vi.mocked(reduceHearts).mockResolvedValueOnce({ error: "hearts" });

    render(
      <Quiz
        initialPercentage={0}
        initialHearts={0}
        initialLessonId={42}
        initialStreak={0}
        courseLanguage="Spanish"
        initialLessonChallenges={makeChallenges()}
        userSubscription={null}
      />,
    );

    // Select wrong answer
    const wrongOption = screen.getByTestId("option-11");
    await act(async () => {
      fireEvent.click(wrongOption);
    });

    // Click check
    const checkBtn = screen.getByTestId("check-btn");
    await act(async () => {
      fireEvent.click(checkBtn);
    });

    await waitFor(() => {
      expect(trackPayloadSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "lesson_fail",
          properties: expect.objectContaining({
            lesson_id: 42,
            hearts_remaining: 0,
            challenges_completed: 0,
          }),
        }),
      );
    });
  });

  it("should fire lesson_fail when hearts decrement to 0", async () => {
    const { reduceHearts } = await import("@/actions/user-progress");
    // Return success (no error) so hearts decrement path runs
    vi.mocked(reduceHearts).mockResolvedValueOnce(undefined as any);

    render(
      <Quiz
        initialPercentage={0}
        initialHearts={1}
        initialLessonId={42}
        initialStreak={0}
        courseLanguage="Spanish"
        initialLessonChallenges={makeChallenges()}
        userSubscription={null}
      />,
    );

    // Select wrong answer
    const wrongOption = screen.getByTestId("option-11");
    await act(async () => {
      fireEvent.click(wrongOption);
    });

    // Click check
    const checkBtn = screen.getByTestId("check-btn");
    await act(async () => {
      fireEvent.click(checkBtn);
    });

    await waitFor(() => {
      expect(trackPayloadSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "lesson_fail",
          properties: expect.objectContaining({
            lesson_id: 42,
            hearts_remaining: 0,
            challenges_completed: 0,
          }),
        }),
      );
    });
  });
});
