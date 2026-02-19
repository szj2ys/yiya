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

  it("should show empty state when no items", () => {
    render(<PracticeEntry reviewItemCount={0} dueCount={0} />);
    expect(screen.getByText("All caught up!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Practice" })).toBeDisabled();
  });
});
