import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const outDir = path.join(__dirname, 'dist');
fs.mkdirSync(outDir, { recursive: true });

const banner = `/*! AURA Core Engine v${pkg.version} | MIT License */`;

/**
 * Build outputs:
 * - dist/aura-core.js (IIFE global build, unminified, sourcemap)
 * - dist/aura-core.min.js (IIFE global build, minified, sourcemap)
 */
async function run() {
  const entry = path.join(__dirname, 'src', 'core.js');

  /** @type {import('esbuild').BuildOptions} */
  const base = {
    entryPoints: [entry],
    bundle: true,
    platform: 'browser',
    target: ['es2018'],
    sourcemap: true,
    legalComments: 'none',
    define: {
      __AURA_VERSION__: JSON.stringify(pkg.version)
    }
  };

  await esbuild.build({
    ...base,
    format: 'iife',
    globalName: 'AuraCore',
    outfile: path.join(outDir, 'aura-core.js'),
    banner: { js: banner }
  });

  await esbuild.build({
    ...base,
    format: 'iife',
    globalName: 'AuraCore',
    minify: true,
    outfile: path.join(outDir, 'aura-core.min.js'),
    banner: { js: banner }
  });
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

