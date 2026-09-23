import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import './build.mjs';
const root = path.resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.txt':'text/plain; charset=utf-8','.xml':'application/xml','.woff2':'font/woff2'};
const csp = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'";
http.createServer(async(req,res)=>{
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const headers = {'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Content-Security-Policy':csp,'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()','Cache-Control':pathname.startsWith('/assets/')?'public, max-age=31536000, immutable':'public, max-age=0, must-revalidate'};
  try {
    const file = path.resolve(root, '.' + decodeURIComponent(pathname));
    if (!file.startsWith(root+path.sep) && file !== root) throw new Error('Invalid path');
    let target = file;
    if ((await stat(target)).isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(301, {Location:pathname+'/'}); res.end(); return; }
      target = path.join(target,'index.html');
    }
    const body = await readFile(target);
    res.writeHead(200, {...headers, 'Content-Type':types[path.extname(target)]||'application/octet-stream','Content-Length':body.length});
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, {...headers,'Content-Type':'text/html; charset=utf-8'});
    res.end(await readFile(path.join(root,'404.html')));
  }
}).listen(4173,'127.0.0.1',()=>console.log('Več gostov preview: http://127.0.0.1:4173'));
