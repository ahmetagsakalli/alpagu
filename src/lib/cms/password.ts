import {
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
function scrypt(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) =>
    scryptCallback(
      password,
      salt,
      64,
      { N: 32768, r: 8, p: 1, maxmem: 128 * 1024 * 1024 },
      (e, key) => (e ? reject(e) : resolve(key)),
    ),
  );
}
export async function hashPassword(password: string) {
  if (password.length < 8 || password.length > 256)
    throw new Error("Şifre 8–256 karakter olmalıdır.");
  return hash(password, {
    algorithm: 2, // Argon2id; the package's const enum is not available at runtime.
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
    outputLen: 32,
  });
}
export async function verifyPassword(password: string, stored: string) {
  if (password.length > 256) return false;
  if (stored.startsWith("$argon2id$")) return verify(stored, password);
  const parts = stored.split(":");
  if (
    parts[0] !== "scrypt" ||
    !/^[a-f0-9]{32}$/.test(parts[1] || "") ||
    !/^[a-f0-9]{128}$/.test(parts[2] || "")
  )
    return false;
  const key = await scrypt(password, Buffer.from(parts[1], "hex"));
  return timingSafeEqual(key, Buffer.from(parts[2], "hex"));
}
