import type { MetadataRoute } from "next";
import { indexable, siteUrl } from "@/lib/seo";
import { projects } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexable) return [];
  return [
    "",
    "/hakkimizda",
    "/projeler",
    "/bagis",
    "/gonullu-ol",
    "/iletisim",
    "/gizlilik",
    ...projects.map((p) => `/projeler/${p.slug}`),
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : path.startsWith("/projeler") ? 0.9 : 0.7,
  }));
}
