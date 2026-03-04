import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { courses, units, lessons } from "@/db/schema";

/**
 * GET /api/agent/courses/[courseId]
 *
 * Returns detailed information about a specific course including all units and lessons.
 */
export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = parseInt(params.courseId, 10);
    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: "Invalid course ID" },
        { status: 400 }
      );
    }

    // Get course
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Get units with lessons
    const unitsData = await db
      .select({
        id: units.id,
        title: units.title,
        description: units.description,
        order: units.order,
      })
      .from(units)
      .where(eq(units.courseId, courseId))
      .orderBy(units.order);

    const unitsWithLessons = await Promise.all(
      unitsData.map(async (unit) => {
        const lessonsData = await db
          .select({
            id: lessons.id,
            title: lessons.title,
            order: lessons.order,
          })
          .from(lessons)
          .where(eq(lessons.unitId, unit.id))
          .orderBy(lessons.order);

        return {
          ...unit,
          lessons: lessonsData,
        };
      })
    );

    return NextResponse.json(
      {
        course: {
          id: course.id,
          title: course.title,
          imageSrc: course.imageSrc,
        },
        units: unitsWithLessons,
        totalUnits: unitsWithLessons.length,
        totalLessons: unitsWithLessons.reduce(
          (sum, u) => sum + u.lessons.length,
          0
        ),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (error) {
    console.error("[agent/course] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
