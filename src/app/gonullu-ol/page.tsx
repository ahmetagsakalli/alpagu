import { ArrowUpRight, BookOpen, Users, HeartHandshake } from "lucide-react";
import Image from "next/image";
import { organization } from "@/lib/content";
import { PageHero } from "@/components/Shared";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Gönüllü Ol",
  "Alpagu Derneğinin gönüllüleri arasına katılın. Kitaplarla, eğitimle ve dayanışmayla çocukların geleceğine birlikte katkı sunalım.",
  "/gonullu-ol",
);
export default function Volunteer() {
  return (
    <>
      <PageHero
        eyebrow="Gönüllü Ol"
        title="İyilik, birlikte emek vermekle başlar."
        description="Zamanınızı, bilginizi ve heyecanınızı paylaşın. Çocukların yarınlarına birlikte güzel bir iz bırakalım."
      />
      <section className="section container editorial-grid">
        <div className="volunteer-image">
          <Image
            src="/images/reading.webp"
            alt="Kütüphanede kitap okuyan çocuklar; temsili fotoğraf"
            fill
            sizes="(max-width:800px) 90vw, 45vw"
          />
        </div>
        <div className="volunteer-copy">
          <h2>
            Birlikte yapacak
            <br />
            <em>çok güzel işimiz var.</em>
          </h2>
          <p>
            Kitapların hazırlanmasından kütüphane çalışmalarına, eğitim
            desteğinden sosyal etkinliklere kadar her adımda gönüllülerimizin
            katkısı var.
          </p>
          <ul className="volunteer-list">
            <li>
              <BookOpen /> Kitap ve kütüphane çalışmalarına katkı sunun.
            </li>
            <li>
              <HeartHandshake /> Eğitim desteklerinde dayanışmayı büyütün.
            </li>
            <li>
              <Users /> Sosyal ve kültürel etkinliklerde yer alın.
            </li>
          </ul>
          <a
            href={organization.volunteerForm}
            className="button"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gönüllü Formunu Aç <ArrowUpRight size={19} />
          </a>
          <p className="form-note">
            Derneğimizin Google Forms başvuru formu yeni sekmede açılır.
          </p>
        </div>
      </section>
    </>
  );
}
