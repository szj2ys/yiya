import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock upsertUserProgress
const mockUpsert = vi.fn().mockResolvedValue(undefined);
vi.mock("@/actions/user-progress", () => ({
  upsertUserProgress: (...args: any[]) => mockUpsert(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { OnboardingFlow } from "@/app/onboarding/onboarding-flow";

const mockCourses = [
  { id: 1, title: "Spanish", imageSrc: "/es.svg" },
  { id: 2, title: "French", imageSrc: "/fr.svg" },
];

describe("OnboardingFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call upsertUserProgress with selected goal", async () => {
    render(<OnboardingFlow courses={mockCourses} />);

    // Step 1: Select a language
    fireEvent.click(screen.getByText("Spanish"));
    fireEvent.click(screen.getByText("Continue"));

    // Step 2: Select a daily goal (Regular = 3 lessons/day)
    // Click the parent button element containing the "Regular" text
    const regularButton = screen.getByText("Regular").closest("button")!;
    fireEvent.click(regularButton);

    // Click "Start Learning"
    fireEvent.click(screen.getByText("Start Learning"));

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(1, 3);
    });
  });

  it("should pass goal of 1 when Casual is selected", async () => {
    render(<OnboardingFlow courses={mockCourses} />);

    // Step 1: Select a language
    fireEvent.click(screen.getByText("Spanish"));
    fireEvent.click(screen.getByText("Continue"));

    // Step 2: Select "Casual" (1 lesson/day)
    const casualButton = screen.getByText("Casual").closest("button")!;
    fireEvent.click(casualButton);

    fireEvent.click(screen.getByText("Start Learning"));

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(1, 1);
    });
  });
});
