/**
 * Compresses photos in public/images (max width 2048px).
 * PNGs with photo content are saved as high-quality JPEG unless they need alpha.
 * Run after adding new assets: npm run optimize-images
 */
import { readdir, rename, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "..", "public", "images");
const MAX_WIDTH = 2048;
const MIN_SAVINGS_RATIO = 0.05;

async function hasAlpha(filePath) {
  const { channels, hasAlpha: metaAlpha } = await sharp(filePath).metadata();
  return metaAlpha === true || channels === 4;
}

async function optimizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) return null;

  const before = (await stat(filePath)).size;
  const tmp = `${filePath}.opt`;
  const alpha = ext === ".png" ? await hasAlpha(filePath) : false;

  let pipeline = sharp(filePath).rotate().resize({
    width: MAX_WIDTH,
    withoutEnlargement: true,
  });

  let outPath = filePath;

  if (ext === ".webp") {
    await pipeline.webp({ quality: 82, effort: 4 }).toFile(tmp);
  } else if (ext === ".png" && alpha) {
    await pipeline
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(tmp);
  } else if (ext === ".png") {
    const jpegPath = filePath.replace(/\.png$/i, ".jpg");
    await pipeline.jpeg({ quality: 85, mozjpeg: true }).toFile(tmp);
    outPath = jpegPath;
  } else {
    await pipeline.jpeg({ quality: 85, mozjpeg: true }).toFile(tmp);
  }

  const after = (await stat(tmp)).size;
  if (after >= before * (1 - MIN_SAVINGS_RATIO)) {
    await unlink(tmp);
    return null;
  }

  if (outPath !== filePath) {
    await unlink(filePath);
  }
  await rename(tmp, outPath);
  return {
    file: path.basename(outPath),
    before,
    after,
    converted: outPath !== filePath,
  };
}

const files = await readdir(imagesDir);
let saved = 0;

for (const name of files) {
  const full = path.join(imagesDir, name);
  try {
    const result = await optimizeFile(full);
    if (!result) continue;
    saved += result.before - result.after;
    const pct = Math.round((1 - result.after / result.before) * 100);
    const note = result.converted ? " (PNG→JPEG)" : "";
    console.log(
      `${result.file}${note}: ${(result.before / 1024).toFixed(0)}KB → ${(result.after / 1024).toFixed(0)}KB (${pct}% smaller)`
    );
  } catch (err) {
    console.warn(`Skipped ${name}:`, err.message);
  }
}

console.log(`\nDone. Saved ~${(saved / 1024 / 1024).toFixed(1)} MB total.`);
