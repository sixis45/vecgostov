import { readFile,writeFile,mkdir } from 'node:fs/promises';
const assets=JSON.parse(await readFile('dist/asset-manifest.json','utf8'));
const initial=['/',assets.css,assets.js,assets.favicon,assets['interior-900.webp']];
const complete=[...initial,assets['lake-900.webp']];
const measurements=[];
for(const url of complete){const res=await fetch(`http://127.0.0.1:4173${url}`,{headers:{'Accept-Encoding':'identity','Cache-Control':'no-cache'}});if(!res.ok)throw new Error(`${url}: ${res.status}`);measurements.push({url,bytes:(await res.arrayBuffer()).byteLength,encoding:res.headers.get('content-encoding')||'identity',csp:res.headers.get('content-security-policy'),cache:res.headers.get('cache-control')});}
const report={conditions:'Local HTTP, fresh independent requests, identity encoding, body bytes excluding HTTP headers. 900px image variants; repeat use of interior shares one URL. No external fonts. Not browser Resource Timing or Core Web Vitals.',initialBytes:measurements.slice(0,initial.length).reduce((n,r)=>n+r.bytes,0),totalBytes:measurements.reduce((n,r)=>n+r.bytes,0),measurements};
await mkdir('.qa',{recursive:true});await writeFile('.qa/transfer-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
