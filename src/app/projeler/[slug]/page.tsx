import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { projects } from "@/lib/content";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { JoinBanner } from "@/components/Shared";
export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  if (!p) return {};
  return pageMetadata(p.title, p.summary, `/projeler/${slug}`);
}
export default async function Project({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  if (!p) notFound();
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Çalışmalarımız",
        item: `${siteUrl}/projeler`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: p.title,
        item: `${siteUrl}/projeler/${p.slug}`,
      },
    ],
  };
  return (
    <>
      <section className="project-detail-hero">
        <Image
          src={`/images/${p.image}`}
          alt={p.alt}
          fill
          sizes="100vw"
          preload
        />
        <div className="project-detail-shade" />
        <div className="container">
          <div className="breadcrumbs">
            <Link href="/">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/projeler">Çalışmalarımız</Link>
          </div>
          <h1>{p.title}</h1>
          <p>{p.lead}</p>
        </div>
      </section>
      <section className="section container detail-grid">
        <div className="prose">
          <h2>
            Birlikte, <em>geleceğe.</em>
          </h2>
          {p.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <Link href="/projeler" className="text-link">
            Tüm çalışmalarımız <ArrowRight size={18} />
          </Link>
        </div>
        <aside className="project-aside">
          <strong className="impact-number">{p.impact}</strong>
          <p>{p.impactLabel}</p>
          <hr />
          <h3>Siz de katkı sunabilirsiniz</h3>
          <ul>
            {p.needs.map((n) => (
              <li key={n}>
                <Check size={17} />
                {n}
              </li>
            ))}
          </ul>
          <Link href="/bagis" className="button">
            Destek Ol <ArrowRight size={18} />
          </Link>
          <Link href="/iletisim" className="aside-contact">
            Ayni destek için bize ulaşın
          </Link>
        </aside>
      </section>
      <JoinBanner />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
