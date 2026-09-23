import sharp from "sharp";
import { copyFile, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
const input = path.resolve(process.argv[2] || "../../work/assets");
const output = path.resolve("public/images");
await mkdir(output, { recursive: true });
const report = [];
for (const name of await readdir(input)) {
  if (!/\.(png|jpe?g|webp|avif)$/i.test(name)) continue;
  const source = path.join(input, name);
  const slug = path.parse(name).name;
  const target = path.join(output, `${slug}.webp`);
  await sharp(source)
    .rotate()
    .resize({
      width: slug === "logo" ? 256 : slug.startsWith("news-") ? 960 : 1920,
      withoutEnlargement: true,
    })
    .webp({ quality: slug === "logo" ? 90 : 78, effort: 6 })
    .toFile(target);
  const original = (await stat(source)).size;
  let optimized = (await stat(target)).size;
  if (/\.webp$/i.test(name) && optimized > original) {
    await copyFile(source, target);
    optimized = original;
  }
  report.push({
    file: `${slug}.webp`,
    original,
    optimized,
    savedPercent: Math.round((1 - optimized / original) * 100),
  });
}
await writeFile("image-optimization.json", JSON.stringify(report, null, 2));
console.table(report);
