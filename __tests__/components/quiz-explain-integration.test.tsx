import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import type { challenges } from "@/db/schema";

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

const pushSpy = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushSpy }) }));

const openPracticeModalSpy = vi.fn();
vi.mock("@/store/use-practice-modal", () => ({
  usePracticeModal: () => ({ open: openPracticeModalSpy }),
}));

vi.mock("@/store/use-hearts-modal", () => ({ useHeartsModal: () => ({ open: vi.fn() }) }));
vi.mock("@/actions/challenge-progress", () => ({ upsertChallengeProgress: vi.fn() }));
vi.mock("@/actions/user-progress", () => ({ reduceHearts: vi.fn().mockResolvedValue({}) }));

// keep UI shallow
vi.mock("@/app/lesson/header", () => ({ Header: () => null }));
vi.mock("@/app/lesson/result-card", () => ({ ResultCard: () => null }));
vi.mock("@/app/lesson/question-bubble", () => ({ QuestionBubble: () => null }));

// We want the real Footer for correct-answer text assertions.

const fetchSpy = vi.fn();
global.fetch = fetchSpy as unknown as typeof global.fetch;

beforeEach(() => {
  fetchSpy.mockReset();
});

describe("Quiz explain integration", () => {
  it("should show ExplanationPanel after wrong answer", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        explanation: "E",
        rule: "R",
        tip: "T",
        examples: [],
        cached: false,
      }),
    });

    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={0}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={[
          {
            id: 10,
            lessonId: 1,
            type: "SELECT" as (typeof challenges.$inferSelect)["type"],
            question: "Q?",
            order: 1,
            completed: false,
            challengeOptions: [
              { id: 1, challengeId: 10, text: "Wrong", correct: false, imageSrc: null, audioSrc: null },
              { id: 2, challengeId: 10, text: "Right", correct: true, imageSrc: null, audioSrc: null },
            ],
          },
        ]}
      />,
    );

    // select wrong option
    fireEvent.click(screen.getByText("Wrong"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/ai/explain",
        expect.objectContaining({ method: "POST" }),
      );
    });

    const explainBody = JSON.parse(fetchSpy.mock.calls[0][1].body as string);
    expect(explainBody.courseLanguage).toBe("Spanish");

    await waitFor(() => {
      expect(screen.getByText("Why it’s wrong")).toBeInTheDocument();
      expect(screen.getByText("E")).toBeInTheDocument();
    });
  });

  it("should not show explanation in practice mode", async () => {
    render(
      <Quiz
        initialPercentage={100}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={0}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={[
          {
            id: 10,
            lessonId: 1,
            type: "SELECT" as (typeof challenges.$inferSelect)["type"],
            question: "Q?",
            order: 1,
            completed: false,
            challengeOptions: [
              { id: 1, challengeId: 10, text: "Wrong", correct: false, imageSrc: null, audioSrc: null },
              { id: 2, challengeId: 10, text: "Right", correct: true, imageSrc: null, audioSrc: null },
            ],
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByText("Wrong"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));

    await waitFor(() => {
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    expect(screen.queryByText("Why it’s wrong")).toBeNull();
  });

  it("should dismiss on Got it click", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        explanation: "E",
        rule: "R",
        tip: "T",
        examples: [],
        cached: false,
      }),
    });

    render(
      <Quiz
        initialPercentage={0}
        initialHearts={5}
        initialLessonId={1}
        initialStreak={0}
        courseLanguage="Spanish"
        userSubscription={null}
        initialLessonChallenges={[
          {
            id: 10,
            lessonId: 1,
            type: "SELECT" as (typeof challenges.$inferSelect)["type"],
            question: "Q?",
            order: 1,
            completed: false,
            challengeOptions: [
              { id: 1, challengeId: 10, text: "Wrong", correct: false, imageSrc: null, audioSrc: null },
              { id: 2, challengeId: 10, text: "Right", correct: true, imageSrc: null, audioSrc: null },
            ],
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByText("Wrong"));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));

    await waitFor(() => {
      expect(screen.getByText("Why it’s wrong")).toBeInTheDocument();
      expect(screen.getByText("E")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Got it" }));

    await waitFor(() => {
      const panelRoot = screen
        .getByText("Why it’s wrong")
        .closest("[aria-hidden]");

      expect(panelRoot).toHaveAttribute("aria-hidden", "true");
    });
  });
});
