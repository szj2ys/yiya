import Link from "next/link";
import { Check, NotebookText, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  completedLessons: number;
  totalLessons: number;
};

const ProgressRing = ({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) => {
  const safeTotal = Math.max(0, total);
  const safeCompleted = Math.min(Math.max(0, completed), safeTotal);
  const percentage = safeTotal > 0 ? safeCompleted / safeTotal : 0;
  const isComplete = safeTotal > 0 && safeCompleted === safeTotal;

  // SVG circle dimensions
  const size = 32;
  const mobileSize = 28;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - percentage * circumference;

  const mobileRadius = (mobileSize - strokeWidth) / 2;
  const mobileCircumference = 2 * Math.PI * mobileRadius;
  const mobileOffset = mobileCircumference - percentage * mobileCircumference;

  return (
    <div className="flex items-center gap-2">
      {/* Mobile ring (28px) */}
      <div className="block sm:hidden" data-testid="progress-ring-mobile">
        <svg
          width={mobileSize}
          height={mobileSize}
          viewBox={`0 0 ${mobileSize} ${mobileSize}`}
          className={cn(isComplete && "animate-scale-up")}
        >
          <circle
            cx={mobileSize / 2}
            cy={mobileSize / 2}
            r={mobileRadius}
            fill={isComplete ? "#22c55e" : "none"}
            stroke="#e5e5e5"
            strokeWidth={strokeWidth}
            className="opacity-40"
          />
          <circle
            cx={mobileSize / 2}
            cy={mobileSize / 2}
            r={mobileRadius}
            fill="none"
            stroke={isComplete ? "#16a34a" : "#22c55e"}
            strokeWidth={strokeWidth}
            strokeDasharray={mobileCircumference}
            strokeDashoffset={mobileOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${mobileSize / 2} ${mobileSize / 2})`}
          />
          {isComplete && (
            <Check
              x={(mobileSize - 14) / 2}
              y={(mobileSize - 14) / 2}
              width={14}
              height={14}
              className="text-white"
              strokeWidth={3}
            />
          )}
        </svg>
      </div>

      {/* Desktop ring (32px) */}
      <div className="hidden sm:block" data-testid="progress-ring-desktop">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={cn(isComplete && "animate-scale-up")}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill={isComplete ? "#22c55e" : "none"}
            stroke="#e5e5e5"
            strokeWidth={strokeWidth}
            className="opacity-40"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isComplete ? "#16a34a" : "#22c55e"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          {isComplete && (
            <Check
              x={(size - 16) / 2}
              y={(size - 16) / 2}
              width={16}
              height={16}
              className="text-white"
              strokeWidth={3}
            />
          )}
        </svg>
      </div>

      <span
        className="text-sm font-semibold text-white/90"
        data-testid="progress-label"
      >
        {safeCompleted}/{safeTotal}
      </span>
    </div>
  );
};

export const UnitBanner = ({
  title,
  description,
  completedLessons,
  totalLessons,
}: Props) => {
  const isUnitComplete =
    totalLessons > 0 && completedLessons === totalLessons;

  return (
    <div className="w-full rounded-xl bg-green-500 p-5 text-white flex items-center justify-between">
      <div className="space-y-2.5">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-bold">{title}</h3>
          <ProgressRing completed={completedLessons} total={totalLessons} />
        </div>
        <p className="text-lg">{description}</p>
        {isUnitComplete && (
          <div
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
            data-testid="unit-complete-badge"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Unit Complete!
          </div>
        )}
      </div>
      <Link href="/lesson">
        <Button
          size="lg"
          variant="secondary"
          className="hidden xl:flex border-2 border-b-4 active:border-b-2"
        >
          <NotebookText className="mr-2" />
          Continue
        </Button>
      </Link>
    </div>
  );
};
