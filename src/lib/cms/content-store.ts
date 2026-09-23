import "server-only";
import { randomUUID } from "node:crypto";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CmsError, readRecord, writeRecord, isConflict } from "./store";
import { contentSchema, type ContentRecord, type SiteContent } from "./schema";
import { initialRecord } from "./seed";
export const CONTENT_TAG = "alpagu-content";
const KEY = "content/published.json";
export async function readContentSnapshot() {
  return (
    (await readRecord<ContentRecord>(KEY)) ?? {
      value: structuredClone(initialRecord),
      etag: undefined,
    }
  );
}
export async function readContentRecord() {
  return (await readContentSnapshot()).value;
}
const cachedContent = unstable_cache(
  async () => (await readContentRecord()).content,
  [
    "alpagu-content-v1",
    process.env.CMS_PRIVATE_STORE_ID || process.env.CMS_LOCAL_DIR || "local-v2",
  ],
  { tags: [CONTENT_TAG], revalidate: 3600 },
);
export const getContent = cache(async (): Promise<SiteContent> => {
  return process.env.NODE_ENV === "development"
    ? (await readContentRecord()).content
    : cachedContent();
});
export async function saveContent(
  data: unknown,
  revision: string,
  label: string,
  snapshot?: Awaited<ReturnType<typeof readContentSnapshot>>,
) {
  const content = contentSchema.parse(data);
  const stored = snapshot ?? (await readContentSnapshot());
  const current = stored.value;
  if (current.revision !== revision)
    throw new CmsError(
      "İçerik başka bir sekmede güncellendi. Değişikliklerinizi kopyalayıp sayfayı yenileyin.",
      409,
    );
  for (const old of current.content.projects) {
    const p = content.projects.find((p) => p.id === old.id);
    if (p && p.slug !== old.slug)
      throw new CmsError("Mevcut çalışma adresi değiştirilemez.");
  }
  const { history, ...previous } = current;
  const next: ContentRecord = {
    revision: randomUUID(),
    updatedAt: new Date().toISOString(),
    label: label.slice(0, 120),
    content,
    history: [previous, ...history].slice(0, 20),
  };
  try {
    // Reuse the read only with its ETag; a concurrent write still fails atomically.
    await writeRecord(KEY, next, stored.etag);
  } catch (e) {
    if (isConflict(e))
      throw new CmsError(
        "İçerik başka bir sekmede güncellendi. Sayfayı yenileyin.",
        409,
      );
    throw e;
  }
  return next;
}
