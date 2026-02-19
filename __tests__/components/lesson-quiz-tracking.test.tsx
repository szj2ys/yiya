import { describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

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

// Keep these lightweight: the test only asserts tracking behavior.
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
vi.mock("@/actions/user-progress", () => ({ reduceHearts: vi.fn() }));
vi.mock("@/actions/review", () => ({ submitReview: vi.fn() }));

vi.mock("@/app/lesson/header", () => ({ Header: () => null }));
vi.mock("@/app/lesson/footer", () => ({ Footer: () => null }));
vi.mock("@/app/lesson/challenge", () => ({ Challenge: () => null }));
vi.mock("@/app/lesson/result-card", () => ({ ResultCard: () => null }));
vi.mock("@/app/lesson/question-bubble", () => ({ QuestionBubble: () => null }));

describe("Quiz analytics", () => {
  it("should track lesson_complete when user finishes lesson", async () => {
    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={0}
        courseLanguage="Spanish"
        initialLessonChallenges={[]}
        userSubscription={null}
      />,
    );

    await waitFor(() => {
      expect(trackPayloadSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "lesson_complete",
          properties: expect.objectContaining({
            lesson_id: 1,
            hearts_remaining: 5,
          }),
        }),
      );
    });
  });

  it("should track review session start and complete in practice mode", async () => {
    render(
      <Quiz
        initialPercentage={100}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={0}
        courseLanguage="Spanish"
        initialLessonChallenges={[]}
        userSubscription={null}
      />,
    );

    await waitFor(() => {
      expect(trackPayloadSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "review_session_start",
          properties: expect.objectContaining({ due_count: 1 }),
        }),
      );

      expect(trackPayloadSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "review_session_complete",
          properties: expect.objectContaining({
            reviewed_count: 0,
            again_count: 0,
            duration_ms: expect.any(Number),
          }),
        }),
      );
    });
  });
});
