import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock updateUserSettings
const mockUpdate = vi.fn().mockResolvedValue(undefined);
vi.mock("@/actions/user-settings", () => ({
  updateUserSettings: (...args: any[]) => mockUpdate(...args),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { SettingsForm } from "@/app/(main)/settings/settings-form";
import { toast } from "sonner";

const mockCourses = [
  { id: 1, title: "Spanish", imageSrc: "/es.svg" },
  { id: 2, title: "French", imageSrc: "/fr.svg" },
  { id: 3, title: "Japanese", imageSrc: "/jp.svg" },
];

describe("SettingsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render current daily goal and language selection", () => {
    render(
      <SettingsForm
        courses={mockCourses}
        currentCourseId={1}
        currentDailyGoal={3}
      />,
    );

    // Daily goal section
    expect(screen.getByText("Daily goal")).toBeInTheDocument();
    expect(screen.getByText("Casual")).toBeInTheDocument();
    expect(screen.getByText("Regular")).toBeInTheDocument();
    expect(screen.getByText("Intense")).toBeInTheDocument();

    // Language section
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("French")).toBeInTheDocument();
    expect(screen.getByText("Japanese")).toBeInTheDocument();

    // Save button should be disabled when no changes
    const saveButton = screen.getByText("Save changes");
    expect(saveButton).toBeDisabled();
  });

  it("should enable Save button when daily goal changes", () => {
    render(
      <SettingsForm
        courses={mockCourses}
        currentCourseId={1}
        currentDailyGoal={3}
      />,
    );

    // Click Casual (changes from Regular=3 to Casual=1)
    const casualButton = screen.getByText("Casual").closest("button")!;
    fireEvent.click(casualButton);

    const saveButton = screen.getByText("Save changes");
    expect(saveButton).not.toBeDisabled();
  });

  it("should enable Save button when language changes", () => {
    render(
      <SettingsForm
        courses={mockCourses}
        currentCourseId={1}
        currentDailyGoal={3}
      />,
    );

    // Click French (changes from Spanish=1 to French=2)
    const frenchButton = screen.getByText("French").closest("button")!;
    fireEvent.click(frenchButton);

    const saveButton = screen.getByText("Save changes");
    expect(saveButton).not.toBeDisabled();
  });

  it("should call updateUserSettings when saving changes", async () => {
    render(
      <SettingsForm
        courses={mockCourses}
        currentCourseId={1}
        currentDailyGoal={3}
      />,
    );

    // Change daily goal to Casual (1)
    const casualButton = screen.getByText("Casual").closest("button")!;
    fireEvent.click(casualButton);

    // Click Save
    const saveButton = screen.getByText("Save changes");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(1, 1);
    });
  });

  it("should show success toast after saving", async () => {
    render(
      <SettingsForm
        courses={mockCourses}
        currentCourseId={1}
        currentDailyGoal={3}
      />,
    );

    // Change language to French
    const frenchButton = screen.getByText("French").closest("button")!;
    fireEvent.click(frenchButton);

    // Click Save
    const saveButton = screen.getByText("Save changes");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Settings saved!");
    });
  });

  it("should show error toast when save fails", async () => {
    mockUpdate.mockRejectedValueOnce(new Error("fail"));

    render(
      <SettingsForm
        courses={mockCourses}
        currentCourseId={1}
        currentDailyGoal={3}
      />,
    );

    // Change daily goal
    const intenseButton = screen.getByText("Intense").closest("button")!;
    fireEvent.click(intenseButton);

    // Click Save
    const saveButton = screen.getByText("Save changes");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
  });

  it("should disable Save button when selection matches current values", () => {
    render(
      <SettingsForm
        courses={mockCourses}
        currentCourseId={1}
        currentDailyGoal={3}
      />,
    );

    // Change to Casual then back to Regular
    const casualButton = screen.getByText("Casual").closest("button")!;
    fireEvent.click(casualButton);

    const regularButton = screen.getByText("Regular").closest("button")!;
    fireEvent.click(regularButton);

    const saveButton = screen.getByText("Save changes");
    expect(saveButton).toBeDisabled();
  });
});
