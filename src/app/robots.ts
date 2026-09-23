import type { MetadataRoute } from "next";
import { indexable, siteUrl } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return indexable
    ? {
        rules: {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin", "/api/admin/"],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
