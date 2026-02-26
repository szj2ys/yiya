import { describe, expect, it } from "vitest";

import {
  buildStreakReminderSubject,
  buildStreakReminderHtml,
} from "@/lib/email/templates/streak-reminder";

describe("streak reminder email template", () => {
  it("should render streak count in subject", () => {
    const subject = buildStreakReminderSubject(5);
    expect(subject).toBe("Your 5-day streak expires at midnight!");
  });

  it("should render streak count in email body", () => {
    const html = buildStreakReminderHtml({ streakCount: 5, userId: "user_123" });
    expect(html).toContain("Your 5-day streak expires at midnight!");
  });

  it("should include correct CTA link", () => {
    const html = buildStreakReminderHtml({ streakCount: 3, userId: "user_123" });
    expect(html).toContain("/learn");
    expect(html).toContain("Continue Learning");
  });

  it("should include unsubscribe link with userId", () => {
    const html = buildStreakReminderHtml({ streakCount: 3, userId: "user_123" });
    expect(html).toContain("/api/unsubscribe?userId=user_123");
    expect(html).toContain("Unsubscribe");
  });

  it("should render different streak counts correctly", () => {
    const html = buildStreakReminderHtml({ streakCount: 42, userId: "user_456" });
    expect(html).toContain("42-day streak");
  });
});
