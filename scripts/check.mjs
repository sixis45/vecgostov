// Checks the built site in dist/ (run `npm run check`, which builds first).
// No dependencies. Exits with code 1 if anything is broken.
//
//  • every internal link, image, srcset entry and #anchor resolves
//  • one <h1> per page, lang set, every <img> has alt text
//  • the CSP in _headers covers every inline <style> block
//  • Cloudflare files are present (_headers, _redirects, 404.html, robots.txt)
//  • no "undefined" / "NaN" / "[object Object]" leaked into a page

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const DIST = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'dist');
const errors = [];
const warn = [];
const walk = (d) => readdirSync(d).flatMap((f) => { const p = path.join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const pages = walk(DIST).filter((f) => f.endsWith('.html'));
const idsByFile = new Map();
const idsOf = (file) => {
  if (!idsByFile.has(file)) idsByFile.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return idsByFile.get(file);
};
const resolve = (urlPath) => {
  const p = path.join(DIST, decodeURIComponent(urlPath));
  if (existsSync(p) && statSync(p).isDirectory()) return existsSync(path.join(p, 'index.html')) ? path.join(p, 'index.html') : null;
  if (existsSync(p)) return p;
  if (existsSync(p + '.html')) return p + '.html';
  return null;
};

for (const file of ['_headers', '_redirects', '404.html', 'robots.txt', 'favicon.ico', 'favicon.svg']) {
  if (!existsSync(path.join(DIST, file))) errors.push(`Missing dist/${file}`);
}

const headers = existsSync(path.join(DIST, '_headers')) ? readFileSync(path.join(DIST, '_headers'), 'utf8') : '';
let links = 0;
for (const file of pages) {
  const rel = '/' + path.relative(DIST, file);
  const html = readFileSync(file, 'utf8');
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${rel}: ${h1} <h1> elements (expected 1)`);
  if (!/<html lang="[a-z]{2}">/.test(html)) errors.push(`${rel}: <html lang> missing`);
  for (const [img] of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(img)) errors.push(`${rel}: <img> without alt: ${img.slice(0, 80)}`);
  const text = html.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');
  for (const bad of ['undefined', 'NaN', '[object Object]']) if (text.includes(bad)) errors.push(`${rel}: contains "${bad}"`);
  for (const [, block] of html.matchAll(/<style>([\s\S]*?)<\/style>/g)) {
    const h = `'sha256-${createHash('sha256').update(block).digest('base64')}'`;
    if (!headers.includes(h)) errors.push(`${rel}: inline <style> not allowed by the CSP in _headers`);
  }
  const urls = [
    ...[...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(' ')[0])),
    ...[...html.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]),
  ];
  for (const raw of urls) {
    const u = raw.replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|data:)/.test(u)) continue;
    links++;
    const [p, hash] = u.split('#');
    const target = p === '' ? file : resolve(p.startsWith('/') ? p : path.posix.join(path.posix.dirname(rel), p));
    if (!target) { errors.push(`${rel}: broken link ${u}`); continue; }
    if (hash && target.endsWith('.html') && !idsOf(target).has(hash)) errors.push(`${rel}: missing anchor ${u}`);
  }
  const placeholders = (html.match(/class="ph"/g) || []).length;
  if (placeholders && !rel.includes('style-tile')) warn.push(`${rel}: ${placeholders} placeholder value(s) still marked`);
}

console.log(`Checked ${pages.length} pages and ${links} internal links/assets.`);
if (warn.length) console.log(`\nReminders:\n${warn.map((w) => `  • ${w}`).join('\n')}`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s):\n${errors.map((e) => `  • ${e}`).join('\n')}`);
  process.exit(1);
}
console.log('\n✓ All checks passed.');
