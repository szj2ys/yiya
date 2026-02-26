import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function isLocalHourInWindow(timezone: string, targetHour: number): boolean {
  try {
    const localHour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false,
      }).format(new Date()),
    );
    return localHour === targetHour;
  } catch {
    return false;
  }
}

describe("isLocalHourInWindow", () => {
  it("should return true when timezone local hour matches target", () => {
    const now = new Date();
    const currentUTCHour = now.getUTCHours();
    const result = isLocalHourInWindow("UTC", currentUTCHour);
    expect(result).toBe(true);
  });

  it("should return false when timezone local hour does not match target", () => {
    const now = new Date();
    const currentUTCHour = now.getUTCHours();
    const wrongHour = (currentUTCHour + 12) % 24;
    const result = isLocalHourInWindow("UTC", wrongHour);
    expect(result).toBe(false);
  });

  it("should return false for invalid timezone", () => {
    const result = isLocalHourInWindow("Invalid/Timezone", 19);
    expect(result).toBe(false);
  });

  it("should handle common IANA timezones without throwing", () => {
    const timezones = ["America/New_York", "Europe/London", "Asia/Tokyo", "Pacific/Auckland"];
    for (const tz of timezones) {
      expect(() => isLocalHourInWindow(tz, 19)).not.toThrow();
    }
  });
});
