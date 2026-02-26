import { describe, it, expect } from "vitest";
import {
  LANGUAGE_PAGES,
  getLanguageBySlug,
  getAllLanguageSlugs,
} from "@/lib/seo/languages";

describe("lib/seo/languages", () => {
  it("should have 6 language pages", () => {
    expect(LANGUAGE_PAGES).toHaveLength(6);
  });

  it("should include all expected languages", () => {
    const slugs = getAllLanguageSlugs();
    expect(slugs).toContain("spanish");
    expect(slugs).toContain("chinese");
    expect(slugs).toContain("french");
    expect(slugs).toContain("italian");
    expect(slugs).toContain("japanese");
    expect(slugs).toContain("english");
  });

  it("should return language by slug when it exists", () => {
    const spanish = getLanguageBySlug("spanish");
    expect(spanish).toBeDefined();
    expect(spanish!.languageName).toBe("Spanish");
    expect(spanish!.flagCode).toBe("es");
  });

  it("should return undefined for unknown slug", () => {
    expect(getLanguageBySlug("klingon")).toBeUndefined();
  });

  it("should have required fields for each language", () => {
    for (const lang of LANGUAGE_PAGES) {
      expect(lang.slug).toBeTruthy();
      expect(lang.languageName).toBeTruthy();
      expect(lang.nativeName).toBeTruthy();
      expect(lang.flagCode).toBeTruthy();
      expect(lang.heroTitle).toBeTruthy();
      expect(lang.heroHighlight).toBeTruthy();
      expect(lang.heroDescription).toBeTruthy();
      expect(lang.metaTitle).toBeTruthy();
      expect(lang.metaDescription).toBeTruthy();
      expect(lang.keywords.length).toBeGreaterThan(0);
      expect(lang.samplePhrases.length).toBeGreaterThanOrEqual(3);
      expect(lang.features.length).toBeGreaterThanOrEqual(3);
      expect(lang.faqs.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("should generate static params for all 6 languages", () => {
    const slugs = getAllLanguageSlugs();
    expect(slugs).toHaveLength(6);
    for (const slug of slugs) {
      expect(typeof slug).toBe("string");
      expect(slug.length).toBeGreaterThan(0);
    }
  });
});
