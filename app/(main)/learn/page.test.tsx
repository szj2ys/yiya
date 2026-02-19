import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockGetCourseProgress = vi.fn();
const mockGetUserProgress = vi.fn();
const mockRedirect = vi.fn();

vi.mock("next/navigation", () => ({ redirect: (...args: any[]) => mockRedirect(...args) }));

vi.mock("@/db/queries", () => ({
  getUserProgress: (...args: any[]) => mockGetUserProgress(...args),
  getCourseProgress: mockGetCourseProgress,
  getLessonPercentage: vi.fn().mockResolvedValue(0),
  getTodayReviewItems: vi.fn().mockResolvedValue([]),
  getUnits: vi.fn().mockResolvedValue([]),
  getUserSubscription: vi.fn().mockResolvedValue({ isActive: true }),
  getUserStreak: vi.fn().mockResolvedValue({ streak: 7, lastLessonAt: new Date() }),
  getCourseStats: vi.fn().mockResolvedValue({
    totalLessons: 10,
    completedLessons: 3,
    totalChallenges: 50,
    completedChallenges: 15,
    wordsLearned: 20,
  }),
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

vi.mock("./unit", () => ({
  Unit: () => <div>Unit</div>,
}));

vi.mock("./practice-entry", () => ({
  PracticeEntry: () => <div>PracticeEntry</div>,
}));

vi.mock("./start-first-lesson", () => ({
  StartFirstLesson: ({ primaryCta }: { primaryCta: React.ReactNode }) => (
    <div>{primaryCta}</div>
  ),
}));

vi.mock("@/components/promo", () => ({ Promo: () => <div>Promo</div> }));
vi.mock("@/components/quests", () => ({ Quests: () => <div>Quests</div> }));

vi.mock("./daily-goal", () => ({
  DailyGoal: () => <div>DailyGoal</div>,
}));

vi.mock("./progress-stats", () => ({
  ProgressStats: () => <div>ProgressStats</div>,
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
    mockGetCourseProgress.mockResolvedValueOnce(null);
    // redirect() in Next.js throws to halt execution; simulate that
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    const LearnPage = (await import("./page")).default;

    await expect(LearnPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/onboarding");
  });

  it("should show primary start CTA when user has no progress", async () => {
    mockGetCourseProgress.mockResolvedValueOnce({ activeLesson: null });

    const LearnPage = (await import("./page")).default;

    const element = await LearnPage();
    render(element);

    expect(screen.getByText("Start first lesson")).toBeInTheDocument();
  });

  it("should display streak in sidebar", async () => {
    mockGetCourseProgress.mockResolvedValueOnce({ activeLesson: { id: 1 } });

    const LearnPage = (await import("./page")).default;

    const element = await LearnPage();
    render(element);

    expect(screen.getByText("7 day streak")).toBeInTheDocument();
  });
});
