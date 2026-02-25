import Link from "next/link";

import { getUnitsWithProgress } from "@/db/queries";

type Props = {
  primaryCta: React.ReactNode;
};

export const StartFirstLesson = async ({ primaryCta }: Props) => {
  const { activeLessonId } = await getUnitsWithProgress();

  const href = activeLessonId
    ? `/lesson/${activeLessonId}`
    : "/lesson";

  return (
    <Link href={href} className="w-full sm:w-auto">
      {primaryCta}
    </Link>
  );
};

