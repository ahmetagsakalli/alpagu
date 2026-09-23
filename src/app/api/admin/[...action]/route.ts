import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { ZodError } from "zod";
import {
  COOKIE,
  SESSION_SECONDS,
  login,
  logout,
  requireSession,
} from "@/lib/cms/auth";
import { CmsError, readBinary } from "@/lib/cms/store";
import {
  CONTENT_TAG,
  readContentRecord,
  saveContent,
} from "@/lib/cms/content-store";
import { listMedia, uploadMedia, prepareMedia } from "@/lib/cms/media";
import { contentSchema } from "@/lib/cms/schema";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};
function json(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers });
}
async function limitedBody(req: NextRequest, max = 1_000_000) {
  if (Number(req.headers.get("content-length")) > max)
    throw new CmsError("Dosya veya içerik çok büyük.", 413);
  const reader = req.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const parts: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > max) {
      await reader.cancel();
      throw new CmsError("Dosya veya içerik çok büyük.", 413);
    }
    parts.push(value);
  }
  return Buffer.concat(parts);
}
async function body(req: NextRequest) {
  try {
    const value: unknown = JSON.parse((await limitedBody(req)).toString());
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new CmsError("Geçerli bir içerik gönderin.");
    return value as Record<string, unknown>;
  } catch (e) {
    if (e instanceof CmsError) throw e;
    throw new CmsError("İstek okunamadı.");
  }
}
function invalidate() {
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}
function failure(e: unknown) {
  if (e instanceof CmsError) return json({ error: e.message }, e.status);
  if (e instanceof ZodError)
    return json(
      {
        error: e.issues
          .map((x) => {
            const labels: Record<string, string> = {
              home: "Ana sayfa",
              organization: "Site bilgileri",
              projects: "Çalışmalar",
              news: "Haberler",
              faqs: "Sorular",
              title: "Başlık",
              description: "Açıklama",
              alt: "Görsel açıklaması",
              email: "E-posta",
              iban: "IBAN",
              phone: "Telefon",
              slug: "Çalışma adresi",
              needs: "Destek ihtiyaçları",
              paragraphs: "Metinler",
              image: "Görsel",
              href: "Bağlantı",
              q: "Soru",
              a: "Yanıt",
              stats: "İstatistikler",
            };
            const key = [...x.path]
              .reverse()
              .find((k) => typeof k === "string") as string;
            const message =
              x.code === "custom"
                ? x.message
                : x.code === "too_small"
                  ? "Bu alanı doldurun."
                  : x.code === "too_big"
                    ? "İçerik izin verilen uzunluğu aşıyor."
                    : "Bu alana geçerli bir değer girin.";
            return `${labels[key] || "İçerik"}: ${message}`;
          })
          .slice(0, 4)
          .join(" · "),
      },
      400,
    );
  console.error(
    "CMS request failed",
    e instanceof Error ? e.name : "Unknown error",
  );
  return json(
    {
      error:
        "İşlem tamamlanamadı. Değişiklikleriniz korunuyor; lütfen yeniden deneyin.",
    },
    500,
  );
}
type Context = { params: Promise<{ action: string[] }> };
export async function GET(req: NextRequest, ctx: Context) {
  try {
    const session = await requireSession(req);
    const { action } = await ctx.params;
    const key = action.join("/");
    if (key === "session") return json({ csrf: session.csrf });
    if (key === "content") {
      const { history, ...record } = await readContentRecord();
      return json({
        ...record,
        csrf: session.csrf,
        history: history.map(({ content: _, ...s }) => s),
      });
    }
    if (key === "history")
      return json(
        (await readContentRecord()).history.map(({ content: _, ...s }) => s),
      );
    if (key === "media") return json(await listMedia());
    if (action[0] === "media" && action.length === 2) {
      const a = (await listMedia()).find((a) => a.id === action[1]);
      if (!a) throw new CmsError("Görsel bulunamadı.", 404);
      return new Response(new Uint8Array(await readBinary(a.id, a.published)), {
        headers: { ...headers, "Content-Type": "image/webp" },
      });
    }
    throw new CmsError("İşlem bulunamadı.", 404);
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest, ctx: Context) {
  try {
    const { action } = await ctx.params;
    const key = action.join("/");
    if (key === "login") {
      const data = await body(req);
      if (typeof data.password !== "string")
        throw new CmsError("Şifrenizi girin.");
      const result = await login(req, data.password);
      const response = json({ csrf: result.csrf });
      response.cookies.set(COOKIE, result.token, {
        httpOnly: true,
        secure:
          Boolean(process.env.VERCEL) || new URL(req.url).protocol === "https:",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_SECONDS,
      });
      return response;
    }
    const session = await requireSession(req, true);
    if (key === "logout") {
      await logout(session.hash);
      const response = json({ ok: true });
      response.cookies.set(COOKIE, "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: Boolean(process.env.VERCEL),
        sameSite: "strict",
      });
      return response;
    }
    if (key === "media") {
      let name = "Görsel";
      try {
        name = decodeURIComponent(req.headers.get("x-filename") || name);
      } catch {}
      return json(await uploadMedia(await limitedBody(req, 4_000_000), name));
    }
    if (key === "content" || key === "restore") {
      const data = await body(req);
      if (typeof data.revision !== "string")
        throw new CmsError("Kayıt sürümü eksik.");
      const current = await readContentRecord();
      if (current.revision !== data.revision)
        throw new CmsError(
          "Başka bir sekmede değişiklik yapıldı. İçeriği yenileyin.",
          409,
        );
      const target =
        key === "restore"
          ? current.history.find((h) => h.revision === data.targetRevision)
              ?.content
          : data.content;
      if (!target) throw new CmsError("Geçmiş kayıt bulunamadı.", 404);
      const prepared = await prepareMedia(contentSchema.parse(target));
      const result = await saveContent(
        prepared,
        data.revision,
        key === "restore"
          ? "Geçmiş sürüm geri yüklendi"
          : typeof data.label === "string"
            ? data.label
            : "İçerik güncellendi",
      );
      invalidate();
      return json({
        ...result,
        history: result.history.map(({ content: _, ...s }) => s),
      });
    }
    throw new CmsError("İşlem bulunamadı.", 404);
  } catch (e) {
    return failure(e);
  }
}
