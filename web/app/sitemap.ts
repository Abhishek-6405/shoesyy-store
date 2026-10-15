import type { MetadataRoute } from "next";
import { getActiveProductSlugs } from "@/lib/catalog";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getActiveProductSlugs();
  return [
    ...["/", "/shop"].map((path) => ({
      url: new URL(path, siteUrl).href,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...slugs.map((slug) => ({
      url: new URL(`/products/${encodeURIComponent(slug)}`, siteUrl).href,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
