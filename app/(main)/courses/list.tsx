"use client";

import { toast } from "sonner";
import { useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";

import { courses, userProgress } from "@/db/schema";
import { upsertUserProgress } from "@/actions/user-progress";

import { Card } from "./card";

type Course = typeof courses.$inferSelect;

type CourseMeta = {
  badge?: string;
  description?: string;
  /** Lower = shown first */
  sortOrder: number;
};

/**
 * Course metadata is UI-only (not stored in DB).
 * We match by lowercase title to keep it decoupled from DB IDs.
 */
const COURSE_META: Record<string, CourseMeta> = {
  english: {
    badge: "Hot",
    description: "Master everyday English",
    sortOrder: 0,
  },
  chinese: {
    badge: "Hot",
    description: "Learn Mandarin Chinese",
    sortOrder: 1,
  },
  spanish: {
    badge: "Popular",
    description: "Speak Spanish with confidence",
    sortOrder: 2,
  },
  french: {
    description: "Explore the French language",
    sortOrder: 3,
  },
  italian: {
    description: "Discover Italian culture through language",
    sortOrder: 4,
  },
  japanese: {
    description: "Begin your Japanese journey",
    sortOrder: 5,
  },
};

const DEFAULT_META: CourseMeta = { sortOrder: 99 };

function getMeta(title: string): CourseMeta {
  return COURSE_META[title.toLowerCase()] ?? DEFAULT_META;
}

type Props = {
  courses: Course[];
  activeCourseId?: typeof userProgress.$inferSelect.activeCourseId;
};

export const List = ({ courses, activeCourseId }: Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const sortedCourses = useMemo(
    () =>
      [...courses].sort(
        (a, b) => getMeta(a.title).sortOrder - getMeta(b.title).sortOrder
      ),
    [courses]
  );

  const onClick = (id: number) => {
    if (pending) return;

    if (id === activeCourseId) {
      return router.push("/learn");
    }

    startTransition(() => {
      upsertUserProgress(id)
        .catch(() => toast.error("Something went wrong."));
    });
  };

  return (
    <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
      {sortedCourses.map((course) => {
        const meta = getMeta(course.title);

        return (
          <Card
            key={course.id}
            id={course.id}
            title={course.title}
            imageSrc={course.imageSrc}
            onClick={onClick}
            disabled={pending}
            active={course.id === activeCourseId}
            badge={meta.badge}
            description={meta.description}
          />
        );
      })}
    </div>
  );
};
