import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Component tests: verify the enhanced first-lesson CTA renders
 * with animation and encouraging copy.
 *
 * Since both the learn page and StartFirstLesson are server components,
 * we verify the source wiring.
 */

describe("StartFirstLesson CTA", () => {
  const pageSource = readFileSync(
    resolve(process.cwd(), "app/(main)/learn/page.tsx"),
    "utf-8",
  );

  it("should render enhanced first lesson CTA with animation", () => {
    // The CTA button should have pulse animation
    expect(pageSource).toContain("animate-pulse");
    // The card should have a data-testid for targeting
    expect(pageSource).toContain('data-testid="first-lesson-cta"');
  });

  it("should show encouraging copy about lesson duration", () => {
    expect(pageSource).toContain("Your first lesson takes about 2 minutes");
  });

  it("should support dark mode styling", () => {
    expect(pageSource).toContain("dark:bg-green-950");
    expect(pageSource).toContain("dark:border-green-800");
  });

  it("should use a visually distinct card with green styling", () => {
    // Card should have green border and background to stand out
    expect(pageSource).toContain("border-green-200");
    expect(pageSource).toContain("bg-green-50");
  });
});
