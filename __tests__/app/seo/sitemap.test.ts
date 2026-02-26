import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { getAllLanguageSlugs } from "@/lib/seo/languages";
import { getAllTopicParams } from "@/lib/seo/topics";

describe("Sitemap", () => {
  it("should include all language and topic pages in sitemap", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);

    // Check static pages
    expect(urls).toContain("https://yiya.app");
    expect(urls).toContain("https://yiya.app/privacy");
    expect(urls).toContain("https://yiya.app/terms");

    // Check all language pages
    for (const slug of getAllLanguageSlugs()) {
      expect(urls).toContain(`https://yiya.app/learn/${slug}`);
    }

    // Check all topic pages
    for (const { lang, topic } of getAllTopicParams()) {
      expect(urls).toContain(`https://yiya.app/learn/${lang}/${topic}`);
    }
  });

  it("should have correct priority ordering", () => {
    const entries = sitemap();

    const homepage = entries.find((e) => e.url === "https://yiya.app");
    expect(homepage?.priority).toBe(1);

    const langPage = entries.find((e) =>
      e.url.includes("/learn/spanish"),
    );
    expect(langPage?.priority).toBe(0.9);

    const privacyPage = entries.find((e) =>
      e.url.includes("/privacy"),
    );
    expect(privacyPage?.priority).toBe(0.3);
  });

  it("should include correct number of entries", () => {
    const entries = sitemap();
    const languageCount = getAllLanguageSlugs().length;
    const topicCount = getAllTopicParams().length;
    // 3 static pages + language pages + topic pages
    expect(entries).toHaveLength(3 + languageCount + topicCount);
  });
});
