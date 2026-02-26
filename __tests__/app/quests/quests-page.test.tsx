import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("QuestsPage", () => {
  const pageSource = readFileSync(
    resolve(process.cwd(), "app/(main)/quests/page.tsx"),
    "utf-8",
  );

  it("should redirect to /learn", () => {
    expect(pageSource).toContain('redirect("/learn")');
  });
});
