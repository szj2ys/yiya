import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Root layout manifest link", () => {
  const layoutPath = path.resolve(process.cwd(), "app/layout.tsx");

  it("should include manifest link in layout", () => {
    const content = fs.readFileSync(layoutPath, "utf-8");
    expect(content).toContain('rel="manifest"');
    expect(content).toContain('href="/manifest.json"');
  });

  it("should include theme-color meta tag", () => {
    const content = fs.readFileSync(layoutPath, "utf-8");
    expect(content).toContain('name="theme-color"');
    expect(content).toContain("#22c55e");
  });

  it("should include apple-touch-icon link", () => {
    const content = fs.readFileSync(layoutPath, "utf-8");
    expect(content).toContain('rel="apple-touch-icon"');
  });
});
