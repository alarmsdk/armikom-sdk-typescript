#!/usr/bin/env node
// Deep-merges openapi/codegen/common.yaml with a per-language file into a single
// JSON config, because openapi-generator accepts only one -c. Language settings
// win on conflict. Output is written with sorted keys so `make generate` is
// byte-deterministic.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { parse } from 'yaml';

const [, , commonPath, langPath, outPath] = process.argv;
if (!commonPath || !langPath || !outPath) {
  console.error('usage: merge-codegen-config.mjs <common.yaml> <lang.yaml> <out.json>');
  process.exit(2);
}

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function deepMerge(base, over) {
  if (!isPlainObject(base) || !isPlainObject(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) {
    out[k] = k in base ? deepMerge(base[k], v) : v;
  }
  return out;
}

function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (!isPlainObject(v)) return v;
  return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]));
}

const merged = sortKeys(
  deepMerge(parse(readFileSync(commonPath, 'utf8')), parse(readFileSync(langPath, 'utf8'))),
);

if (merged.skipValidateSpec !== false) {
  console.error('refusing to generate: skipValidateSpec must be false (W-10 Step 2)');
  process.exit(1);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(merged, null, 2) + '\n');
console.log(`merged codegen config -> ${outPath}`);
