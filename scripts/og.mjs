// Renders the social preview images (Open Graph, 1200 × 630) for each language
// into src/assets/og/og-<lang>.jpg, using the site's fonts, colours and hero photo.
//
//   npx -y -p playwright@1 node scripts/og.mjs     (needs a Chromium; optional)
//
// Only re-run this when the headline, brand name or hero photo changes, then
// commit src/assets/og/. The build picks the files up automatically.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

let chromium;
try {
  ({ chromium } = (await import('playwright')).default ?? (await import('playwright')));
} catch {
  console.error('Playwright is not installed. Run: npx -y -p playwright@1 node scripts/og.mjs');
  process.exit(1);
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const site = JSON.parse(readFileSync(path.join(ROOT, 'content/site.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(path.join(ROOT, 'src/assets/img/manifest.json'), 'utf8'));
const tokens = readFileSync(path.join(ROOT, 'src/styles/tokens.css'), 'utf8')
  .replace(/url\("\.\.\/assets\/fonts\/([^"]+)"\)/g, (m, f) => `url("data:font/woff2;base64,${readFileSync(path.join(ROOT, 'src/assets/fonts', f)).toString('base64')}")`);
const heroFile = manifest.hero.files.jpg.find(([w]) => w >= 1200)[1];
const hero = `data:image/jpeg;base64,${readFileSync(path.join(ROOT, 'src/assets/img', heroFile)).toString('base64')}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const outDir = path.join(ROOT, 'src/assets/og');
mkdirSync(outDir, { recursive: true });
const tmp = path.join(tmpdir(), `vecgostov-og-${process.pid}`);
mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

for (const lang of site.site.locales) {
  const t = site.i18n[lang];
  const brand = esc(site.BRAND_NAME).replace('č', '<span class="c">č</span>');
  const title = esc(t.hero.title).replace(/\{(.+?)\}/g, '<em>$1</em>');
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${tokens}
  *{box-sizing:border-box;margin:0}
  body{width:1200px;height:630px;overflow:hidden;background:var(--linen);font-family:var(--font-body);color:var(--ink);position:relative}
  .photo{position:absolute;inset:0 0 0 430px;background:url(${hero}) 58% 55%/cover}
  .card{position:absolute;left:56px;top:62px;width:640px;padding:44px 48px 40px;background:var(--paper);border-radius:18px;box-shadow:0 40px 80px -30px rgb(74 52 30/.45),0 4px 12px rgb(74 52 30/.08);transform:rotate(-1.4deg)}
  .brand{font-family:var(--font-display);font-size:34px;font-weight:500;letter-spacing:-.02em}
  .c{color:var(--terra)}
  .kicker{margin-top:26px;font-size:17px;font-weight:650;letter-spacing:.12em;text-transform:uppercase;color:var(--terra)}
  h1{margin-top:12px;font-family:var(--font-display);font-weight:400;font-size:60px;line-height:1.02;letter-spacing:-.03em}
  h1 em{color:var(--terra)}
  .stamp{position:absolute;right:34px;top:-26px;width:78px;height:94px;padding:7px;background:var(--paper);transform:rotate(6deg);box-shadow:0 3px 8px rgb(74 52 30/.2)}
  .stamp div{width:100%;height:100%;background:var(--sun);display:grid;place-items:center;font-family:var(--font-display);font-size:30px}
  </style></head><body><div class="photo"></div><div class="card"><div class="stamp"><div>SI</div></div><p class="brand">${brand}</p><p class="kicker">${esc(t.hero.kicker)}</p><h1>${title}</h1></div></body></html>`;
  const file = path.join(tmp, `og-${lang}.html`);
  writeFileSync(file, html);
  await page.goto(`file://${file}`);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(outDir, `og-${lang}.jpg`));
  console.log(`✓ src/assets/og/og-${lang}.jpg`);
}
await browser.close();
rmSync(tmp, { recursive: true, force: true });
