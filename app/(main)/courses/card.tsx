import Image from "next/image";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const BADGE_STYLES: Record<string, string> = {
  Hot: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
  Popular: "bg-blue-500 text-white",
  New: "bg-green-500 text-white",
};

type Props = {
  title: string;
  id: number;
  imageSrc: string;
  onClick: (id: number) => void;
  disabled?: boolean;
  active?: boolean;
  badge?: string;
  description?: string;
};

export const Card = ({
  title,
  id,
  imageSrc,
  disabled,
  onClick,
  active,
  badge,
  description,
}: Props) => {
  return (
    <div
      onClick={() => onClick(id)}
      className={cn(
        "relative h-full border-2 rounded-xl border-b-4 hover:bg-black/5 cursor-pointer active:border-b-2 flex flex-col items-center justify-between p-3 pb-6 min-h-[200px] min-w-0 w-full transition-all duration-150",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {badge && (
        <span
          className={cn(
            "absolute top-2 right-2 px-2 py-0.5 text-[10px] font-semibold rounded-full leading-tight",
            BADGE_STYLES[badge] ?? "bg-neutral-200 text-neutral-700"
          )}
        >
          {badge}
        </span>
      )}
      <div className="min-h-[24px] w-full flex items-center justify-end">
        {active && (
          <div className="rounded-md bg-green-600 flex items-center justify-center p-1.5">
            <Check className="text-white stroke-[4] h-4 w-4" />
          </div>
        )}
      </div>
      <Image
        src={imageSrc}
        alt={title}
        height={70}
        width={93.33}
        className="rounded-lg drop-shadow-md border object-cover"
        sizes="(max-width: 640px) 80px, 93px"
      />
      <div className="flex flex-col items-center mt-3 px-1">
        <p className="text-neutral-700 text-center font-bold text-sm sm:text-base">
          {title}
        </p>
        {description && (
          <p className="text-xs text-neutral-500 text-center mt-1 leading-snug">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
