import Link from "next/link";
import { BookOpen, HeartHandshake, ArrowRight } from "lucide-react";
import Donation from "@/components/Donation";
import { PageHero } from "@/components/Shared";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Bağış ve Destek",
  "Alpagu Derneğinin Şehit Kütüphaneleri ve eğitim çalışmalarına havale/EFT, kitap, kırtasiye veya gönüllü emeğinizle destek olun.",
  "/bagis",
);
export default function Donate() {
  return (
    <>
      <PageHero
        eyebrow="Bağış ve Destek"
        title="Bir çocuğun yarınına dokunun."
        description="Bir kitap, bir okul çantası, yeni bir kütüphane… Her katkı, birlikte büyüttüğümüz iyiliğin bir parçası."
      />
      <section className="section container donation-layout">
        <div>
          <h2>
            Küçük bir katkı.
            <br />
            <em>Büyük bir anlam.</em>
          </h2>
          <p className="lead">
            Şehitlerimizin hatırasını yaşatan ve çocukların eğitimini
            destekleyen çalışmalarımıza katılın.
          </p>
          <div className="support-option">
            <BookOpen />
            <div>
              <h3>Kitap ve eğitim materyali</h3>
              <p>
                Kitap, kırtasiye ve okul kıyafeti desteği için güncel
                ihtiyaçları ekibimizden öğrenebilirsiniz.
              </p>
              <Link className="text-link" href="/iletisim">
                Bize ulaşın <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="support-option">
            <HeartHandshake />
            <div>
              <h3>Zamanınız da bir destek</h3>
              <p>
                Gönüllü emeğinizle kütüphanelerimizin ve eğitim çalışmalarımızın
                bir parçası olun.
              </p>
              <Link className="text-link" href="/gonullu-ol">
                Gönüllü olun <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
        <Donation />
      </section>
    </>
  );
}
