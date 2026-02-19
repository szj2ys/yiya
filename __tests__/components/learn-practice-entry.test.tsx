import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const pushSpy = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushSpy }),
}));

vi.mock("@/actions/practice", () => ({
  startPractice: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), message: vi.fn() },
}));

describe("PracticeEntry", () => {
  it("should start practice flow when user clicks practice", async () => {
    const { PracticeEntry } = await import("@/app/(main)/learn/practice-entry");

    render(<PracticeEntry reviewItemCount={3} dueCount={2} />);

    fireEvent.click(screen.getByRole("button", { name: "Practice" }));

    expect(pushSpy).toHaveBeenCalledWith("/practice");
  });
});
