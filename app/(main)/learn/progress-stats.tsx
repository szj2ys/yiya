import { BookOpen, GraduationCap, Trophy } from "lucide-react";

import { Progress } from "@/components/ui/progress";

type Props = {
  totalLessons: number;
  completedLessons: number;
  totalChallenges: number;
  completedChallenges: number;
  wordsLearned: number;
};

export const ProgressStats = ({
  totalLessons,
  completedLessons,
  totalChallenges,
  completedChallenges,
  wordsLearned,
}: Props) => {
  const completionPercent =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  return (
    <div className="w-full rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
      <h3 className="text-sm font-bold text-neutral-700">Course progress</h3>

      {/* Completion bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>{completionPercent}% complete</span>
          <span>
            {completedLessons}/{totalLessons} lessons
          </span>
        </div>
        <Progress value={completionPercent} className="h-2" />
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center gap-x-3 rounded-lg bg-green-50 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <BookOpen className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-700">
              {wordsLearned}
            </span>
            <span className="text-xs text-neutral-500">Words learned</span>
          </div>
        </div>

        <div className="flex items-center gap-x-3 rounded-lg bg-blue-50 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-700">
              {completedLessons}/{totalLessons}
            </span>
            <span className="text-xs text-neutral-500">Lessons completed</span>
          </div>
        </div>

        <div className="flex items-center gap-x-3 rounded-lg bg-purple-50 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
            <Trophy className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-700">
              {completedChallenges}/{totalChallenges}
            </span>
            <span className="text-xs text-neutral-500">
              Challenges completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
