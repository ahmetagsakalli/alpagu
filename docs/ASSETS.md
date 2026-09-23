# Görsel kaynakları

Görseller `public/images` içinde WebP olarak saklanır ve `next/image` ile sunulur. Stok fotoğraflar derneğin gerçek faaliyet fotoğrafları değildir; ilgili alternatif metinlerde temsili oldukları belirtilir.

## Derneğin resmî görselleri

- `logo.webp`: [Alpagu Derneği Instagram profili](https://www.instagram.com/alpagudernegi/).
- `news-education.webp`: [25 çocuğa eğitim desteği duyurusu](https://www.instagram.com/alpagudernegi/p/DcNnXFAIt0v/).
- `news-support.webp`: [Şehit Kütüphaneleri destek duyurusu](https://www.instagram.com/alpagudernegi/p/DdWPAGOofY-/).
- `news-story.webp`: [Derneğin çalışmalarını tanıtan paylaşım](https://www.instagram.com/alpagudernegi/p/DcmEgJgiI9h/).

Haber kartları ilgili orijinal gönderiye bağlantı verir.

## Stok fotoğraflar

- `reading.webp`: [Unsplash — kütüphanede çocuklar](https://unsplash.com/s/photos/library-kids); fotoğraf kimliği `photo-1762475833776-fd57865db4d5`.
- `library.webp` ve sosyal paylaşım kırpımı `social.webp`: [Unsplash — kitap rafları](https://unsplash.com/photos/assorted-books-ZtI4l8EvyUw); fotoğraf kimliği `photo-1568667256531-7d5ac92eaa7a`.
- `pencils.webp`: [Unsplash — eğitim materyalleri](https://unsplash.com/photos/a-black-rectangular-object-with-a-yellow-and-green-design-on-it-kluhfCFYVIM); fotoğraf kimliği `photo-1661732017110-52fab3f0ab2b`.

## Dönüşüm

Sharp ile WebP dönüşümü ve boyutlandırma için `scripts/optimize-images.mjs` kullanılır. Görseller ve yerel yazı tipleri doğrudan site tarafından sunulur.
