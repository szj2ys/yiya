import type OpenAI from "openai";

export type ExplainPromptParams = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  challengeType: string;
  courseLanguage: string;
};

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export function buildExplainPrompt(params: ExplainPromptParams): ChatMessage[] {
  const { question, userAnswer, correctAnswer, challengeType, courseLanguage } =
    params;

  const system = `You are a language tutor. The student just answered a quiz question incorrectly.

Write a concise explanation in ${courseLanguage}.

Requirements:
- Explain why the student's answer is wrong.
- Provide the relevant grammar rule.
- Provide a short memory tip.
- Provide 2 similar example sentences with translations.
- Be brief and practical (no long essays).

Return ONLY valid JSON with this shape:
{
  "explanation": string,
  "rule": string,
  "tip": string,
  "examples": [{ "source": string, "translation": string }, { "source": string, "translation": string }]
}`;

  const user = `Context:
- challengeType: ${challengeType}

Question:
${question}

Student answer:
${userAnswer}

Correct answer:
${correctAnswer}

Now respond with the JSON.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
