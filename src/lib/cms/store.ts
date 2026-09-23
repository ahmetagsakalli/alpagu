import "server-only";
import { get, put, BlobPreconditionFailedError, BlobError } from "@vercel/blob";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
export class CmsError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export const cloud = () => Boolean(process.env.CMS_PRIVATE_STORE_ID);
export function localRoot() {
  if (process.env.VERCEL)
    throw new CmsError("İçerik deposu yapılandırılmamış.", 503);
  return process.env.CMS_LOCAL_DIR || path.join(process.cwd(), ".cms");
}
export const privateOptions = () => ({
  access: "private" as const,
  storeId: process.env.CMS_PRIVATE_STORE_ID,
});
export const publicOptions = () => ({
  access: "public" as const,
  storeId: process.env.CMS_PUBLIC_STORE_ID,
});
function keyPath(key: string) {
  if (!/^[a-zA-Z0-9/._-]+$/.test(key) || key.includes(".."))
    throw new Error("Invalid store key");
  return path.join(/* turbopackIgnore: true */ localRoot(), key);
}
function digest(s: string) {
  return createHash("sha256").update(s).digest("hex");
}
export async function readRecord<T>(
  key: string,
): Promise<{ value: T; etag: string } | null> {
  if (cloud()) {
    const r = await get(key, {
      ...privateOptions(),
      useCache: false,
      headers: { "accept-encoding": "identity" },
    });
    if (!r) return null;
    if (r.statusCode !== 200) throw new CmsError("İçerik okunamadı.", 503);
    return {
      value: JSON.parse(await new Response(r.stream).text()) as T,
      etag: r.blob.etag,
    };
  }
  try {
    const s = await readFile(/* turbopackIgnore: true */ keyPath(key), "utf8");
    return { value: JSON.parse(s), etag: digest(s) };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}
export function isConflict(e: unknown) {
  return (
    (e instanceof CmsError && e.status === 409) ||
    e instanceof BlobPreconditionFailedError ||
    (e instanceof BlobError && /already exists/i.test(e.message))
  );
}
export async function writeRecord<T>(key: string, value: T, etag?: string) {
  const body = JSON.stringify(value);
  if (cloud()) {
    await put(key, body, {
      ...privateOptions(),
      contentType: "application/json",
      addRandomSuffix: false,
      cacheControlMaxAge: 60,
      ...(etag
        ? { ifMatch: etag, allowOverwrite: true }
        : { allowOverwrite: false }),
    });
    return;
  }
  const file = keyPath(key),
    lock = file + ".lock";
  await mkdir(path.dirname(file), { recursive: true });
  let locked = false;
  for (let n = 0; n < 50; n++) {
    try {
      await mkdir(lock);
      locked = true;
      break;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
      await new Promise((r) => setTimeout(r, 40));
    }
  }
  if (!locked) throw new CmsError("Kayıt sürüyor, yeniden deneyin.", 409);
  const temp = file + "." + randomUUID() + ".tmp";
  try {
    const current = await readRecord(key);
    if (current?.etag !== etag)
      throw new CmsError(
        "Bu içerik başka bir sekmede değişti. Sayfayı yenileyin.",
        409,
      );
    await writeFile(temp, body, { mode: 0o600 });
    await rename(temp, file);
  } finally {
    await rm(temp, { force: true });
    await rm(lock, { recursive: true, force: true });
  }
}
export async function mutateRecord<T, R>(
  key: string,
  initial: T,
  change: (value: T) => R | Promise<R>,
): Promise<R> {
  for (let i = 0; i < 8; i++) {
    const current = await readRecord<T>(key);
    const value = structuredClone(current?.value ?? initial);
    const result = await change(value);
    try {
      await writeRecord(key, value, current?.etag);
      return result;
    } catch (e) {
      if (!isConflict(e)) throw e;
    }
  }
  throw new CmsError(
    "Aynı anda başka bir işlem yapılıyor. Yeniden deneyin.",
    409,
  );
}
export async function saveBinary(id: string, data: Buffer, publish = false) {
  if (cloud()) {
    const r = await put(`${publish ? "media" : "pending"}/${id}.webp`, data, {
      ...(publish ? publicOptions() : privateOptions()),
      addRandomSuffix: false,
      contentType: "image/webp",
      // Retrying publication copies the same immutable pending file.
      allowOverwrite: publish,
      cacheControlMaxAge: 31536000,
    });
    return r.url;
  }
  const key = `${publish ? "media" : "pending"}/${id}.webp`;
  const file = keyPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data, { mode: 0o600 });
  return `/api/media/${id}.webp`;
}
export async function readBinary(id: string, published = false) {
  if (!/^[a-f0-9-]{36}$/.test(id))
    throw new CmsError("Görsel bulunamadı.", 404);
  const key = `${published ? "media" : "pending"}/${id}.webp`;
  if (cloud()) {
    const r = await get(key, {
      ...(published ? publicOptions() : privateOptions()),
      useCache: false,
    });
    if (!r || r.statusCode !== 200)
      throw new CmsError("Görsel bulunamadı.", 404);
    return Buffer.from(await new Response(r.stream).arrayBuffer());
  }
  try {
    return await readFile(/* turbopackIgnore: true */ keyPath(key));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT")
      throw new CmsError("Görsel bulunamadı.", 404);
    throw e;
  }
}
