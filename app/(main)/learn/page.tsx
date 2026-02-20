import { redirect } from "next/navigation";

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
  getClaimedDailyQuests,
  getDailyQuestProgress,
  getLearningStats,
  getLessonPercentage,
  getMemoryStrength,
  getTodayLessonCount,
  getTodayReviewItems,
  getUnits,
  getUserProgress,
  getUserSubscription,
  getUserStreak,
  getWeeklyActivity,
} from "@/db/queries";
import { DAILY_QUESTS } from "@/constants";
import { getReviewDueCount } from "@/actions/review";

import { UnitWithProgress } from "./unit-with-progress";
import { Header } from "./header";
import { ContinueCta } from "./continue-cta";
import { LearningProgress } from "./learning-progress";
import { DailyGoal } from "./daily-goal";
import { PracticeEntry } from "./practice-entry";
import { StartFirstLesson } from "./start-first-lesson";
import { WeeklyActivity } from "./weekly-activity";
import { DailyQuestsCard } from "./daily-quests-card";

const LearnPage = async () => {
  const userProgressData = getUserProgress();
  const courseProgressData = getCourseProgress();
  const lessonPercentageData = getLessonPercentage();
  const unitsData = getUnits();
  const userSubscriptionData = getUserSubscription();
  const userStreakData = getUserStreak();
  const todayReviewItemsData = getTodayReviewItems();
  const reviewDueCountData = getReviewDueCount();
  const weeklyActivityData = getWeeklyActivity();
  const todayLessonCountData = getTodayLessonCount();
  const courseStatsData = getCourseStats();
  const memoryStrengthData = getMemoryStrength();
  const learningStatsData = getLearningStats();
  const dailyQuestProgressData = getDailyQuestProgress();
  const claimedDailyQuestsData = getClaimedDailyQuests();

  const [
    userProgress,
    units,
    courseProgress,
    lessonPercentage,
    userSubscription,
    userStreak,
    todayReviewItems,
    reviewDueCount,
    weeklyActivity,
    todayLessonCount,
    courseStats,
    memoryStrength,
    learningStats,
    dailyQuestProgress,
    claimedDailyQuests,
  ] = await Promise.all([
    userProgressData,
    unitsData,
    courseProgressData,
    lessonPercentageData,
    userSubscriptionData,
    userStreakData,
    todayReviewItemsData,
    reviewDueCountData,
    weeklyActivityData,
    todayLessonCountData,
    courseStatsData,
    memoryStrengthData,
    learningStatsData,
    dailyQuestProgressData,
    claimedDailyQuestsData,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/onboarding");
  }

  if (!courseProgress) {
    redirect("/onboarding");
  }

  const isPro = !!userSubscription?.isActive;
  const shouldShowStartCta = !courseProgress.activeLesson;

  const dailyQuests = DAILY_QUESTS.map((quest) => ({
    id: quest.id,
    title: quest.title,
    description: quest.description,
    xpReward: quest.xpReward,
    completed: dailyQuestProgress[quest.id as keyof typeof dailyQuestProgress],
    claimed: claimedDailyQuests.includes(quest.id),
  }));

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />
        <Streak streak={userStreak?.streak ?? 0} lastLessonAt={userStreak?.lastLessonAt ?? null} />
        <Quests points={userProgress.points} />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={userProgress.activeCourse.title} />

        {courseProgress.activeLesson && (
          <ContinueCta
            lessonTitle={courseProgress.activeLesson.title}
            unitDescription={courseProgress.activeLesson.unit.description}
            lessonPercentage={lessonPercentage}
          />
        )}

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

        <LearningProgress
          courseStats={courseStats}
          memoryStrength={memoryStrength}
          accuracyPercent={learningStats?.averageAccuracy ?? 0}
        />

        <DailyGoal
          todayLessonCount={todayLessonCount}
          dailyGoal={userProgress.dailyGoal ?? 1}
        />

        <DailyQuestsCard quests={dailyQuests} />

        {weeklyActivity.length > 0 && (
          <WeeklyActivity data={weeklyActivity} />
        )}

        <PracticeEntry
          reviewItemCount={todayReviewItems.length}
          dueCount={reviewDueCount}
        />

        {units.map((unit: typeof units[number]) => (
          <div key={unit.id} className="mb-10">
            <UnitWithProgress
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
