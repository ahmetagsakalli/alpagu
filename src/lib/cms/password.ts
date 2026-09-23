import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from "node:crypto";
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
  const salt = randomBytes(16);
  return `scrypt:${salt.toString("hex")}:${(await scrypt(password, salt)).toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
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
