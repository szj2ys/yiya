"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface Question {
  prompt: string;
  options: string[];
  correctIndex: number;
}

interface InteractiveSampleProps {
  languageName: string;
}

const SAMPLE_QUESTIONS: Record<string, Question[]> = {
  spanish: [
    {
      prompt: 'What does "Buenos dias" mean?',
      options: ["Good night", "Good morning", "Goodbye", "Thank you"],
      correctIndex: 1,
    },
    {
      prompt: 'How do you say "Thank you" in Spanish?',
      options: ["Por favor", "De nada", "Gracias", "Hola"],
      correctIndex: 2,
    },
    {
      prompt: 'What does "Donde esta?" mean?',
      options: ["How are you?", "What is this?", "Where is?", "Who is?"],
      correctIndex: 2,
    },
  ],
  chinese: [
    {
      prompt: "What does \"\u4f60\u597d\" (ni hao) mean?",
      options: ["Goodbye", "Thank you", "Hello", "Sorry"],
      correctIndex: 2,
    },
    {
      prompt: "How do you say \"Thank you\" in Chinese?",
      options: [
        "\u5bf9\u4e0d\u8d77",
        "\u8c22\u8c22",
        "\u4f60\u597d",
        "\u518d\u89c1",
      ],
      correctIndex: 1,
    },
    {
      prompt:
        "What does \"\u591a\u5c11\u94b1\" (duo shao qian) mean?",
      options: ["Where is it?", "How much?", "What time?", "How are you?"],
      correctIndex: 1,
    },
  ],
  french: [
    {
      prompt: 'What does "Bonjour" mean?',
      options: ["Goodbye", "Good night", "Hello", "Thank you"],
      correctIndex: 2,
    },
    {
      prompt: 'How do you say "Please" in French?',
      options: ["Merci", "S'il vous plait", "Bonjour", "Au revoir"],
      correctIndex: 1,
    },
    {
      prompt: 'What does "Merci beaucoup" mean?',
      options: ["You're welcome", "Excuse me", "Thank you very much", "See you soon"],
      correctIndex: 2,
    },
  ],
  italian: [
    {
      prompt: 'What does "Buongiorno" mean?',
      options: ["Good night", "Goodbye", "Good morning", "Thank you"],
      correctIndex: 2,
    },
    {
      prompt: 'How do you say "How much does it cost?" in Italian?',
      options: ["Per favore", "Grazie", "Mi chiamo", "Quanto costa?"],
      correctIndex: 3,
    },
    {
      prompt: 'What does "Per favore" mean?',
      options: ["Thank you", "Please", "Sorry", "Hello"],
      correctIndex: 1,
    },
  ],
  japanese: [
    {
      prompt:
        "What does \"\u3053\u3093\u306b\u3061\u306f\" (konnichiwa) mean?",
      options: ["Thank you", "Goodbye", "Hello", "Sorry"],
      correctIndex: 2,
    },
    {
      prompt: "How do you say \"Thank you\" in Japanese?",
      options: [
        "\u3059\u307f\u307e\u305b\u3093",
        "\u3053\u3093\u306b\u3061\u306f",
        "\u3055\u3088\u3046\u306a\u3089",
        "\u3042\u308a\u304c\u3068\u3046",
      ],
      correctIndex: 3,
    },
    {
      prompt:
        "What does \"\u3059\u307f\u307e\u305b\u3093\" (sumimasen) mean?",
      options: ["Hello", "Thank you", "Excuse me", "Goodbye"],
      correctIndex: 2,
    },
  ],
  english: [
    {
      prompt: 'What is the polite way to ask for help?',
      options: ["Help me!", "Could you help me, please?", "I need help.", "Help now."],
      correctIndex: 1,
    },
    {
      prompt: 'Which phrase is used for greeting someone new?',
      options: ["See you later", "Nice to meet you", "How are you doing?", "Goodbye"],
      correctIndex: 1,
    },
    {
      prompt: 'What does "I would like to order" express?',
      options: ["A command", "A polite request", "A question", "An apology"],
      correctIndex: 1,
    },
  ],
};

export function InteractiveSample({ languageName }: InteractiveSampleProps) {
  const questions = SAMPLE_QUESTIONS[languageName.toLowerCase()] ?? SAMPLE_QUESTIONS.spanish;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === question.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(null);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center ring-1 ring-black/5" data-testid="sample-quiz">
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
          <h3 className="text-lg font-bold text-neutral-900">
            You scored {score}/{questions.length}!
          </h3>
          <p className="text-sm text-neutral-600">
            Imagine what you could learn with full interactive lessons, AI explanations, and spaced repetition.
          </p>
          <button
            onClick={handleRestart}
            className="mt-2 rounded-xl bg-green-500 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-green-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5" data-testid="sample-quiz">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">
          Question {currentQuestion + 1} of {questions.length}
        </span>
        <span className="text-xs font-medium text-green-600">
          Score: {score}
        </span>
      </div>

      <h3 className="mb-4 text-base font-semibold text-neutral-900">
        {question.prompt}
      </h3>

      <div className="flex flex-col gap-2">
        {question.options.map((option, index) => {
          let className =
            "w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-colors ";

          if (selectedAnswer === null) {
            className += "border-neutral-200 text-neutral-700 hover:border-green-300 hover:bg-green-50 cursor-pointer";
          } else if (index === question.correctIndex) {
            className += "border-green-500 bg-green-50 text-green-700";
          } else if (index === selectedAnswer) {
            className += "border-red-500 bg-red-50 text-red-700";
          } else {
            className += "border-neutral-200 text-neutral-400";
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={className}
            >
              <span className="flex items-center gap-2">
                {selectedAnswer !== null && index === question.correctIndex && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {selectedAnswer === index && index !== question.correctIndex && (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {selectedAnswer !== null && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleNext}
            className="rounded-xl bg-green-500 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-green-600"
          >
            {currentQuestion < questions.length - 1 ? "Next" : "See Results"}
          </button>
        </div>
      )}
    </div>
  );
}
