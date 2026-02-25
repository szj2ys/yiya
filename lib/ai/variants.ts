import { aiChat, AiConfigError } from "@/lib/ai/client";
import { getCachedOrFetch, sha256 } from "@/lib/ai/cache";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { buildVariantPrompt } from "@/lib/ai/prompts/variants";
import { isNonEmptyString, safeParseJson } from "@/lib/utils";

export type VariantOption = {
  text: string;
  correct: boolean;
};

export type VariantQuestion = {
  question: string;
  type: "SELECT" | "TYPE";
  options?: VariantOption[];
  expectedAnswer?: string;
};

export type GetVariantQuestionParams = {
  userId: string;
  challengeId: number;
  originalQuestion: string;
  correctAnswer: string;
  challengeType: "SELECT" | "ASSIST" | "TYPE";
  courseLanguage: string;
};

function isVariantOptionPayload(value: unknown): value is VariantOption {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return isNonEmptyString(obj.text) && typeof obj.correct === "boolean";
}

function isVariantQuestionPayload(value: unknown): value is VariantQuestion {
  if (!value || typeof value !== "object") return false;

  const obj = value as Record<string, unknown>;
  if (!isNonEmptyString(obj.question)) return false;

  const type = obj.type;
  if (type !== "SELECT" && type !== "TYPE") return false;

  if (type === "SELECT") {
    const options = obj.options;
    if (!Array.isArray(options) || options.length !== 4) return false;

    let correctCount = 0;
    for (const item of options) {
      if (!isVariantOptionPayload(item)) return false;
      if (item.correct) correctCount += 1;
    }
    return correctCount === 1;
  }

  return isNonEmptyString(obj.expectedAnswer);
}

function makeVariantCacheKey(challengeId: number, originalQuestion: string): string {
  return `variant:${challengeId}:${sha256(originalQuestion)}`;
}

async function fetchVariantFromLlm(
  params: Omit<GetVariantQuestionParams, "userId" | "challengeId">,
): Promise<VariantQuestion | null> {
  try {
    const messages = buildVariantPrompt(params);

    const content = await aiChat(messages, {
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 300,
    });

    const parsed = safeParseJson(content);
    if (!isVariantQuestionPayload(parsed)) {
      return null;
    }

    return parsed;
  } catch (error) {
    // Graceful degradation: when AI env vars are missing, fall back to original question.
    if (error instanceof AiConfigError) {
      return null;
    }

    return null;
  }
}

export async function getVariantQuestion(
  params: GetVariantQuestionParams,
): Promise<VariantQuestion | null> {
  const rate = await checkRateLimit(params.userId, "review_variant");
  if (!rate.allowed) return null;

  const cacheKey = makeVariantCacheKey(params.challengeId, params.originalQuestion);

  return getCachedOrFetch(cacheKey, () =>
    fetchVariantFromLlm({
      originalQuestion: params.originalQuestion,
      correctAnswer: params.correctAnswer,
      challengeType: params.challengeType,
      courseLanguage: params.courseLanguage,
    }),
  );
}

export const __testing__ = {
  isVariantQuestionPayload,
  makeVariantCacheKey,
  fetchVariantFromLlm,
};
