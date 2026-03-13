import { NextResponse } from "next/server";
import { eq, count } from "drizzle-orm";
import db from "@/db/drizzle";
import { userProgress, lessonCompletions, courses } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * GET /api/agent/progress?userId=xxx
 *
 * Returns user progress information.
 * Requires AGENT_API_KEY header for authorization.
 */
export async function GET(request: Request) {
  try {
    // Check API key
    const apiKey = request.headers.get("X-Agent-API-Key");
    const validKey = process.env.AGENT_API_KEY;

    if (!validKey || apiKey !== validKey) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Get user progress
    const progress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
      with: {
        activeCourse: true,
      },
    });

    if (!progress) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get completed lessons count
    const completedLessons = await db
      .select({ count: count() })
      .from(lessonCompletions)
      .where(eq(lessonCompletions.userId, userId));

    return NextResponse.json({
      userId,
      activeCourse: progress.activeCourse
        ? {
            id: progress.activeCourse.id,
            title: progress.activeCourse.title,
          }
        : null,
      hearts: progress.hearts,
      points: progress.points,
      streak: progress.streak,
      longestStreak: progress.longestStreak,
      dailyGoal: progress.dailyGoal,
      completedLessons: completedLessons[0]?.count ?? 0,
      lastLessonAt: progress.lastLessonAt,
    });
  } catch (error) {
    console.error("[agent/progress] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
