/**
 * Authoring script for Learmux challenge definitions.
 *
 * Run `node scripts/generate-challenges.mjs` to (re)build
 * src/data/challenges.json. Writing the challenges in code lets us compute
 * real SHA-256 digests, base64, rot13 and reversals so the data stays correct
 * and self-consistent. The JSON it emits is the runtime source of truth.
 */

import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../src/data/challenges.json');

const HOME = '/data/data/com.termux/files/home';
const PREFIX = '/data/data/com.termux/files/usr';
const USER = 'player';
const HOST = 'termux';

// ── fs builders ─────────────────────────────────────────────────────────────
const d = (children, mode = '755', owner = USER) => ({ type: 'dir', children, mode, owner });
const f = (content, mode = '644', owner = USER) => ({ type: 'file', content, mode, owner });

/** Wrap home-directory contents inside the standard Termux path tree. */
function termuxRoot(homeChildren, extraRoot = {}) {
  return d({
    data: d({
      data: d({
        'com.termux': d({
          files: d({
            home: d(homeChildren),
            usr: d({ bin: d({}), etc: d({}), tmp: d({}) }),
          }),
        }),
      }),
    }),
    ...extraRoot,
  });
}

// ── crypto / encoding helpers ───────────────────────────────────────────────
const sha256 = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const rot13 = (s) =>
  s.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
const rev = (s) => [...s].reverse().join('');

// ── challenge definitions ───────────────────────────────────────────────────
/**
 * Explicit completion rules, keyed by slug. The engine evaluates these against
 * what the player actually did (files read, commands run, output produced)
 * rather than scanning for a flag string. Submitting the flag directly also
 * completes a challenge.
 */
const V = {
  'first-steps': [{ type: 'read', path: `${HOME}/welcome.txt` }],
  'hidden-in-plain-sight': [{ type: 'read', path: `${HOME}/.secret` }],
  'follow-the-trail': [{ type: 'read', path: `${HOME}/projects/android/scripts/backup/flag.txt` }],
  'world-writable': [{ type: 'read', path: `${HOME}/shared.ini` }],
  'logs-never-lie': [
    { type: 'command', pattern: '\\bgrep\\b' },
    { type: 'output', pattern: 'TERMUX\\{logs_never_lie\\}' },
  ],
  'case-insensitive': [
    { type: 'command', pattern: '\\bgrep\\b' },
    { type: 'output', pattern: 'TERMUX\\{case_insensitive\\}' },
  ],
  'pipe-dreams': [
    { type: 'command', pattern: '\\bcut\\b' },
    { type: 'output', pattern: 'TERMUX\\{pipe_dreams\\}' },
  ],
  'decode-me': [
    { type: 'command', pattern: 'base64\\s+(-d|--decode)' },
    { type: 'output', pattern: 'TERMUX\\{decode_me\\}' },
  ],
  'rot13-is-weak': [
    { type: 'command', pattern: '\\brot13\\b' },
    { type: 'output', pattern: 'TERMUX\\{rot13_is_weak\\}' },
  ],
  'hex-on-the-wire': [
    { type: 'command', pattern: '\\b(xxd|hexdump|strings)\\b' },
    { type: 'output', pattern: 'TERMUX\\{hex_on_the_wire\\}' },
  ],
  'integrity-matters': [
    { type: 'command', pattern: '\\bsha256sum\\b' },
    { type: 'output', pattern: 'TERMUX\\{integrity_matters\\}' },
  ],
  'environment-leak': [
    { type: 'command', pattern: '\\b(env|printenv)\\b' },
    { type: 'output', pattern: 'TERMUX\\{env_vars_leak\\}' },
  ],
  'process-hunt': [
    { type: 'command', pattern: '\\bps\\b' },
    { type: 'output', pattern: 'TERMUX\\{process_hunt\\}' },
  ],
  'package-cache': [
    { type: 'command', pattern: '\\bpkg\\b' },
    { type: 'output', pattern: 'TERMUX\\{package_cache\\}' },
  ],
  'user-accounts': [{ type: 'read', path: '/etc/accounts' }],
  'network-recon': [
    { type: 'command', pattern: '\\bnmap\\b' },
    { type: 'output', pattern: 'TERMUX\\{network_recon\\}' },
  ],
  'fetch-the-flag': [
    { type: 'command', pattern: '\\b(curl|wget)\\b' },
    { type: 'output', pattern: 'TERMUX\\{fetched_from_web\\}' },
  ],
  'buried-strings': [
    { type: 'command', pattern: '\\bstrings\\b' },
    { type: 'output', pattern: 'TERMUX\\{buried_strings\\}' },
  ],
  'reverse-engineering': [
    { type: 'command', pattern: '\\brev\\b' },
    { type: 'output', pattern: 'TERMUX\\{reverse_engineering\\}' },
  ],
  'final-boss': [
    { type: 'command', pattern: 'base64\\s+(-d|--decode)' },
    { type: 'output', pattern: 'TERMUX\\{final_boss\\}' },
  ],
};

const challenges = [];
const add = (c) =>
  challenges.push({
    user: USER,
    host: HOST,
    cwd: HOME,
    ...c,
    validation: V[c.slug] ?? [],
  });

// 01 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c01',
  slug: 'first-steps',
  title: 'Hello, Termux',
  category: 'Filesystem',
  difficulty: 'Easy',
  points: 10,
  summary: 'Look around a fresh Termux home directory and read your first flag.',
  objective: 'Read the file in your home directory to capture the flag.',
  briefing:
    'You are dropped into the Termux home directory. Two commands do most of the work here:\n\n' +
    '- `ls` lists what is in the current directory.\n' +
    '- `cat <file>` prints a file to the screen.\n\n' +
    'List the directory, find the interesting file, and read it.',
  flag: 'TERMUX{hello_world}',
  hints: ['Run `ls` on its own.', 'Then run `cat welcome.txt`.'],
  starters: ['ls', 'cat welcome.txt'],
  fs: termuxRoot({
    'welcome.txt': f('Welcome to Learmux!\nYour first flag is: TERMUX{hello_world}\n'),
    'readme.md': f('# Termux\nA terminal emulator and Linux environment for Android.\n'),
  }),
});

// 02 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c02',
  slug: 'hidden-in-plain-sight',
  title: 'Hidden in Plain Sight',
  category: 'Filesystem',
  difficulty: 'Easy',
  points: 10,
  summary: 'Unix hides files whose names start with a dot. Find one.',
  objective: 'Find and read the hidden file in your home directory.',
  briefing:
    'On Unix-like systems a leading dot marks a file as hidden, so `ls` will not show it by default. ' +
    'Use `ls -a` to list *all* entries, then `cat` the one that looks suspicious.',
  flag: 'TERMUX{hidden_in_plain_sight}',
  hints: ['`ls` skips dotfiles.', '`ls -a` shows them, including `.secret`'],
  starters: ['ls -a', 'cat .secret'],
  fs: termuxRoot({
    '.secret': f('You found me. TERMUX{hidden_in_plain_sight}\n'),
    'notes.txt': f('Remember to check for dotfiles next time.\n'),
    '.bashrc': f('# ~/.bashrc\nexport PS1="\\w $ "\n'),
  }),
});

// 03 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c03',
  slug: 'follow-the-trail',
  title: 'Follow the Trail',
  category: 'Filesystem',
  difficulty: 'Easy',
  points: 15,
  summary: 'A flag is buried deep in a directory tree. Hunt it down.',
  objective: 'Locate the file named flag.txt anywhere under your home directory and read it.',
  briefing:
    'The flag is several directories deep. Instead of `cd`-ing one level at a time, let `find` do the walking:\n\n' +
    '```\nfind . -name flag.txt\n```\n\n' +
    'Then `cat` the path it prints.',
  flag: 'TERMUX{follow_the_trail}',
  hints: ['`find . -name flag.txt` searches everything below you.', '`cd` and `ls` work too if you prefer.'],
  starters: ['find . -name flag.txt', 'cat projects/android/scripts/backup/flag.txt'],
  fs: termuxRoot({
    projects: d({
      android: d({
        scripts: d({
          backup: d({
            'flag.txt': f('TERMUX{follow_the_trail}\n'),
            'notes.md': f('Backups run nightly at 02:00.\n'),
          }),
        }),
      }),
      web: d({ 'index.html': f('<h1>hi</h1>\n') }),
    }),
    'todo.md': f('- [x] set up termux\n- [ ] find the flag\n'),
  }),
});

// 04 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c04',
  slug: 'world-writable',
  title: 'World-Writable',
  category: 'Permissions',
  difficulty: 'Medium',
  points: 20,
  summary: 'Spot the file that any user on the system can write to.',
  objective: 'Find the one file whose permissions are rw-rw-rw- and read it.',
  briefing:
    '`ls -l` shows a permissions column like `-rw-r--r--`. Read it as three groups: **user**, **group**, **others**. ' +
    'A file that is `rw-rw-rw-` (octal `666`) can be written by *anyone*. That is a classic security smell.\n\n' +
    'List the directory in long form and find the file that is too permissive.',
  flag: 'TERMUX{world_writable}',
  hints: ['`ls -l` prints the modes.', 'Look for `-rw-rw-rw-`. That is the odd one out.'],
  starters: ['ls -l', 'cat shared.ini'],
  fs: termuxRoot({
    'config.cfg': f('debug = false\n', '644'),
    'shared.ini': f('everyone can write here: TERMUX{world_writable}\n', '666'),
    'private.key': f('[private key material redacted for this exercise]\n', '600'),
    'script.sh': f('#!/bin/sh\necho hello\n', '755'),
  }),
});

// 05 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c05',
  slug: 'logs-never-lie',
  title: 'Logs Never Lie',
  category: 'Text',
  difficulty: 'Easy',
  points: 15,
  summary: 'A flag is buried in a noisy access log. Grep it out.',
  objective: 'Search access.log for the flag.',
  briefing:
    '`grep <pattern> <file>` prints only the lines that match. The log is hundreds of lines of noise, ' +
    'but the flag starts with `TERMUX{`. Search for that.',
  flag: 'TERMUX{logs_never_lie}',
  hints: ['`grep TERMUX access.log`', 'Add `-n` to see line numbers.'],
  starters: ['grep TERMUX access.log'],
  fs: termuxRoot({
    'access.log': f(
      Array.from({ length: 60 }, (_, i) =>
        `10.0.0.${(i % 200) + 1} - - [01/Jan/2026:00:${String(i % 60).padStart(2, '0')}:00] "GET /page/${i} HTTP/1.1" 200 ${100 + i}`
      )
        .concat('10.0.0.42 - - [01/Jan/2026:00:59:59] "GET /flag HTTP/1.1" 200 42 "TERMUX{logs_never_lie}"')
        .concat(Array.from({ length: 20 }, (_, i) => `10.0.0.${i} - - [01/Jan/2026:01:00:00] "GET /health HTTP/1.1" 200 2`))
        .join('\n') + '\n'
    ),
  }),
});

// 06 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c06',
  slug: 'case-insensitive',
  title: 'Case Insensitive',
  category: 'Text',
  difficulty: 'Easy',
  points: 15,
  summary: 'Match a pattern regardless of letter case.',
  objective: 'Find the line containing the flag without worrying about case.',
  briefing:
    'The flag is in `notes.txt`, but the author wrote surrounding text in mixed case. ' +
    '`grep -i` ignores case, so `grep -i termux notes.txt` will find `TERMUX{...}` too.',
  flag: 'TERMUX{case_insensitive}',
  hints: ['`grep -i termux notes.txt`', 'The `-i` flag means case-insensitive.'],
  starters: ['grep -i termux notes.txt'],
  fs: termuxRoot({
    'notes.txt': f(
      'Meeting notes\n' +
        'TODO: clean up the TErMuX build\n' +
        'remember the flag is TERMUX{case_insensitive}\n' +
        'ask Priya about the deploy\n'
    ),
  }),
});

// 07 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c07',
  slug: 'pipe-dreams',
  title: 'Pipe Dreams',
  category: 'Pipes',
  difficulty: 'Medium',
  points: 25,
  summary: 'Chain commands together with the pipe operator.',
  objective: 'Extract the third field of the admin line in users.txt.',
  briefing:
    'The pipe `|` sends the output of one command into the next. ' +
    'A passwd-style file is colon-separated; `cut -d: -f3` prints the third field.\n\n' +
    '```\ncat users.txt | grep admin | cut -d: -f3\n```',
  flag: 'TERMUX{pipe_dreams}',
  hints: ['`grep admin users.txt` narrows it down.', '`cut -d: -f3` prints field 3.'],
  starters: ['cat users.txt | grep admin | cut -d: -f3'],
  fs: termuxRoot({
    'users.txt': f(
      'root:x:0:0:root:/root:/bin/bash\n' +
        'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n' +
        'guest:x:1001:1001:Guest:/home/guest:/bin/sh\n' +
        'admin:x:TERMUX{pipe_dreams}:admin:/home/admin:/bin/bash\n' +
        'sync:x:4:65534:sync:/bin:/bin/sync\n'
    ),
  }),
});

// 08 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c08',
  slug: 'decode-me',
  title: 'Decode Me',
  category: 'Encoding',
  difficulty: 'Easy',
  points: 15,
  summary: 'Base64 is an encoding, not encryption. Decode it.',
  objective: 'Decode encoded.txt to reveal the flag.',
  briefing:
    'Base64 turns binary into printable text. It is trivially reversible:\n\n' +
    '```\nbase64 -d encoded.txt\n```',
  flag: 'TERMUX{decode_me}',
  hints: ['The `-d` flag decodes instead of encodes.'],
  starters: ['base64 -d encoded.txt'],
  fs: termuxRoot({
    'encoded.txt': f(b64('TERMUX{decode_me}') + '\n'),
  }),
});

// 09 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c09',
  slug: 'rot13-is-weak',
  title: 'ROT13 Is Weak',
  category: 'Encoding',
  difficulty: 'Easy',
  points: 15,
  summary: 'A Caesar cipher with a shift of 13. Undo it.',
  objective: 'Decode cipher.txt to reveal the flag.',
  briefing:
    'ROT13 rotates every letter 13 places. It is its own inverse. The Learmux shell ships a helper:\n\n' +
    '```\nrot13 cipher.txt\n```',
  flag: 'TERMUX{rot13_is_weak}',
  hints: ['`rot13 cipher.txt`', 'Applying it twice returns the original.'],
  starters: ['rot13 cipher.txt'],
  fs: termuxRoot({
    'cipher.txt': f('The secret is ' + rot13('TERMUX{rot13_is_weak}') + '\n'),
  }),
});

// 10 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c10',
  slug: 'hex-on-the-wire',
  title: 'Hex on the Wire',
  category: 'Encoding',
  difficulty: 'Medium',
  points: 20,
  summary: 'Inspect raw bytes with a hex dump.',
  objective: 'Hex-dump data.bin and read the flag from the ASCII column.',
  briefing:
    '`xxd` prints each byte as hex, with the printable characters shown on the right. ' +
    'Even when a file looks like gibberish, the ASCII column often gives it away:\n\n' +
    '```\nxxd data.bin\n```',
  flag: 'TERMUX{hex_on_the_wire}',
  hints: ['The right-hand column of `xxd` shows printable characters.', '`strings data.bin` pulls the flag out in one piece.'],
  starters: ['xxd data.bin', 'strings data.bin'],
  fs: termuxRoot({
    'data.bin': f('\u0000\u0001\u0002TERMUX{hex_on_the_wire}\u0003\u0004\u0005'),
  }),
});

// 11 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c11',
  slug: 'integrity-matters',
  title: 'Integrity Matters',
  category: 'Hashing',
  difficulty: 'Medium',
  points: 25,
  summary: 'Two backups look identical. A checksum tells them apart.',
  objective: 'Find which file matches the digest in checksum.txt, then read it.',
  briefing:
    'A SHA-256 digest is a fingerprint for file contents. `checksum.txt` records the digest of the *genuine* ' +
    'file. Compute the digest of both candidates with `sha256sum` and compare.',
  flag: 'TERMUX{integrity_matters}',
  hints: ['`sha256sum backup_a.txt backup_b.txt`', 'The file whose digest matches checksum.txt is the real one.'],
  starters: ['sha256sum backup_a.txt backup_b.txt', 'cat checksum.txt', 'cat backup_a.txt'],
  fs: (() => {
    const real = 'genuine backup\nTERMUX{integrity_matters}\n';
    const fake = 'genuine backup\nTERMUX{1ntegr1ty_m4tt3rs}\n';
    return termuxRoot({
      'backup_a.txt': f(real),
      'backup_b.txt': f(fake),
      'checksum.txt': f(`${sha256(real)}  backup_a.txt\n`),
    });
  })(),
});

// 12 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c12',
  slug: 'environment-leak',
  title: 'Environment Leak',
  category: 'Environment',
  difficulty: 'Easy',
  points: 15,
  summary: 'Secrets are often left behind in environment variables.',
  objective: 'Inspect the environment and find the leaked secret.',
  briefing:
    'Environment variables are handed to every process a shell starts. That makes them a common place for ' +
    'secrets to leak. Print them with `env` (or `printenv`).',
  flag: 'TERMUX{env_vars_leak}',
  hints: ['`env` prints every variable.', '`printenv SECRET_FLAG` prints just one.'],
  starters: ['env'],
  env: {
    SECRET_FLAG: 'TERMUX{env_vars_leak}',
    API_KEY: 'demo_api_key_placeholder',
    PREFIX: PREFIX,
  },
  fs: termuxRoot({
    '.env.example': f('API_KEY=\nSECRET_FLAG=\n'),
  }),
});

// 13 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c13',
  slug: 'process-hunt',
  title: 'Process Hunt',
  category: 'Processes',
  difficulty: 'Medium',
  points: 20,
  summary: 'A careless admin left a secret in a running command line.',
  objective: 'List running processes and find the flag in a command argument.',
  briefing:
    'On real systems, `ps` shows the full command line of every process, including secrets people pass as ' +
    'arguments by mistake. Run `ps` here and read carefully.',
  flag: 'TERMUX{process_hunt}',
  hints: ['`ps` lists processes.', 'One process passes a `--token`.'],
  starters: ['ps'],
  overrides: {
    ps:
      '  PID TTY          TIME CMD\n' +
      ' 1234 pts/0    00:00:00 bash\n' +
      ' 1420 pts/0    00:00:00 /usr/bin/backup --token TERMUX{process_hunt}\n' +
      ' 1502 pts/0    00:00:00 ps\n',
  },
  fs: termuxRoot({ 'ps-notes.txt': f('Never pass secrets as command-line arguments.\n') }),
});

// 14 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c14',
  slug: 'package-cache',
  title: 'Package Cache',
  category: 'Termux',
  difficulty: 'Medium',
  points: 20,
  summary: 'A suspicious package is installed. List packages and read its metadata.',
  objective: 'List the installed packages and find the flag in the metadata.',
  briefing:
    'Termux uses `pkg` to manage software. Listing installed packages can reveal unexpected or malicious tools:\n\n' +
    '```\npkg list-installed\n```',
  flag: 'TERMUX{package_cache}',
  hints: ['`pkg list-installed` prints the package set.', 'The flag is in the description of `termux-flagutils`.'],
  starters: ['pkg list-installed'],
  overrides: {
    pkg:
      'Listing installed packages ...\n' +
      'bash\ncoreutils\ngit\nnmap\nopenssh\npython\ntermux-flagutils (description: "extracts flags; secret TERMUX{package_cache}")\n',
  },
  fs: termuxRoot({}),
});

// 15 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c15',
  slug: 'user-accounts',
  title: 'User Accounts',
  category: 'System',
  difficulty: 'Easy',
  points: 15,
  summary: 'Read the account database and find an unusual user.',
  objective: 'Read the account database at /etc/accounts and find the flag in a user record.',
  briefing:
    '`/etc/accounts` lists user accounts as colon-separated records: ' +
    '`name:password:uid:gid:GECOS:home:shell`. Read it with `cat`.',
  flag: 'TERMUX{user_accounts}',
  hints: ['`cat /etc/accounts`', 'One GECOS field holds the flag.'],
  starters: ['cat /etc/accounts'],
  fs: termuxRoot(
    {},
    {
      etc: d({
        accounts: f(
          'root:x:0:0:root:/root:/bin/bash\n' +
            'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n' +
            'termux:x:10000:10000:TERMUX{user_accounts}:/data/data/com.termux/files/home:/bin/bash\n' +
            'nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n'
        ),
        shadow: f('root:!:19000:0:99999:7:::\n'),
      }),
    }
  ),
});

// 16 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c16',
  slug: 'network-recon',
  title: 'Network Recon',
  category: 'Networking',
  difficulty: 'Medium',
  points: 20,
  summary: 'Scan a host and read a service banner that leaks a flag.',
  objective: 'Run an nmap scan against 127.0.0.1 and read the service banner.',
  briefing:
    '`nmap` maps open ports and, with service detection, reads the banner each service returns. ' +
    'Banners are a classic information leak.\n\n```\nnmap -sV 127.0.0.1\n```',
  flag: 'TERMUX{network_recon}',
  hints: ['`nmap 127.0.0.1`', 'Look at the banner for port 1337.'],
  starters: ['nmap 127.0.0.1'],
  overrides: {
    nmap:
      'Starting Nmap 7.94 ( https://nmap.org )\n' +
      'Nmap scan report for localhost (127.0.0.1)\n' +
      'PORT     STATE SERVICE VERSION\n' +
      '22/tcp   open  ssh     OpenSSH 9.6 (protocol 2.0)\n' +
      '1337/tcp open  waste   Learmux flag service, banner: TERMUX{network_recon}\n' +
      '8022/tcp open  ssh     OpenSSH 9.6 (Termux dropbear)\n' +
      'Nmap done: 1 IP address (1 host up) scanned in 1.42 seconds\n',
  },
  fs: termuxRoot({}),
});

// 17 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c17',
  slug: 'fetch-the-flag',
  title: 'Fetch the Flag',
  category: 'Networking',
  difficulty: 'Medium',
  points: 20,
  summary: 'Pull a flag down from a web endpoint.',
  objective: 'Use curl to fetch http://challenge.local/flag and read the response.',
  briefing:
    '`curl <url>` prints the body of an HTTP response to the terminal. Fetch the challenge endpoint:\n\n' +
    '```\ncurl http://challenge.local/flag\n```',
  flag: 'TERMUX{fetched_from_web}',
  hints: ["Use curl against the challenge endpoint.", "wget can also download the file."],
  starters: ["curl http://challenge.local/flag"],
  overrides: {
    curl: '{"status":"ok","flag":"TERMUX{fetched_from_web}"}\n',
    wget: "Connecting to challenge.local...\nHTTP request sent, awaiting response... 200 OK\nTERMUX{fetched_from_web}\n",
  },
  fs: termuxRoot({}),
});

// 18 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c18',
  slug: 'buried-strings',
  title: 'Buried Strings',
  category: 'Forensics',
  difficulty: 'Medium',
  points: 25,
  summary: 'Extract readable text from a messy binary blob.',
  objective: 'Use strings on firmware.bin to reveal the embedded flag.',
  briefing:
    '`strings` pulls out runs of printable characters from any file. It is the first thing a forensics ' +
    'analyst runs on an unknown blob:\n\n```\nstrings firmware.bin\n```',
  flag: 'TERMUX{buried_strings}',
  hints: ['`strings firmware.bin`', 'The flag is one of several printable runs.'],
  starters: ['strings firmware.bin'],
  fs: termuxRoot({
    'firmware.bin': f(
      '\u0000\u0001\u0002BIN\u0000init\u0000\u0000config=TERMUX{buried_strings}\u0000\u0000v2.4.1\u0000\u0000'
    ),
  }),
});

// 19 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c19',
  slug: 'reverse-engineering',
  title: 'Reverse Engineering',
  category: 'Encoding',
  difficulty: 'Easy',
  points: 15,
  summary: 'A file holds the flag written backwards.',
  objective: 'Reverse the characters in reversed.txt to read the flag.',
  briefing:
    'Not every obfuscation is cryptography. `rev` reverses each line. Perfect for text stored backwards:\n\n' +
    '```\nrev reversed.txt\n```',
  flag: 'TERMUX{reverse_engineering}',
  hints: ['`rev reversed.txt`', '`cat` then read it right-to-left also works.'],
  starters: ['rev reversed.txt'],
  fs: termuxRoot({
    'reversed.txt': f(rev('TERMUX{reverse_engineering}') + '\n'),
  }),
});

// 20 ─────────────────────────────────────────────────────────────────────────
add({
  id: 'c20',
  slug: 'final-boss',
  title: 'The Final Boss',
  category: 'Mixed',
  difficulty: 'Hard',
  points: 40,
  summary: 'Combine grep, cut and base64 in one pipeline to win.',
  objective: 'Extract the base64 blob from capture.log and decode it.',
  briefing:
    'A service logged its flag base64-encoded, buried in a busy log. Chain the tools you have learned:\n\n' +
    '```\ngrep flag_blob capture.log | cut -d" " -f4 | base64 -d\n```\n\n' +
    'Breaking it down: `grep` finds the line, `cut` takes the fourth field, `base64 -d` decodes it.',
  flag: 'TERMUX{final_boss}',
  hints: ['Find the line with `flag_blob`.', 'The blob is the fourth whitespace-separated field.'],
  starters: ['grep flag_blob capture.log', 'grep flag_blob capture.log | cut -d" " -f4 | base64 -d'],
  fs: (() => {
    const blob = b64('TERMUX{final_boss}');
    const lines = [];
    for (let i = 0; i < 40; i++) {
      lines.push(`2026-01-01T12:${String(i % 60).padStart(2, '0')}:01 INFO heartbeat ok id=${i}`);
    }
    lines.push(`2026-01-01T12:41:07 WARN vault sealed`);
    lines.push(`2026-01-01T12:41:09 INFO flag_blob ${blob}`);
    lines.push(`2026-01-01T12:41:10 INFO vault resealed`);
    for (let i = 0; i < 20; i++) {
      lines.push(`2026-01-01T12:42:${String(i % 60).padStart(2, '0')} INFO heartbeat ok id=${i}`);
    }
    return termuxRoot({ 'capture.log': f(lines.join('\n') + '\n') });
  })(),
});

// ── emit ────────────────────────────────────────────────────────────────────
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(challenges, null, 2) + '\n', 'utf8');
console.log(`Wrote ${challenges.length} challenges (${challenges.reduce((s, c) => s + c.points, 0)} pts) to ${OUT}`);
