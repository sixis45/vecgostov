import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

const root = path.resolve('dist');
const site = JSON.parse(await readFile('content/site.json','utf8'));
const errors = [];
const pages = [];
async function walk(dir) { for (const name of await readdir(dir)) { const file = path.join(dir,name); if ((await stat(file)).isDirectory()) await walk(file); else if(name.endsWith('.html')) pages.push(file); } }
await walk(root);
for (const file of pages) {
  const html = await readFile(file,'utf8');
  const relative = path.relative(root,file).replaceAll('\\','/');
  if ((html.match(/<h1[ >]/g)||[]).length !== 1) errors.push(`${relative}: expected one h1`);
  if (/<form[ >]|<iframe[ >]/.test(html)) errors.push(`${relative}: unexpected form or iframe`);
  if (!html.includes(`<html lang="${relative.startsWith('en/')?'en':'sl'}"`)) errors.push(`${relative}: wrong language`);
  if (html.includes('undefined') || html.includes('PENDING')) errors.push(`${relative}: unresolved content`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (/^(?:https?:|mailto:|tel:|data:)/.test(url)) continue;
    const [pathname,hash] = url.split('#');
    let target = pathname ? path.join(root,pathname) : file;
    try {
      if ((await stat(target)).isDirectory()) target=path.join(target,'index.html');
      const data = await readFile(target);
      if (hash && !data.toString().includes(`id="${hash}"`)) errors.push(`${relative}: missing anchor ${url}`);
    } catch { errors.push(`${relative}: missing asset or route ${url}`); }
  }
  for (const tag of html.match(/<img[^>]+>/g)||[]) {
    if (!/alt="[^\"]+"/.test(tag)||!tag.includes('width=')||!tag.includes('height=')||!tag.includes('srcset=')||!tag.includes('sizes=')) errors.push(`${relative}: image attributes`);
  }
  const eager = (html.match(/loading="eager"/g)||[]).length;
  if (!relative.includes('style-tile') && relative !== '404.html' && eager !== 1) errors.push(`${relative}: expected one eager hero`);
}
for (const file of ['_headers','_redirects','404.html','robots.txt']) assert((await stat(path.join(root,file))).isFile(),`${file} missing`);
function shape(value,prefix='') { return Object.entries(value).flatMap(([k,v]) => typeof v==='object' && v!==null ? shape(v,`${prefix}${k}.`) : [`${prefix}${k}`]).sort(); }
assert.deepEqual(shape(site.locales.sl),shape(site.locales.en),'Translation structure must match');
for (const img of Object.values(site.images)) assert(img.source.startsWith('https://') && img.license && img.replaceable,'Image attribution incomplete');
const rgb = h => h.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
const lum = h => rgb(h).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
const contrasts = [['28473c','faf8f3'],['505951','faf8f3'],['a4452c','fffefa'],['326371','e7eeeb'],['505951','eeefe7'],['d5ded4','28473c'],['60695f','faf8f3']].map(([fg,bg]) => { const [a,b]=[lum(fg),lum(bg)].sort((a,b)=>b-a); const ratio=(a+.05)/(b+.05); assert(ratio>=4.5,`Contrast ${fg}/${bg}: ${ratio}`);return {foreground:fg,background:bg,ratio:ratio.toFixed(2)}; });
const manifest = JSON.parse(await readFile(path.join(root,'asset-manifest.json'),'utf8'));
const size = async url => (await stat(path.join(root,url))).size;
const html = await readFile(path.join(root,'index.html'));
const css = await readFile(path.join(root,manifest.css));
const js = await readFile(path.join(root,manifest.js));
const report={date:new Date().toISOString(),pages:pages.length,errors,contrasts,bytes:{html:html.length,css:css.length,javascript:js.length,compressedTextGzip: gzipSync(html).length+gzipSync(css).length+gzipSync(js).length,hero480:await size(manifest['interior-480.webp']),hero900:await size(manifest['interior-900.webp']),hero1600:await size(manifest['interior-1600.webp']),fullPage900:html.length+css.length+js.length+await size(manifest['interior-900.webp'])+await size(manifest['lake-900.webp'])}};
await import('node:fs/promises').then(fs=>fs.mkdir('.qa',{recursive:true}));
await import('node:fs/promises').then(fs=>fs.writeFile('.qa/static-report.json',JSON.stringify(report,null,2)));
console.log(JSON.stringify(report,null,2));
if(errors.length) process.exitCode=1;
