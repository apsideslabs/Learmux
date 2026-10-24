/**
 * Build the marks for the tool directory.
 *
 * 1. Where a tool has a genuine project logo, we take the real mark from
 *    Simple Icons (or SVG Logos) and paint it in the project's brand colour.
 * 2. Every other tool gets a drawn glyph — an original, hand-authored SVG for
 *    that tool's `glyph` name, stroked in its category colour.
 *
 * Either way the tile behind the mark is provided by CSS, so the grid stays
 * even and no entry is ever a blank box.
 *
 * Output: public/logos/<slug>.svg — one per tool.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as si from 'simple-icons';
import logos from '@iconify-json/logos/icons.json' with { type: 'json' };

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(root, 'src/data/tools');
const OUT = join(root, 'public/logos');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

/** Category colours, reused for the drawn glyphs. */
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

/**
 * Tools whose official project mark we can use.
 * `si:` is a Simple Icons slug; `logos:` is an SVG Logos slug.
 */
const BRAND = {
  bash: 'si:gnubash',
  zsh: 'si:zsh',
  vim: 'si:vim',
  neovim: 'si:neovim',
  npm: 'si:npm',
  git: 'si:git',
  python: 'si:python',
  nodejs: 'si:nodedotjs',
  go: 'si:go',
  ruby: 'si:ruby',
  php: 'si:php',
  perl: 'si:perl',
  rust: 'si:rust',
  cmake: 'si:cmake',
  ffmpeg: 'si:ffmpeg',
  pandoc: 'si:pandoc',
  curl: 'si:curl',
  openssl: 'si:openssl',
  gnupg: 'si:gnuprivacyguard',
  wireguard: 'si:wireguard',
  hashcat: 'si:hashcat',
  tshark: 'si:wireshark',
  apt: 'si:debian',
  dpkg: 'si:debian',
  htop: 'si:htop',
  tmux: 'si:tmux',
  openssh: 'si:openbsd',
  rclone: 'si:rclone',
  syncthing: 'si:syncthing',
};

/**
 * Brand colours are used as-is, except where they are so light they would
 * disappear on the pale tile — those fall back to a readable charcoal.
 */
const readable = (hex) => {
  const n = parseInt(hex, 16);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const L =
    0.2126 * lin(((n >> 16) & 255) / 255) +
    0.7152 * lin(((n >> 8) & 255) / 255) +
    0.0722 * lin((n & 255) / 255);
  return L > 0.72 ? '#20212B' : `#${hex}`;
};

/** Brand colours for marks taken from SVG Logos (Simple Icons supplies its own). */
const LOGOS_COLOUR = { micro: '#3b9ad9' };

/* ── drawn glyphs: 24×24, stroked, round caps ─────────────────────────────── */
const S = (d) => `<path d="${d}" fill="none" stroke="{c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
const C = (cx, cy, r, fill = false) =>
  fill
    ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="{c}"/>`
    : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="{c}" stroke-width="1.7"/>`;
const R = (x, y, w, h, rx = 1.4) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="{c}" stroke-width="1.7"/>`;

const GLYPHS = {
  folder: R(3.2, 6.6, 17.6, 11.6, 2.2) + S('M3.2 10h17.6') + S('M9 6.6l1.8-2.4h4.4l1.8 2.4'),
  'folder-search': R(3.2, 6.6, 17.6, 11.6, 2.2) + S('M3.2 10h17.6') + C(13.4, 13.6, 3.1) + S('M15.7 15.9l2.3 2.3'),
  archive: R(3.4, 4.4, 17.2, 4.4, 1.4) + S('M5 8.8v8.6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.8') + S('M10.2 12.6h3.6'),
  sync: S('M4.4 10.4a7.7 7.7 0 0 1 12.9-3.7') + S('M19.6 13.6a7.7 7.7 0 0 1-12.9 3.7') + S('M17.4 3.4v3.6h-3.6') + S('M6.6 20.6v-3.6h3.6'),
  tree: R(3.2, 9.6, 5.2, 4.6) + R(15.6, 4.2, 5.2, 4.6) + R(15.6, 15.2, 5.2, 4.6) + S('M8.4 11.9h3V6.5h4.2') + S('M11.4 11.9v5.6h4.2'),
  magnifier: C(10.6, 10.6, 5.6) + S('M14.8 14.8l4.6 4.6'),
  replace: S('M4.2 8.6h12.6') + S('M13.6 5.6l3 3-3 3') + S('M19.8 15.4H7.2') + S('M10.4 12.4l-3 3 3 3'),
  columns: R(3.4, 4.6, 17.2, 14.8, 2) + S('M9.1 4.6v14.8M14.9 4.6v14.8'),
  braces: S('M9.8 4.4c-2.5 0-2.7 1.7-2.7 3.5s-.4 2.7-1.9 3v2.2c1.5.3 1.9 1.2 1.9 3s.2 3.5 2.7 3.5') + S('M14.2 4.4c2.5 0 2.7 1.7 2.7 3.5s.4 2.7 1.9 3v2.2c-1.5.3-1.9 1.2-1.9 3s-.2 3.5-2.7 3.5'),
  pager: S('M6.2 3.8h7.4l4.4 4.4v11.2a1.8 1.8 0 0 1-1.8 1.8H6.2a1.8 1.8 0 0 1-1.8-1.8V5.6a1.8 1.8 0 0 1 1.8-1.8z') + S('M13.4 3.8v4.6h4.6') + S('M7.6 12.6h8.8M7.6 15.8h6.4'),
  gauge: S('M4.4 17.4a8.6 8.6 0 1 1 15.2 0') + S('M12 17.4l4.2-5.4') + C(12, 17.4, 1.3, true),
  activity: S('M3.4 12.4h4l2-5.4 3.4 10.6 2.2-5.2h5.6'),
  radar: S('M20.4 12a8.4 8.4 0 1 1-2.5-6') + S('M16.4 12a4.4 4.4 0 1 1-1.3-3.1') + S('M12 12l6.4-6.4') + C(12, 12, 1.2, true),
  packets: R(3.4, 5.4, 9.6, 4) + R(3.4, 14.6, 9.6, 4) + S('M15.6 7.4h2.6a1.6 1.6 0 0 1 1.6 1.6v6a1.6 1.6 0 0 1-1.6 1.6h-2.6'),
  dns: R(3.4, 4.6, 17.2, 6, 1.8) + R(3.4, 13.4, 17.2, 6, 1.8) + C(6.9, 7.6, 1.1, true) + C(6.9, 16.4, 1.1, true),
  route: C(5.4, 6.4, 2.2) + C(18.6, 17.6, 2.2) + C(18.6, 6.4, 2.2) + S('M5.4 8.6v4.6a4.4 4.4 0 0 0 4.4 4.4h6.6'),
  signal: C(12, 18.4, 1.1, true) + S('M8.8 15.2a4.6 4.6 0 0 1 6.4 0') + S('M6 12.2a8.6 8.6 0 0 1 12 0') + S('M3.4 9.2a12.4 12.4 0 0 1 17.2 0'),
  download: S('M12 4.4v10.2') + S('M8.2 10.8L12 14.6l3.8-3.8') + S('M4.6 16.4v1.8a2 2 0 0 0 2 2h10.8a2 2 0 0 0 2-2v-1.8'),
  terminal: R(3.2, 4.6, 17.6, 14.8, 2) + S('M7.2 10.2l2.6 2.2-2.6 2.2') + S('M12.4 14.6h4.6'),
  split: R(3.2, 4.6, 17.6, 14.8, 2) + S('M12 4.6v14.8'),
  key: C(8.2, 8.2, 3.8) + S('M10.9 10.9l8.4 8.4') + S('M16.6 16.6l1.9-1.9') + S('M18.9 18.9l1.6-1.6'),
  lock: R(4.6, 10.4, 14.8, 9.2, 2) + S('M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6') + C(12, 15, 1.2, true),
  hash: S('M9.4 3.6L7.6 20.4M16.4 3.6l-1.8 16.8M4.6 8.6h15M3.8 15.4h15'),
  bug: R(7.4, 7.4, 9.2, 11.2, 4.6) + S('M12 7.4V4.6') + S('M7.4 11.4H3.8M7.4 15.4H4.2M16.6 11.4h3.6M16.6 15.4h3.2') + S('M9.6 6.2l1.2-1.6M14.4 6.2l-1.2-1.6'),
  image: R(3.4, 4.8, 17.2, 14.4, 2) + C(8.6, 9.6, 1.6) + S('M3.9 16.8l4.5-4.5 3.6 3.6 3.2-3.2 4.9 4.9'),
  box: S('M12 3.4l8.4 4.6v8L12 20.6l-8.4-4.6v-8z') + S('M3.6 8l8.4 4.6L20.4 8') + S('M12 12.6v8'),
  hex: S('M12 3.4l7.4 4.3v8.6L12 20.6l-7.4-4.3V7.7z') + C(12, 12, 2.5),
  chip: R(7.4, 7.4, 9.2, 9.2, 1.8) + S('M10.4 3.6v3.8M13.6 3.6v3.8M10.4 16.6v3.8M13.6 16.6v3.8M3.6 10.4h3.8M3.6 13.6h3.8M16.6 10.4h3.8M16.6 13.6h3.8'),
  gear: C(12, 12, 3.4) + S('M12 3.4v2.6M12 18v2.6M3.4 12h2.6M18 12h2.6M6.1 6.1l1.8 1.8M16.1 16.1l1.8 1.8M17.9 6.1l-1.8 1.8M7.9 16.1l-1.8 1.8'),
  pen: S('M4.6 19.4l1-4.2L15.8 5a2.1 2.1 0 0 1 3 3L8.8 18.4z') + S('M13.9 6.9l3.2 3.2') + S('M4.6 19.4l4.2-1'),
  code: S('M8.6 7.4L4 12l4.6 4.6') + S('M15.4 7.4L20 12l-4.6 4.6') + S('M13.4 4.8l-2.8 14.4'),
  cloud: S('M7.4 18.6h9.4a3.9 3.9 0 0 0 .5-7.8 5.4 5.4 0 0 0-10.4-1.3A4 4 0 0 0 7.4 18.6z'),
  disk: S('M4.4 6.6c0-1.7 3.4-3 7.6-3s7.6 1.3 7.6 3v10.8c0 1.7-3.4 3-7.6 3s-7.6-1.3-7.6-3z') + S('M4.4 12c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3') + S('M4.4 6.6c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3'),
  doc: S('M6.4 3.8h7l4.2 4.2v12a1.8 1.8 0 0 1-1.8 1.8H6.4a1.8 1.8 0 0 1-1.8-1.8V5.6a1.8 1.8 0 0 1 1.8-1.8z') + S('M13.4 3.8v4.4h4.4'),
  clock: C(12, 12, 8.4) + S('M12 7.2V12l3.4 2'),
  shield: S('M12 3.4l7.4 2.8v5.6c0 4.4-3 7.6-7.4 9.2-4.4-1.6-7.4-4.8-7.4-9.2V6.2z') + S('M9.2 12.2l2 2 3.6-3.8'),
  network: C(12, 5.4, 2.2) + C(5.4, 17.6, 2.2) + C(18.6, 17.6, 2.2) + S('M10.4 7.2l-3.6 8.4M13.6 7.2l3.6 8.4M7.6 17.6h8.8'),
  wand: S('M5 19l10.2-10.2') + S('M14.6 6.2l3.2 3.2') + S('M18.6 3.4l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6z') + S('M6.4 4.2l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L4.4 6.2l1.5-.5z'),
  list: S('M8.4 6.6h11M8.4 12h11M8.4 17.4h11') + C(4.8, 6.6, 1.2, true) + C(4.8, 12, 1.2, true) + C(4.8, 17.4, 1.2, true),
};

/* ── read the dataset ─────────────────────────────────────────────────────── */
const tools = [];
for (const file of readdirSync(DATA).filter((f) => f.endsWith('.ts') && f !== 'types.ts' && f !== 'index.ts')) {
  const src = readFileSync(join(DATA, file), 'utf8');
  for (const block of src.split('\n  {\n').slice(1)) {
    const slug = block.match(/^\s*slug:\s*['"]([^'"]+)['"]/m)?.[1];
    const category = block.match(/^\s*category:\s*['"]([^'"]+)['"]/m)?.[1];
    const glyph = block.match(/^\s*glyph:\s*['"]([^'"]+)['"]/m)?.[1];
    if (slug && category) tools.push({ slug, category, glyph });
  }
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wrap = (inner, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="${escape(label)}">${inner}</svg>`;

let brand = 0;
let drawn = 0;
const unknownGlyph = [];

for (const { slug, category, glyph } of tools) {
  const colour = CATEGORY_COLOUR[category] ?? '#5c6b7f';
  const spec = BRAND[slug];
  let svg = null;

  if (spec?.startsWith('si:')) {
    const key = 'si' + spec.slice(3).replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
    const icon = si[key];
    if (icon) {
      let path = icon.svg.match(/<path[^>]*\/>/)?.[0] ?? '';
      // Simple Icons paths usually carry no fill of their own, so add the brand colour
      const colour = readable(icon.hex);
      path = /fill="/.test(path)
        ? path.replace(/fill="[^"]*"/, `fill="${colour}"`)
        : path.replace('<path', `<path fill="${colour}"`);
      svg = wrap(path, icon.title);
      brand++;
    }
  } else if (spec?.startsWith('logos:')) {
    const icon = logos.icons[spec.slice(6)];
    if (icon) {
      const w = icon.width ?? logos.width ?? 24;
      const h = icon.height ?? logos.height ?? 24;
      const body = `<g fill="${LOGOS_COLOUR[slug] ?? '#20212B'}">${icon.body.replace(/currentColor/g, 'currentColor')}</g>`;
      svg =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(slug)}">${body}</svg>`;
      brand++;
    }
  }

  if (!svg) {
    const g = GLYPHS[glyph];
    if (!g) {
      unknownGlyph.push(`${slug}:${glyph}`);
      svg = wrap(GLYPHS.box.replace(/\{c\}/g, colour), slug);
    } else {
      svg = wrap(g.replace(/\{c\}/g, colour), slug);
    }
    drawn++;
  }

  writeFileSync(join(OUT, `${slug}.svg`), svg);
}

console.log(`tools: ${tools.length} | real brand marks: ${brand} | drawn glyphs: ${drawn}`);
if (unknownGlyph.length) console.log('UNKNOWN GLYPHS:', unknownGlyph.join(', '));
