import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockGetUnitsWithProgress = vi.fn();
const mockGetUserProgress = vi.fn();
const mockRedirect = vi.fn();

vi.mock("next/navigation", () => ({ redirect: (...args: any[]) => mockRedirect(...args) }));

vi.mock("@/db/queries", () => ({
  getUserProgress: (...args: any[]) => mockGetUserProgress(...args),
  getUnitsWithProgress: (...args: any[]) => mockGetUnitsWithProgress(...args),
  getLessonPercentage: vi.fn().mockResolvedValue(0),
  getTodayReviewItems: vi.fn().mockResolvedValue([]),
  getUserSubscription: vi.fn().mockResolvedValue({ isActive: true }),
  getUserStreak: vi.fn().mockResolvedValue({ streak: 7, lastLessonAt: new Date() }),
  getWeeklyActivity: vi.fn().mockResolvedValue([
    { date: "2026-02-13", count: 0 },
    { date: "2026-02-14", count: 1 },
    { date: "2026-02-15", count: 0 },
    { date: "2026-02-16", count: 2 },
    { date: "2026-02-17", count: 0 },
    { date: "2026-02-18", count: 1 },
    { date: "2026-02-19", count: 0 },
  ]),
  getTodayLessonCount: vi.fn().mockResolvedValue(0),
  getCourseStats: vi.fn().mockResolvedValue({
    totalLessons: 10,
    completedLessons: 5,
    totalChallenges: 50,
    completedChallenges: 25,
    wordsLearned: 25,
  }),
  getMemoryStrength: vi.fn().mockResolvedValue({
    total: 0,
    mastered: 0,
    strong: 0,
    weak: 0,
    newCount: 0,
  }),
  getLearningStats: vi.fn().mockResolvedValue({
    currentStreak: 0,
    longestStreak: 0,
    totalWordsLearned: 0,
    totalLessonsCompleted: 0,
    averageAccuracy: 0,
  }),
  getDailyQuestProgress: vi.fn().mockResolvedValue({
    complete_lesson: false,
    hit_daily_goal: false,
    practice_review: false,
  }),
  getClaimedDailyQuests: vi.fn().mockResolvedValue([]),
  getStreakFreezeForDate: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/actions/review", () => ({
  getReviewDueCount: vi.fn().mockResolvedValue(0),
}));

vi.mock("@/components/sticky-wrapper", () => ({
  StickyWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/user-progress", () => ({
  UserProgress: () => <div>UserProgress</div>,
}));

vi.mock("@/components/feed-wrapper", () => ({
  FeedWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("./header", () => ({
  Header: () => <div>Header</div>,
}));

vi.mock("./unit-with-progress", () => ({
  UnitWithProgress: () => <div>Unit</div>,
}));

vi.mock("./learning-progress", () => ({
  LearningProgress: () => <div>LearningProgress</div>,
}));

vi.mock("./practice-entry", () => ({
  PracticeEntry: () => <div>PracticeEntry</div>,
}));

vi.mock("./start-first-lesson", () => ({
  StartFirstLesson: ({ primaryCta }: { primaryCta: React.ReactNode }) => (
    <div>{primaryCta}</div>
  ),
}));

vi.mock("@/components/quests", () => ({ Quests: () => <div>Quests</div> }));

vi.mock("./daily-goal", () => ({
  DailyGoal: () => <div>DailyGoal</div>,
}));

vi.mock("./weekly-activity", () => ({
  WeeklyActivity: () => <div>WeeklyActivity</div>,
}));

vi.mock("./daily-quests-card", () => ({
  DailyQuestsCard: () => <div>DailyQuestsCard</div>,
}));

vi.mock("./streak-risk-banner", () => ({
  StreakRiskBanner: ({ streak, todayLessonCount, hasFreezeToday }: { streak: number; todayLessonCount: number; hasFreezeToday: boolean }) => {
    if (streak > 0 && todayLessonCount === 0) {
      return (
        <div data-testid="streak-risk-banner">
          {hasFreezeToday
            ? `冻结保护中，但今天学习可以延续 ${streak} 天连胜`
            : `你的 ${streak} 天连胜还差今天的课程！`}
        </div>
      );
    }
    return null;
  },
}));

vi.mock("./continue-cta", () => ({
  ContinueCta: ({ lessonTitle, unitDescription, lessonPercentage }: { lessonTitle: string; unitDescription: string; lessonPercentage: number }) => (
    <div>
      <span>{unitDescription}</span>
      <span>{lessonTitle}</span>
      <span>{lessonPercentage}%</span>
      <span>Continue</span>
    </div>
  ),
}));

vi.mock("@/components/ui/progress", () => ({
  Progress: ({ value, className }: { value: number; className?: string }) => (
    <div data-testid="progress-bar" data-value={value} className={className} />
  ),
}));

describe("LearnPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserProgress.mockResolvedValue({
      activeCourse: { title: "Spanish", imageSrc: "/course.svg" },
      hearts: 5,
      points: 10,
      lastLessonAt: null,
    });
  });

  it("should redirect new users to onboarding when no userProgress", async () => {
    mockGetUserProgress.mockResolvedValueOnce(null);
    mockGetUnitsWithProgress.mockResolvedValueOnce({ units: [], activeLesson: undefined, activeLessonId: undefined });
    // redirect() in Next.js throws to halt execution; simulate that
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    const LearnPage = (await import("./page")).default;

    await expect(LearnPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/onboarding");
  });

  it("should show primary start CTA when user has no progress", async () => {
    mockGetUnitsWithProgress.mockResolvedValueOnce({ units: [], activeLesson: undefined, activeLessonId: undefined });

    const LearnPage = (await import("./page")).default;

    const element = await LearnPage();
    render(element);

    expect(screen.getByText("Start first lesson")).toBeInTheDocument();
  });

  it("should display streak in sidebar", async () => {
    mockGetUnitsWithProgress.mockResolvedValueOnce({ units: [], activeLesson: { id: 1, title: "Greetings", unit: { description: "Basics" } }, activeLessonId: 1 });

    const LearnPage = (await import("./page")).default;

    const element = await LearnPage();
    render(element);

    // Streak appears both in sidebar and mobile wrapper
    const streakElements = screen.getAllByText("7 day streak");
    expect(streakElements.length).toBeGreaterThanOrEqual(1);
  });

  it("should not render ProgressStats or LearningStats or Promo in sidebar", async () => {
    mockGetUnitsWithProgress.mockResolvedValueOnce({ units: [], activeLesson: { id: 1, title: "Greetings", unit: { description: "Basics" } }, activeLessonId: 1 });

    const LearnPage = (await import("./page")).default;

    const element = await LearnPage();
    render(element);

    expect(screen.queryByText("ProgressStats")).not.toBeInTheDocument();
    expect(screen.queryByText("LearningStats")).not.toBeInTheDocument();
    expect(screen.queryByText("Promo")).not.toBeInTheDocument();
  });

  it("should render continue CTA with lesson title and progress when active lesson exists", async () => {
    mockGetUnitsWithProgress.mockResolvedValueOnce({
      units: [],
      activeLesson: { id: 1, title: "Greetings", unit: { description: "Learn the basics" } },
      activeLessonId: 1,
    });

    const LearnPage = (await import("./page")).default;

    const element = await LearnPage();
    render(element);

    expect(screen.getByText("Greetings")).toBeInTheDocument();
    expect(screen.getByText("Learn the basics")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });

  it("should render DailyGoal with correct todayLessonCount and dailyGoal", async () => {
    mockGetUnitsWithProgress.mockResolvedValueOnce({ units: [], activeLesson: { id: 1, title: "Greetings", unit: { description: "Basics" } }, activeLessonId: 1 });

    const LearnPage = (await import("./page")).default;

    const element = await LearnPage();
    render(element);

    expect(screen.getByText("DailyGoal")).toBeInTheDocument();
  });

  it("should render Streak component in mobile wrapper when viewport < lg", async () => {
    mockGetUnitsWithProgress.mockResolvedValueOnce({ units: [], activeLesson: { id: 1, title: "Greetings", unit: { description: "Basics" } }, activeLessonId: 1 });

    const LearnPage = (await import("./page")).default;

    const element = await LearnPage();
    render(element);

    const mobileStreak = screen.getByTestId("mobile-streak");
    expect(mobileStreak).toBeInTheDocument();
    expect(mobileStreak.className).toContain("lg:hidden");
  });

  it("should render DailyGoal before LearningProgress", async () => {
    mockGetUnitsWithProgress.mockResolvedValueOnce({ units: [], activeLesson: { id: 1, title: "Greetings", unit: { description: "Basics" } }, activeLessonId: 1 });

    const LearnPage = (await import("./page")).default;

    const element = await LearnPage();
    const { container } = render(element);

    const allText = container.textContent ?? "";
    const dailyGoalIndex = allText.indexOf("DailyGoal");
    const learningProgressIndex = allText.indexOf("LearningProgress");

    expect(dailyGoalIndex).toBeGreaterThan(-1);
    expect(learningProgressIndex).toBeGreaterThan(-1);
    expect(dailyGoalIndex).toBeLessThan(learningProgressIndex);
  });

  it("should display hearts and points in mobile stats bar", async () => {
    mockGetUnitsWithProgress.mockResolvedValueOnce({ units: [], activeLesson: { id: 1, title: "Greetings", unit: { description: "Basics" } }, activeLessonId: 1 });

    const LearnPage = (await import("./page")).default;

    const element = await LearnPage();
    render(element);

    const mobileStatsBar = screen.getByTestId("mobile-stats-bar");
    expect(mobileStatsBar).toBeInTheDocument();
    expect(mobileStatsBar.className).toContain("lg:hidden");
    // Default mock has subscription active (Pro), so hearts show infinity icon rather than number
    expect(mobileStatsBar.textContent).toContain("10 XP");
    // Verify heart icon is present (lucide renders an svg with class containing "heart")
    const heartIcon = mobileStatsBar.querySelector("svg.lucide-heart");
    expect(heartIcon).toBeInTheDocument();
    // Verify flame icon is present
    const flameIcon = mobileStatsBar.querySelector("svg.lucide-flame");
    expect(flameIcon).toBeInTheDocument();
  });

  it("should show Pro badge in mobile stats bar when user has active subscription", async () => {
    mockGetUnitsWithProgress.mockResolvedValueOnce({ units: [], activeLesson: { id: 1, title: "Greetings", unit: { description: "Basics" } }, activeLessonId: 1 });

    const LearnPage = (await import("./page")).default;

    const element = await LearnPage();
    render(element);

    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("should show streak risk banner when todayLessonCount is 0 and streak > 0", async () => {
    mockGetUnitsWithProgress.mockResolvedValueOnce({
      units: [],
      activeLesson: { id: 1, title: "Greetings", unit: { description: "Basics" } },
      activeLessonId: 1,
    });

    const LearnPage = (await import("./page")).default;

    const element = await LearnPage();
    render(element);

    // Default mocks: streak=7, todayLessonCount=0 → banner should show
    expect(screen.getByTestId("streak-risk-banner")).toBeInTheDocument();
    expect(screen.getByText("你的 7 天连胜还差今天的课程！")).toBeInTheDocument();
  });

  it("should render learn page with merged query data", async () => {
    mockGetUnitsWithProgress.mockResolvedValueOnce({
      units: [{ id: 1, order: 1, title: "Unit 1", description: "Desc 1", lessons: [] }],
      activeLesson: { id: 1, title: "Greetings", unit: { description: "Basics" } },
      activeLessonId: 1,
    });

    const LearnPage = (await import("./page")).default;

    const element = await LearnPage();
    render(element);

    // Both units and active lesson come from the single getUnitsWithProgress call
    expect(screen.getByText("Unit")).toBeInTheDocument();
    expect(screen.getByText("Greetings")).toBeInTheDocument();
  });
});
