import type OpenAI from "openai";

export type VariantPromptParams = {
  originalQuestion: string;
  correctAnswer: string;
  challengeType: "SELECT" | "ASSIST" | "TYPE";
  courseLanguage: string;
};

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export function buildVariantPrompt(params: VariantPromptParams): ChatMessage[] {
  const { originalQuestion, correctAnswer, challengeType, courseLanguage } = params;

  const system = `You create small variations of language-learning review questions.

Rules:
- Keep the same difficulty and vocabulary domain.
- Do NOT change the underlying meaning; the correct answer MUST be exactly the provided correctAnswer.
- Create a single variant.
- Return ONLY valid JSON (no markdown).

Output JSON shape:
{
  "question": string,
  "type": "SELECT" | "TYPE",
  "options"?: [{ "text": string, "correct": boolean }, { "text": string, "correct": boolean }, { "text": string, "correct": boolean }, { "text": string, "correct": boolean }],
  "expectedAnswer"?: string
}`;

  const variantMode =
    challengeType === "TYPE"
      ? `Generate a TYPE variant.
- Write a new prompt that tests the same item (e.g. reverse translation, synonym, or fill-in-the-blank).
- Set type to "TYPE".
- Set expectedAnswer EXACTLY to correctAnswer.`
      : `Generate a SELECT variant.
- Write a new question prompt.
- Provide EXACTLY 4 options.
- EXACTLY 1 option must be correct.
- The correct option text MUST be exactly correctAnswer.
- The 3 distractors must be plausible but clearly wrong.
- Set type to "SELECT".`;

  const user = `Context:
- challengeType: ${challengeType}
- courseLanguage: ${courseLanguage}

Original question:
${originalQuestion}

correctAnswer:
${correctAnswer}

Task:
${variantMode}

Now respond with the JSON.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
