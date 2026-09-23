import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import { organization } from "@/lib/content";
import { siteUrl, indexable } from "@/lib/seo";
import "@fontsource-variable/manrope";
import "@fontsource-variable/oswald";
import "./globals.css";
import "./reference-theme.css";
import "./editorial.css";
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
  const schema = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: organization.name,
    alternateName: organization.shortName,
    url: siteUrl,
    logo: `${siteUrl}/images/logo.webp`,
    foundingDate: "2023-05-03",
    email: organization.email,
    telephone: organization.phone,
    areaServed: { "@type": "Country", name: "Türkiye" },
    sameAs: [organization.instagram],
    description:
      "Şehit Kütüphaneleri, eğitim desteği, sosyal ve kültürel çalışmalar yürüten sivil toplum kuruluşu.",
  };
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          İçeriğe geç
        </a>
        <div className="site-shell">
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </div>
        <FloatingActions />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
