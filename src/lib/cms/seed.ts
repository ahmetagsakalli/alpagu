import { organization, projects, faqs } from "../content";
import initial from "./initial-pages.json";
import { contentSchema, type ContentRecord } from "./schema";
export const seedContent = contentSchema.parse({
  schemaVersion: 1,
  ...initial,
  organization: {
    ...organization,
    accountName: organization.name,
    location: "İzmir, Türkiye",
    footerText:
      "Şehit Kütüphaneleri, eğitim desteği ve gönüllülük çalışmaları.",
  },
  projects: projects.map((p) => ({
    ...p,
    id: p.slug,
    image: `/images/${p.image}`,
    published: true,
    featured: true,
    seo: {
      title: p.title,
      description: p.summary,
      image: `/images/${p.image}`,
    },
  })),
  faqs: faqs.map((f, i) => ({ ...f, id: `faq-${i + 1}` })),
  stats: [
    { value: "40", label: "Şehit Kütüphanesi" },
    { value: "22.000+", label: "bağışlanan kitap" },
    { value: "10.000+", label: "ulaşılan çocuk" },
    { value: "2016", label: "ilk kütüphanemizin açılışı" },
  ],
  join: {
    title: "Nasıl katkı sağlayabilirsiniz?",
    donationTitle: "Bağış yapın",
    donationText:
      "Kitap, kırtasiye ve maddi destek için bağış bilgilerine ulaşın.",
    volunteerTitle: "Gönüllü olun",
    volunteerText:
      "Kütüphane hazırlıklarına ve etkinliklerimize katılmak için başvuru formunu doldurun.",
  },
});
export const initialRecord: ContentRecord = {
  revision: "initial",
  updatedAt: "2026-09-23T09:00:00.000Z",
  label: "İlk içerik",
  content: seedContent,
  history: [],
};
