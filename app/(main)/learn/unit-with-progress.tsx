import { lessons, units } from "@/db/schema";

import { UnitBanner } from "./unit-banner";
import { LessonButton } from "./lesson-button";
import { UnitProgress } from "./unit-progress";

type Props = {
  id: number;
  order: number;
  title: string;
  description: string;
  lessons: (typeof lessons.$inferSelect & {
    completed: boolean;
  })[];
  activeLesson:
    | (typeof lessons.$inferSelect & {
        unit: typeof units.$inferSelect;
      })
    | undefined;
  activeLessonPercentage: number;
};

export const UnitWithProgress = ({
  id,
  order,
  title,
  description,
  lessons,
  activeLesson,
  activeLessonPercentage,
}: Props) => {
  const completedLessons = lessons.filter((l) => l.completed).length;

  return (
    <>
      <div className="space-y-3">
        <UnitBanner
          title={title}
          description={description}
          completedLessons={completedLessons}
          totalLessons={lessons.length}
        />
        <UnitProgress
          completed={completedLessons}
          total={lessons.length}
          className="px-1"
        />
      </div>

      <div className="flex items-center flex-col relative">
        {lessons.map((lesson, index) => {
          const isCurrent = lesson.id === activeLesson?.id;
          const isLocked = !lesson.completed && !isCurrent;

          return (
            <LessonButton
              key={lesson.id}
              id={lesson.id}
              index={index}
              totalCount={lessons.length - 1}
              current={isCurrent}
              locked={isLocked}
              percentage={activeLessonPercentage}
              title={lesson.title}
            />
          );
        })}
      </div>
    </>
  );
};
