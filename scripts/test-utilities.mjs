/**
 * Bundles the utility tests with esbuild and runs them.
 *
 * The tests live in TypeScript so they can import the same modules the site
 * ships. esbuild is already a dependency, so this stays a two-second job.
 *
 *   node scripts/test-utilities.mjs
 */

import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outfile = resolve(__dirname, '../.test-utilities.mjs');

await build({
  entryPoints: [resolve(__dirname, 'test-utilities.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  logLevel: 'warning',
});

await import(pathToFileURL(outfile).href);
