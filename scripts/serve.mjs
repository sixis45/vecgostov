// Serves dist/ locally the way Cloudflare Pages does: clean URLs, the rules in
// _headers (including the CSP), _redirects, and 404.html for unknown paths.
//
//   npm run preview            → http://localhost:4321
//   PORT=8080 npm run preview

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'dist');
const PORT = Number(process.env.PORT) || 4321;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
};

function parseRules(file) {
  if (!existsSync(file)) return [];
  const rules = [];
  let current = null;
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) { current = { pattern: line.trim(), set: [], detach: [] }; rules.push(current); continue; }
    const t = line.trim();
    if (t.startsWith('!')) current.detach.push(t.slice(1).trim().toLowerCase());
    else { const i = t.indexOf(':'); current.set.push([t.slice(0, i).trim(), t.slice(i + 1).trim()]); }
  }
  return rules;
}
const toRegex = (pattern) => new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
// Re-read on every request so a rebuild (new CSP hashes) is picked up at once.
const loadHeaderRules = () => parseRules(path.join(ROOT, '_headers')).map((r) => ({ ...r, re: toRegex(r.pattern) }));
const loadRedirects = () => existsSync(path.join(ROOT, '_redirects'))
  ? readFileSync(path.join(ROOT, '_redirects'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    .map((l) => { const [from, to, code = '302'] = l.split(/\s+/); return { from, to, code: Number(code) }; })
  : [];

function headersFor(urlPath) {
  const headerRules = loadHeaderRules();
  const out = new Map();
  for (const rule of headerRules) {
    if (!rule.re.test(urlPath)) continue;
    for (const name of rule.detach) out.delete(name);
    for (const [k, v] of rule.set) out.set(k.toLowerCase(), out.has(k.toLowerCase()) ? `${out.get(k.toLowerCase())}, ${v}` : v);
  }
  return Object.fromEntries(out);
}

async function resolve(urlPath) {
  let p = path.join(ROOT, decodeURIComponent(urlPath));
  if (!p.startsWith(ROOT)) return null;
  if (existsSync(p) && (await stat(p)).isDirectory()) {
    if (!urlPath.endsWith('/')) return { redirect: urlPath + '/' };
    p = path.join(p, 'index.html');
  }
  if (existsSync(p) && (await stat(p)).isFile()) return { file: p };
  if (existsSync(p + '.html')) return { file: p + '.html' };
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  for (const r of loadRedirects()) {
    const m = r.from.endsWith('/*') ? url.pathname.startsWith(r.from.slice(0, -1)) || url.pathname === r.from.slice(0, -2) : url.pathname === r.from;
    if (!m) continue;
    const splat = r.from.endsWith('/*') ? url.pathname.slice(r.from.length - 1) : '';
    res.writeHead(r.code, { Location: r.to.replace(':splat', splat) });
    return res.end();
  }
  const found = await resolve(url.pathname);
  if (found?.redirect) { res.writeHead(308, { Location: found.redirect + url.search }); return res.end(); }
  const file = found?.file ?? path.join(ROOT, '404.html');
  const status = found ? 200 : 404;
  const body = await readFile(file);
  res.writeHead(status, {
    'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
    'Content-Length': body.length,
    ...headersFor(url.pathname),
  });
  res.end(req.method === 'HEAD' ? undefined : body);
}).listen(PORT, () => console.log(`Serving dist/ at http://localhost:${PORT}  (Ctrl+C to stop)`));
