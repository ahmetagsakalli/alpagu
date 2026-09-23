import type { Metadata } from "next";
import { organization } from "./content";
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");
export const indexable =
  process.env.SITE_INDEXABLE === "true" && /^https:\/\//.test(siteUrl);
export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title:
      path === "/"
        ? { absolute: `${title} | ${organization.shortName}` }
        : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${organization.shortName}`,
      description,
      url: path,
      type: "website",
      locale: "tr_TR",
      siteName: organization.shortName,
      images: [
        {
          url: "/images/social.webp",
          width: 1200,
          height: 630,
          alt: "Alpagu Derneği — Bir kitap, bir umut, bir gelecek",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/social.webp"],
    },
  };
}
