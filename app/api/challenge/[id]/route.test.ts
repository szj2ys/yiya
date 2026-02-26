import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/challenge", () => ({
  getChallenge: vi.fn(),
}));

import { getChallenge } from "@/lib/challenge";

const mockGetChallenge = vi.mocked(getChallenge);

describe("GET /api/challenge/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return questions without answers for public access", async () => {
    mockGetChallenge.mockResolvedValue({
      id: "test-123",
      challengerId: "user_1",
      challengerName: "Alice",
      language: "Spanish",
      questions: [
        {
          id: 1,
          question: "What is hello?",
          options: [
            { id: 10, text: "Hola", imageSrc: null },
            { id: 11, text: "Adiós", imageSrc: null },
          ],
        },
      ],
      answers: { 1: 10 },
      challengerScore: 4,
      createdAt: Date.now(),
    });

    const { GET } = await import("@/app/api/challenge/[id]/route");

    const res = await GET(
      new Request("http://localhost/api/challenge/test-123"),
      { params: { id: "test-123" } },
    );

    expect(res.status).toBe(200);
    const json = await res.json();

    // Should NOT include answers
    expect(json.answers).toBeUndefined();
    expect((json as any).answers).toBeUndefined();

    // Should include public data
    expect(json.id).toBe("test-123");
    expect(json.challengerName).toBe("Alice");
    expect(json.questions).toHaveLength(1);
    expect(json.challengerScore).toBe(4);
  });

  it("should return 404 when challenge not found", async () => {
    mockGetChallenge.mockResolvedValue(null);

    const { GET } = await import("@/app/api/challenge/[id]/route");

    const res = await GET(
      new Request("http://localhost/api/challenge/nonexistent"),
      { params: { id: "nonexistent" } },
    );

    expect(res.status).toBe(404);
  });
});
