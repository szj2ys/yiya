import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("manifest.json", () => {
  const manifestPath = path.resolve(process.cwd(), "public/manifest.json");

  it("should exist in public directory", () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
  });

  it("should be valid JSON with required PWA fields", () => {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);

    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBe("Yiya");
    expect(manifest.start_url).toBe("/learn");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#22c55e");
    expect(manifest.background_color).toBeTruthy();
    expect(manifest.scope).toBe("/");
  });

  it("should include icons in 192px and 512px sizes", () => {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);

    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });
});
