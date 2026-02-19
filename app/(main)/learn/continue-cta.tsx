import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Props = {
  lessonTitle: string;
  unitDescription: string;
  lessonPercentage: number;
};

export const ContinueCta = ({
  lessonTitle,
  unitDescription,
  lessonPercentage,
}: Props) => {
  return (
    <div className="mb-6 rounded-2xl border border-green-200 bg-green-50/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
            {unitDescription}
          </p>
          <h2 className="text-lg font-bold text-neutral-800">
            {lessonTitle}
          </h2>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>Progress</span>
          <span>{lessonPercentage}%</span>
        </div>
        <Progress value={lessonPercentage} className="h-2" />
      </div>
      <Link href="/lesson">
        <Button size="lg" variant="primary" className="mt-4 w-full">
          Continue
        </Button>
      </Link>
    </div>
  );
};
