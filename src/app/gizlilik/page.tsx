import { PageHero } from "@/components/Shared";
import { organization } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Gizlilik ve Çerezler",
  "Alpagu Derneği internet sitesinin çerez kullanımı, dış bağlantıları ve iletişim kanalları hakkında bilgiler.",
  "/gizlilik",
);
export default function Privacy() {
  return (
    <>
      <PageHero
        eyebrow="Gizlilik ve Çerezler"
        title="Gizliliğinize saygı duyuyoruz."
        description="Bu internet sitesinin kullanımı hakkında bilgiler."
      />
      <article className="section container prose privacy-prose">
        <h2>Site kullanımı</h2>
        <p>
          Bu sitede reklam veya ziyaretçi analizi amacıyla çerez kullanılmaz.
          Sayfaları görüntülemek için üyelik oluşturmanız gerekmez.
        </p>
        <h2>Bağış bilgileri</h2>
        <p>
          Bağış sayfası derneğin havale/EFT hesap bilgilerini sunar. Bu sitede
          kart bilgisi alınmaz ve ödeme işlemi gerçekleştirilmez. Transfer
          işlemi kullandığınız banka üzerinden yürütülür.
        </p>
        <h2>Dış bağlantılar</h2>
        <p>
          Instagram ve Google Forms bağlantıları sizi ilgili hizmete
          yönlendirir. Bu hizmetleri kullandığınızda ilgili hizmet sağlayıcının
          gizlilik koşulları geçerli olur. Gönüllü başvurunuzu göndermeden önce
          formdaki bilgilendirmeyi okuyabilirsiniz.
        </p>
        <h2>İletişim</h2>
        <p>
          Gizlilikle ilgili sorularınız için{" "}
          <a href={`mailto:${organization.email}`}>{organization.email}</a>{" "}
          adresinden derneğimizle iletişime geçebilirsiniz.
        </p>
      </article>
    </>
  );
}
