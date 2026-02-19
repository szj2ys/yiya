import { aiChat, AiConfigError } from "@/lib/ai/client";
import { getCachedOrFetch, sha256 } from "@/lib/ai/cache";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { buildExplainPrompt } from "@/lib/ai/prompts/explain";

export type ExplanationExample = {
  source: string;
  translation: string;
};

export type ExplanationResult = {
  explanation: string;
  rule: string;
  tip: string;
  examples: ExplanationExample[];
  /** True when served from cache. */
  cached: boolean;
};

export type GetExplanationParams = {
  userId: string;
  challengeId: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  challengeType: string;
  courseLanguage: string;
};

const FALLBACK_EXPLANATION: Omit<ExplanationResult, "cached"> = {
  explanation: "That answer is not correct.",
  rule: "Review the relevant grammar rule for this question.",
  tip: "Compare your answer to the correct one and note the difference.",
  examples: [],
};

function safeParseJson(input: string): unknown | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isExplanationResultPayload(value: unknown): value is Omit<
  ExplanationResult,
  "cached"
> {
  if (!value || typeof value !== "object") return false;

  const obj = value as Record<string, unknown>;
  if (!isNonEmptyString(obj.explanation)) return false;
  if (!isNonEmptyString(obj.rule)) return false;
  if (!isNonEmptyString(obj.tip)) return false;

  const examples = obj.examples;
  if (!Array.isArray(examples)) return false;

  for (const item of examples) {
    if (!item || typeof item !== "object") return false;
    const ex = item as Record<string, unknown>;
    if (!isNonEmptyString(ex.source)) return false;
    if (!isNonEmptyString(ex.translation)) return false;
  }

  return true;
}

function makeExplainCacheKey(challengeId: number, userAnswer: string): string {
  return sha256(`explain:${challengeId}:${userAnswer}`);
}

async function fetchExplanationFromLlm(
  params: Omit<GetExplanationParams, "userId" | "challengeId">,
): Promise<Omit<ExplanationResult, "cached">> {
  try {
    const messages = buildExplainPrompt(params);

    // Hint JSON response formatting to the OpenAI API.
    const content = await aiChat(messages, {
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 350,
    });

    const parsed = safeParseJson(content);
    if (!isExplanationResultPayload(parsed)) {
      return FALLBACK_EXPLANATION;
    }

    return {
      explanation: parsed.explanation,
      rule: parsed.rule,
      tip: parsed.tip,
      examples: parsed.examples,
    };
  } catch (error) {
    // Graceful degradation: when AI env vars are missing, return fallback
    if (error instanceof AiConfigError) {
      return FALLBACK_EXPLANATION;
    }
    throw error;
  }
}

export async function getExplanation(
  params: GetExplanationParams,
): Promise<ExplanationResult | null> {
  const rate = checkRateLimit(params.userId, "explain");
  if (!rate.allowed) return null;

  const cacheKey = makeExplainCacheKey(params.challengeId, params.userAnswer);

  let wasCached = true;
  const payload = await getCachedOrFetch(cacheKey, async () => {
    wasCached = false;
    return fetchExplanationFromLlm({
      question: params.question,
      userAnswer: params.userAnswer,
      correctAnswer: params.correctAnswer,
      challengeType: params.challengeType,
      courseLanguage: params.courseLanguage,
    });
  });

  return {
    ...payload,
    cached: wasCached,
  };
}

export const __testing__ = {
  FALLBACK_EXPLANATION,
  isExplanationResultPayload,
  makeExplainCacheKey,
  fetchExplanationFromLlm,
};
