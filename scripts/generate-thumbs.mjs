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
  { slug: 'environment-and-variables', accent: '#20d65a', lines: ['$ echo $HOME', '/data/data/com.termux/files/home', '$ export EDITOR=nano'] },
  { slug: 'text-processing-awk-sed', accent: '#f3bc36', lines: ["$ sed 's/old/new/g' notes.txt", '$ awk -F: {print $1}', '$ cat log | awk {sum+=$1}'] },
  { slug: 'archives-and-compression', accent: '#e8734a', lines: ['$ tar -czf backup.tar.gz project', '$ tar -tzf backup.tar.gz', '$ unzip -l pack.zip'] },
  { slug: 'scheduling-with-cron', accent: '#8b7cd8', lines: ['$ crontab -l', '0 3 * * * /path/backup.sh', '$ crontab -e'] },
  { slug: 'dns-and-addresses', accent: '#2878d0', lines: ['$ dig example.com A', '93.184.216.34', '$ dig -x 93.184.216.34'] },
  { slug: 'http-and-apis-from-the-shell', accent: '#35b0c4', lines: ['$ curl -i example.com', 'HTTP/1.1 200 OK', '$ curl -o page.html example.com'] },
  { slug: 'transferring-files', accent: '#3fb98a', lines: ['$ scp notes.txt player@host:~', '$ rsync -av --dry-run src/ dst/', '$ rsync -av src/ dst/'] },
  { slug: 'passwords-and-keys', accent: '#e0559a', lines: ['$ openssl rand -base64 24', '$ sha256sum secret.txt', '$ ssh-keygen -t ed25519'] },
  { slug: 'logs-and-detection', accent: '#e8734a', lines: ['$ grep Failed auth.log | wc -l', '128', '$ cut -d" " -f1 auth.log | sort | uniq -c'] },
  { slug: 'hardening-your-termux', accent: '#20d65a', lines: ['$ netstat -tuln', 'tcp 127.0.0.1:8022 LISTEN', '$ pkg upgrade'] },
  { slug: 'safe-habits-and-privacy', accent: '#8b7cd8', lines: ['$ history', '$ history -d 42', '$ ls -la ~/storage/shared'] },
  { slug: 'project-backup-script', accent: '#20d65a', lines: ['$ cat backup.sh', '#!/bin/sh', '$ ./backup.sh ~/notes'] },
  { slug: 'project-log-analyzer', accent: '#f3bc36', lines: ['$ ./analyse.sh access.log', 'Top sources by requests', '$ ./analyse.sh'] },
  { slug: 'project-personal-dashboard', accent: '#2878d0', lines: ['$ ./dash.sh', 'Uptime 3h 12m', '$ ./dash.sh --brief'] },
  { slug: 'security-mindset', accent: '#e0559a', lines: ['$ cat assets.txt', 'photos   confidentiality high', 'notes    integrity       medium'] },
  { slug: 'threat-modelling', accent: '#8b7cd8', lines: ['$ cat threat-model.txt', 'asset:    sshd on 8022', 'decision: key-only login'] },
  { slug: 'security-assessment-phases', accent: '#35b0c4', lines: ['$ hostname; id', 'u0_a318 uid=10318', '$ uname -srm'] },
  { slug: 'inventory-your-devices', accent: '#2878d0', lines: ['$ ip -o -4 addr show', 'inet 192.168.1.24/24', '$ df -h ~'] },
  { slug: 'reading-a-port-scan', accent: '#3fb98a', lines: ['$ nmap -n -p 8022 localhost', '8022/tcp open  ssh', 'Nmap done: 1 host up'] },
  { slug: 'service-versions', accent: '#f3bc36', lines: ['$ nmap -sV -p 8010 localhost', '8010/tcp open  http', 'Python 3.12 http.server'] },
  { slug: 'finding-a-vulnerability', accent: '#e8734a', lines: ['$ openssl version', 'OpenSSL 3.0.19', '$ pkg upgrade'] },
  { slug: 'how-a-web-request-works', accent: '#2878d0', lines: ['$ curl -i 127.0.0.1:8000', 'GET /hello HTTP/1.1', 'HTTP/1.0 200 OK'] },
  { slug: 'untrusted-input', accent: '#e8734a', lines: ['$ curl "…?n=abc"', '400 bad request', '$ curl "…?n=5"'] },
  { slug: 'injection', accent: '#e0559a', lines: ['$ curl "…?name=world;id"', 'uid=10318(u0_a318)', 'fix: shell=False'] },
  { slug: 'cross-site-scripting', accent: '#f3bc36', lines: ['$ curl "…?q=<script>"', '&lt;script&gt;', 'fix: html.escape'] },
  { slug: 'access-control-and-misconfiguration', accent: '#8b7cd8', lines: ['$ curl "…/user?id=2"', '403 forbidden', 'fix: deny by default'] },
  { slug: 'hashing-encoding-encryption', accent: '#e0559a', lines: ['$ sha256sum msg.txt', 'a1b2c3…  msg.txt', '$ base64 msg.txt'] },
  { slug: 'symmetric-and-asymmetric', accent: '#2878d0', lines: ['$ openssl rand -base64 32', 'xQ7f…9dK=', '$ openssl pkey -pubout'] },
  { slug: 'tls-and-certificates', accent: '#3fb98a', lines: ['$ openssl req -x509 -newkey', 'subject=CN = termux.local', 'issuer=CN = termux.local'] },
  { slug: 'signing-and-verifying', accent: '#f3bc36', lines: ['$ gpg --detach-sign msg.txt', 'Good signature from you', '$ gpg --verify msg.asc'] },
  { slug: 'crypto-mistakes', accent: '#e8734a', lines: ['$ openssl enc -aes-128-ecb', 'two identical blocks', 'use CBC or CTR instead'] },
  { slug: 'baselines', accent: '#20d65a', lines: ['$ cat baseline.txt', '== ports ==', '8022 LISTEN'] },
  { slug: 'file-integrity', accent: '#35b0c4', lines: ['$ sha256sum -c watch.sha256', 'watch/a.txt: OK', 'watch/b.txt: FAILED'] },
  { slug: 'logs-as-a-story', accent: '#e8734a', lines: ['$ awk -F" " {print $1, $4}', '10:14 sshd', '10:15 sshd failed'] },
  { slug: 'alerting-on-your-own-device', accent: '#8b7cd8', lines: ['$ cat alert.log', '2026-10-25 ALERT new line', '$ crontab -l'] },
  { slug: 'incident-response-steps', accent: '#2878d0', lines: ['$ ls -l ir/evidence.txt', '-rw------- 1 you', '$ sha256sum ir/evidence.txt'] },
  { slug: 'rules-of-engagement', accent: '#3fb98a', lines: ['$ cat roe.txt', 'scope: my own lab', 'out of bounds: the rest'] },
  { slug: 'writing-a-finding', accent: '#f3bc36', lines: ['$ cat finding.txt', 'title: idor in /user', 'fix: deny by default'] },
  { slug: 'responsible-disclosure', accent: '#e0559a', lines: ['$ cat disclosure.txt', 'reported: 2026-10-25', 'window: 90 days'] },
  { slug: 'certifications-and-labs', accent: '#8b7cd8', lines: ['$ cat portfolio.txt', 'lab: local http server', 'reasoning: allowlist'] },
  { slug: 'build-a-password-generator', accent: '#e0559a', lines: ['$ openssl rand -base64 24', 'xQ7fK2mP9dL4nR8tY1vB3w==', '$ awk {print 20*log(62)/log(2)}'] },
  { slug: 'build-an-encoder', accent: '#35b0c4', lines: ['$ printf %s café | base64', 'Y2Fmw6k=', '$ printf %s café | od -An -tx1'] },
  { slug: 'build-a-hash-tool', accent: '#20d65a', lines: ['$ sha256sum -c SHA256SUMS', 'notes.txt: OK', 'archive.zip: FAILED'] },
  { slug: 'build-a-jwt-inspector', accent: '#f3bc36', lines: ['$ cut -d. -f2 token | base64 -d', '{"sub":"user-42"}', '$ openssl dgst -sha256 -hmac'] },
  { slug: 'build-a-permissions-calculator', accent: '#8b7cd8', lines: ['$ stat -c "%a %n" calc.sh', '4755 calc.sh', '$ ls -l calc.sh'] },
  { slug: 'build-a-subnet-calculator', accent: '#2878d0', lines: ['$ python3 -c "import ipaddress"', '255.255.255.0', '10.0.0.192/26'] },
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
