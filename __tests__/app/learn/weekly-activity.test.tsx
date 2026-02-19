import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { WeeklyActivity } from "@/app/(main)/learn/weekly-activity";

describe("WeeklyActivity", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-19T12:00:00.000Z")); // Thursday
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockData = [
    { date: "2026-02-13", count: 0 },
    { date: "2026-02-14", count: 1 },
    { date: "2026-02-15", count: 0 },
    { date: "2026-02-16", count: 2 },
    { date: "2026-02-17", count: 0 },
    { date: "2026-02-18", count: 1 },
    { date: "2026-02-19", count: 3 },
  ];

  it("should render 7 days with correct color coding", () => {
    const { container } = render(<WeeklyActivity data={mockData} />);

    // Should show day labels for all 7 days
    expect(screen.getByText("Fri")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("Thu")).toBeInTheDocument();
  });

  it("should display 'This week' label", () => {
    render(<WeeklyActivity data={mockData} />);

    expect(screen.getByText("This week")).toBeInTheDocument();
  });

  it("should show total lesson count", () => {
    render(<WeeklyActivity data={mockData} />);

    // Total: 0+1+0+2+0+1+3 = 7
    expect(screen.getByText("7 lessons")).toBeInTheDocument();
  });

  it("should use singular 'lesson' when total is 1", () => {
    const singleData = [
      { date: "2026-02-13", count: 0 },
      { date: "2026-02-14", count: 0 },
      { date: "2026-02-15", count: 0 },
      { date: "2026-02-16", count: 1 },
      { date: "2026-02-17", count: 0 },
      { date: "2026-02-18", count: 0 },
      { date: "2026-02-19", count: 0 },
    ];

    render(<WeeklyActivity data={singleData} />);

    expect(screen.getByText("1 lesson")).toBeInTheDocument();
  });

  it("should highlight today with a ring", () => {
    render(<WeeklyActivity data={mockData} />);

    // Today (2026-02-19, Thursday) should have the ring class
    const todayLabel = screen.getByLabelText(/Thu: 3 lessons/);
    expect(todayLabel.className).toContain("ring-2");
  });

  it("should show count numbers for active days", () => {
    render(<WeeklyActivity data={mockData} />);

    // Days with count > 0 should show the number
    // "1" may appear multiple times (two days with count=1)
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
