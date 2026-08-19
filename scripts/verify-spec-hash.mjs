#!/usr/bin/env node
// The pinned spec must be byte-identical to the artifact recorded when it was
// pinned from tag api-v1.0. If it is not, the SDK has drifted off the frozen
// contract and nothing downstream is trustworthy.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const SPEC = 'openapi/armikom-api.v1.json';
const EXPECTED_FILE = 'openapi/armikom-api.v1.json.sha256';

const expected = readFileSync(EXPECTED_FILE, 'utf8').trim().split(/\s+/)[0];
const actual = createHash('sha256').update(readFileSync(SPEC)).digest('hex');

if (expected !== actual) {
  console.error(`spec hash mismatch\n  expected (${EXPECTED_FILE}): ${expected}\n  actual   (${SPEC}): ${actual}`);
  console.error('Re-pin from the tag: git show api-v1.0:openapi/armikom-api.v1.frozen.json');
  process.exit(1);
}
console.log(`spec hash OK: ${actual}  ${SPEC}`);
