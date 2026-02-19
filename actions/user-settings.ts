"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs";
import { getAuthUserId } from "@/lib/auth-utils";

import db from "@/db/drizzle";
import { getUserProgress, getCourseById } from "@/db/queries";
import { userProgress } from "@/db/schema";

/**
 * Updates the user's daily goal and/or active course WITHOUT redirecting.
 * This is specifically for the settings page, where we want to stay on /settings
 * after saving (unlike upsertUserProgress which redirects to /learn).
 */
export const updateUserSettings = async (
  courseId: number,
  dailyGoal: number,
) => {
  const userId = await getAuthUserId();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  const course = await getCourseById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.units.length || !course.units[0].lessons.length) {
    throw new Error("Course is empty");
  }

  const existingUserProgress = await getUserProgress();

  if (!existingUserProgress) {
    throw new Error("User progress not found. Please complete onboarding first.");
  }

  await db
    .update(userProgress)
    .set({
      activeCourseId: courseId,
      userName: user.firstName || "User",
      userImageSrc: user.imageUrl || "/mascot.svg",
      dailyGoal,
    })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/courses");
  revalidatePath("/learn");
  revalidatePath("/settings");
};
