// Builds the static site into dist/ — the folder Cloudflare Pages publishes.
//
//   npm run build
//
// Reads content/site.json, renders every page from src/templates/, inlines the
// CSS, fingerprints fonts/JS/images for long-term caching, and writes the
// Cloudflare files (_headers with a matching CSP, _redirects, 404.html).

import { readFile, writeFile, mkdir, rm, readdir, copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { renderHome } from '../src/templates/home.mjs';
import { renderDemo } from '../src/templates/demo.mjs';
import { renderNotFound, renderStyleTile } from '../src/templates/pages.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const started = Date.now();

const fail = (msg) => { console.error(`\n✗ Build failed: ${msg}\n`); process.exit(1); };
const hash = (buf, n = 10) => createHash('sha256').update(buf).digest('hex').slice(0, n);

// ---- Load content -----------------------------------------------------------
let site;
try {
  site = JSON.parse(await readFile(path.join(ROOT, 'content/site.json'), 'utf8'));
} catch (err) {
  fail(`content/site.json is not valid JSON.\n  ${err.message}\n  Tip: check for a missing comma or quote near that position.`);
}
const manifestPath = path.join(SRC, 'assets/img/manifest.json');
if (!existsSync(manifestPath)) fail('src/assets/img/manifest.json is missing — run `npm run images` first.');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

validate();

// ---- Assets -----------------------------------------------------------------
await rm(DIST, { recursive: true, force: true });
await mkdir(path.join(DIST, 'assets'), { recursive: true });

const assets = new Map(); // logical name -> public URL
async function emitAsset(logical, file) {
  const data = await readFile(file);
  const ext = path.extname(file);
  const base = path.basename(logical, ext);
  const dir = path.dirname(logical) === '.' ? '' : path.dirname(logical) + '/';
  const name = `${dir}${base}.${hash(data)}${ext}`;
  await mkdir(path.join(DIST, 'assets', dir), { recursive: true });
  await writeFile(path.join(DIST, 'assets', name), data);
  assets.set(logical, `/assets/${name}`);
}
for (const f of await readdir(path.join(SRC, 'assets/fonts'))) {
  if (f.endsWith('.woff2')) await emitAsset(`fonts/${f}`, path.join(SRC, 'assets/fonts', f));
}
await emitAsset('site.js', path.join(SRC, 'scripts/site.js'));
if (existsSync(path.join(SRC, 'assets/og'))) {
  for (const f of await readdir(path.join(SRC, 'assets/og'))) await emitAsset(`og/${f}`, path.join(SRC, 'assets/og', f));
}
// Image variants are already content-hashed by `npm run images`.
for (const entry of Object.values(manifest)) {
  for (const [, file] of Object.values(entry.files).flat()) assets.set(`img/${file}`, `/assets/img/${file}`);
}

function asset(logical, { optional = false } = {}) {
  if (assets.has(logical)) return assets.get(logical);
  if (optional) return '';
  fail(`Unknown asset: ${logical}`);
}

// ---- CSS --------------------------------------------------------------------
const cssCache = new Map();
async function loadCss(name) {
  let css = await readFile(path.join(SRC, 'styles', `${name}.css`), 'utf8');
  css = css.replace(/url\(["']?\.\.\/assets\/([^"')]+)["']?\)/g, (m, p) => `url("${asset(p)}")`);
  return css;
}
const cssSources = {};
for (const f of await readdir(path.join(SRC, 'styles'))) {
  if (f.endsWith('.css')) cssSources[path.basename(f, '.css')] = await loadCss(path.basename(f, '.css'));
}
// Crop focus for each photo, from images.<key>.position in site.json.
cssSources.positions = Object.entries(site.images)
  .filter(([k, v]) => !k.startsWith('_') && v.position)
  .map(([k, v]) => `.obj-${k}{object-position:${v.position}}`).join('');

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}
function css(names) {
  const key = names.join('+');
  if (!cssCache.has(key)) {
    cssCache.set(key, minifyCss([...names, 'positions'].map((n) => {
      if (!(n in cssSources)) fail(`Missing stylesheet src/styles/${n}.css`);
      return cssSources[n];
    }).join('\n')));
  }
  return cssCache.get(key);
}
const preloadFonts = () => ['fonts/fraunces-soft.woff2', 'fonts/figtree.woff2']
  .map((f) => `<link rel="preload" href="${asset(f)}" as="font" type="font/woff2" crossorigin>`);

// ---- Pages ------------------------------------------------------------------
const report = { placeholders: new Set(), drafts: new Set(), images: new Set() };
const pages = [];
const { locales, defaultLocale } = site.site;
const homeOf = (l) => site.i18n[l].paths.home;
const demoOf = (l, slug) => `${site.i18n[l].paths.demos}${slug}/`;

function makeCtx(lang, alternates) {
  return {
    site, lang, t: site.i18n[lang], manifest, report, asset, css, preloadFonts,
    homeUrl: homeOf(lang), alternates,
  };
}
async function writePage(urlPath, html) {
  const file = urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath;
  const out = path.join(DIST, file);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html);
  pages.push({ url: urlPath, file: path.relative(DIST, out), bytes: Buffer.byteLength(html) });
}

for (const lang of locales) {
  const alt = Object.fromEntries(locales.map((l) => [l, homeOf(l)]));
  await writePage(homeOf(lang), renderHome(makeCtx(lang, alt)));
  for (const demo of site.demos) {
    const altDemo = Object.fromEntries(locales.map((l) => [l, demoOf(l, demo.slug)]));
    await writePage(demoOf(lang, demo.slug), renderDemo(makeCtx(lang, altDemo), demo));
  }
}
const defaultAlt = Object.fromEntries(locales.map((l) => [l, homeOf(l)]));
await writePage('/404.html', renderNotFound(makeCtx(defaultLocale, defaultAlt)));
await writePage('/style-tile/', renderStyleTile(makeCtx(defaultLocale, { [defaultLocale]: '/style-tile/' }), cssSources.tokens));

// ---- Copy the images the pages use -------------------------------------------
await mkdir(path.join(DIST, 'assets/img'), { recursive: true });
for (const key of report.images) {
  for (const [, file] of Object.values(manifest[key].files).flat()) {
    await copyFile(path.join(SRC, 'assets/img', file), path.join(DIST, 'assets/img', file));
  }
}

// ---- Static files, _headers with CSP hashes, robots, sitemap -----------------
const styleHashes = new Set();
for (const p of pages) {
  const html = await readFile(path.join(DIST, p.file), 'utf8');
  for (const [, block] of html.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
    styleHashes.add(`'sha256-${createHash('sha256').update(block).digest('base64')}'`);
  }
}
for (const f of await readdir(path.join(SRC, 'static'))) {
  const from = path.join(SRC, 'static', f);
  if (f === '_headers') {
    const tpl = await readFile(from, 'utf8');
    await writeFile(path.join(DIST, '_headers'), tpl.replaceAll('{{STYLE_HASHES}}', [...styleHashes].join(' ')));
  } else if ((await stat(from)).isFile()) {
    await copyFile(from, path.join(DIST, f));
  }
}

const domain = site.site.domain.replace(/\/$/, '');
await writeFile(path.join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /style-tile/\n${domain ? `\nSitemap: ${domain}/sitemap.xml\n` : ''}`);
if (domain) {
  const alts = locales.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${domain}${homeOf(l)}"/>`).join('');
  const urls = locales.map((l) => `<url><loc>${domain}${homeOf(l)}</loc>${alts}</url>`).join('');
  await writeFile(path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>\n`);
}

// ---- Report -----------------------------------------------------------------
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(`\n✓ Built ${pages.length} pages into dist/ in ${Date.now() - started} ms`);
for (const p of pages) console.log(`  ${p.url.padEnd(28)} ${kb(p.bytes)}`);
const illustrated = Object.entries(site.images).filter(([k, v]) => !k.startsWith('_') && v.placeholder).map(([k]) => k);
const todo = [
  report.placeholders.size && `Placeholders to replace in content/site.json: ${[...report.placeholders].join(', ')}`,
  report.drafts.size && `FAQ answers marked "confirm": ${report.drafts.size}`,
  illustrated.length && `Illustrated stand-ins (swap for photos when you have them): ${illustrated.join(', ')}`,
  !domain && 'site.domain is empty — canonical, hreflang, og:url and sitemap.xml are off until you set it.',
].filter(Boolean);
if (todo.length) console.log(`\nStill to do:\n${todo.map((t) => `  • ${t}`).join('\n')}`);
console.log('');

// ---- Validation -------------------------------------------------------------
function validate() {
  if (!site.BRAND_NAME) fail('BRAND_NAME is empty.');
  const { locales, defaultLocale } = site.site;
  if (!locales.includes(defaultLocale)) fail(`defaultLocale "${defaultLocale}" is not in site.locales.`);
  for (const l of locales) if (!site.i18n[l]) fail(`site.locales lists "${l}" but i18n.${l} is missing.`);

  // Every language must have the same structure as the default language.
  const shape = (v, p) => {
    if (Array.isArray(v)) return [`${p}[${v.length}]`, ...v.flatMap((x, i) => shape(x, `${p}[${i}]`))];
    if (v && typeof v === 'object') return Object.keys(v).sort().flatMap((k) => [`${p}.${k}`, ...shape(v[k], `${p}.${k}`)]);
    return [];
  };
  const ref = new Set(shape(site.i18n[defaultLocale], ''));
  for (const l of locales) {
    if (l === defaultLocale) continue;
    const s = new Set(shape(site.i18n[l], ''));
    const missing = [...ref].filter((k) => !s.has(k));
    const extra = [...s].filter((k) => !ref.has(k));
    // Plural forms legitimately differ between languages.
    const real = (list) => list.filter((k) => !/\.facts\.(guests|bedrooms)\.(one|two|few|many|other)$/.test(k));
    if (real(missing).length || real(extra).length) {
      fail(`i18n.${l} does not match i18n.${defaultLocale}.\n  Missing: ${real(missing).slice(0, 12).join(', ') || '—'}\n  Extra: ${real(extra).slice(0, 12).join(', ') || '—'}`);
    }
  }

  const imageKeys = Object.keys(site.images).filter((k) => !k.startsWith('_'));
  for (const key of imageKeys) {
    if (!manifest[key]) fail(`Image "${key}" has not been processed — run \`npm run images\`.`);
    if (manifest[key].src !== site.images[key].src) fail(`Image "${key}" now points to ${site.images[key].src} — run \`npm run images\`.`);
    for (const l of locales) if (!site.i18n[l].alt?.[key]) fail(`Missing alt text i18n.${l}.alt["${key}"].`);
  }
  for (const demo of site.demos) {
    for (const key of [demo.hero, ...demo.gallery]) {
      if (!imageKeys.includes(key)) fail(`Demo "${demo.slug}" uses image "${key}", which is not in images.`);
    }
    for (const l of locales) if (!site.i18n[l].demo.items[demo.slug]) fail(`Missing i18n.${l}.demo.items.${demo.slug}.`);
  }
}
