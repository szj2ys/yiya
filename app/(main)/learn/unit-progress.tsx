import { cn } from "@/lib/utils";

export type UnitProgressProps = {
  completed: number;
  total: number;
  className?: string;
};

export const UnitProgress = ({ completed, total, className }: UnitProgressProps) => {
  const safeTotal = Math.max(0, total);
  const safeCompleted = Math.min(Math.max(0, completed), safeTotal);
  const percent = safeTotal > 0 ? Math.round((safeCompleted / safeTotal) * 100) : 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between text-xs font-semibold text-neutral-600">
        <span>
          {safeCompleted} / {safeTotal} lessons completed
        </span>
        <span>{percent}%</span>
      </div>

      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          data-testid="unit-progress-fill"
          className="h-full rounded-full bg-green-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
