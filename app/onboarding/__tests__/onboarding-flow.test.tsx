import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";

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

  afterEach(() => {
    vi.useRealTimers();
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

  it("should show progress indicator with 4 steps", () => {
    const { container } = render(<OnboardingFlow courses={MOCK_COURSES} />);

    // 4 progress dots
    const dots = container.querySelectorAll(".rounded-full.transition-all");
    expect(dots).toHaveLength(4);
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

  it("should show sample challenge after language selection", () => {
    render(<OnboardingFlow courses={MOCK_COURSES} />);

    fireEvent.click(screen.getByText("Spanish"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByText("Try it")).toBeInTheDocument();
    expect(screen.getByTestId("try-it-question")).toHaveTextContent(
      "Which one means 'hello'?",
    );
    expect(screen.getByRole("button", { name: "Hola" })).toBeInTheDocument();
  });

  it("should highlight correct answer on correct selection", async () => {
    vi.useFakeTimers();

    render(<OnboardingFlow courses={MOCK_COURSES} />);

    fireEvent.click(screen.getByText("Spanish"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    const holaButton = screen.getByRole("button", { name: "Hola" });
    fireEvent.click(holaButton);

    expect(holaButton).toHaveClass("border-green-600");
    expect(screen.getByText("Nice!")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText("Set your daily goal")).toBeInTheDocument();
  });

  it("should show correct answer on wrong selection", async () => {
    vi.useFakeTimers();

    render(<OnboardingFlow courses={MOCK_COURSES} />);

    fireEvent.click(screen.getByText("Spanish"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    const wrongButton = screen.getByRole("button", { name: "Gracias" });
    fireEvent.click(wrongButton);

    expect(wrongButton).toHaveClass("border-rose-400");
    expect(screen.getByRole("button", { name: "Hola" })).toHaveClass(
      "border-green-600",
    );
    expect(screen.getByText("Almost!")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText("Set your daily goal")).toBeInTheDocument();
  });

  it("should allow skipping", () => {
    render(<OnboardingFlow courses={MOCK_COURSES} />);

    fireEvent.click(screen.getByText("Spanish"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    fireEvent.click(screen.getByRole("button", { name: /skip/i }));

    expect(screen.getByText("Set your daily goal")).toBeInTheDocument();
  });

  it("should apply correct animation class on selection", () => {
    render(<OnboardingFlow courses={MOCK_COURSES} />);

    fireEvent.click(screen.getByText("Spanish"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    const wrongButton = screen.getByRole("button", { name: "Gracias" });
    fireEvent.click(wrongButton);

    expect(wrongButton.className).toContain("animate-[ob-shake_300ms_ease-out]");
  });

  it("should disable start learning button when no goal is selected", () => {
    render(<OnboardingFlow courses={MOCK_COURSES} />);

    // Go to goal step
    fireEvent.click(screen.getByText("Spanish"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /skip/i }));

    const startButton = screen.getByRole("button", { name: /start learning/i });
    expect(startButton).toBeDisabled();
  });

  it("should allow navigating back from goal step to step 1", () => {
    render(<OnboardingFlow courses={MOCK_COURSES} />);

    // Go to goal step
    fireEvent.click(screen.getByText("Spanish"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /skip/i }));

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

    // Step 2: skip sample challenge
    fireEvent.click(screen.getByRole("button", { name: /skip/i }));

    // Step 3: select goal and finish
    fireEvent.click(screen.getByText("Casual"));
    fireEvent.click(screen.getByRole("button", { name: /start learning/i }));

    await waitFor(() => {
      expect(upsertUserProgress).toHaveBeenCalledWith(3, 1, expect.any(Object), expect.any(String));
    });
  });

  it("should redirect to first lesson ID after new user onboarding", async () => {
    // upsertUserProgress is a server action that handles the redirect.
    // For new users it redirects to /lesson/[firstLessonId].
    // Here we verify the onboarding flow calls the action with correct args
    // so the server-side redirect is triggered.
    const { upsertUserProgress } = await import("@/actions/user-progress");

    render(<OnboardingFlow courses={MOCK_COURSES} />);

    // Complete full onboarding flow
    fireEvent.click(screen.getByText("English"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /skip/i }));
    fireEvent.click(screen.getByText("Regular"));
    fireEvent.click(screen.getByRole("button", { name: /start learning/i }));

    await waitFor(() => {
      // English course id=1, Regular goal=3
      expect(upsertUserProgress).toHaveBeenCalledWith(1, 3, expect.any(Object), expect.any(String));
    });

    // Step 4 loading indicator shown while server action processes
    expect(screen.getByText("Setting up your course...")).toBeInTheDocument();
  });
});
