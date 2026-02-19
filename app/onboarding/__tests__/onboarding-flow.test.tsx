import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

vi.mock("@/actions/user-progress", () => ({
  upsertUserProgress: vi.fn().mockResolvedValue(undefined),
}));

import { OnboardingFlow } from "../onboarding-flow";

const MOCK_COURSES = [
  { id: 1, title: "English", imageSrc: "/en.svg" },
  { id: 2, title: "Chinese", imageSrc: "/cn.svg" },
  { id: 3, title: "Spanish", imageSrc: "/es.svg" },
  { id: 4, title: "French", imageSrc: "/fr.svg" },
  { id: 5, title: "Italian", imageSrc: "/it.svg" },
  { id: 6, title: "Japanese", imageSrc: "/jp.svg" },
];

describe("OnboardingFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render language selection on step 1", () => {
    render(<OnboardingFlow courses={MOCK_COURSES} />);

    expect(screen.getByText("What do you want to learn?")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Chinese")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("French")).toBeInTheDocument();
    expect(screen.getByText("Italian")).toBeInTheDocument();
    expect(screen.getByText("Japanese")).toBeInTheDocument();
  });

  it("should show progress indicator with 3 steps", () => {
    const { container } = render(<OnboardingFlow courses={MOCK_COURSES} />);

    // 3 progress dots
    const dots = container.querySelectorAll(".rounded-full.transition-all");
    expect(dots).toHaveLength(3);
  });

  it("should disable continue button when no language is selected", () => {
    render(<OnboardingFlow courses={MOCK_COURSES} />);

    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).toBeDisabled();
  });

  it("should enable continue button when a language is selected", () => {
    render(<OnboardingFlow courses={MOCK_COURSES} />);

    fireEvent.click(screen.getByText("Spanish"));

    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).not.toBeDisabled();
  });

  it("should advance to step 2 on language select and continue", () => {
    render(<OnboardingFlow courses={MOCK_COURSES} />);

    fireEvent.click(screen.getByText("Spanish"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByText("Set your daily goal")).toBeInTheDocument();
    expect(screen.getByText("Casual")).toBeInTheDocument();
    expect(screen.getByText("Regular")).toBeInTheDocument();
    expect(screen.getByText("Intense")).toBeInTheDocument();
  });

  it("should disable start learning button when no goal is selected", () => {
    render(<OnboardingFlow courses={MOCK_COURSES} />);

    // Go to step 2
    fireEvent.click(screen.getByText("Spanish"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    const startButton = screen.getByRole("button", { name: /start learning/i });
    expect(startButton).toBeDisabled();
  });

  it("should allow navigating back from step 2 to step 1", () => {
    render(<OnboardingFlow courses={MOCK_COURSES} />);

    // Go to step 2
    fireEvent.click(screen.getByText("Spanish"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByText("Set your daily goal")).toBeInTheDocument();

    // Go back
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText("What do you want to learn?")).toBeInTheDocument();
  });

  it("should call upsertUserProgress when finishing onboarding", async () => {
    const { upsertUserProgress } = await import("@/actions/user-progress");

    render(<OnboardingFlow courses={MOCK_COURSES} />);

    // Step 1: select language
    fireEvent.click(screen.getByText("Spanish"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Step 2: select goal and finish
    fireEvent.click(screen.getByText("Casual"));
    fireEvent.click(screen.getByRole("button", { name: /start learning/i }));

    expect(upsertUserProgress).toHaveBeenCalledWith(3, 1);
  });
});
