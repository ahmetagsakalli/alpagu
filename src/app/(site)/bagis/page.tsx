import Link from "next/link";
import { BookOpen, HeartHandshake, ArrowRight } from "lucide-react";
import Donation from "@/components/Donation";
import { PageHero } from "@/components/Shared";
import { getContent } from "@/lib/cms/content-store";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const c = await getContent(),
    s = c.pages.bagis.seo;
  return pageMetadata(
    s.title,
    s.description,
    "/bagis",
    s.image,
    c.organization.shortName,
  );
}
export default async function Donate() {
  const {
    pages: { bagis: p },
    organization,
  } = await getContent();
  return (
    <>
      <PageHero
        eyebrow="Bağış ve Destek"
        title={p.title}
        description={p.description}
      />
      <section className="section container donation-layout">
        <div>
          <h2>
            {p.heading}
            <br />
            <em>{p.emphasis}</em>
          </h2>
          <p className="lead">{p.lead}</p>
          {p.items.map((item, i) => (
            <div className="support-option" key={i}>
              {i % 2 === 0 ? <BookOpen /> : <HeartHandshake />}
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link
                  className="text-link"
                  href={i % 2 === 0 ? "/iletisim" : "/gonullu-ol"}
                >
                  {i % 2 === 0 ? "Bize ulaşın" : "Gönüllü olun"}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
        <Donation organization={organization} note={p.note} />
      </section>
    </>
  );
}
