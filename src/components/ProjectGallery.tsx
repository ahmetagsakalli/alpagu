"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

type Project = {
  slug: string;
  title: string;
  image: string;
  alt: string;
  summary: string;
};
export default function ProjectGallery({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const change = (direction: number) =>
    setActive(
      (value) => (value + direction + projects.length) % projects.length,
    );
  return (
    <div className="project-showcase">
      <div className="project-panels">
        {projects.map((project, index) => (
          <article
            key={project.slug}
            className={`project-panel ${active === index ? "is-active" : ""}`}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") setActive(index);
            }}
          >
            <Image
              src={`/images/${project.image}`}
              alt={project.alt}
              fill
              sizes="(max-width: 700px) 100vw, 65vw"
            />
            <div className="panel-shade" />
            <button
              className="panel-trigger"
              aria-expanded={active === index}
              aria-controls={`panel-${project.slug}`}
              aria-label={`${project.title} çalışmasını göster`}
              onClick={() => setActive(index)}
            >
              <span>{project.title}</span>
            </button>
            <div
              className="panel-copy"
              id={`panel-${project.slug}`}
              hidden={active !== index}
            >
              <div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
              </div>
              <Link
                href={`/projeler/${project.slug}`}
                className="circle-arrow"
                aria-label={`${project.title} projesini keşfedin`}
              >
                <ArrowUpRight size={27} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="showcase-controls">
        <span aria-live="polite" aria-atomic="true">
          {String(active + 1).padStart(2, "0")}{" "}
          <span>/ {String(projects.length).padStart(2, "0")}</span>
        </span>
        <button onClick={() => change(-1)} aria-label="Önceki çalışma">
          <ArrowLeft size={20} />
        </button>
        <button onClick={() => change(1)} aria-label="Sonraki çalışma">
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
