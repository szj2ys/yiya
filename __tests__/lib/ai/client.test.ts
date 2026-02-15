import { beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();

vi.mock("openai", () => {
  return {
    default: class OpenAI {
      chat = {
        completions: {
          create: createMock,
        },
      };

      constructor(_options: unknown) {}
    },
  };
});

describe("aiChat", () => {
  beforeEach(() => {
    vi.resetModules();
    createMock.mockReset();
    process.env.OPENAI_API_BASE_URL = "http://localhost:4000/v1";
    process.env.OPENAI_API_KEY = "test-key";
  });

  it("should return response text when API succeeds", async () => {
    createMock.mockResolvedValue({
      choices: [{ message: { content: "hello" } }],
    });

    const { aiChat } = await import("@/lib/ai/client");
    const text = await aiChat([{ role: "user", content: "hi" }]);
    expect(text).toBe("hello");
  });

  it("should retry on transient failure", async () => {
    const error: any = new Error("rate limited");
    error.status = 429;

    createMock
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue({ choices: [{ message: { content: "ok" } }] });

    const { aiChat } = await import("@/lib/ai/client");
    const text = await aiChat([{ role: "user", content: "hi" }]);

    expect(text).toBe("ok");
    expect(createMock).toHaveBeenCalledTimes(3);
  });

  it("should throw after max retries", async () => {
    const error: any = new Error("server error");
    error.status = 500;

    createMock.mockRejectedValue(error);

    const { aiChat } = await import("@/lib/ai/client");
    await expect(aiChat([{ role: "user", content: "hi" }])).rejects.toBe(error);
    expect(createMock).toHaveBeenCalledTimes(3);
  });
});

