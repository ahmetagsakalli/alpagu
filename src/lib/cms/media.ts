import "server-only";
import sharp, { type OutputInfo } from "sharp";
import { randomUUID } from "node:crypto";
import {
  CmsError,
  readRecord,
  mutateRecord,
  readBinary,
  saveBinary,
  isConflict,
} from "./store";
import type { MediaAsset, SiteContent } from "./schema";
const KEY = "media/index.json";
export type StoredAsset = MediaAsset & { published: boolean };
export async function listMedia() {
  return (await readRecord<StoredAsset[]>(KEY))?.value ?? [];
}
export async function uploadMedia(bytes: Buffer, name: string) {
  if (bytes.length > 4_000_000)
    throw new CmsError(
      "Görsel küçültülemedi. Daha küçük bir dosya seçin.",
      413,
    );
  let output: { data: Buffer; info: OutputInfo };
  try {
    const source = sharp(bytes, {
      limitInputPixels: 40_000_000,
      failOn: "warning",
    });
    const m = await source.metadata();
    if (!["jpeg", "png", "webp"].includes(m.format || "") || (m.pages ?? 1) > 1)
      throw new Error("format");
    output = await source
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new CmsError(
      "Geçerli, hareketsiz bir JPG, PNG veya WebP görsel seçin (en fazla 40 megapiksel).",
    );
  }
  const id = randomUUID();
  await saveBinary(id, output.data);
  const asset: StoredAsset = {
    id,
    url: `/api/media/${id}.webp`,
    width: output.info.width,
    height: output.info.height,
    bytes: output.data.length,
    name: name.slice(0, 160) || "Görsel",
    createdAt: new Date().toISOString(),
    published: false,
  };
  await mutateRecord(KEY, [] as StoredAsset[], (v) => {
    v.unshift(asset);
  });
  return asset;
}
export const builtinImages = [
  "logo.webp",
  "library.webp",
  "pencils.webp",
  "reading.webp",
  "news-education.webp",
  "news-support.webp",
  "news-story.webp",
  "social.webp",
].map((n) => `/images/${n}`);
export async function prepareMedia(content: SiteContent) {
  let assets: StoredAsset[] | undefined;
  const replacements = new Map<string, string>();
  const visit = async (value: unknown, key = ""): Promise<unknown> => {
    if (Array.isArray(value)) {
      const out: unknown[] = [];
      for (const v of value) out.push(await visit(v));
      return out;
    }
    if (value && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) out[k] = await visit(v, k);
      return out;
    }
    if (typeof value !== "string" || !["image", "aboutImage"].includes(key))
      return value;
    if (builtinImages.includes(value)) return value;
    if (replacements.has(value)) return replacements.get(value)!;
    assets ??= await listMedia();
    const asset = assets.find(
      (a) => a.url === value || `/api/media/${a.id}.webp` === value,
    );
    if (!asset)
      throw new CmsError(
        "İçerikteki görsel kitaplıkta bulunamadı. Görseli yeniden seçin.",
      );
    if (asset.published) return asset.url;
    let url: string;
    try {
      url = await saveBinary(asset.id, await readBinary(asset.id), true);
    } catch (e) {
      if (!isConflict(e)) throw e;
      const latest = (await listMedia()).find(
        (a) => a.id === asset.id && a.published,
      );
      if (!latest)
        throw new CmsError("Görsel işleniyor. Yeniden kaydedin.", 409);
      url = latest.url;
    }
    await mutateRecord(KEY, [] as StoredAsset[], (v) => {
      const a = v.find((a) => a.id === asset.id);
      if (a) {
        a.published = true;
        a.url = url;
      }
    });
    replacements.set(value, url);
    return url;
  };
  return (await visit(content)) as SiteContent;
}
