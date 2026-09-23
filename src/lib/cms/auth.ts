import "server-only";
import { randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { CmsError, mutateRecord, readRecord } from "./store";
import { hashPassword, hashToken, verifyPassword } from "./password";
import { COOKIE, SESSION_SECONDS } from "./auth-config";
export { COOKIE, SESSION_SECONDS } from "./auth-config";
type Session = {
  hash: string;
  csrf: string;
  expires: number;
  passwordVersion: string;
};
type AuthState = {
  credential?: { hash: string; bootstrapVersion: string };
  sessions: Session[];
  attempts: Record<string, { count: number; reset: number }>;
};
const empty: AuthState = { sessions: [], attempts: {} };
const authKey = "auth/state.json";
function bootstrapHash() {
  const v = process.env.CMS_PASSWORD_HASH;
  if (!v) throw new CmsError("Yönetim girişi henüz yapılandırılmamış.", 503);
  return v;
}
function passwordHash(state: AuthState) {
  const bootstrap = bootstrapHash();
  return state.credential?.bootstrapVersion === hashToken(bootstrap)
    ? state.credential.hash
    : bootstrap;
}
function sessionError() {
  return new CmsError("Oturumunuz sona erdi. Lütfen giriş yapın.", 401);
}
function activeSession(state: AuthState, hash: string) {
  return state.sessions.find(
    (s) =>
      s.hash === hash &&
      s.expires > Date.now() &&
      s.passwordVersion === hashToken(passwordHash(state)),
  );
}
function newSession(stored: string) {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    session: {
      hash: hashToken(token),
      csrf: randomBytes(24).toString("hex"),
      expires: Date.now() + SESSION_SECONDS * 1000,
      passwordVersion: hashToken(stored),
    },
  };
}
function reserveAttempt(state: AuthState, key: string, message: string) {
  clean(state);
  const a = state.attempts[key] ?? {
    count: 0,
    reset: Date.now() + 15 * 60 * 1000,
  };
  if (a.count >= 5) {
    console.warn("CMS authentication rate limit reached");
    throw new CmsError(message, 429);
  }
  a.count++;
  state.attempts[key] = a;
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
  const ip = process.env.VERCEL
    ? req.headers.get("x-vercel-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown"
    : "local";
  const { stored, key } = await mutateRecord(authKey, empty, (v) => {
    const stored = passwordHash(v);
    const key = hashToken(ip + stored);
    reserveAttempt(
      v,
      key,
      "Çok fazla giriş denemesi. 15 dakika sonra yeniden deneyin.",
    );
    return { stored, key };
  });
  if (password.length > 256 || !(await verifyPassword(password, stored))) {
    console.warn("CMS login rejected: invalid password");
    throw new CmsError("Şifre doğru değil.", 401);
  }
  const { token, session } = newSession(stored);
  await mutateRecord(authKey, empty, (v) => {
    if (passwordHash(v) !== stored) throw sessionError();
    clean(v);
    delete v.attempts[key];
    v.sessions.push(session);
    v.sessions = v.sessions.slice(-30);
  });
  return { token, csrf: session.csrf };
}
export async function requireSession(req: NextRequest, write = false) {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) throw sessionError();
  const state = await readRecord<AuthState>(authKey);
  const s = state && activeSession(state.value, hashToken(token));
  if (!s) throw sessionError();
  if (write) {
    checkOrigin(req);
    const csrf = req.headers.get("x-csrf-token") || "";
    const actual = Buffer.from(csrf),
      expected = Buffer.from(s.csrf);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      throw new CmsError(
        "Güvenlik doğrulaması başarısız. Sayfayı yenileyin.",
        403,
      );
  }
  return s;
}
export async function changePassword(
  session: Session,
  currentPassword: string,
  nextPassword: string,
  confirmation: string,
) {
  if (!currentPassword || currentPassword.length > 256)
    throw new CmsError("Mevcut şifrenizi girin.");
  if (nextPassword.length < 8 || nextPassword.length > 256)
    throw new CmsError("Yeni şifre 8–256 karakter olmalıdır.");
  if (nextPassword !== confirmation)
    throw new CmsError("Yeni şifreler birbiriyle eşleşmiyor.");
  if (nextPassword === currentPassword)
    throw new CmsError("Yeni şifreniz mevcut şifrenizden farklı olmalıdır.");
  const state = (await readRecord<AuthState>(authKey))?.value;
  if (!state || !activeSession(state, session.hash)) throw sessionError();
  const stored = passwordHash(state);
  const key = hashToken(`password-change:${session.hash}:${stored}`);
  await mutateRecord(authKey, empty, (v) => {
    if (passwordHash(v) !== stored || !activeSession(v, session.hash))
      throw sessionError();
    reserveAttempt(
      v,
      key,
      "Çok fazla şifre değiştirme denemesi. 15 dakika sonra yeniden deneyin.",
    );
  });
  if (!(await verifyPassword(currentPassword, stored))) {
    console.warn("CMS password change rejected: invalid current password");
    throw new CmsError("Mevcut şifre doğru değil.", 401);
  }
  const hash = await hashPassword(nextPassword);
  const fresh = newSession(hash);
  await mutateRecord(authKey, empty, (v) => {
    // Recheck inside the conditional write: two simultaneous changes cannot both win.
    if (passwordHash(v) !== stored || !activeSession(v, session.hash))
      throw sessionError();
    v.credential = { hash, bootstrapVersion: hashToken(bootstrapHash()) };
    v.sessions = [fresh.session];
    v.attempts = {};
  });
  console.info("CMS password changed; previous sessions revoked");
  return { token: fresh.token, csrf: fresh.session.csrf };
}
export async function logout(hash: string) {
  await mutateRecord(authKey, empty, (v) => {
    v.sessions = v.sessions.filter((s) => s.hash !== hash);
    clean(v);
  });
}
