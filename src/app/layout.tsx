import type { Metadata, Viewport } from "next";
import { siteUrl, indexable } from "@/lib/seo";
import "@fontsource-variable/manrope";
import "@fontsource-variable/oswald";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Alpagu Derneği | Bir Kitap, Bir Umut, Bir Gelecek",
    template: "%s | Alpagu Derneği",
  },
  description:
    "Alpagu Eğitim Araştırma ve Yardımlaşma Derneği. Şehit Kütüphaneleri, kitap bağışları ve eğitim destekleriyle çocukların geleceğine birlikte sahip çıkıyoruz.",
  applicationName: "Alpagu Derneği",
  robots: { index: indexable, follow: indexable },
  icons: { icon: "/icon.png", apple: "/icon.png" },
  category: "nonprofit",
  referrer: "strict-origin-when-cross-origin",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2bb9b3",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
