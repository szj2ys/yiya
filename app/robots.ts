import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yiya.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/lesson/", "/practice/", "/onboarding/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
