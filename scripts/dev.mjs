// Local development: builds, serves dist/ at http://localhost:4321 and rebuilds
// whenever content/site.json, a template, a stylesheet or the script changes.
// Refresh the browser after saving.
//
//   npm run dev

import { spawn, spawnSync } from 'node:child_process';
import { watch } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const build = () => spawnSync(process.execPath, [path.join(ROOT, 'scripts/build.mjs')], { stdio: 'inherit' }).status === 0;

build();
const server = spawn(process.execPath, [path.join(ROOT, 'scripts/serve.mjs')], { stdio: 'inherit' });

let timer;
for (const dir of ['content', 'src']) {
  watch(path.join(ROOT, dir), { recursive: true }, (event, file) => {
    if (!file || file.includes('assets/img')) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log(`\n↻ ${dir}/${file} changed — rebuilding…`);
      build();
    }, 120);
  });
}
process.on('SIGINT', () => { server.kill(); process.exit(0); });
