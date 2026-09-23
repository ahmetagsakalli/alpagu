import Instagram from "@/components/InstagramIcon";
import { Mail, Phone, ArrowUpRight, BookOpen } from "lucide-react";
import { getContent } from "@/lib/cms/content-store";
import { phoneHref, instagramName } from "@/lib/cms/schema";
import { PageHero } from "@/components/Shared";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const c = await getContent(),
    s = c.pages.iletisim.seo;
  return pageMetadata(
    s.title,
    s.description,
    "/iletisim",
    s.image,
    c.organization.shortName,
  );
}
export default async function Contact() {
  const {
    pages: { iletisim: p },
    organization,
  } = await getContent();
  return (
    <>
      <PageHero
        eyebrow="İletişim"
        title={p.title}
        description={p.description}
      />
      <section className="section container contact-layout">
        <div>
          <h2>
            {p.heading}
            <br />
            <em>{p.emphasis}</em>
          </h2>
          <p className="lead">{p.lead}</p>
          <div className="contact-note">
            <BookOpen size={28} />
            <p>{p.note}</p>
          </div>
        </div>
        <div className="contact-cards">
          {[
            {
              icon: Mail,
              label: "E-posta",
              value: organization.email,
              href: `mailto:${organization.email}`,
            },
            {
              icon: Phone,
              label: "Telefon",
              value: organization.phone,
              href: phoneHref(organization.phone),
            },
            {
              icon: Instagram,
              label: "Instagram",
              value: instagramName(organization.instagram),
              href: organization.instagram,
            },
          ].map((c) => (
            <a
              href={c.href}
              key={c.label}
              target={c.label === "Instagram" ? "_blank" : undefined}
              rel={c.label === "Instagram" ? "noopener noreferrer" : undefined}
            >
              <span className="icon-box">
                <c.icon size={23} />
              </span>
              <div>
                <span>{c.label}</span>
                <h3>{c.value}</h3>
              </div>
              <ArrowUpRight size={21} />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
