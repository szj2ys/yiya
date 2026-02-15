import OpenAI from "openai";

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export type AiChatOptions = {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: OpenAI.Chat.Completions.ChatCompletionCreateParams["response_format"];
};

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as Record<string, unknown>;
  const status =
    (typeof err.status === "number" ? err.status : undefined) ??
    (typeof (err as { response?: { status?: unknown } }).response?.status === "number"
      ? (err as { response?: { status?: number } }).response?.status
      : undefined);
  if (typeof status === "number") {
    return status >= 500 || status === 429;
  }

  const code = typeof err.code === "string" ? err.code : undefined;
  return code === "ETIMEDOUT" || code === "ECONNRESET" || code === "ENOTFOUND";
}

export const aiClient = new OpenAI({
  apiKey: getEnv("OPENAI_API_KEY"),
  baseURL: getEnv("OPENAI_API_BASE_URL"),
  timeout: 30_000,
  maxRetries: 0,
});

export async function aiChat(
  messages: ChatMessage[],
  options: AiChatOptions = {},
): Promise<string> {
  const {
    model = "gpt-4o-mini",
    temperature,
    max_tokens,
    response_format,
  } = options;

  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const completion = await aiClient.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
        response_format,
      });

      return completion.choices?.[0]?.message?.content ?? "";
    } catch (error) {
      lastError = error;
      const canRetry = attempt < maxAttempts && isTransientError(error);
      if (!canRetry) break;

      const backoffMs = 250 * 2 ** (attempt - 1);
      await sleep(backoffMs);
    }
  }

  throw lastError;
}
