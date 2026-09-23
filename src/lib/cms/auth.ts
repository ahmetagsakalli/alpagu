import "server-only";
import { randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { CmsError, mutateRecord, readRecord } from "./store";
import { hashToken, verifyPassword } from "./password";
export const COOKIE = "alpagu_admin";
export const SESSION_SECONDS = 12 * 60 * 60;
type Session = {
  hash: string;
  csrf: string;
  expires: number;
  passwordVersion: string;
};
type AuthState = {
  sessions: Session[];
  attempts: Record<string, { count: number; reset: number }>;
};
const empty: AuthState = { sessions: [], attempts: {} };
const authKey = "auth/state.json";
function passwordHash() {
  const v = process.env.CMS_PASSWORD_HASH;
  if (!v) throw new CmsError("Yönetim girişi henüz yapılandırılmamış.", 503);
  return v;
}
function clean(v: AuthState) {
  const now = Date.now();
  v.sessions = v.sessions.filter((s) => s.expires > now);
  for (const [k, a] of Object.entries(v.attempts))
    if (a.reset <= now) delete v.attempts[k];
}
export function checkOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowed = [
    process.env.CMS_ORIGIN,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : null,
  ].filter(Boolean);
  if (!process.env.VERCEL) {
    const port = new URL(req.url).port;
    const suffix = port ? `:${port}` : "";
    allowed.push(`http://127.0.0.1${suffix}`, `http://localhost${suffix}`);
  }
  if (!origin || !allowed.includes(origin))
    throw new CmsError("İstek kaynağı doğrulanamadı.", 403);
}
export async function login(req: NextRequest, password: string) {
  checkOrigin(req);
  const stored = passwordHash();
  const ip = process.env.VERCEL
    ? req.headers.get("x-vercel-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown"
    : "local";
  const key = hashToken(ip + stored),
    now = Date.now();
  await mutateRecord(authKey, empty, (v) => {
    clean(v);
    const a = v.attempts[key] ?? { count: 0, reset: now + 15 * 60 * 1000 };
    if (a.count >= 5)
      throw new CmsError(
        "Çok fazla giriş denemesi. 15 dakika sonra yeniden deneyin.",
        429,
      );
    a.count++;
    v.attempts[key] = a;
  });
  if (password.length > 256 || !(await verifyPassword(password, stored)))
    throw new CmsError("Şifre doğru değil.", 401);
  const token = randomBytes(32).toString("hex");
  const session = {
    hash: hashToken(token),
    csrf: randomBytes(24).toString("hex"),
    expires: now + SESSION_SECONDS * 1000,
    passwordVersion: hashToken(stored),
  };
  await mutateRecord(authKey, empty, (v) => {
    clean(v);
    delete v.attempts[key];
    v.sessions.push(session);
    v.sessions = v.sessions.slice(-30);
  });
  return { token, csrf: session.csrf };
}
export async function requireSession(req: NextRequest, write = false) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    throw new CmsError("Oturumunuz sona erdi. Lütfen giriş yapın.", 401);
  const state = await readRecord<AuthState>(authKey);
  const s = state?.value.sessions.find(
    (s) =>
      s.hash === hashToken(token) &&
      s.expires > Date.now() &&
      s.passwordVersion === hashToken(passwordHash()),
  );
  if (!s) throw new CmsError("Oturumunuz sona erdi. Lütfen giriş yapın.", 401);
  if (write) {
    checkOrigin(req);
    const csrf = req.headers.get("x-csrf-token") || "";
    if (
      csrf.length !== s.csrf.length ||
      !timingSafeEqual(Buffer.from(csrf), Buffer.from(s.csrf))
    )
      throw new CmsError(
        "Güvenlik doğrulaması başarısız. Sayfayı yenileyin.",
        403,
      );
  }
  return s;
}
export async function logout(hash: string) {
  await mutateRecord(authKey, empty, (v) => {
    v.sessions = v.sessions.filter((s) => s.hash !== hash);
    clean(v);
  });
}
