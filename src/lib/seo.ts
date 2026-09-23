import type { Metadata } from "next";
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");
export const indexable =
  process.env.SITE_INDEXABLE === "true" && /^https:\/\//.test(siteUrl);
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image = "/images/social.webp",
  siteName = "Alpagu Derneği",
): Metadata {
  return {
    title: { absolute: `${title} | ${siteName}` },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: path,
      type: "website",
      locale: "tr_TR",
      siteName: siteName,
      images: [
        {
          url: image,
          alt: "Alpagu Derneği — Bir kitap, bir umut, bir gelecek",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
