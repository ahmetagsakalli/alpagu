import { ArrowUpRight, BookOpen, Users, HeartHandshake } from "lucide-react";
import Image from "next/image";
import { getContent } from "@/lib/cms/content-store";
import { PageHero } from "@/components/Shared";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const c = await getContent(),
    s = c.pages["gonullu-ol"].seo;
  return pageMetadata(
    s.title,
    s.description,
    "/gonullu-ol",
    s.image,
    c.organization.shortName,
  );
}
export default async function Volunteer() {
  const {
    pages: { "gonullu-ol": p },
    organization,
  } = await getContent();
  const icons = [BookOpen, HeartHandshake, Users];
  return (
    <>
      <PageHero
        eyebrow="Gönüllü Ol"
        title={p.title}
        description={p.description}
      />
      <section className="section container editorial-grid">
        <div className="volunteer-image">
          <Image
            src={p.image}
            alt={p.alt}
            fill
            sizes="(max-width:800px) 90vw, 45vw"
          />
        </div>
        <div className="volunteer-copy">
          <h2>
            {p.heading}
            <br />
            <em>{p.emphasis}</em>
          </h2>
          <p>{p.lead}</p>
          <ul className="volunteer-list">
            {p.items.map((item, i) => {
              const Icon = icons[i % 3];
              return (
                <li key={i}>
                  <Icon />
                  {item.title}
                </li>
              );
            })}
          </ul>
          <a
            href={organization.volunteerForm}
            className="button"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gönüllü Formunu Aç <ArrowUpRight size={19} />
          </a>
          <p className="form-note">{p.note}</p>
        </div>
      </section>
    </>
  );
}
