import { describe, expect, it } from "vitest";

import {
  calculateScore,
  generateChallengeId,
  CHALLENGE_QUESTION_COUNT,
} from "@/lib/challenge";
import type { ChallengeSession } from "@/lib/challenge";

describe("generateChallengeId", () => {
  it("should generate a non-empty string id", () => {
    const id = generateChallengeId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(5);
  });

  it("should generate unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateChallengeId()));
    expect(ids.size).toBe(100);
  });
});

describe("CHALLENGE_QUESTION_COUNT", () => {
  it("should be 5", () => {
    expect(CHALLENGE_QUESTION_COUNT).toBe(5);
  });
});

describe("calculateScore", () => {
  const session: ChallengeSession = {
    id: "test-123",
    challengerId: "user_1",
    challengerName: "Alice",
    language: "Spanish",
    questions: [
      { id: 1, question: "What is hello?", options: [{ id: 10, text: "Hola", imageSrc: null }, { id: 11, text: "Adiós", imageSrc: null }] },
      { id: 2, question: "What is bye?", options: [{ id: 20, text: "Hola", imageSrc: null }, { id: 21, text: "Adiós", imageSrc: null }] },
      { id: 3, question: "What is cat?", options: [{ id: 30, text: "Gato", imageSrc: null }, { id: 31, text: "Perro", imageSrc: null }] },
      { id: 4, question: "What is dog?", options: [{ id: 40, text: "Gato", imageSrc: null }, { id: 41, text: "Perro", imageSrc: null }] },
      { id: 5, question: "What is water?", options: [{ id: 50, text: "Agua", imageSrc: null }, { id: 51, text: "Fuego", imageSrc: null }] },
    ],
    answers: { 1: 10, 2: 21, 3: 30, 4: 41, 5: 50 },
    challengerScore: 4,
    createdAt: Date.now(),
  };

  it("should calculate score on submission", () => {
    const result = calculateScore(session, {
      1: 10, // correct
      2: 21, // correct
      3: 30, // correct
      4: 40, // wrong
      5: 51, // wrong
    });

    expect(result.friendScore).toBe(3);
    expect(result.challengerScore).toBe(4);
    expect(result.totalQuestions).toBe(5);
    expect(result.correctAnswers).toEqual([1, 2, 3]);
  });

  it("should return 0 when all answers are wrong", () => {
    const result = calculateScore(session, {
      1: 11,
      2: 20,
      3: 31,
      4: 40,
      5: 51,
    });

    expect(result.friendScore).toBe(0);
    expect(result.correctAnswers).toEqual([]);
  });

  it("should return perfect score when all answers are correct", () => {
    const result = calculateScore(session, {
      1: 10,
      2: 21,
      3: 30,
      4: 41,
      5: 50,
    });

    expect(result.friendScore).toBe(5);
    expect(result.correctAnswers).toEqual([1, 2, 3, 4, 5]);
  });
});
