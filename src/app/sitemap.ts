import type { MetadataRoute } from "next";
import { indexable, siteUrl } from "@/lib/seo";
import { getContent } from "@/lib/cms/content-store";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getContent();
  if (!indexable) return [];
  return [
    "",
    "/hakkimizda",
    "/projeler",
    "/bagis",
    "/gonullu-ol",
    "/iletisim",
    "/gizlilik",
    ...projects.filter((p) => p.published).map((p) => `/projeler/${p.slug}`),
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : path.startsWith("/projeler") ? 0.9 : 0.7,
  }));
}
