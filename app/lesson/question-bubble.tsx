import Image from "next/image";
import { Volume2 } from "lucide-react";

import { speak, isTtsSupported } from "@/lib/tts";

type Props = {
  question: string;
  courseLanguage?: string;
};

export const QuestionBubble = ({ question, courseLanguage }: Props) => {
  const showReplay = !!courseLanguage && isTtsSupported();

  const handleReplay = () => {
    if (courseLanguage) {
      speak(question, courseLanguage);
    }
  };

  return (
    <div className="flex items-center gap-x-4 mb-6">
      <Image
        src="/mascot.svg"
        alt="Mascot"
        height={60}
        width={60}
        className="hidden lg:block"
      />
      <Image
        src="/mascot.svg"
        alt="Mascot"
        height={40}
        width={40}
        className="block lg:hidden"
      />
      <div className="relative py-2 px-4 border-2 rounded-xl text-sm lg:text-base">
        {question}
        <div
          className="absolute -left-3 top-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-y-1/2 rotate-90"
        />
      </div>
      {showReplay && (
        <button
          type="button"
          onClick={handleReplay}
          aria-label="Replay pronunciation"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 active:bg-neutral-200 transition-colors"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
