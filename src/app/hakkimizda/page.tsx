import Image from "next/image";
import { PageHero, Stats, JoinBanner } from "@/components/Shared";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Hakkımızda",
  "2016’da Bir Kitap Bin Fırat projesiyle başlayan, 3 Mayıs 2023’te dernekleşen Alpagu’nun hikâyesini, amacını ve eğitim çalışmalarını tanıyın.",
  "/hakkimizda",
);
export default function About() {
  return (
    <>
      <PageHero
        eyebrow="Hakkımızda"
        title="Bir hatıradan, binlerce yarına."
        description="Şehitlerimizin adını güzel işlerle geleceğe taşımak için bir aradayız."
      />
      <section className="section container editorial-grid">
        <div>
          <h2>
            İyiliğin izinde,
            <br />
            <em>aynı inançla.</em>
          </h2>
          <div className="editorial-image">
            <Image
              src="/images/library.webp"
              alt="Kitaplarla dolu kütüphane rafları; temsili fotoğraf"
              fill
              sizes="(max-width:800px) 90vw, 40vw"
            />
          </div>
        </div>
        <div className="prose">
          <p className="lead">
            Alpagu Eğitim Araştırma ve Yardımlaşma Derneği, çocukların eğitime
            erişimini desteklemek ve şehitlerimizin hatırasını kalıcı eserlerle
            yaşatmak için çalışır.
          </p>
          <p>
            Hikâyemiz, 2016 yılında Ege Üniversitesi öğrencilerinin başlattığı
            “Bir Kitap Bin Fırat” projesiyle başladı. Şehit Fırat Yılmaz
            Çakıroğlu adına ilk kütüphanemizi Kemalpaşa Ören Ortaokulu’nda
            kurduk.
          </p>
          <p>
            Daha fazla şehidimizin adını yaşatmak için çalışmalarımızı Şehit
            Kütüphaneleri adıyla sürdürdük. Türkiye’nin farklı şehirlerindeki
            okullarda kitapları çocuklarla buluşturduk.
          </p>
          <p>
            2023 yılında Van’ın Özalp ilçesindeki kütüphane çalışmasının
            ardından, faaliyetlerimizin daha kalıcı bir yapıya kavuşması için
            dernekleşme adımını attık. Alpagu Derneği, 3 Mayıs 2023 tarihinde
            resmen kuruldu.
          </p>
          <p>
            Bugün kütüphanelerin yanında kırtasiye, okul kıyafeti ve eğitim
            materyali desteği sağlıyor; çocukların sosyal ve kültürel gelişimine
            katkıda bulunan etkinlikler düzenliyoruz.
          </p>
        </div>
      </section>
      <Stats />
      <section className="section container">
        <h2>
          Küçük bir adım.
          <br />
          <em>Kalıcı bir iz.</em>
        </h2>
        <div className="timeline">
          {[
            {
              year: "2016",
              title: "Bir Kitap Bin Fırat",
              text: "Ege Üniversitesi öğrencilerinin girişimiyle ilk kütüphane Kemalpaşa Ören Ortaokulu’nda açıldı.",
            },
            {
              year: "2016–2023",
              title: "35 Şehit Kütüphanesi",
              text: "İzmir, Erzurum, Mersin, Eskişehir, Konya ve Van’da şehitlerimizin adını yaşatan kütüphaneler kuruldu.",
            },
            {
              year: "3 Mayıs 2023",
              title: "Alpagu Derneği kuruldu",
              text: "Gönüllülükle büyüyen hareketimiz, eğitim, araştırma ve yardımlaşma derneği çatısı altında devam etti.",
            },
            {
              year: "Bugün",
              title: "40 kütüphane, binlerce gelecek",
              text: "22.000’den fazla kitap bağışı ve 10.000’den fazla çocuğa ulaşan çalışmalarla iyiliği birlikte büyütüyoruz.",
            },
          ].map((item) => (
            <div key={item.year}>
              <span>{item.year}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
      <JoinBanner />
    </>
  );
}
