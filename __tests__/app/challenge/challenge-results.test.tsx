import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ChallengePublic, ChallengeResult } from "@/lib/challenge";

// Mock analytics
vi.mock("@/lib/analytics", () => ({
  buildTrackPayload: vi.fn((_event: string, props: any) => ({
    event: _event,
    properties: { ts: 0, schema_version: 1, ...props },
  })),
  trackPayload: vi.fn(() => Promise.resolve()),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock canvas getContext for jsdom
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    font: "",
    textAlign: "",
    beginPath: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    clip: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
  } as any);
});

import { ChallengeResults } from "@/app/challenge/[id]/results";

const challenge: ChallengePublic = {
  id: "test-123",
  challengerName: "Alice",
  language: "Spanish",
  challengerScore: 3,
  questions: [],
};

describe("ChallengeResults", () => {
  it("should display both scores", () => {
    const result: ChallengeResult = {
      friendScore: 4,
      challengerScore: 3,
      totalQuestions: 5,
      correctAnswers: [1, 2, 3, 4],
    };

    render(<ChallengeResults challenge={challenge} result={result} />);

    expect(screen.getByTestId("score-comparison")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy(); // friend score
    expect(screen.getByText("3")).toBeTruthy(); // challenger score
  });

  it("should show signup CTA", () => {
    const result: ChallengeResult = {
      friendScore: 2,
      challengerScore: 3,
      totalQuestions: 5,
      correctAnswers: [1, 2],
    };

    render(<ChallengeResults challenge={challenge} result={result} />);

    expect(screen.getByTestId("challenge-signup-btn")).toBeTruthy();
    expect(
      screen.getByText("Want to keep learning? Sign up free"),
    ).toBeTruthy();
  });

  it("should show 'You won!' when friend beats challenger", () => {
    const result: ChallengeResult = {
      friendScore: 5,
      challengerScore: 3,
      totalQuestions: 5,
      correctAnswers: [1, 2, 3, 4, 5],
    };

    render(<ChallengeResults challenge={challenge} result={result} />);

    expect(screen.getByTestId("challenge-headline").textContent).toBe(
      "You won!",
    );
  });

  it("should show 'Nice try!' when challenger wins", () => {
    const result: ChallengeResult = {
      friendScore: 1,
      challengerScore: 3,
      totalQuestions: 5,
      correctAnswers: [1],
    };

    render(<ChallengeResults challenge={challenge} result={result} />);

    expect(screen.getByTestId("challenge-headline").textContent).toBe(
      "Nice try!",
    );
  });

  it("should show share button", () => {
    const result: ChallengeResult = {
      friendScore: 3,
      challengerScore: 3,
      totalQuestions: 5,
      correctAnswers: [1, 2, 3],
    };

    render(<ChallengeResults challenge={challenge} result={result} />);

    expect(screen.getByTestId("challenge-share-btn")).toBeTruthy();
  });

  it("should render shareable card on download button click", async () => {
    const result: ChallengeResult = {
      friendScore: 3,
      challengerScore: 3,
      totalQuestions: 5,
      correctAnswers: [1, 2, 3],
    };

    const user = userEvent.setup();
    render(<ChallengeResults challenge={challenge} result={result} />);

    const downloadBtn = screen.getByText("Download Score Card");
    await user.click(downloadBtn);

    await waitFor(() => {
      expect(
        screen.getByRole("dialog", { name: "Share challenge results" }),
      ).toBeTruthy();
    });
  });
});
