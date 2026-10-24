/**
 * Generates the original thumbnail artwork for each lesson.
 *
 * Deliberately calm: a flat dark field, one accent rule, and a single terminal
 * card with large monospace lines. No grid, no glow, no decoration that does
 * not carry information — small thumbnails need to stay legible and quiet.
 *
 * Everything is drawn from scratch and written into public/thumbs/, so the site
 * ships locally-stored, original assets.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/thumbs');
mkdirSync(OUT, { recursive: true });

const W = 1200;
const H = 675;
const BG = '#101419';

/** slug, category, accent, and up to three terminal lines */
const thumbs = [
  { slug: 'getting-started', accent: '#20d65a', lines: ['$ pwd', '/data/data/com.termux/files/home', '$ whoami'] },
  { slug: 'navigating-the-filesystem', accent: '#2878d0', lines: ['$ ls -la', 'drwxr-xr-x  projects', '$ cd projects/android'] },
  { slug: 'reading-and-searching-text', accent: '#f3bc36', lines: ['$ grep -n "error" access.log', '42: error: vault sealed', '$ wc -l access.log'] },
  { slug: 'pipes-and-redirection', accent: '#e8734a', lines: ['$ cat log | grep 500 | head', '500 GET /flag', '$ ls -l > listing.txt'] },
  { slug: 'file-permissions', accent: '#35b0c4', lines: ['$ ls -l', '-rw-rw-rw- shared.ini', '$ chmod 600 id_rsa'] },
  { slug: 'managing-packages', accent: '#8b7cd8', lines: ['$ pkg update', '$ pkg install nmap', 'Setting up nmap ...'] },
  { slug: 'encoding-and-hashes', accent: '#e0559a', lines: ['$ base64 -d encoded.txt', 'TERMUX{...}', '$ sha256sum backup_a.txt'] },
  { slug: 'networking-basics', accent: '#3fb98a', lines: ['$ nmap -sV 127.0.0.1', '1337/tcp open  waste', '$ ssh player@host'] },
  { slug: 'shell-scripting-basics', accent: '#20d65a', lines: ['$ cat backup.sh', '#!/bin/sh', '$ ./backup.sh'] },
  { slug: 'processes-and-jobs', accent: '#e8734a', lines: ['$ ps aux', 'player  1420  backup --token', '$ kill 1420'] },
  { slug: 'ssh-and-remote-work', accent: '#2878d0', lines: ['$ ssh-keygen -t ed25519', 'Your public key has been saved', '$ ssh player@host'] },
  { slug: 'shell-config-and-aliases', accent: '#f3bc36', lines: ['$ cat ~/.bashrc', "alias ll='ls -la'", '$ source ~/.bashrc'] },
];

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function thumb({ accent, lines }) {
  const x = 84;
  const y = 104;
  const w = W - x * 2;
  const h = H - y * 2;
  const bar = 58;
  const lineX = x + 48;
  const fontSize = 50;
  const step = 92;
  // centre the block of text vertically inside the card, so the card never
  // looks bottom-heavy whatever the line count
  const blockH = (lines.length - 1) * step;
  const first = y + bar + (h - bar - blockH) / 2 + fontSize * 0.35;

  const rows = lines
    .map((line, i) => {
      const isCmd = line.startsWith('$');
      const fill = isCmd ? '#eef1f5' : '#8b95a3';
      const yy = Math.round(first + i * step);
      return `<text x="${lineX}" y="${yy}" font-family="'JetBrains Mono', 'DejaVu Sans Mono', monospace" font-size="${fontSize}" fill="${fill}">${esc(line)}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${accent}"/>

  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#0b0e12" stroke="#232a33" stroke-width="2"/>
  <path d="M${x} ${y + 10} a10 10 0 0 1 10 -10 h${w - 20} a10 10 0 0 1 10 10 v${bar - 10} h-${w} z" fill="#161c23"/>

  <circle cx="${x + 34}" cy="${y + bar / 2}" r="7" fill="${accent}"/>
  <circle cx="${x + 62}" cy="${y + bar / 2}" r="7" fill="#333d47"/>
  <circle cx="${x + 90}" cy="${y + bar / 2}" r="7" fill="#333d47"/>

  ${rows}
</svg>
`;
}

for (const t of thumbs) {
  writeFileSync(resolve(OUT, `${t.slug}.svg`), thumb(t), 'utf8');
  console.log('wrote', `${t.slug}.svg`);
}

writeFileSync(
  resolve(OUT, 'default.svg'),
  thumb({ accent: '#20d65a', lines: ['$ help', 'lear mux sandbox', '$ ls'] }),
  'utf8'
);
console.log('wrote default.svg');
