"use client";

import Link from "next/link";
import { Check, Crown, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  id: number;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  percentage: number;
  title: string;
};

const CircularProgress = ({
  value,
  children,
}: {
  value: number;
  children: React.ReactNode;
}) => {
  const size = 112;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#4ade80"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export const LessonButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
  title,
}: Props) => {
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  let indentationLevel;

  if (cycleIndex <= 2) {
    indentationLevel = cycleIndex;
  } else if (cycleIndex <= 4) {
    indentationLevel = 4 - cycleIndex;
  } else if (cycleIndex <= 6) {
    indentationLevel = 4 - cycleIndex;
  } else {
    indentationLevel = cycleIndex - 8;
  }

  const rightPosition = Math.min(indentationLevel * 40, 60);

  const isFirst = index === 0;
  const isLast = index === totalCount;
  const isCompleted = !current && !locked;

  const Icon = isCompleted ? Check : isLast ? Crown : Star;

  const href = isCompleted ? `/lesson/${id}` : "/lesson";

  return (
    <Link
      href={href}
      aria-disabled={locked}
      style={{ pointerEvents: locked ? "none" : "auto" }}
    >
      <div
        className="relative flex flex-col items-center"
        style={{
          right: `${rightPosition}px`,
          marginTop: isFirst && !isCompleted ? 60 : 24,
        }}
      >
        {current ? (
          <div className="h-[112px] w-[112px] relative">
            <div className="absolute -top-6 left-2.5 px-3 py-2.5 border-2 font-bold uppercase text-green-500 bg-white rounded-xl animate-bounce tracking-wide z-10">
              Start
              <div
                className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-x-1/2"
              />
            </div>
            <CircularProgress
              value={Number.isNaN(percentage) ? 0 : percentage}
            >
              <Button
                size="rounded"
                variant={locked ? "locked" : "secondary"}
                className="h-[56px] w-[56px] lg:h-[70px] lg:w-[70px] border-b-8"
              >
                <Icon
                  className={cn(
                    "h-8 w-8 lg:h-10 lg:w-10",
                    locked
                    ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                    : "fill-primary-foreground text-primary-foreground",
                    isCompleted && "fill-none stroke-[4]"
                  )}
                />
              </Button>
            </CircularProgress>
          </div>
        ) : (
          <Button
            size="rounded"
            variant={locked ? "locked" : "secondary"}
            className="h-[56px] w-[56px] lg:h-[70px] lg:w-[70px] border-b-8"
          >
            <Icon
              className={cn(
                "h-8 w-8 lg:h-10 lg:w-10",
                locked
                ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                : "fill-primary-foreground text-primary-foreground",
                isCompleted && "fill-none stroke-[4]"
              )}
            />
          </Button>
        )}
        <span
          className={cn(
            "mt-1 truncate max-w-[100px] text-center",
            locked
              ? "text-xs font-medium text-neutral-500"
              : "text-xs font-semibold text-neutral-700"
          )}
        >
          {title}
        </span>
      </div>
    </Link>
  );
};
