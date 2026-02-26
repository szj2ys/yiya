import type { MetadataRoute } from "next";
import { getAllLanguageSlugs } from "@/lib/seo/languages";
import { getAllTopicParams } from "@/lib/seo/topics";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yiya.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const languagePages: MetadataRoute.Sitemap = getAllLanguageSlugs().map(
    (slug) => ({
      url: `${BASE_URL}/learn/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    }),
  );

  const topicPages: MetadataRoute.Sitemap = getAllTopicParams().map(
    ({ lang, topic }) => ({
      url: `${BASE_URL}/learn/${lang}/${topic}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...languagePages,
    ...topicPages,
  ];
}
