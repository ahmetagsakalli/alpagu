import Link from "next/link";
import Image from "next/image";
import ProjectGallery from "@/components/ProjectGallery";
import {
  ArrowUpRight,
  BookOpen,
  Users,
  LibraryBig,
  HeartHandshake,
} from "lucide-react";
import { getContent } from "@/lib/cms/content-store";
export async function Stats() {
  const { stats } = await getContent();
  const icons = [LibraryBig, BookOpen, Users, HeartHandshake];
  return (
    <section className="impact-stats container" aria-label="Rakamlarla Alpagu">
      {stats.map((item, i) => {
        const Icon = icons[i];
        return (
          <div className="impact-stat" key={i}>
            <Icon size={43} strokeWidth={1.1} aria-hidden="true" />
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        );
      })}
    </section>
  );
}
export async function ProjectCards({ all = false }: { all?: boolean }) {
  const { projects } = await getContent();
  const selected = projects.filter((p) => p.published && (all || p.featured));
  if (!all)
    return (
      <ProjectGallery
        projects={selected
          .slice(0, 3)
          .map(({ slug, title, image, alt, summary }) => ({
            slug,
            title,
            image,
            alt,
            summary,
          }))}
      />
    );
  return (
    <div className="all-projects-grid">
      {selected.map((p) => (
        <Link
          className="all-project-card"
          href={`/projeler/${p.slug}`}
          key={p.id}
        >
          <div>
            <Image
              src={p.image}
              alt={p.alt}
              fill
              sizes="(max-width:700px) 90vw, 33vw"
            />
          </div>
          <h2>{p.title}</h2>
          <p>{p.summary}</p>
          <span className="text-link">
            Çalışmayı inceleyin <ArrowUpRight size={18} />
          </span>
        </Link>
      ))}
    </div>
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
export async function JoinBanner() {
  const { join } = await getContent();
  return (
    <section className="participate-section">
      <div className="container">
        <div className="participate-heading">
          <h2>{join.title}</h2>
        </div>
        <div className="participate-grid">
          {[
            {
              href: "/bagis",
              className: "participate-donation",
              title: join.donationTitle,
              text: join.donationText,
            },
            {
              href: "/gonullu-ol",
              className: "participate-volunteer",
              title: join.volunteerTitle,
              text: join.volunteerText,
            },
          ].map((c) => (
            <Link
              className={`participate-card ${c.className}`}
              href={c.href}
              key={c.href}
            >
              <div>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
              <span className="circle-arrow" aria-hidden="true">
                <ArrowUpRight size={27} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
