import Instagram from "@/components/InstagramIcon";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import { Stats, ProjectCards, JoinBanner } from "@/components/Shared";
import { faqs, organization } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Bir Kitap, Bir Umut, Bir Gelecek",
  "Alpagu Derneği; 40 Şehit Kütüphanesi, 22.000’den fazla kitap bağışı ve eğitim destekleriyle çocukların geleceğine sahip çıkıyor.",
  "/",
);
export default function Home() {
  return (
    <>
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="home-hero-visual">
          <Image
            className="home-hero-image"
            src="/images/reading.webp"
            alt="Kütüphanede birlikte kitap okuyan iki çocuk; temsili fotoğraf"
            fill
            sizes="(max-width: 700px) 100vw, 70vw"
            preload
            quality={85}
          />
        </div>
        <div className="home-hero-shade" aria-hidden="true" />
        <div className="home-hero-content container">
          <h1 id="hero-title">UMUT</h1>
          <p className="home-hero-subtitle">Çocukların yarınları için.</p>
          <div className="hero-actions">
            <a className="hero-action-primary" href="#calismalarimiz">
              Çalışmalarımız <ArrowUpRight size={21} aria-hidden="true" />
            </a>
            <Link className="hero-action-secondary" href="/bagis">
              Destek Ol <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <section className="home-about" id="hikayemiz">
        <div className="home-about-grid">
          <div className="home-about-copy">
            <h2>
              Bir okulun
              <br />
              kütüphanesiyle başladı.
            </h2>
            <p className="home-about-intro">
              İzmir’den başlayan bir çalışma. <strong>2016’dan beri.</strong>
            </p>
            <p>
              2016’da Ege Üniversitesi öğrencileri olarak “Bir Kitap Bin Fırat”
              projesini başlattık. İlk kütüphanemizi Kemalpaşa Ören
              Ortaokulu’nda, Şehit Fırat Yılmaz Çakıroğlu adına kurduk.
            </p>
            <p>
              Bugün 40 Şehit Kütüphanesiyle çalışmalarımızı sürdürüyor;
              çocuklara kitap, kırtasiye ve okul kıyafeti desteği sağlıyoruz.
            </p>
            <Link className="text-link" href="/hakkimizda">
              Derneğimizi tanıyın <ArrowRight size={17} />
            </Link>
          </div>
          <div className="home-about-photo">
            <Image
              src="/images/library.webp"
              alt="Rafları kitaplarla dolu bir kütüphane; temsili fotoğraf"
              fill
              sizes="(max-width: 700px) 90vw, 40vw"
            />
          </div>
        </div>
        <Stats />
      </section>
      <section className="work-section">
        <div className="container">
          <div className="work-heading" id="calismalarimiz">
            <h2>Çalışmalarımız</h2>
          </div>
          <ProjectCards />
        </div>
      </section>
      <JoinBanner />
      <section className="news-section container">
        <div className="news-heading">
          <h2>Dernekten haberler</h2>
        </div>
        <div className="news-gallery">
          {[
            {
              image: "news-education.webp",
              title: "25 çocuğa okul desteği",
              text: "Çanta, ayakkabı ve kırtasiye desteği için hazırladığımız kampanya.",
              alt: "Alpagu Derneğinin 25 çocuğa eğitim desteği duyurusu",
              href: "https://www.instagram.com/alpagudernegi/p/DcNnXFAIt0v/",
            },
            {
              image: "news-support.webp",
              title: "Şehit Kütüphanelerine destek",
              text: "Kütüphane çalışmalarımıza katkıda bulunmak isteyenler için bağış bilgileri.",
              alt: "Şehit Kütüphaneleri Projesine destek için Alpagu Derneği duyurusu",
              href: organization.donationSource,
            },
            {
              image: "news-story.webp",
              title: "Alpagu Derneği neler yapıyor?",
              text: "Kütüphanelerimizi, eğitim desteklerimizi ve gönüllülük çalışmalarımızı anlattık.",
              alt: "Alpagu Derneğinin çalışmalarını tanıtan Instagram paylaşımı",
              href: "https://www.instagram.com/alpagudernegi/p/DcmEgJgiI9h/",
            },
          ].map((news) => (
            <article className="news-card" key={news.href}>
              <a href={news.href} target="_blank" rel="noopener noreferrer">
                <div className="news-image">
                  <Image
                    src={`/images/${news.image}`}
                    alt={news.alt}
                    fill
                    sizes="(max-width: 700px) 90vw, 30vw"
                  />
                </div>
                <div className="news-copy">
                  <h3>{news.title}</h3>
                  <p>{news.text}</p>
                  <span className="news-arrow" aria-hidden="true">
                    <ArrowUpRight size={23} />
                  </span>
                </div>
              </a>
            </article>
          ))}
        </div>
        <div className="news-follow">
          <a
            className="text-link"
            href={organization.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={19} /> Instagram’da takip edin{" "}
            <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <section className="questions-section">
        <div className="container questions-grid">
          <div className="questions-intro">
            <h2>Sık sorulan sorular</h2>
          </div>
          <div className="questions-list">
            {faqs.map((faq) => (
              <details key={faq.q} name="alpagu-faq">
                <summary>
                  {faq.q}
                  <span aria-hidden="true">
                    <Plus size={16} strokeWidth={1.8} />
                  </span>
                </summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
          <div className="questions-contact">
            <Link href="/iletisim" className="text-link">
              Bize ulaşın <ArrowUpRight size={19} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
