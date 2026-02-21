import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("QuestsPage", () => {
  const pageSource = readFileSync(
    resolve(process.cwd(), "app/(main)/quests/page.tsx"),
    "utf-8",
  );

  it("should not render Promo on quests page", () => {
    expect(pageSource).not.toContain("<Promo");
    expect(pageSource).not.toContain("@/components/promo");
  });

  it("should keep StickyWrapper sidebar with UserProgress", () => {
    expect(pageSource).toContain("<StickyWrapper");
    expect(pageSource).toContain("<UserProgress");
  });
});
