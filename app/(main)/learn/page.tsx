import { redirect } from "next/navigation";

import { Quests } from "@/components/quests";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Streak } from "@/components/streak";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { Flame, Heart, InfinityIcon } from "lucide-react";
import { lessons, units as unitsSchema } from "@/db/schema";
import {
  getCourseStats,
  getClaimedDailyQuests,
  getDailyQuestProgress,
  getLearningStats,
  getLessonPercentage,
  getMemoryStrength,
  getStreakFreezeForDate,
  getTodayLessonCount,
  getTodayReviewItems,
  getUnitsWithProgress,
  getUserProgress,
  getUserSubscription,
  getUserStreak,
  getWeeklyActivity,
  getNextStreakMilestoneForUser,
} from "@/db/queries";
import { DAILY_QUESTS } from "@/constants";
import { getReviewDueCount } from "@/actions/review";
import { getAndMarkUnnotifiedReferrals } from "@/actions/referral-reward";
import { ReferralRewardToast } from "@/components/referral-reward-toast";
import { getAuthUserId } from "@/lib/auth-utils";

import { UnitWithProgress } from "./unit-with-progress";
import { Header } from "./header";
import { ContinueCta } from "./continue-cta";
import { LearningProgress } from "./learning-progress";
import { DailyGoal } from "./daily-goal";
import { PracticeEntry } from "./practice-entry";
import { StartFirstLesson } from "./start-first-lesson";
import { StreakRiskBanner } from "./streak-risk-banner";
import { WeeklyActivity } from "./weekly-activity";
import { DailyQuestsCard } from "./daily-quests-card";

const LearnPage = async () => {
  const [
    userProgress,
    unitsWithProgress,
    lessonPercentage,
    userSubscription,
    userStreak,
    courseStats,
  ] = await Promise.all([
    getUserProgress(),
    getUnitsWithProgress(),
    getLessonPercentage(),
    getUserSubscription(),
    getUserStreak(),
    getCourseStats(),
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/onboarding");
  }

  const { units, activeLesson, activeLessonId } = unitsWithProgress;
  const courseProgress = { activeLesson, activeLessonId };
  const isPro = !!userSubscription?.isActive;
  const shouldShowStartCta = !courseProgress.activeLesson;
  const isNewUser = (courseStats?.completedLessons ?? 0) < 3;

  let todayReviewItems: Awaited<ReturnType<typeof getTodayReviewItems>> = [];
  let reviewDueCount = 0;
  let weeklyActivity: Awaited<ReturnType<typeof getWeeklyActivity>> = [];
  let todayLessonCount = 0;
  let memoryStrength: Awaited<ReturnType<typeof getMemoryStrength>> = { total: 0, mastered: 0, strong: 0, weak: 0, newCount: 0 };
  let learningStats: Awaited<ReturnType<typeof getLearningStats>> = null;
  let dailyQuestProgress: Awaited<ReturnType<typeof getDailyQuestProgress>> = { complete_lesson: false, hit_daily_goal: false, practice_review: false };
  let claimedDailyQuests: Awaited<ReturnType<typeof getClaimedDailyQuests>> = [];
  let hasFreezeToday = false;
  let nextMilestone: Awaited<ReturnType<typeof getNextStreakMilestoneForUser>> = null;
  let referralRewardCount = 0;

  if (!isNewUser) {
    const [
      _todayReviewItems,
      _reviewDueCount,
      _weeklyActivity,
      _todayLessonCount,
      _memoryStrength,
      _learningStats,
      _dailyQuestProgress,
      _claimedDailyQuests,
      _todayFreeze,
      _nextMilestone,
    ] = await Promise.all([
      getTodayReviewItems(),
      getReviewDueCount(),
      getWeeklyActivity(),
      getTodayLessonCount(),
      getMemoryStrength(),
      getLearningStats(),
      getDailyQuestProgress(),
      getClaimedDailyQuests(),
      getStreakFreezeForDate(),
      getNextStreakMilestoneForUser(),
    ]);

    todayReviewItems = _todayReviewItems;
    reviewDueCount = _reviewDueCount;
    weeklyActivity = _weeklyActivity;
    todayLessonCount = _todayLessonCount;
    memoryStrength = _memoryStrength;
    learningStats = _learningStats;
    dailyQuestProgress = _dailyQuestProgress;
    claimedDailyQuests = _claimedDailyQuests;
    hasFreezeToday = !!_todayFreeze;
    nextMilestone = _nextMilestone;
  }

  const userId = await getAuthUserId();
  if (userId) {
    referralRewardCount = await getAndMarkUnnotifiedReferrals(userId);
  }

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
      <ReferralRewardToast count={referralRewardCount} />
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />
        {!isNewUser && (
          <Streak
            streak={userStreak?.streak ?? 0}
            lastLessonAt={userStreak?.lastLessonAt ?? null}
            freezeActive={hasFreezeToday}
            nextMilestone={nextMilestone}
          />
        )}
        {!isNewUser && <Quests points={userProgress.points} />}
      </StickyWrapper>
      <FeedWrapper>
        <Header title={userProgress.activeCourse.title} />

        {!isNewUser && (
          <>
            <div className="lg:hidden mb-4" data-testid="mobile-streak">
              <Streak
                streak={userStreak?.streak ?? 0}
                lastLessonAt={userStreak?.lastLessonAt ?? null}
                freezeActive={hasFreezeToday}
                nextMilestone={nextMilestone}
              />
            </div>

            <div className="lg:hidden mb-4 flex items-center gap-x-4" data-testid="mobile-stats-bar">
              <div className="flex items-center gap-x-1 text-sm text-neutral-600">
                <Heart className="h-4 w-4 text-rose-500" />
                {isPro ? (
                  <InfinityIcon className="h-4 w-4 stroke-[3] text-rose-500" />
                ) : (
                  <span>{userProgress.hearts}</span>
                )}
              </div>
              <div className="flex items-center gap-x-1 text-sm text-neutral-600">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>{userProgress.points} XP</span>
              </div>
              {isPro && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  Pro
                </span>
              )}
            </div>
          </>
        )}

        {!isNewUser && (
          <StreakRiskBanner
            streak={userStreak?.streak ?? 0}
            todayLessonCount={todayLessonCount}
            hasFreezeToday={hasFreezeToday}
          />
        )}

        {courseProgress.activeLesson && (
          <ContinueCta
            lessonTitle={courseProgress.activeLesson.title}
            unitDescription={courseProgress.activeLesson.unit.description}
            lessonPercentage={lessonPercentage}
          />
        )}

        {shouldShowStartCta && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950" data-testid="first-lesson-cta">
            <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
              Ready for your first lesson?
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Your first lesson takes about 2 minutes. Let&apos;s go!
            </p>
            <StartFirstLesson
              primaryCta={
                <Button size="lg" variant="primary" className="w-full animate-pulse sm:w-auto">
                  Start first lesson
                </Button>
              }
            />
          </div>
        )}

        {!isNewUser && (
          <DailyGoal
          todayLessonCount={todayLessonCount}
            dailyGoal={userProgress.dailyGoal ?? 1}
          />
        )}

        {!isNewUser && (
          <PracticeEntry
          reviewItemCount={todayReviewItems.length}
            dueCount={reviewDueCount}
          />
        )}

        {!isNewUser && <DailyQuestsCard quests={dailyQuests} />}

        {!isNewUser && (
          <LearningProgress
            courseStats={courseStats}
            memoryStrength={memoryStrength}
            accuracyPercent={learningStats?.averageAccuracy ?? 0}
          />
        )}

        {!isNewUser && weeklyActivity.length > 0 && (
          <WeeklyActivity data={weeklyActivity} />
        )}

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
