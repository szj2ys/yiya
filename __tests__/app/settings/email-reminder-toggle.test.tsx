import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EmailReminderToggle } from "@/app/(main)/settings/email-reminder-toggle";

vi.mock("@/actions/email-preferences", () => ({
  updateEmailReminders: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("EmailReminderToggle", () => {
  it("should render with On selected when defaultEnabled is true", () => {
    render(<EmailReminderToggle defaultEnabled={true} />);

    expect(screen.getByText("Streak Reminders")).toBeDefined();
    expect(screen.getByText("On")).toBeDefined();
    expect(screen.getByText("Off")).toBeDefined();
  });

  it("should render with Off selected when defaultEnabled is false", () => {
    render(<EmailReminderToggle defaultEnabled={false} />);

    const offButton = screen.getByText("Off");
    // The Off button should have the selected style (green border)
    expect(offButton.className).toContain("border-green-600");
  });

  it("should toggle when clicking Off button", async () => {
    const user = userEvent.setup();
    render(<EmailReminderToggle defaultEnabled={true} />);

    const offButton = screen.getByText("Off");
    await user.click(offButton);

    // After clicking, Off should be selected
    expect(offButton.className).toContain("border-green-600");
  });

  it("should toggle when clicking On button", async () => {
    const user = userEvent.setup();
    render(<EmailReminderToggle defaultEnabled={false} />);

    const onButton = screen.getByText("On");
    await user.click(onButton);

    // After clicking, On should be selected
    expect(onButton.className).toContain("border-green-600");
  });
});
