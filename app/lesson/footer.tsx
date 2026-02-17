import { useKey, useMedia } from "react-use";
import { CheckCircle, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  onCheck: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number;
  correctAnswerText?: string;
  reserveBottomSpacePx?: number;
};

export const Footer = ({
  onCheck,
  status,
  disabled,
  lessonId,
  correctAnswerText,
  reserveBottomSpacePx = 0,
}: Props) => {
  useKey("Enter", onCheck, {}, [onCheck]);
  const isMobile = useMedia("(max-width: 1024px)");

  return (
    <footer
      className={cn(
        "lg:h-[140px] h-auto border-t-2",
        "sticky bottom-0 z-40 bg-white",
        status === "correct" && "border-transparent bg-green-100",
        status === "wrong" && "border-transparent bg-rose-100",
      )}
      style={{
        paddingBottom: isMobile
          ? `max(env(safe-area-inset-bottom, 0px), ${reserveBottomSpacePx}px)`
          : reserveBottomSpacePx
            ? `${reserveBottomSpacePx}px`
            : undefined,
      }}
    >
      <div className="max-w-[1140px] h-full mx-auto flex items-center justify-between px-4 lg:px-10 py-3 lg:py-0 gap-x-4">
        {status === "correct" && (
          <div className="text-green-500 font-bold text-base lg:text-2xl flex items-center">
            <CheckCircle className="h-6 w-6 lg:h-10 lg:w-10 mr-3 flex-shrink-0" />
            Nicely done!
          </div>
        )}
        {status === "wrong" && (
          <div className="text-rose-500 font-bold text-base lg:text-2xl flex items-center">
            <XCircle className="h-6 w-6 lg:h-10 lg:w-10 mr-3 flex-shrink-0" />
            {correctAnswerText ? (
              <span className="text-neutral-700 text-sm lg:text-2xl">
                Correct: <span className="text-rose-600">{correctAnswerText}</span>
              </span>
            ) : (
              "Try again."
            )}
          </div>
        )}
        {status === "completed" && (
          <Button
            variant="default"
            size={isMobile ? "sm" : "lg"}
            className="min-h-[44px]"
            onClick={() => window.location.href = `/lesson/${lessonId}`}
          >
            Practice again
          </Button>
        )}
        <Button
          disabled={disabled}
          className="ml-auto min-h-[44px] min-w-[100px] text-base"
          onClick={onCheck}
          size={isMobile ? "sm" : "lg"}
          variant={status === "wrong" ? "danger" : "secondary"}
        >
          {status === "none" && "Check"}
          {status === "correct" && "Next"}
          {status === "wrong" && "Retry"}
          {status === "completed" && "Continue"}
        </Button>
      </div>
    </footer>
  );
};
