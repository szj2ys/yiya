import { cn } from "@/lib/utils";
import type { MemoryStrengthData } from "@/db/queries";

type CourseStats = {
  wordsLearned: number;
  completedLessons: number;
  totalLessons: number;
  completedChallenges: number;
  totalChallenges: number;
};

export type LearningProgressProps = {
  courseStats: CourseStats | null;
  memoryStrength: MemoryStrengthData | null;
  accuracyPercent: number | null;
};

type Segment = {
  key: "mastered" | "strong" | "weak" | "new";
  label: string;
  count: number;
  className: string;
};

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-4 w-full rounded-md bg-neutral-200/80 animate-pulse", className)}
    />
  );
}

export const LearningProgress = ({
  courseStats,
  memoryStrength,
  accuracyPercent,
}: LearningProgressProps) => {
  if (!courseStats || !memoryStrength) {
    return (
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <SkeletonLine className="h-5 w-32" />
        </div>
        <div className="mt-5 space-y-3">
          <SkeletonLine className="h-8 w-24" />
          <SkeletonLine className="h-3" />
          <SkeletonLine className="h-4 w-56" />
        </div>
      </div>
    );
  }

  const wordsLearned = courseStats.wordsLearned;
  const lessonsCompleted = courseStats.completedLessons;
  const totalLessons = courseStats.totalLessons;
  const lessonPercent =
    totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

  const accuracy = accuracyPercent ?? 0;

  const hasAnyProgress =
    wordsLearned > 0 || lessonsCompleted > 0 || memoryStrength.total > 0;

  if (!hasAnyProgress) {
    return (
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-bold text-neutral-800">Your Progress</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Start your first lesson! We'll track words learned and memory strength as you go.
        </p>
      </div>
    );
  }

  const segments: Segment[] = [
    {
      key: "mastered",
      label: "Mastered",
      count: memoryStrength.mastered,
      className: "bg-green-500",
    },
    {
      key: "strong",
      label: "Strong",
      count: memoryStrength.strong,
      className: "bg-blue-500",
    },
    {
      key: "weak",
      label: "Weak",
      count: memoryStrength.weak,
      className: "bg-amber-400",
    },
    {
      key: "new",
      label: "New",
      count: memoryStrength.newCount,
      className: "bg-neutral-300",
    },
  ];

  const totalCards = memoryStrength.total;

  const masteredPct = totalCards > 0 ? Math.round((memoryStrength.mastered / totalCards) * 100) : 0;
  const strongPct = totalCards > 0 ? Math.round((memoryStrength.strong / totalCards) * 100) : 0;
  const weakPct = totalCards > 0 ? Math.round((memoryStrength.weak / totalCards) * 100) : 0;
  const newPct = Math.max(0, 100 - masteredPct - strongPct - weakPct);

  const pctByKey: Record<Segment["key"], number> = {
    mastered: masteredPct,
    strong: strongPct,
    weak: weakPct,
    new: newPct,
  };

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-neutral-800">Your Progress</h2>
        <span className="text-xs font-semibold text-neutral-500">
          {lessonPercent}% complete
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold text-neutral-500">Words Learned</p>
          <p className="mt-1 text-2xl font-bold text-neutral-800">{wordsLearned}</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold text-neutral-500">Lessons</p>
          <p className="mt-1 text-2xl font-bold text-neutral-800">
            {lessonsCompleted}/{totalLessons}
          </p>
          <p className="mt-1 text-xs text-neutral-500">{lessonPercent}% completed</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:col-span-1 col-span-2">
          <p className="text-xs font-semibold text-neutral-500">Accuracy</p>
          <p className="mt-1 text-2xl font-bold text-neutral-800">{accuracy}%</p>
          <p className="mt-1 text-xs text-neutral-500">Overall</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-800">Memory strength</p>
          <span className="text-xs font-medium text-neutral-500">
            {totalCards} card{totalCards === 1 ? "" : "s"}
          </span>
        </div>

        <div
          className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-neutral-100"
          role="img"
          aria-label="Memory strength breakdown"
        >
          {segments.map((segment) => (
            <div
              key={segment.key}
              data-testid={`memory-segment-${segment.key}`}
              className={cn("h-full", segment.className)}
              style={{ width: `${pctByKey[segment.key]}%` }}
              aria-label={`${segment.label}: ${segment.count}`}
              title={`${segment.label}: ${segment.count}`}
            />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-neutral-600 sm:grid-cols-4">
          {segments.map((segment) => (
            <div key={segment.key} className="flex items-center gap-2">
              <span
                className={cn("h-2 w-2 rounded-full", segment.className)}
                aria-hidden="true"
              />
              <span className="font-medium">{segment.label}</span>
              <span className="text-neutral-500">{segment.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
