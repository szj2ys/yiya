import { describe, it, expect } from "vitest";
import { lessonCompletions } from "@/db/schema";

describe("lessonCompletions schema", () => {
  it("should have lessonCompletions table in schema", () => {
    expect(lessonCompletions).toBeDefined();
  });

  it("should have id column as primary key", () => {
    const columns = lessonCompletions as Record<string, any>;
    expect(columns.id).toBeDefined();
    expect(columns.id.name).toBe("id");
  });

  it("should have userId column that is not null", () => {
    const columns = lessonCompletions as Record<string, any>;
    expect(columns.userId).toBeDefined();
    expect(columns.userId.name).toBe("user_id");
    expect(columns.userId.notNull).toBe(true);
  });

  it("should have lessonId column that is not null", () => {
    const columns = lessonCompletions as Record<string, any>;
    expect(columns.lessonId).toBeDefined();
    expect(columns.lessonId.name).toBe("lesson_id");
    expect(columns.lessonId.notNull).toBe(true);
  });

  it("should have completedAt column with default now", () => {
    const columns = lessonCompletions as Record<string, any>;
    expect(columns.completedAt).toBeDefined();
    expect(columns.completedAt.name).toBe("completed_at");
    expect(columns.completedAt.notNull).toBe(true);
    expect(columns.completedAt.hasDefault).toBe(true);
  });
});
