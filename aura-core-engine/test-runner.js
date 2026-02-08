/**
 * @file test-runner.js
 * Zero-dependency test runner (Node >= 18).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function assert(cond, msg = 'Assertion failed') {
  if (!cond) throw new Error(msg);
}

function eq(a, b, msg = 'Expected values to be equal') {
  const ja = JSON.stringify(a);
  const jb = JSON.stringify(b);
  if (ja !== jb) throw new Error(`${msg}\nA=${ja}\nB=${jb}`);
}

globalThis.__AURA_TEST__ = { assert, eq };

async function run() {
  const testsDir = path.join(__dirname, 'tests');
  const files = fs
    .readdirSync(testsDir)
    .filter((f) => f.endsWith('.test.js'))
    .sort();

  let passed = 0;
  let failed = 0;

  for (const f of files) {
    const url = pathToFileURL(path.join(testsDir, f)).href;
    try {
      const mod = await import(url);
      if (typeof mod.run !== 'function') throw new Error('Test file must export async function run()');
      await mod.run();
      // eslint-disable-next-line no-console
      console.log(`PASS ${f}`);
      passed++;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`FAIL ${f}\n`, e);
      failed++;
    }
  }

  // eslint-disable-next-line no-console
  console.log(`\nDone. Passed: ${passed} Failed: ${failed}`);
  if (failed) process.exitCode = 1;
}

run();

