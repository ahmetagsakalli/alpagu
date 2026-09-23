import Link from "next/link";
import ProjectGallery from "@/components/ProjectGallery";
import {
  ArrowUpRight,
  BookOpen,
  Users,
  LibraryBig,
  HeartHandshake,
} from "lucide-react";
import { projects } from "@/lib/content";
export function Stats() {
  return (
    <section className="impact-stats container" aria-label="Rakamlarla Alpagu">
      {[
        { icon: LibraryBig, n: "40", s: "Şehit Kütüphanesi" },
        { icon: BookOpen, n: "22.000+", s: "bağışlanan kitap" },
        { icon: Users, n: "10.000+", s: "ulaşılan çocuk" },
        { icon: HeartHandshake, n: "2016", s: "ilk kütüphanemizin açılışı" },
      ].map((item) => (
        <div className="impact-stat" key={item.n}>
          <item.icon size={43} strokeWidth={1.1} aria-hidden="true" />
          <strong>{item.n}</strong>
          <span>{item.s}</span>
        </div>
      ))}
    </section>
  );
}
export function ProjectCards() {
  return (
    <ProjectGallery
      projects={projects.map(({ slug, title, image, alt, summary }) => ({
        slug,
        title,
        image,
        alt,
        summary,
      }))}
    />
  );
}
export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Ana Sayfa</Link>
          <span>/</span>
          <span>{eyebrow}</span>
        </div>
        <h1>{title}</h1>
        <p className="page-lead">{description}</p>
        <BookOpen
          className="page-hero-icon"
          size={210}
          strokeWidth={0.6}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
export function JoinBanner() {
  return (
    <section className="participate-section">
      <div className="container">
        <div className="participate-heading">
          <h2>Nasıl katkı sağlayabilirsiniz?</h2>
        </div>
        <div className="participate-grid">
          <Link className="participate-card participate-donation" href="/bagis">
            <div>
              <h3>Bağış yapın</h3>
              <p>
                Kitap, kırtasiye ve maddi destek için bağış bilgilerine ulaşın.
              </p>
            </div>
            <span className="circle-arrow" aria-hidden="true">
              <ArrowUpRight size={27} />
            </span>
          </Link>
          <Link
            className="participate-card participate-volunteer"
            href="/gonullu-ol"
          >
            <div>
              <h3>Gönüllü olun</h3>
              <p>
                Kütüphane hazırlıklarına ve etkinliklerimize katılmak için
                başvuru formunu doldurun.
              </p>
            </div>
            <span className="circle-arrow" aria-hidden="true">
              <ArrowUpRight size={27} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
