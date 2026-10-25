/**
 * Rasterises the lesson thumbnails into PNGs for link previews.
 *
 * The thumbnails are 1200x675 SVGs, which is the right shape for an og:image,
 * but almost nothing that renders a link preview will accept an SVG. Facebook,
 * Twitter, LinkedIn, Slack and WhatsApp all want a raster. So the artwork is
 * drawn once as SVG and converted here, rather than maintained twice.
 *
 * The PNGs are committed alongside the SVGs, the same way the SVGs are, so the
 * build needs neither a browser nor this script.
 *
 *   node scripts/generate-og.mjs
 *
 * Requires Chrome at the path below. On another machine, set CHROME_PATH.
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../public/thumbs');
const OUT = resolve(__dirname, '../public/og');
const CHROME = process.env.CHROME_PATH ?? '/usr/local/bin/google-chrome';

const W = 1200;
const H = 675;

mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith('.svg')).sort();
console.log(`rasterising ${files.length} thumbnails at ${W}x${H}`);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

let total = 0;
for (const file of files) {
  const slug = basename(file, '.svg');
  const svg = readFileSync(join(SRC, file), 'utf8');

  // The SVGs carry their own viewBox; pin the rendered size so the screenshot
  // is exactly 1200x675 rather than whatever the intrinsic size happens to be.
  const sized = svg.replace(/<svg\b([^>]*?)\bwidth="[^"]*"/, '<svg$1').replace(
    /<svg\b([^>]*?)\bheight="[^"]*"/,
    '<svg$1',
  );

  await page.setContent(
    `<html><head><style>html,body{margin:0;padding:0;background:#101419}</style></head>
     <body>${sized.replace(/<svg /, `<svg width="${W}" height="${H}" `)}</body></html>`,
    { waitUntil: 'load' },
  );

  const out = join(OUT, `${slug}.png`);
  await page.screenshot({ path: out, type: 'png' });
  total += statSync(out).size;
}

await browser.close();
console.log(`wrote ${files.length} PNGs, ${(total / 1024 / 1024).toFixed(1)} MB in total`);
