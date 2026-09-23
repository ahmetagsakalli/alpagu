# Yönetim paneli

Panel: https://alpagu-dernegi.vercel.app/admin

Tek yönetim şifresiyle giriş yapılır. **Kaydet**, ekrandaki tüm kaydedilmemiş içerik değişikliklerini hemen yayımlar. Ayrı taslak veya yayınlama adımı yoktur. İnternete açık site üzerinde değişiklik görmek için sayfayı yenileyin.

## İçerik düzenleme

- **Ana sayfa:** Hero, fotoğraflar, butonlar, tanıtım metinleri, dört istatistik ve katkı kartları.
- **Sayfalar:** Hakkımızda ve tarihçe, bağış, gönüllülük, iletişim, gizlilik, çalışmaların giriş alanı.
- **Çalışmalar:** Ekleme, sıralama, ayrıntı ve görsel düzenleme, yayından kaldırma. Ana sayfada en fazla üç yayımlanan çalışma seçilir. Sayfa adresi ilk kayıttan sonra değişmez. Yeni sayfalar yeniden dağıtım gerekmeden açılır; yayından kaldırılanlar 404 döner.
- **Haberler:** Başlık, kısa açıklama, fotoğraf ve yönlendirme bağlantısı. En fazla üç haber ana sayfada yayımlanır; diğerleri panelde saklanır.
- **Sık sorulan sorular:** Ekleme, düzenleme, sıralama, kaldırma.
- **Site bilgileri:** Ortak iletişim bilgileri, gönüllü formu, banka ve IBAN. IBAN biçimi ve kontrol basamakları doğrulanır; hesap sahipliği banka tarafından kontrol edilmelidir.
- **Görsel kitaplığı:** JPG/PNG/WebP, 10 MB kaynak ve 40 megapiksel sınırı. Tarayıcı boyutu küçültür; sunucu tekrar doğrular, EXIF bilgisini kaldırır ve en fazla 2400 × 2400 piksel WebP oluşturur. Kaydedilmeyen görsel özel depoda kalır. Yayımlanmış görseller değişmez adresler alır.
- **Kayıt geçmişi:** Son 20 önceki kayıt tutulur. Geri yükleme tüm içerik belgesine uygulanır; mevcut sürüm de geçmişe alınır. Görseller fiziksel olarak silinmediği için eski sürümler çalışmaya devam eder.

SEO ayarları ilgili sayfanın altındaki açılır alandadır. Tasarım, menü yapısı, fontlar ve geliştirici imzası içerik panelinden değiştirilmez. Çoklu kullanıcı, online ödeme ve Instagram’dan otomatik içerik çekme bulunmaz.

İki açık sekme aynı sürümü düzenlerse ilk kayıt başarılı olur; ikinci sekme 409 uyarısı alır. İkinci sekmede yapılan metinleri kopyalayıp sayfayı yenileyerek birleştirin. Oturum sona ererse açık formdaki değişiklikleri koruyup yeni bir sekmede tekrar giriş yapabilirsiniz.

## Yerel geliştirme

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm admin:password
pnpm dev
```

Şifre terminalde görünmeden alınır ve scrypt hash olarak `.env.local` ile `.cms/password-hash` dosyasına yazılır. Gerçek şifre kaynak koda yazılmaz. Yerel içerikler `.cms/` altında atomik dosya yazımı ve kilitle kaydedilir. Bu dizin, ortam dosyaları ve test çıktıları Git ve Vercel yüklemelerine dahil edilmez.

## Vercel yapılandırması

Mevcut proje: `bgc-nakliyat/alpagu-dernegi`. CLI hesabı: `ahmetagsakalli`.

Her ortam için birbirinden ayrı özel içerik deposu ve açık görsel deposu kullanılır:

| Ortam      | Özel içerik        | Açık görseller       |
| ---------- | ------------------ | -------------------- |
| Production | alpagu-cms         | alpagu-media         |
| Preview    | alpagu-preview-cms | alpagu-preview-media |

Bağlantılar OIDC kullanır; uzun ömürlü Blob erişim token’ı tutulmaz. Ortam değişkenleri:

- `CMS_PRIVATE_STORE_ID`: ilgili özel depo, yalnız sunucuda.
- `CMS_PUBLIC_STORE_ID`: ilgili açık depo; Next Image yalnız bu deponun görsellerine izin verir.
- `CMS_PASSWORD_HASH`: scrypt hash, Vercel Secret türü.
- `CMS_ORIGIN`: canlı yönetim adresinin kökü, ör. `https://alpagu-dernegi.vercel.app`.
- `NEXT_PUBLIC_SITE_URL`: canonical alan adı.
- `SITE_INDEXABLE`: yalnız Production için `true`.

Preview, Vercel’in kendi deployment ve branch adresleri üzerinden yönetilebilir. Önizleme verileri canlı depoya yazılmaz. Özel alan adı bağlandığında hem `CMS_ORIGIN` hem `NEXT_PUBLIC_SITE_URL` değiştirilip yeniden dağıtılmalıdır.

İçerik özel depoda `content/published.json`, oturum ve giriş sınırı `auth/state.json`, görsel envanteri `media/index.json` olarak tutulur. Kayıtlar güçlü ETag koşuluyla atomik yazılır. Next.js sunucu önbelleği başarılı kayıt sonrası derhal geçersizleştirilir. Depo hataları başlangıç verisine dönülerek gizlenmez. İlk kayıt yoksa depodaki mevcut başlangıç içeriği kullanılır; panelden ilk başarılı kayıt bunu kalıcılaştırır. Sonraki dağıtımlar kaydedilmiş içerikleri değiştirmez.

## Şifre değiştirme / sıfırlama

```sh
pnpm admin:password
pnpm dlx vercel@59.25.0 env add CMS_PASSWORD_HASH production,preview --sensitive --force --yes --scope bgc-nakliyat < .cms/password-hash
pnpm dlx vercel@59.25.0 deploy --prod --yes --scope bgc-nakliyat
```

Preview ortamı da kullanılacaksa ayrıca preview dağıtımı yapın. Değişen hash eski oturumları geçersiz kılar. Şifreyi komut satırı argümanına, Git’e, loglara veya paylaşılacak belgelere yazmayın.

Oturumlar 12 saattir; HttpOnly, SameSite=Strict ve canlıda Secure çerez kullanılır. Tüm yönetim API’leri oturum kontrolü yapar; yazma işlemleri CSRF ve origin doğrulaması gerektirir. Beş başarısız girişten sonra ilgili adres için 15 dakika bekleme uygulanır. Panel noindex ve no-store ile sunulur.

## Doğrulama ve dağıtım

```sh
pnpm typecheck
pnpm test
pnpm dlx vercel@59.25.0 deploy --yes --scope bgc-nakliyat
# Önizlemeyi doğruladıktan sonra, Production ortamıyla yeni derleme:
pnpm dlx vercel@59.25.0 deploy --prod --yes --scope bgc-nakliyat
```

`pnpm test` üretim derlemesi alır ve `127.0.0.1:3100` üzerinde rastgele geçici içerik diziniyle test sunucusu çalıştırır. Test şifresi yalnız bu yerel sunucu içindir. Gerçek CMS depoları kullanılmaz. Testler yetkisiz erişim, CSRF, oturum iptali, giriş sınırı, eşzamanlı kayıt, doğrulama, geri alma, proje adresleri, WebP yükleme, masaüstü ve mobil akışları kapsar.

Önizlemeyi Production’a doğrudan promote etmeyin: ortamların depoları farklıdır. Canlı için `deploy --prod` ile doğru ortam değişkenleri kullanılarak derleme alın. Kod geri alma içerik geçmişinden bağımsızdır; gerekirse önceki Vercel deployment’a rollback, içerik için panelden geri yükleme yapılır.
