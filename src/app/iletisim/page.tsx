import Instagram from "@/components/InstagramIcon";
import { Mail, Phone, ArrowUpRight, BookOpen } from "lucide-react";
import { organization } from "@/lib/content";
import { PageHero } from "@/components/Shared";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "İletişim",
  "Alpagu Eğitim Araştırma ve Yardımlaşma Derneğine ulaşın. Kitap bağışı, eğitim desteği, gönüllülük ve iş birliği için iletişim kanallarımız.",
  "/iletisim",
);
export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="İletişim"
        title="Birlikte güzel şeyler yapabiliriz."
        description="Destek olmak, gönüllü olarak katılmak veya çalışmalarımız hakkında bilgi almak için bize ulaşın."
      />
      <section className="section container contact-layout">
        <div>
          <h2>
            Bir merhaba,
            <br />
            <em>yeni bir başlangıç.</em>
          </h2>
          <p className="lead">
            Kitap bağışı, eğitim desteği ve iş birliği için sizinle tanışmaktan
            mutluluk duyarız.
          </p>
          <div className="contact-note">
            <BookOpen size={28} />
            <p>
              Kitap ve malzeme göndermeden önce güncel ihtiyaçları ve teslim
              bilgilerini ekibimizden öğrenebilirsiniz.
            </p>
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
              href: organization.phoneHref,
            },
            {
              icon: Instagram,
              label: "Instagram",
              value: "@alpagudernegi",
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
