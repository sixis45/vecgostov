// Turns the source photos listed in content/site.json into web-ready files:
// AVIF + WebP + JPEG at several widths, written to src/assets/img/ together
// with manifest.json (sizes, colours, file names) that the build reads.
//
//   npm run images           only re-processes photos that changed
//   npm run images -- --all  re-processes everything
//
// Commit src/assets/img/ afterwards. Cloudflare never runs this step.

import { readFile, writeFile, readdir, unlink, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/assets/img');
const MANIFEST = path.join(OUT, 'manifest.json');
const PIPELINE = 'v1'; // bump to force a full rebuild when settings below change

const LADDER = [480, 800, 1200, 1600, 2000];
const FORMATS = {
  avif: (img) => img.avif({ quality: 52, effort: 5 }),
  webp: (img) => img.webp({ quality: 76, effort: 5 }),
  jpg: (img) => img.jpeg({ quality: 76, mozjpeg: true, progressive: true }),
};

const force = process.argv.includes('--all');
const site = JSON.parse(await readFile(path.join(ROOT, 'content/site.json'), 'utf8'));
await mkdir(OUT, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, 'utf8')) : {};
const existing = new Set(await readdir(OUT));

const entries = Object.entries(site.images).filter(([key]) => !key.startsWith('_'));
let processed = 0;

for (const [key, image] of entries) {
  const srcPath = path.join(ROOT, image.src);
  if (!existsSync(srcPath)) {
    console.error(`✗ ${key}: source file not found: ${image.src}`);
    process.exitCode = 1;
    continue;
  }
  const source = await readFile(srcPath);
  const hash = createHash('sha256').update(PIPELINE).update(source).digest('hex').slice(0, 10);
  const prev = manifest[key];
  const complete = prev && prev.hash === hash &&
    Object.values(prev.files).flat().every(([, file]) => existing.has(file));
  if (complete && !force) continue;

  // SVG placeholders are rendered at 2x so every ladder width stays crisp.
  const isSvg = srcPath.endsWith('.svg');
  const base = sharp(source, isSvg ? { density: 144 } : {}).rotate();
  const meta = await base.metadata();
  const srcWidth = isSvg ? Math.round(meta.width) : meta.width;
  const maxWidth = Math.min(srcWidth, 2000);
  const widths = [...new Set([...LADDER.filter((w) => w < maxWidth), maxWidth])];
  const height = Math.round((meta.height / meta.width) * maxWidth);
  const { dominant } = await sharp(source, isSvg ? { density: 36 } : {}).stats();
  const color = '#' + [dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('');

  // Remove this image's old variants.
  for (const file of existing) {
    if (file.startsWith(`${key}-`) && /\.(avif|webp|jpg)$/.test(file) && !(prev && prev.hash === hash)) {
      await unlink(path.join(OUT, file));
      existing.delete(file);
    }
  }

  const files = {};
  for (const [ext, encode] of Object.entries(FORMATS)) {
    files[ext] = [];
    for (const w of widths) {
      const name = `${key}-${w}.${hash}.${ext}`;
      const img = sharp(source, isSvg ? { density: 144 } : {}).rotate().resize({ width: w }).flatten({ background: '#faf6ef' });
      await encode(img).toFile(path.join(OUT, name));
      existing.add(name);
      files[ext].push([w, name]);
    }
  }
  manifest[key] = { src: image.src, hash, width: maxWidth, height, color, files };
  processed++;
  const kb = files.avif.map(([w, n]) => `${w}`).join('/');
  console.log(`✓ ${key} (${kb})`);
}

// Drop manifest entries for images no longer in site.json, and their files.
const keys = new Set(entries.map(([k]) => k));
for (const key of Object.keys(manifest)) {
  if (keys.has(key)) continue;
  for (const [, file] of Object.values(manifest[key].files).flat()) {
    if (existsSync(path.join(OUT, file))) await unlink(path.join(OUT, file));
  }
  delete manifest[key];
  console.log(`– removed ${key}`);
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(processed ? `Done: ${processed} image(s) processed.` : 'All images up to date.');
