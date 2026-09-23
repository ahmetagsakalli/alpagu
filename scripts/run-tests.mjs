import { spawnSync } from "node:child_process";
const env = {
  ...process.env,
  SITE_INDEXABLE: "true",
  NEXT_PUBLIC_SITE_URL: "https://alpagu-dernegi.vercel.app",
};
for (const args of [
  ["node_modules/next/dist/bin/next", "build"],
  ["node_modules/@playwright/test/cli.js", "test"],
]) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit", env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
