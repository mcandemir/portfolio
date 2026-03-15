#!/usr/bin/env node
/**
 * Resize event images to max 800px width, output as WebP.
 * Run: node scripts/optimize-event-images.mjs
 */
import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVENTS_DIR = join(__dirname, "../public/events");
const MAX_WIDTH = 800;

async function main() {
  const files = await readdir(EVENTS_DIR);
  const images = files.filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));

  for (const file of images) {
    const inputPath = join(EVENTS_DIR, file);
    const before = (await stat(inputPath)).size;
    const base = file.slice(0, file.lastIndexOf("."));
    const outputPath = join(EVENTS_DIR, `${base}.webp`);

    await sharp(inputPath)
      .resize(MAX_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const after = (await stat(outputPath)).size;
    console.log(`  ${file} → ${base}.webp: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB`);
  }
}

main().catch(console.error);
