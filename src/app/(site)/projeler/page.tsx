import { PageHero, ProjectCards, JoinBanner } from "@/components/Shared";
import { getContent } from "@/lib/cms/content-store";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const c = await getContent(),
    s = c.pages.projeler.seo;
  return pageMetadata(
    s.title,
    s.description,
    "/projeler",
    s.image,
    c.organization.shortName,
  );
}
export default async function Projects() {
  const {
    pages: { projeler: p },
  } = await getContent();
  return (
    <>
      <PageHero
        eyebrow="Çalışmalarımız"
        title={p.title}
        description={p.description}
      />
      <section className="section container">
        <ProjectCards all />
      </section>
      <JoinBanner />
    </>
  );
}
