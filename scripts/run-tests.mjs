/**
 * Test runner: bundle the TypeScript engine test with esbuild, then run it.
 * Keeps `npm test` dependency-light and fast.
 */

import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outfile = resolve(__dirname, '../.test-engine.mjs');

await build({
  entryPoints: [resolve(__dirname, 'test-engine.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  logLevel: 'warning',
});

await import(pathToFileURL(outfile).href);
