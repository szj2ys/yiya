import { NextResponse } from "next/server";
import { eq, count, inArray } from "drizzle-orm";
import db from "@/db/drizzle";
import { courses, units, lessons } from "@/db/schema";

/**
 * GET /api/agent/courses
 *
 * Returns a list of all available courses with basic metadata.
 * Supports ?format=simple for text-based agent consumption.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    // Get all courses with unit and lesson counts
    const allCourses = await db.select().from(courses);

    const coursesWithStats = await Promise.all(
      allCourses.map(async (course) => {
        const unitsData = await db
          .select({ id: units.id, title: units.title })
          .from(units)
          .where(eq(units.courseId, course.id));

        const unitIds = unitsData.map((u) => u.id);

        let lessonCount = 0;
        if (unitIds.length > 0) {
          const result = await db
            .select({ count: count() })
            .from(lessons)
            .where(inArray(lessons.unitId, unitIds));
          lessonCount = result[0]?.count ?? 0;
        }

        return {
          id: course.id,
          title: course.title,
          imageSrc: course.imageSrc,
          units: unitsData.length,
          lessons: lessonCount,
        };
      })
    );

    // Simple format for text-based agents
    if (format === "simple") {
      const lines = coursesWithStats.map(
        (c) => `${c.id}. ${c.title} (${c.units} units, ${c.lessons} lessons)`
      );
      return new NextResponse(lines.join("\n"), {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // JSON format
    return NextResponse.json(
      {
        courses: coursesWithStats,
        total: coursesWithStats.length,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (error) {
    console.error("[agent/courses] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
