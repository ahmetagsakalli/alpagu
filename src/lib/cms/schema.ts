import { z } from "zod";

const short = z.string().trim().min(1, "Bu alan boş bırakılamaz.").max(250);
const text = z.string().trim().max(12000);
export const safeLink = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (v) =>
      /^\/(?!\/)[^\\]*$/.test(v) ||
      /^#[\w-]+$/.test(v) ||
      (() => {
        try {
          const u = new URL(v);
          return u.protocol === "https:" && !u.username && !u.password;
        } catch {
          return false;
        }
      })(),
    "Geçerli bir HTTPS bağlantısı veya site içi adres girin.",
  );
const image = z
  .string()
  .min(1)
  .max(2048)
  .refine(
    (v) =>
      /^\/images\/[a-zA-Z0-9._-]+$/.test(v) ||
      /^\/api\/media\/[a-f0-9-]+\.webp$/.test(v) ||
      /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/media\/[a-f0-9-]+\.webp$/.test(
        v,
      ),
    "Görseli görsel kitaplığından seçin.",
  );
const seo = z.object({
  title: short,
  description: z.string().trim().min(1).max(400),
  image,
});
const item = z.object({ title: short, text, year: z.string().max(60) });
export const pageSchema = z.object({
  title: short,
  description: text,
  heading: text,
  emphasis: text,
  lead: text,
  paragraphs: z.array(text).max(30),
  image,
  alt: short,
  items: z.array(item).max(30),
  extraHeading: text,
  extraEmphasis: text,
  note: text,
  seo,
});
export const pageKeys = [
  "hakkimizda",
  "bagis",
  "gonullu-ol",
  "iletisim",
  "gizlilik",
  "projeler",
] as const;
export type PageKey = (typeof pageKeys)[number];
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
export const projectSchema = z.object({
  id,
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
  title: short,
  image,
  alt: short,
  summary: text,
  lead: text,
  paragraphs: z.array(text).min(1).max(30),
  needs: z.array(short).max(20),
  impact: z.string().max(40),
  impactLabel: z.string().max(120),
  published: z.boolean(),
  featured: z.boolean(),
  seo,
});
export const newsSchema = z.object({
  id,
  title: short,
  text,
  image,
  alt: short,
  href: safeLink,
  published: z.boolean(),
});
export function validIban(value: string) {
  const v = value.replace(/\s/g, "").toUpperCase();
  if (!/^TR\d{24}$/.test(v)) return false;
  const digits = (v.slice(4) + v.slice(0, 4)).replace(/[A-Z]/g, (c) =>
    String(c.charCodeAt(0) - 55),
  );
  let n = 0;
  for (const d of digits) n = (n * 10 + Number(d)) % 97;
  return n === 1;
}
export const organizationSchema = z.object({
  name: short,
  shortName: short,
  instagram: safeLink,
  volunteerForm: safeLink,
  email: z.email(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{10,24}$/, "Geçerli bir telefon numarası girin."),
  iban: z
    .string()
    .refine(validIban, "IBAN geçerli bir Türkiye IBAN’ı olmalıdır."),
  bank: short,
  accountName: short,
  donationSource: safeLink,
  location: short,
  footerText: text,
});
export const homeSchema = z.object({
  title: short,
  subtitle: text,
  image,
  alt: short,
  primaryLabel: short,
  primaryHref: safeLink,
  secondaryLabel: short,
  secondaryHref: safeLink,
  aboutTitle: text,
  aboutIntro: text,
  aboutSince: text,
  aboutParagraphs: z.array(text).max(10),
  aboutImage: image,
  aboutAlt: short,
  workTitle: short,
  newsTitle: short,
  faqTitle: short,
  seo,
});
export const joinSchema = z.object({
  title: short,
  donationTitle: short,
  donationText: text,
  volunteerTitle: short,
  volunteerText: text,
});
export const contentSchema = z
  .object({
    schemaVersion: z.literal(1),
    organization: organizationSchema,
    home: homeSchema,
    pages: z.object({
      hakkimizda: pageSchema,
      bagis: pageSchema,
      "gonullu-ol": pageSchema,
      iletisim: pageSchema,
      gizlilik: pageSchema,
      projeler: pageSchema,
    }),
    stats: z.array(z.object({ value: short, label: short })).length(4),
    join: joinSchema,
    projects: z.array(projectSchema).max(100),
    news: z.array(newsSchema).max(100),
    faqs: z.array(z.object({ id, q: short, a: text })).max(50),
  })
  .superRefine((v, ctx) => {
    const error = (message: string, path: (string | number)[]) =>
      ctx.addIssue({ code: "custom", message, path });
    if (v.projects.filter((p) => p.published && p.featured).length > 3)
      error("Ana sayfada en fazla üç çalışma gösterilebilir.", ["projects"]);
    if (v.news.filter((n) => n.published).length > 3)
      error("Ana sayfada en fazla üç haber gösterilebilir.", ["news"]);
    for (const key of ["projects", "news", "faqs"] as const)
      if (new Set(v[key].map((x) => x.id)).size !== v[key].length)
        error("Tekrarlanan kayıt kimliği.", [key]);
    if (new Set(v.projects.map((p) => p.slug)).size !== v.projects.length)
      error("Çalışma adresleri birbirinden farklı olmalıdır.", ["projects"]);
  });
export type SiteContent = z.infer<typeof contentSchema>;
export type Project = z.infer<typeof projectSchema>;
export type PageContent = z.infer<typeof pageSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type MediaAsset = {
  id: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  name: string;
  createdAt: string;
};
export type Snapshot = {
  revision: string;
  updatedAt: string;
  label: string;
  content: SiteContent;
};
export type ContentRecord = Snapshot & { history: Snapshot[] };
export function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(
      /[çğıöşü]/g,
      (c) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[c]!,
    )
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}
export function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}
export function instagramName(url: string) {
  try {
    return "@" + new URL(url).pathname.split("/").filter(Boolean)[0];
  } catch {
    return "Instagram";
  }
}

export function uniqueSlug(title: string, used: string[]) {
  const base = slugify(title) || "calisma";
  let value = base,
    n = 2;
  while (used.includes(value)) value = `${base.slice(0, 94)}-${n++}`;
  return value;
}
