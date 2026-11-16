import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { getArticles } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://thauduc.de";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
    { url: `${base}/tin-nhanh`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/gioi-thieu`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...CATEGORIES.map((c) => ({
      url: `${base}/chuyen-muc/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];

  const articlePages: MetadataRoute.Sitemap = getArticles().map((a) => ({
    url: `${base}/bai-viet/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "weekly",
    priority: a.featured ? 0.9 : 0.7,
  }));

  return [...staticPages, ...articlePages];
}
