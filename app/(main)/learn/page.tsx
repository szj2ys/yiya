import { redirect } from "next/navigation";

import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Streak } from "@/components/streak";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { lessons, units as unitsSchema } from "@/db/schema";
import {
  getCourseProgress,
  getCourseStats,
  getLessonPercentage,
  getTodayReviewItems,
  getUnits,
  getUserProgress,
  getUserSubscription,
  getUserStreak,
} from "@/db/queries";
import { getReviewDueCount } from "@/actions/review";

import { Unit } from "./unit";
import { Header } from "./header";
import { DailyGoal } from "./daily-goal";
import { PracticeEntry } from "./practice-entry";
import { ProgressStats } from "./progress-stats";
import { StartFirstLesson } from "./start-first-lesson";

const LearnPage = async () => {
  const userProgressData = getUserProgress();
  const courseProgressData = getCourseProgress();
  const lessonPercentageData = getLessonPercentage();
  const unitsData = getUnits();
  const userSubscriptionData = getUserSubscription();
  const userStreakData = getUserStreak();
  const todayReviewItemsData = getTodayReviewItems();
  const reviewDueCountData = getReviewDueCount();
  const courseStatsData = getCourseStats();

  const [
    userProgress,
    units,
    courseProgress,
    lessonPercentage,
    userSubscription,
    userStreak,
    todayReviewItems,
    reviewDueCount,
    courseStats,
  ] = await Promise.all([
    userProgressData,
    unitsData,
    courseProgressData,
    lessonPercentageData,
    userSubscriptionData,
    userStreakData,
    todayReviewItemsData,
    reviewDueCountData,
    courseStatsData,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/onboarding");
  }

  if (!courseProgress) {
    redirect("/onboarding");
  }

  const isPro = !!userSubscription?.isActive;
  const shouldShowStartCta = !courseProgress.activeLesson;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />
        {courseStats && (
          <ProgressStats
            totalLessons={courseStats.totalLessons}
            completedLessons={courseStats.completedLessons}
            totalChallenges={courseStats.totalChallenges}
            completedChallenges={courseStats.completedChallenges}
            wordsLearned={courseStats.wordsLearned}
          />
        )}
        <Streak streak={userStreak?.streak ?? 0} lastLessonAt={userStreak?.lastLessonAt ?? null} />
        {!isPro && (
          <Promo />
        )}
        <Quests points={userProgress.points} />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={userProgress.activeCourse.title} />

        {shouldShowStartCta && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-bold text-neutral-800">
              Ready for your first lesson?
            </h2>
            <p className="text-sm text-neutral-600">
              Start your first lesson now — it only takes a minute.
            </p>
            <StartFirstLesson
              primaryCta={
                <Button size="lg" variant="primary" className="w-full sm:w-auto">
                  Start first lesson
                </Button>
              }
            />
          </div>
        )}

        {courseStats && (
          <DailyGoal
            lastLessonAt={userProgress.lastLessonAt ?? null}
            completedLessons={courseStats.completedLessons}
            totalLessons={courseStats.totalLessons}
          />
        )}

        <PracticeEntry
          reviewItemCount={todayReviewItems.length}
          dueCount={reviewDueCount}
        />

        {units.map((unit) => (
          <div key={unit.id} className="mb-10">
            <Unit
              id={unit.id}
              order={unit.order}
              description={unit.description}
              title={unit.title}
              lessons={unit.lessons}
              activeLesson={courseProgress.activeLesson as typeof lessons.$inferSelect & {
                unit: typeof unitsSchema.$inferSelect;
              } | undefined}
              activeLessonPercentage={lessonPercentage}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
};
 
export default LearnPage;
