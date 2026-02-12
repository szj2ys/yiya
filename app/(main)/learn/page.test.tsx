import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const mockGetCourseProgress = vi.fn();

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

vi.mock("@/db/queries", () => ({
  getUserProgress: vi.fn().mockResolvedValue({
    activeCourse: { title: "Spanish", imageSrc: "/course.svg" },
    hearts: 5,
    points: 10,
  }),
  getCourseProgress: mockGetCourseProgress,
  getLessonPercentage: vi.fn().mockResolvedValue(0),
  getUnits: vi.fn().mockResolvedValue([]),
  getUserSubscription: vi.fn().mockResolvedValue({ isActive: true }),
  getUserStreak: vi.fn().mockResolvedValue({ streak: 7, lastLessonAt: new Date() }),
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
  StartFirstLesson: () => <div>StartFirstLesson</div>,
}));

vi.mock("@/components/promo", () => ({ Promo: () => <div>Promo</div> }));
vi.mock("@/components/quests", () => ({ Quests: () => <div>Quests</div> }));

describe("LearnPage", () => {
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
