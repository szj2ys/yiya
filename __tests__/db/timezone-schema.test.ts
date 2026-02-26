import { describe, it, expect } from "vitest";
import { userProgress } from "@/db/schema";

describe("userProgress schema — timezone column", () => {
  it("should have timezone text column that is nullable", () => {
    const columns = userProgress as Record<string, any>;
    const timezoneCol = columns.timezone;

    expect(timezoneCol).toBeDefined();
    expect(timezoneCol.name).toBe("timezone");
    expect(timezoneCol.notNull).toBe(false);
  });
});
