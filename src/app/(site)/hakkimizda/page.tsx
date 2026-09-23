import Image from "next/image";
import { PageHero, Stats, JoinBanner } from "@/components/Shared";
import { getContent } from "@/lib/cms/content-store";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const c = await getContent(),
    s = c.pages.hakkimizda.seo;
  return pageMetadata(
    s.title,
    s.description,
    "/hakkimizda",
    s.image,
    c.organization.shortName,
  );
}
export default async function About() {
  const {
    pages: { hakkimizda: p },
  } = await getContent();
  return (
    <>
      <PageHero
        eyebrow="Hakkımızda"
        title={p.title}
        description={p.description}
      />
      <section className="section container editorial-grid">
        <div>
          <h2>
            {p.heading}
            <br />
            <em>{p.emphasis}</em>
          </h2>
          <div className="editorial-image">
            <Image
              src={p.image}
              alt={p.alt}
              fill
              sizes="(max-width:800px) 90vw, 40vw"
            />
          </div>
        </div>
        <div className="prose">
          <p className="lead">{p.lead}</p>
          {p.paragraphs.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      </section>
      <Stats />
      <section className="section container">
        <h2>
          {p.extraHeading}
          <br />
          <em>{p.extraEmphasis}</em>
        </h2>
        <div className="timeline">
          {p.items.map((t, i) => (
            <div key={i}>
              <span>{t.year}</span>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </div>
          ))}
        </div>
      </section>
      <JoinBanner />
    </>
  );
}
