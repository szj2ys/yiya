import { describe, it, expect } from "vitest";
import { userProgress } from "@/db/schema";

describe("userProgress schema — emailReminders column", () => {
  it("should have emailReminders boolean column with default true", () => {
    const columns = userProgress as Record<string, any>;
    const emailRemindersCol = columns.emailReminders;

    expect(emailRemindersCol).toBeDefined();
    expect(emailRemindersCol.name).toBe("email_reminders");
    expect(emailRemindersCol.hasDefault).toBe(true);
    expect(emailRemindersCol.default).toBe(true);
    expect(emailRemindersCol.notNull).toBe(true);
  });
});
