import { spawn } from "node:child_process";
import { randomBytes, scryptSync } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
const dir = await mkdtemp(path.join(tmpdir(), "alpagu-cms-test-"));
const salt = randomBytes(16);
const hash = `scrypt:${salt.toString("hex")}:${scryptSync("Only-for-local-tests-79", salt, 64, { N: 32768, r: 8, p: 1, maxmem: 128 * 1024 * 1024 }).toString("hex")}`;
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3100",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      CMS_LOCAL_DIR: dir,
      CMS_PASSWORD_HASH: hash,
      CMS_PRIVATE_STORE_ID: "",
      CMS_PUBLIC_STORE_ID: "",
      CMS_ORIGIN: "http://127.0.0.1:3100",
      VERCEL: "",
      SITE_INDEXABLE: "true",
    },
  },
);
let ending = false;
async function stop() {
  if (ending) return;
  ending = true;
  child.kill("SIGTERM");
  await rm(dir, { recursive: true, force: true });
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
child.on("exit", async (code) => {
  await stop();
  process.exit(code ?? 0);
});
