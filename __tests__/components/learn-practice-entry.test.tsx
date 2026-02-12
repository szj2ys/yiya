import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushSpy = vi.fn();
const startPracticeSpy = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushSpy }),
}));

vi.mock("@/actions/practice", () => ({
  startPractice: () => startPracticeSpy(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), message: vi.fn() },
}));

describe("PracticeEntry", () => {
  it("should start practice flow when user clicks practice", async () => {
    startPracticeSpy.mockResolvedValueOnce({ type: "lesson", lessonId: 42 });

    const { PracticeEntry } = await import("@/app/(main)/learn/practice-entry");

    render(<PracticeEntry />);

    await userEvent.click(screen.getByRole("button", { name: "Practice" }));

    expect(pushSpy).toHaveBeenCalledWith("/lesson/42");
  });
});

