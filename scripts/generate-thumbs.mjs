/**
 * Generates the original thumbnail artwork for each lesson.
 *
 * Everything is drawn from scratch as SVG and written into public/thumbs/, so
 * the site ships locally-stored, original assets and never depends on a remote
 * image that might disappear.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/thumbs');
mkdirSync(OUT, { recursive: true });

const W = 1200;
const H = 675;

/** slug, category label, accent, and the terminal lines drawn on the card */
const thumbs = [
  { slug: 'getting-started', cat: 'Termux', accent: '#20d65a', lines: ['$ pwd', '/data/data/com.termux/files/home', '$ whoami', 'player'] },
  { slug: 'navigating-the-filesystem', cat: 'Filesystem', accent: '#2878d0', lines: ['$ ls -la', 'drwxr-xr-x  projects', '$ cd projects/android'] },
  { slug: 'reading-and-searching-text', cat: 'Text', accent: '#f3bc36', lines: ['$ grep -n "error" access.log', '42: error: vault sealed', '$ wc -l access.log', '118 access.log'] },
  { slug: 'pipes-and-redirection', cat: 'Pipes', accent: '#e8734a', lines: ['$ cat log | grep 500 | head', '500 GET /flag', '$ ls -l > listing.txt'] },
  { slug: 'file-permissions', cat: 'Permissions', accent: '#35b0c4', lines: ['$ ls -l', '-rw-rw-rw- shared.ini', '$ chmod 600 id_rsa'] },
  { slug: 'managing-packages', cat: 'Packages', accent: '#8b7cd8', lines: ['$ pkg update', '$ pkg install nmap', 'Setting up nmap ...'] },
  { slug: 'encoding-and-hashes', cat: 'Encoding', accent: '#e0559a', lines: ['$ base64 -d encoded.txt', 'TERMUX{...}', '$ sha256sum backup_a.txt', 'f6dae38e…  backup_a.txt'] },
  { slug: 'networking-basics', cat: 'Networking', accent: '#3fb98a', lines: ['$ nmap -sV 127.0.0.1', '1337/tcp open  waste', '$ curl http://host/flag', '{"flag":"…"}'] },
];

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function thumb({ cat, accent, lines }) {
  const cardX = 96;
  const cardY = 104;
  const cardW = 1008;
  const cardH = 486;

  const rows = lines
    .map((line, i) => {
      const isCmd = line.startsWith('$');
      const color = isCmd ? '#eef1f5' : '#8b95a3';
      const y = cardY + 118 + i * 82;
      return `<text x="${cardX + 44}" y="${y}" font-family="'JetBrains Mono', monospace" font-size="40" fill="${color}">${esc(line)}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#1b222c" stroke-width="1"/>
    </pattern>
    <clipPath id="card"><rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="14"/></clipPath>
  </defs>

  <rect width="${W}" height="${H}" fill="#101419"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect x="0" y="0" width="${W}" height="7" fill="${accent}"/>

  <circle cx="${W - 120}" cy="${H - 110}" r="150" fill="${accent}" opacity="0.08"/>
  <circle cx="${W - 120}" cy="${H - 110}" r="88" fill="${accent}" opacity="0.07"/>

  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="14" fill="#0b0e12" stroke="#232a33" stroke-width="2"/>
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="58" rx="14" fill="#161c23"/>
  <rect x="${cardX}" y="${cardY + 44}" width="${cardW}" height="14" fill="#161c23"/>
  <circle cx="${cardX + 34}" cy="${cardY + 29}" r="7" fill="#3a444f"/>
  <circle cx="${cardX + 60}" cy="${cardY + 29}" r="7" fill="#3a444f"/>
  <circle cx="${cardX + 86}" cy="${cardY + 29}" r="7" fill="#3a444f"/>
  <g clip-path="url(#card)">${rows}</g>
</svg>
`;
}

for (const t of thumbs) {
  writeFileSync(resolve(OUT, `${t.slug}.svg`), thumb(t), 'utf8');
  console.log('wrote', `${t.slug}.svg`);
}

// a neutral fallback
writeFileSync(
  resolve(OUT, 'default.svg'),
  thumb({ cat: 'Learmux', accent: '#20d65a', lines: ['$ help', 'lear mux sandbox', '$ ls'] }),
  'utf8'
);
console.log('wrote default.svg');
