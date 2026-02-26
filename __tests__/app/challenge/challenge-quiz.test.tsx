import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import type { ChallengePublic } from "@/lib/challenge";

import { ChallengeQuiz } from "@/app/challenge/[id]/quiz";

const mockChallenge: ChallengePublic = {
  id: "test-123",
  challengerName: "Alice",
  language: "Spanish",
  challengerScore: 3,
  questions: [
    {
      id: 1,
      question: "What is hello?",
      options: [
        { id: 10, text: "Hola", imageSrc: null },
        { id: 11, text: "Adiós", imageSrc: null },
        { id: 12, text: "Gato", imageSrc: null },
        { id: 13, text: "Perro", imageSrc: null },
      ],
    },
    {
      id: 2,
      question: "What is bye?",
      options: [
        { id: 20, text: "Hola", imageSrc: null },
        { id: 21, text: "Adiós", imageSrc: null },
        { id: 22, text: "Gato", imageSrc: null },
        { id: 23, text: "Perro", imageSrc: null },
      ],
    },
    {
      id: 3,
      question: "What is cat?",
      options: [
        { id: 30, text: "Gato", imageSrc: null },
        { id: 31, text: "Perro", imageSrc: null },
        { id: 32, text: "Hola", imageSrc: null },
        { id: 33, text: "Adiós", imageSrc: null },
      ],
    },
    {
      id: 4,
      question: "What is dog?",
      options: [
        { id: 40, text: "Gato", imageSrc: null },
        { id: 41, text: "Perro", imageSrc: null },
        { id: 42, text: "Hola", imageSrc: null },
        { id: 43, text: "Adiós", imageSrc: null },
      ],
    },
    {
      id: 5,
      question: "What is water?",
      options: [
        { id: 50, text: "Agua", imageSrc: null },
        { id: 51, text: "Fuego", imageSrc: null },
        { id: 52, text: "Hola", imageSrc: null },
        { id: 53, text: "Perro", imageSrc: null },
      ],
    },
  ],
};

describe("ChallengeQuiz", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render first question immediately", () => {
    render(
      <ChallengeQuiz challenge={mockChallenge} onComplete={vi.fn()} />,
    );

    expect(screen.getByText("What is hello?")).toBeTruthy();
    expect(screen.getByText("1/5")).toBeTruthy();
    expect(screen.getByText("Hola")).toBeTruthy();
  });

  it("should progress through 5 questions", () => {
    render(
      <ChallengeQuiz challenge={mockChallenge} onComplete={vi.fn()} />,
    );

    // Answer question 1
    fireEvent.click(screen.getByText("Hola"));
    fireEvent.click(screen.getByTestId("challenge-check-btn"));
    // Now status is "correct", click Next
    fireEvent.click(screen.getByTestId("challenge-check-btn"));

    // Should be on question 2
    expect(screen.getByText("What is bye?")).toBeTruthy();
    expect(screen.getByText("2/5")).toBeTruthy();
  });

  it("should show results after 5th question", async () => {
    const onComplete = vi.fn();
    const mockSubmitResult = {
      friendScore: 3,
      challengerScore: 3,
      totalQuestions: 5,
      correctAnswers: [1, 2, 3],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSubmitResult),
    });

    render(
      <ChallengeQuiz challenge={mockChallenge} onComplete={onComplete} />,
    );

    // Progress through all 5 questions
    for (let i = 0; i < 5; i++) {
      const options = screen.getByTestId("challenge-options");
      const firstButton = options.querySelectorAll("button")[0];
      fireEvent.click(firstButton);
      fireEvent.click(screen.getByTestId("challenge-check-btn"));

      if (i < 4) {
        // Click "Next"
        fireEvent.click(screen.getByTestId("challenge-check-btn"));
      } else {
        // Last question — click "See Results"
        fireEvent.click(screen.getByTestId("challenge-check-btn"));
      }
    }

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(mockSubmitResult);
    });
  });

  it("should disable check button when no option is selected", () => {
    render(
      <ChallengeQuiz challenge={mockChallenge} onComplete={vi.fn()} />,
    );

    const checkBtn = screen.getByTestId("challenge-check-btn");
    expect(checkBtn).toBeDisabled();
  });

  it("should show challenger name and language", () => {
    render(
      <ChallengeQuiz challenge={mockChallenge} onComplete={vi.fn()} />,
    );

    expect(screen.getByText(/Alice/)).toBeTruthy();
    expect(screen.getByText("Spanish")).toBeTruthy();
  });
});
