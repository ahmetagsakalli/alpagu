import { randomBytes, scryptSync } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
if (!process.stdin.isTTY)
  throw new Error("Şifre kurulumu etkileşimli terminalde çalıştırılmalıdır.");
process.stdout.write("Yeni yönetim şifresi (yazarken görünmez): ");
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();
let password = "";
process.stdin.on("keypress", async (text, key) => {
  if (key?.ctrl && key.name === "c") {
    process.stdout.write("\n");
    process.exit(130);
  }
  if (key?.name === "backspace") {
    password = password.slice(0, -1);
    return;
  }
  if (key?.name === "return") {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdout.write("\n");
    if (password.length < 8 || password.length > 256) {
      process.stderr.write("Şifre 8–256 karakter olmalıdır.\n");
      process.exit(1);
    }
    const salt = randomBytes(16),
      hash = `scrypt:${salt.toString("hex")}:${scryptSync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 128 * 1024 * 1024 }).toString("hex")}`;
    password = "";
    const envPath = path.resolve(".env.local");
    let env = "";
    try {
      env = await readFile(envPath, "utf8");
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    env = env.replace(/^CMS_PASSWORD_HASH=.*\r?\n?/gm, "");
    await writeFile(
      envPath,
      env.trimEnd() + `\nCMS_PASSWORD_HASH='${hash}'\n`,
      { mode: 0o600 },
    );
    await mkdir(".cms", { recursive: true, mode: 0o700 });
    await writeFile(".cms/password-hash", hash, { mode: 0o600 });
    process.stdout.write(
      "Şifre hash olarak .env.local dosyasına kaydedildi. Canlı ortam için docs/ADMIN.md yönergelerini uygulayın.\n",
    );
    process.exit(0);
  }
  if (text && !key?.ctrl && !key?.meta) password += text;
});
