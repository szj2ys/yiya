import Link from "next/link";
import { redirect } from "next/navigation";

import { Quests } from "@/components/quests";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Streak } from "@/components/streak";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { BookOpen, Flame, Heart, InfinityIcon } from "lucide-react";
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
import { getCachedDashboard } from "@/lib/learn-cache";

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
import { DashboardSection } from "./dashboard-section";

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
  const userId = await getAuthUserId();

  type DashboardData = {
    todayReviewItems: Awaited<ReturnType<typeof getTodayReviewItems>>;
    reviewDueCount: number;
    weeklyActivity: Awaited<ReturnType<typeof getWeeklyActivity>>;
    todayLessonCount: number;
    memoryStrength: Awaited<ReturnType<typeof getMemoryStrength>>;
    learningStats: Awaited<ReturnType<typeof getLearningStats>>;
    dailyQuestProgress: Awaited<ReturnType<typeof getDailyQuestProgress>>;
    claimedDailyQuests: Awaited<ReturnType<typeof getClaimedDailyQuests>>;
    hasFreezeToday: boolean;
    nextMilestone: Awaited<ReturnType<typeof getNextStreakMilestoneForUser>>;
  };

  const defaultDashboard: DashboardData = {
    todayReviewItems: [],
    reviewDueCount: 0,
    weeklyActivity: [],
    todayLessonCount: 0,
    memoryStrength: { total: 0, mastered: 0, strong: 0, weak: 0, newCount: 0 },
    learningStats: null,
    dailyQuestProgress: { complete_lesson: false, hit_daily_goal: false, practice_review: false },
    claimedDailyQuests: [],
    hasFreezeToday: false,
    nextMilestone: null,
  };

  const fetchDashboard = async (): Promise<DashboardData> => {
    const [
      todayReviewItems,
      reviewDueCount,
      weeklyActivity,
      todayLessonCount,
      memoryStrength,
      learningStats,
      dailyQuestProgress,
      claimedDailyQuests,
      todayFreeze,
      nextMilestone,
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
    return {
      todayReviewItems,
      reviewDueCount,
      weeklyActivity,
      todayLessonCount,
      memoryStrength,
      learningStats,
      dailyQuestProgress,
      claimedDailyQuests,
      hasFreezeToday: !!todayFreeze,
      nextMilestone,
    };
  };

  const dashboard = !isNewUser && userId
    ? await getCachedDashboard(userId, fetchDashboard)
    : defaultDashboard;

  const {
    todayReviewItems,
    reviewDueCount,
    weeklyActivity,
    todayLessonCount,
    memoryStrength,
    learningStats,
    dailyQuestProgress,
    claimedDailyQuests,
    hasFreezeToday,
    nextMilestone,
  } = dashboard;

  let referralRewardCount = 0;
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
          <div className="lg:hidden mb-4 flex items-center gap-x-4 rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800 px-4 py-2.5" data-testid="mobile-stats-bar">
            <div className="flex items-center gap-x-1 text-sm font-medium text-neutral-600">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{userStreak?.streak ?? 0}</span>
            </div>
            <div className="flex items-center gap-x-1 text-sm font-medium text-neutral-600">
              <Heart className="h-4 w-4 text-rose-500" />
              {isPro ? (
                <InfinityIcon className="h-4 w-4 stroke-[3] text-rose-500" />
              ) : (
                <span>{userProgress.hearts}</span>
              )}
            </div>
            <div className="flex items-center gap-x-1 text-sm font-medium text-neutral-600">
              <span>{userProgress.points} XP</span>
            </div>
            {isPro && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                Pro
              </span>
            )}
            {reviewDueCount > 0 && (
              <Link
                href="/practice"
                className="ml-auto flex items-center gap-x-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-200"
                data-testid="mobile-review-btn"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Review ({reviewDueCount})
              </Link>
            )}
          </div>
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
          <DashboardSection>
            <DailyGoal
              todayLessonCount={todayLessonCount}
              dailyGoal={userProgress.dailyGoal ?? 1}
            />
            <PracticeEntry
              reviewItemCount={todayReviewItems.length}
              dueCount={reviewDueCount}
            />
            <DailyQuestsCard quests={dailyQuests} />
            <LearningProgress
              courseStats={courseStats}
              memoryStrength={memoryStrength}
              accuracyPercent={learningStats?.averageAccuracy ?? 0}
            />
            {weeklyActivity.length > 0 && (
              <WeeklyActivity data={weeklyActivity} />
            )}
          </DashboardSection>
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
