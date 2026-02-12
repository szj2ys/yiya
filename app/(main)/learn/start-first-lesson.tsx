import Link from "next/link";

import { getCourseProgress } from "@/db/queries";

type Props = {
  primaryCta: React.ReactNode;
};

export const StartFirstLesson = async ({ primaryCta }: Props) => {
  const courseProgress = await getCourseProgress();

  const href = courseProgress?.activeLessonId
    ? `/lesson/${courseProgress.activeLessonId}`
    : "/lesson";

  return (
    <Link href={href} className="w-full sm:w-auto">
      {primaryCta}
    </Link>
  );
};

