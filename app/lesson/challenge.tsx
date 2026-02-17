import { cn } from "@/lib/utils";
import { challengeOptions, challenges } from "@/db/schema";

import { Card } from "./card";
import { TypeChallenge } from "./type-challenge";

type Props = {
  options: typeof challengeOptions.$inferSelect[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
  type: typeof challenges.$inferSelect["type"];
  typedAnswer?: string;
  onTypedAnswerChange?: (value: string) => void;
};

export const Challenge = ({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  type,
  typedAnswer,
  onTypedAnswerChange,
}: Props) => {
  if (type === "TYPE") {
    const correctOption = options.find((o) => o.correct);
    return (
      <TypeChallenge
        question=""
        value={typedAnswer ?? ""}
        onChange={onTypedAnswerChange ?? (() => {})}
        status={status}
        disabled={disabled}
        correctAnswer={correctOption?.text}
      />
    );
  }

  return (
    <div className={cn(
      "grid gap-2",
      type === "ASSIST" && "grid-cols-1",
      type === "SELECT" && "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]"
    )}>
      {options.map((option, i) => (
        <Card
          key={option.id}
          id={option.id}
          text={option.text}
          imageSrc={option.imageSrc}
          shortcut={`${i + 1}`}
          selected={selectedOption === option.id}
          onClick={() => onSelect(option.id)}
          status={status}
          audioSrc={option.audioSrc}
          disabled={disabled}
          type={type}
        />
      ))}
    </div>
  );
};
