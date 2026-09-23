import { PageHero, ProjectCards, JoinBanner } from "@/components/Shared";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Çalışmalarımız",
  "Şehit Kütüphaneleri, eğitim materyali desteği ve çocuklar için sosyal ve kültürel çalışmalar. Alpagu Derneğinin projelerini keşfedin.",
  "/projeler",
);
export default function Projects() {
  return (
    <>
      <PageHero
        eyebrow="Çalışmalarımız"
        title="Her adımımız, güzel bir yarın için."
        description="Kütüphanelerden okul sıralarına, birlikte öğrenilen anlardan yeni hayallere uzanan bir dayanışma."
      />
      <section className="section container">
        <ProjectCards />
      </section>
      <JoinBanner />
    </>
  );
}
