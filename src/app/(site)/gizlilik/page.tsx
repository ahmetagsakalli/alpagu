import { PageHero } from "@/components/Shared";
import { getContent } from "@/lib/cms/content-store";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const c = await getContent(),
    s = c.pages.gizlilik.seo;
  return pageMetadata(
    s.title,
    s.description,
    "/gizlilik",
    s.image,
    c.organization.shortName,
  );
}
export default async function Privacy() {
  const {
    pages: { gizlilik: p },
    organization,
  } = await getContent();
  return (
    <>
      <PageHero
        eyebrow="Gizlilik ve Çerezler"
        title={p.title}
        description={p.description}
      />
      <article className="section container prose privacy-prose">
        {p.items.map((item, i) => (
          <section key={i}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </section>
        ))}
        <h2>İletişim</h2>
        <p>
          Gizlilikle ilgili sorularınız için{" "}
          <a href={`mailto:${organization.email}`}>{organization.email}</a>{" "}
          adresinden derneğimizle iletişime geçebilirsiniz.
        </p>
      </article>
    </>
  );
}
