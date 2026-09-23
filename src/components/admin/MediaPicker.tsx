"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Upload, X, ImagePlus, Check } from "lucide-react";
import type { MediaAsset } from "@/lib/cms/schema";
export type LibraryAsset = MediaAsset & { published?: boolean };
const builtins = [
  "reading",
  "library",
  "pencils",
  "news-education",
  "news-support",
  "news-story",
  "social",
  "logo",
].map((name) => ({
  id: name,
  url: `/images/${name}.webp`,
  name: (
    {
      reading: "Kitap okuyan çocuklar",
      library: "Kütüphane",
      pencils: "Eğitim materyalleri",
      "news-education": "Okul desteği duyurusu",
      "news-support": "Kütüphane desteği duyurusu",
      "news-story": "Dernek tanıtımı",
      social: "Paylaşım görseli",
      logo: "Dernek logosu",
    } as Record<string, string>
  )[name],
  published: true,
  width: 0,
  height: 0,
  bytes: 0,
  createdAt: "",
}));
export function previewUrl(url: string) {
  const m = url.match(/^\/api\/media\/([a-f0-9-]+)\.webp$/);
  return m ? `/api/admin/media/${m[1]}` : url;
}
async function shrink(file: File) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error("En fazla 10 MB boyutunda JPG, PNG veya WebP seçin.");
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40_000_000)
      throw new Error("Görsel en fazla 40 megapiksel olabilir.");
    const ratio = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    canvas
      .getContext("2d")!
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Görsel hazırlanamadı."))),
        "image/webp",
        0.85,
      ),
    );
    if (blob.size > 3_800_000)
      throw new Error("Görsel çok büyük. Daha küçük bir görsel seçin.");
    return blob;
  } finally {
    bitmap.close();
  }
}
export default function MediaPicker({
  csrf,
  value,
  onSelect,
  onClose,
}: {
  csrf: string;
  value?: string;
  onSelect?: (url: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    input = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<LibraryAsset[]>(builtins),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    ref.current?.showModal();
    let active = true;
    fetch("/api/admin/media", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (active) setAssets([...d, ...builtins]);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = await shrink(file);
      const r = await fetch("/api/admin/media", {
        method: "POST",
        headers: {
          "x-csrf-token": csrf,
          "x-filename": encodeURIComponent(file.name),
          "Content-Type": "image/webp",
        },
        body,
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setAssets((v) => [d, ...v]);
      if (onSelect) {
        onSelect(d.url);
        onClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme yapılamadı.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <dialog
      ref={ref}
      className="adm-dialog"
      aria-labelledby="media-title"
      onCancel={(e) => {
        if (busy) e.preventDefault();
        else onClose();
      }}
    >
      <div className="adm-dialog-heading">
        <div>
          <span className="adm-kicker">Görsel kitaplığı</span>
          <h2 id="media-title">
            {onSelect ? "Bir görsel seçin" : "Görselleriniz"}
          </h2>
        </div>
        <button
          className="adm-icon-button"
          onClick={onClose}
          disabled={busy}
          aria-label="Görsel kitaplığını kapat"
        >
          <X size={22} />
        </button>
      </div>
      <div className="adm-upload">
        <ImagePlus size={28} />
        <div>
          <strong>Bilgisayarınızdan veya telefonunuzdan yükleyin</strong>
          <p>JPG, PNG veya WebP · En fazla 10 MB · Otomatik WebP dönüşümü</p>
        </div>
        <button
          className="adm-button"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          <Upload size={17} />
          {busy ? "Görsel hazırlanıyor…" : "Görsel yükle"}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => void upload(e.target.files?.[0])}
        />
      </div>
      {error && (
        <p className="adm-alert error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Görseller yükleniyor…</p>
      ) : (
        <div className="adm-media-grid">
          {assets.map((a) => (
            <button
              className={`adm-media-item ${value === a.url ? "selected" : ""}`}
              key={a.id}
              disabled={busy || !onSelect}
              onClick={() => {
                onSelect?.(a.url);
                onClose();
              }}
            >
              <div>
                <Image
                  src={previewUrl(a.url)}
                  alt={a.name}
                  fill
                  sizes="180px"
                  unoptimized
                />
                {value === a.url && (
                  <span>
                    <Check size={18} />
                  </span>
                )}
              </div>
              <strong>{a.name}</strong>
              <small>
                {a.bytes
                  ? `${a.width} × ${a.height} · ${Math.ceil(a.bytes / 1024)} KB`
                  : "Mevcut site görseli"}
              </small>
            </button>
          ))}
        </div>
      )}
      <p className="adm-help">
        Seçtiğiniz görsel, içeriği kaydettiğinizde sitede görünür.
      </p>
    </dialog>
  );
}
