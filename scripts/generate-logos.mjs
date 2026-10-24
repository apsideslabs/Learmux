/**
 * Build the logo assets for the tool directory.
 *
 *  - Where a tool declares a Simple Icons slug, we extract the real project
 *    mark and paint it in the project's official brand colour.
 *  - Where it does not, we draw an original monogram tile in the category
 *    colour, so every entry has a distinct mark and none is a blank box.
 *
 * Output: public/logos/<slug>.svg  (one per tool)
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as si from 'simple-icons';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'public/logos');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const CATEGORY_COLOUR = {
  files: '#2878d0',
  text: '#c8901f',
  shell: '#128a3e',
  process: '#c9552b',
  network: '#2b8ea0',
  transfer: '#2f9b70',
  security: '#c33f80',
  forensics: '#6d5cc4',
  packages: '#5c6b7f',
  dev: '#3a76b8',
  editors: '#b5712c',
  media: '#a8442f',
  monitor: '#3f8a52',
};

// ── read the tool list straight out of the data module ─────────────────────
const src = readFileSync(join(root, 'src/data/tools.ts'), 'utf8');
const entries = [];
const re = /slug: '([^']+)'[\s\S]*?category: '([^']+)'[\s\S]*?(?:logo: '([^']+)')?[\s\S]*?(?:mono: '([^']+)')?/g;
// simpler and safer: split on object boundaries
for (const block of src.split(/\n  \{/).slice(1)) {
  const slug = block.match(/slug: '([^']+)'/)?.[1];
  const category = block.match(/category: '([^']+)'/)?.[1];
  if (!slug || !category) continue;
  entries.push({
    slug,
    category,
    logo: block.match(/logo: '([^']+)'/)?.[1],
    mono: block.match(/mono: '([^']+)'/)?.[1],
  });
}

function siLookup(slug) {
  const key = 'si' + slug.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
  return si[key];
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let real = 0;
let drawn = 0;
const missing = [];

for (const { slug, category, logo, mono } of entries) {
  const colour = CATEGORY_COLOUR[category] ?? '#5c6b7f';
  let svg;

  const icon = logo ? siLookup(logo) : null;
  if (icon) {
    // pull the path out of the Simple Icons svg and repaint it
    const path = icon.svg.match(/<path[^>]*\/>/)?.[0] ?? '';
    const painted = path.replace(/fill="[^"]*"/, `fill="#${icon.hex}"`);
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="${escape(icon.title)}">${painted}</svg>`;
    real++;
  } else {
    // original monogram tile
    const letters = (mono || slug.slice(0, 2)).toUpperCase().slice(0, 2);
    svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="${escape(letters)}">` +
      `<rect width="24" height="24" rx="5" fill="${colour}"/>` +
      `<text x="12" y="16.2" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#ffffff">${escape(letters)}</text>` +
      `</svg>`;
    drawn++;
  }

  writeFileSync(join(OUT, `${slug}.svg`), svg);
}

console.log(`tools: ${entries.length} | real logos: ${real} | monograms drawn: ${drawn}`);
if (missing.length) console.log('unresolved slugs:', missing.join(', '));
