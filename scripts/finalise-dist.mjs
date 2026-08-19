#!/usr/bin/env node
// 1. Marks dist/cjs as CommonJS and dist/esm as ESM, so both halves of the dual
//    build resolve correctly under a "type": "module" root package.
// 2. Rewrites extensionless relative imports in dist/esm to explicit .js.
//    openapi-generator emits `from './runtime'`; Node's ESM resolver requires
//    the extension. Without this the ESM half only works through a bundler.
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir) =>
  readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

if (existsSync('dist/cjs')) writeFileSync('dist/cjs/package.json', '{\n  "type": "commonjs"\n}\n');
if (!existsSync('dist/esm')) process.exit(0);
writeFileSync('dist/esm/package.json', '{\n  "type": "module"\n}\n');

// `from './x'` / `import('./x')` -> `from './x.js'`; './x/' -> './x/index.js'
const RE = /(\bfrom\s*|\bimport\s*\(\s*)(['"])(\.{1,2}\/[^'"]*?)\2/g;
let touched = 0;
for (const file of walk('dist/esm')) {
  if (!/\.(js|d\.ts)$/.test(file)) continue;
  const src = readFileSync(file, 'utf8');
  const out = src.replace(RE, (m, kw, q, spec) => {
    if (/\.(js|json|mjs|cjs)$/.test(spec)) return m;
    const dir = join(file, '..', spec);
    const target = existsSync(dir) && statSync(dir).isDirectory() ? `${spec}/index.js` : `${spec}.js`;
    return `${kw}${q}${target}${q}`;
  });
  if (out !== src) {
    writeFileSync(file, out);
    touched++;
  }
}
console.log(`finalise-dist: rewrote relative imports in ${touched} ESM file(s)`);
