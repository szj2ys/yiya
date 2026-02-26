import { describe, it, expect } from "vitest";
import {
  TOPIC_PAGES,
  getTopicBySlug,
  getTopicsForLanguage,
  getAllTopicParams,
} from "@/lib/seo/topics";

describe("lib/seo/topics", () => {
  it("should have at least 8 topic pages", () => {
    expect(TOPIC_PAGES.length).toBeGreaterThanOrEqual(8);
  });

  it("should generate static params for all topic pages", () => {
    const params = getAllTopicParams();
    expect(params.length).toBe(TOPIC_PAGES.length);
    for (const param of params) {
      expect(param.lang).toBeTruthy();
      expect(param.topic).toBeTruthy();
    }
  });

  it("should return topic by slug when it exists", () => {
    const topic = getTopicBySlug("japanese", "hiragana");
    expect(topic).toBeDefined();
    expect(topic!.title).toContain("Hiragana");
    expect(topic!.languageName).toBe("Japanese");
  });

  it("should return undefined for unknown topic slug", () => {
    expect(getTopicBySlug("spanish", "nonexistent")).toBeUndefined();
  });

  it("should return undefined for unknown language slug", () => {
    expect(getTopicBySlug("klingon", "hiragana")).toBeUndefined();
  });

  it("should filter topics by language", () => {
    const japaneseTopics = getTopicsForLanguage("japanese");
    expect(japaneseTopics.length).toBeGreaterThan(0);
    for (const topic of japaneseTopics) {
      expect(topic.languageSlug).toBe("japanese");
    }
  });

  it("should return empty array for language with no topics", () => {
    const topics = getTopicsForLanguage("nonexistent");
    expect(topics).toHaveLength(0);
  });

  it("should have required fields for each topic", () => {
    for (const topic of TOPIC_PAGES) {
      expect(topic.slug).toBeTruthy();
      expect(topic.languageSlug).toBeTruthy();
      expect(topic.languageName).toBeTruthy();
      expect(topic.title).toBeTruthy();
      expect(topic.heroTitle).toBeTruthy();
      expect(topic.heroDescription).toBeTruthy();
      expect(topic.metaTitle).toBeTruthy();
      expect(topic.metaDescription).toBeTruthy();
      expect(topic.keywords.length).toBeGreaterThan(0);
      expect(topic.content.length).toBeGreaterThanOrEqual(2);
      expect(topic.faqs.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("should have topics for multiple languages", () => {
    const languages = new Set(TOPIC_PAGES.map((t) => t.languageSlug));
    expect(languages.size).toBeGreaterThanOrEqual(4);
  });
});
