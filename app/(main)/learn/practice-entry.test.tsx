import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { PracticeEntry } from "./practice-entry";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useTransition: () => [false, (cb: () => void) => cb()],
  };
});

vi.mock("sonner", () => ({ toast: { error: vi.fn(), message: vi.fn() } }));

vi.mock("@/actions/practice", () => ({
  startPractice: vi.fn().mockResolvedValue({ type: "empty" }),
}));

describe("PracticeEntry", () => {
  it("should display due count and time estimate", () => {
    render(<PracticeEntry reviewItemCount={2} dueCount={8} />);
    expect(screen.getByText("8 items due · ~2 min")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("should fallback to legacy count when due is zero", () => {
    render(<PracticeEntry reviewItemCount={8} dueCount={0} />);
    expect(screen.getByText("8 items due · ~2 min")).toBeInTheDocument();
  });

  it("should render encouraging empty state when no items due", () => {
    render(<PracticeEntry reviewItemCount={0} dueCount={0} />);
    expect(
      screen.getByText("Great job! All caught up for today."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Check back tomorrow for new reviews."),
    ).toBeInTheDocument();
    // Practice button should not be rendered when empty
    expect(screen.queryByRole("button", { name: "Practice" })).toBeNull();
  });

  it("should show emphasized style when items are due", () => {
    render(<PracticeEntry reviewItemCount={5} dueCount={5} />);
    const container = screen.getByTestId("practice-entry");
    expect(container.className).toContain("border-sky-200");
    expect(container.className).toContain("bg-sky-50");
  });

  it("should show encouraging style when all caught up", () => {
    render(<PracticeEntry reviewItemCount={0} dueCount={0} />);
    const container = screen.getByTestId("practice-entry");
    expect(container.className).toContain("border-emerald-200");
    expect(container.className).toContain("bg-emerald-50/50");
  });

  it("should render correctly in dark mode", () => {
    render(<PracticeEntry reviewItemCount={0} dueCount={0} />);
    const container = screen.getByTestId("practice-entry");
    expect(container.className).toContain("dark:border-emerald-800");
    expect(container.className).toContain("dark:bg-emerald-950/30");
  });
});
