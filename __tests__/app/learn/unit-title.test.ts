import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Unit component – lesson title prop", () => {
  const unitSource = readFileSync(
    resolve(process.cwd(), "app/(main)/learn/unit.tsx"),
    "utf-8",
  );

  it("should pass lesson title to LessonButton", () => {
    expect(unitSource).toContain("title={lesson.title}");
  });
});
