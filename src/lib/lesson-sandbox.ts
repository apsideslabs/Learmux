/**
 * A shell for every lesson.
 *
 * The course says "run this in Termux" on almost every page, which means the
 * reader leaves the site, opens another app, and retypes what they just read.
 * This puts a shell beside the lesson instead, seeded with the files that
 * lesson talks about, so the command and the result are on the same screen.
 *
 * ## What it is not
 *
 * It is not a challenge. There is no flag, and the validation list is empty,
 * which the shell treats as never solved, so nothing here can mark a lesson
 * complete or fire the capture banner. It is a scratchpad with a real
 * filesystem and the real command set.
 *
 * ## Why the paths are the real ones
 *
 * The home directory is `/data/data/com.termux/files/home`, because that is
 * where Termux actually puts you. A sandbox that says `/home/player` would
 * teach the wrong path and then the reader's first `pwd` on a real device
 * would disagree with the lesson.
 */

import type { Challenge, DirNode, FSNode } from './types';

/** Where Termux actually starts you. */
export const SANDBOX_HOME = '/data/data/com.termux/files/home';

/** A seeded file tree, keyed by path relative to the home directory. */
type Seed = Record<string, string>;

function ensureDir(root: DirNode, parts: string[]): DirNode {
  let node = root;
  for (const part of parts) {
    const next = node.children[part];
    if (!next || next.type !== 'dir') {
      const created: DirNode = { type: 'dir', children: {} };
      node.children[part] = created;
      node = created;
    } else {
      node = next;
    }
  }
  return node;
}

function put(root: DirNode, absPath: string, content: string): void {
  const parts = absPath.split('/').filter(Boolean);
  const name = parts.pop();
  if (!name) return;
  const parent = ensureDir(root, parts);
  parent.children[name] = { type: 'file', content };
}

/** Build a root tree with the Termux home, plus a couple of system dirs. */
function buildTree(seed: Seed): FSNode {
  const root: DirNode = { type: 'dir', children: {} };
  ensureDir(root, ['tmp']);
  ensureDir(root, ['usr', 'bin']);
  const homeParts = SANDBOX_HOME.split('/').filter(Boolean);
  ensureDir(root, homeParts);
  for (const [rel, content] of Object.entries(seed)) {
    put(root, `${SANDBOX_HOME}/${rel}`, content);
  }
  return root;
}

/**
 * The files a lesson needs.
 *
 * Only lessons that name files get an entry. Everything else falls back to
 * DEFAULT_SEED, which is enough to run pwd, ls, mkdir, echo and the rest.
 */
const DEFAULT_SEED: Seed = {
  'notes.txt': 'buy a bigger SD card\nread the next lesson\n',
  'todo.txt': 'finish foundations\nstart networking\n',
};

const SEEDS: Record<string, Seed> = {
  // ── lessons whose commands work on an artefact rather than a file they
  //    name. The seed is the thing the lesson asks you to look at, so the
  //    commands in the text have something real to act on.
  'getting-started': {
    'notes.txt': 'termux-setup-storage shares your phone storage\n',
    'welcome.txt': 'you are in the Termux home directory\n',
  },
  'baselines': {
    'notes.txt': 'the machine at rest\n',
    'projects/readme.txt': 'work in progress\n',
    // Exactly nine lines, because the lesson shows `wc -l ~/baseline.txt`
    // printing 9. A shorter seed made the page argue with its own sandbox.
    'baseline.txt': [
      '== taken ==',
      '2026-03-10T09:12:00Z',
      '== packages ==',
      'bash/stable,now 5.2.21 aarch64 [installed]',
      'coreutils/stable,now 9.4 aarch64 [installed]',
      'git/stable,now 2.45.2 aarch64 [installed]',
      'nmap/stable,now 7.94 aarch64 [installed]',
      '== ports ==',
      'tcp 0 0 0.0.0.0:8022 0.0.0.0:* LISTEN',
    ].join('\n') + '\n',
  },
  'reading-a-port-scan': {
    'scan.txt': [
      'PORT     STATE SERVICE  VERSION',
      '22/tcp   open  ssh      OpenSSH 9.3 (protocol 2.0)',
      '80/tcp   open  http     nginx 1.24.0',
      '8022/tcp open  ssh      OpenSSH 9.3 (protocol 2.0)',
      '9090/tcp closed http-alt',
    ].join('\n') + '\n',
  },
  'service-versions': {
    'scan.txt': [
      '22/tcp   open  ssh     OpenSSH 9.3 (protocol 2.0)',
      '8022/tcp open  ssh     OpenSSH 9.3 (protocol 2.0)',
      '8080/tcp open  http    Python http.server 3.11.4',
    ].join('\n') + '\n',
  },
  'logs-as-a-story': {
    'events.log': [
      '09:01:12 service started',
      '09:04:03 login ok  user=mira',
      '09:06:41 login fail user=root from 198.51.100.7',
      '09:06:44 login fail user=root from 198.51.100.7',
      '09:06:47 login fail user=root from 198.51.100.7',
      '09:07:02 login ok  user=mira',
      '09:12:30 config changed by user=mira',
    ].join('\n') + '\n',
  },
  'incident-response-steps': {
    'incident.txt': [
      'what happened: three failed root logins, then a success',
      'when: 09:06 to 09:07',
      'where: sshd on this device',
      'known: nothing else yet',
    ].join('\n') + '\n',
  },
  'inventory-your-devices': {
    'devices.txt': [
      'phone      android   this device',
      'laptop     linux     ssh enabled',
      'router     unknown   admin page on 192.168.1.1',
      'printer    unknown   left on the network',
    ].join('\n') + '\n',
  },
  'finding-a-vulnerability': {
    'findings.txt': [
      'port 8022 open to the network',
      'ssh password login enabled',
      'no automatic updates',
      'old package: openssh 8.4',
    ].join('\n') + '\n',
  },
  'security-assessment-phases': {
    'plan.txt': [
      '1 scope      what is in and what is out',
      '2 recon      what is exposed',
      '3 assess     what is weak',
      '4 report     what to fix first',
    ].join('\n') + '\n',
  },
  'threat-modelling': {
    'system.md': [
      '# what we are modelling',
      '',
      'A phone running Termux with ssh open on port 8022,',
      'holding a notes file and an ssh key.',
      '',
      'Who can reach it, and what would they want?',
    ].join('\n') + '\n',
  },
  'rules-of-engagement': {
    'scope.txt': [
      'in scope:    this device only',
      'out of scope: any other host, any network',
      'window:      practice only, no schedule',
    ].join('\n') + '\n',
  },
  'certifications-and-labs': {
    'notes.txt': 'pick one certification and finish it before starting another\n',
  },
  'security-mindset': {
    'notes.txt': 'ask what the attacker gains, not what the tool does\n',
  },
  'safe-habits-and-privacy': {
    'notes.txt': 'review app permissions once a month\n',
    // The four lines the lesson shows and then counts with wc -l.
    '.bash_history': [
      'pkg update',
      'ls -la',
      'ssh-keygen -t ed25519 -C "phone key"',
      'cat ~/.ssh/id_ed25519.pub',
    ].join('\n') + '\n',
  },
  'crypto-mistakes': {
    'message.txt': 'the meeting is at four\n',
    'secret.txt': 'this file should not be world readable\n',
  },
  'hashing-encoding-encryption': {
    'sample.txt': 'the quick brown fox\n',
    'secret.txt': 'a value worth protecting\n',
  },
  'passwords-and-keys': {
    'id_ed25519.pub': 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIexampleKeyForPractice player@termux\n',
    'notes.txt': 'the public key is safe to share, the private one is not\n',
  },
  'symmetric-and-asymmetric': {
    'message.txt': 'the meeting is at four\n',
    'notes.txt': 'a key you share is symmetric, a key you publish is not\n',
  },
  'tls-and-certificates': {
    'notes.txt': 'the certificate names the host, the key proves it\n',
  },
  'build-a-permissions-calculator': {
    'notes.txt': 'readable and writable by you\n',
    'run.sh': '#!/data/data/com.termux/files/usr/bin/bash\necho running\n',
    'private.key': 'a file that should be 600\n',
  },
  'build-a-subnet-calculator': {
    'hosts.txt': '10.0.0.4\n10.0.0.7\n192.168.1.20\n172.16.5.9\n',
  },
  'project-personal-dashboard': {
    'data.txt': 'uptime 4d\nload 0.12\ndisk 61%\n',
  },
  'run-your-first-python': {
    'greeting.py': 'name = "player"\nprint("hello,", name)\n',
  },
  'python-working-with-text': {
    'words.txt': 'the quick brown fox jumps over the lazy dog\n',
  },
  'python-hashing-and-encoding': {
    'sample.txt': 'the quick brown fox\n',
  },
  'python-secrets-and-tokens': {
    'notes.txt': 'secrets is for values an attacker must not guess\n',
  },
  'python-addresses': {
    'ips.txt': '10.0.0.4\n10.0.0.7\n192.168.1.20\n2001:db8::1\n',
  },
  'regular-expressions': {
    // The format the lesson's patterns expect: address, method, path, status.
    'access.log': [
      '10.0.0.4 GET /index.html 200',
      '10.0.0.7 GET /about.html 200',
      '10.0.0.4 POST /login 302',
      '10.0.0.9 GET /missing.html 404',
      '10.0.0.7 GET /index.html 200',
      '10.0.0.4 GET /index.html 200',
      '10.0.0.12 POST /upload 500',
    ].join('\n') + '\n',
  },
  'version-control-with-git': {
    // A plain project with no repository yet: the lesson starts at `git init`,
    // so seeding a .git directory would skip the first thing it teaches.
    'notes.txt': 'the meeting is at four\ncall the bank\n',
    'projects/readme.txt': 'one directory to keep work in\n',
  },
  'editing-a-file': {
    'notes.txt': 'buy a bigger SD card\nread the next lesson\n',
    // A copy of a shell config, so the lesson's copy-edit-check-restore
    // sequence can be practised without risking anything real.
    '.bashrc': 'export PS1="player@termux \\w \\$ "\nalias ll="ls -l"\n',
  },
  'navigating-the-filesystem': {
    'todo.txt': 'finish foundations\nstart networking\n',
    'notes.txt': 'termux-setup-storage shares your phone storage\n',
    'projects/readme.txt': 'one directory to keep work in\n',
    'projects/old/2019.txt': 'an old file, for practising find and rm\n',
  },
  'reading-and-searching-text': {
    'app.log': [
      '2026-01-16 09:01:12 INFO  server started on port 8080',
      '2026-01-16 09:02:03 WARN  slow query took 3200ms',
      '2026-01-16 09:02:44 ERROR failed to send email to user 42',
      '2026-01-16 09:03:10 INFO  user 42 logged in',
      '2026-01-16 09:03:55 ERROR failed to send email to user 91',
      '2026-01-16 09:06:00 INFO  nightly backup finished',
      '2026-01-16 09:06:30 WARN  error rate above threshold',
    ].join('\n') + '\n',
  },
  'pipes-and-redirection': {
    // The exact six lines the lesson tells you to create, so `wc -l` here
    // prints the same 6 the lesson shows.
    'access.log': [
      '10.0.0.4 GET /index.html 200',
      '10.0.0.7 GET /about.html 200',
      '10.0.0.4 POST /login 302',
      '10.0.0.9 GET /missing.html 404',
      '10.0.0.7 GET /index.html 200',
      '10.0.0.4 GET /index.html 200',
    ].join('\n') + '\n',
  },
  'file-permissions': {
    'notes.txt': 'only you should read this\n',
    'run.sh': '#!/data/data/com.termux/files/usr/bin/bash\necho running\n',
    'shared.txt': 'the group can read this\n',
  },
  'managing-packages': {
    'notes.txt': 'pkg is a wrapper around apt on Termux\n',
  },
  'shell-config-and-aliases': {
    'hello.sh': '#!/data/data/com.termux/files/usr/bin/bash\necho hello from a script\n',
  },
  'shell-scripting-basics': {
    'notes.txt': 'scripts start with a shebang\n',
    'data.txt': 'alpha\nbravo\ncharlie\n',
  },
  'processes-and-jobs': {
    'slow.sh': '#!/data/data/com.termux/files/usr/bin/bash\nwhile true; do sleep 1; done\n',
  },
  'environment-and-variables': {
    'notes.txt': 'PATH decides which ls runs\n',
  },
  'text-processing-awk-sed': {
    'scores.txt': 'alice 90 maths\nbob 75 physics\ncarol 88 chemistry\ndave 60 maths\n',
    'words.txt': 'the quick brown fox\njumps over the lazy dog\n',
    'servers.txt': 'web01 10.0.0.11\nweb02 10.0.0.12\ndb01 10.0.0.21\n',
    'numbers.txt': '5\n12\n7\n23\n2\n',
    'access.log': [
      '10.0.0.4 - - "GET /index.html" 200',
      '10.0.0.7 - - "GET /about.html" 404',
      '10.0.0.4 - - "GET /style.css" 200',
      '10.0.0.9 - - "GET /missing.png" 404',
      '10.0.0.4 - - "GET /app.js" 200',
      '10.0.0.7 - - "GET /old.html" 404',
    ].join('\n') + '\n',
  },
  'archives-and-compression': {
    'a.txt': 'the first file\n',
    'b.txt': 'the second file\n',
    'projects/notes.txt': 'kept inside a directory, to practise tar\n',
  },
  'scheduling-with-cron': {
    'notes.txt': 'crontab -e edits your schedule\n',
  },
  'networking-basics': {
    'index.html': '<h1>hello from the sandbox</h1>\n',
    'notes.txt': '127.0.0.1 never leaves the device\n',
  },
  'dns-and-addresses': {
    'notes.txt': 'the resolver is listed in resolv.conf\n',
  },
  'http-and-apis-from-the-shell': {
    'people.json': '[\n  { "name": "ada", "role": "engineer" },\n  { "name": "grace", "role": "admiral" }\n]\n',
  },
  'ssh-and-remote-work': {
    'notes.txt': 'ssh-keygen writes two files into .ssh\n',
  },
  'transferring-files': {
    'notes.txt': 'rsync only sends what changed\n',
    'report.txt': 'quarterly numbers\n',
    'draft.md': '# draft\n',
  },
  'encoding-and-hashes': {
    'sample.txt': 'the quick brown fox\n',
  },
  'file-integrity': {
    'a.txt': 'a file that should not change\n',
    'integrity.log': 'sha256 of a.txt recorded at install time\n',
  },
  'logs-and-detection': {
    'auth.log': [
      '2026-03-10T03:12:01Z user=root src=198.51.100.7 result=fail',
      '2026-03-10T03:12:02Z user=root src=198.51.100.7 result=fail',
      '2026-03-10T08:14:02Z user=mira src=203.0.113.14 result=fail',
      '2026-03-10T08:14:03Z user=mira src=203.0.113.14 result=fail',
      '2026-03-10T08:14:04Z user=mira src=203.0.113.14 result=fail',
      '2026-03-10T08:14:05Z user=mira src=203.0.113.14 result=fail',
      '2026-03-10T08:14:06Z user=mira src=203.0.113.14 result=fail',
      '2026-03-10T08:14:07Z user=mira src=203.0.113.14 result=fail',
      '2026-03-10T08:14:09Z user=mira src=203.0.113.14 result=ok',
      '2026-03-10T11:02:44Z user=dev src=192.0.2.55 result=fail',
      '2026-03-10T19:40:12Z user=mira src=203.0.113.14 result=ok',
    ].join('\n') + '\n',
  },
  'project-backup-script': {
    'notes.txt': 'the backup should be dated\n',
    'draft.md': '# draft\n',
    'projects/readme.txt': 'work in progress\n',
  },
  'project-log-analyzer': {
    'access.log': [
      '10.0.0.4 "GET /" 200',
      '10.0.0.7 "GET /admin" 403',
      '10.0.0.4 "GET /about" 200',
      '10.0.0.99 "GET /admin" 403',
    ].join('\n') + '\n',
  },
  'signing-and-verifying': {
    'release.txt': 'version 1.0\n',
    'notes.txt': 'sign the file, not the directory\n',
  },
  'hardening-your-termux': {
    'notes.txt': 'close the ports you do not need\n',
  },
  'writing-a-finding': {
    'notes.txt': 'title, severity, evidence, fix\n',
  },
  'responsible-disclosure': {
    'security.txt': 'Contact: security@example.com\n',
  },
  'access-control-and-misconfiguration': {
    'panel.py': [
      'def can_view(user, record):',
      '    # checks the session, not the record owner',
      '    return user is not None',
    ].join('\n') + '\n',
  },
  'cross-site-scripting': {
    'search.py': [
      'from http.server import BaseHTTPRequestHandler',
      '',
      'def render(q):',
      '    return "<p>You searched for " + q + "</p>"',
    ].join('\n') + '\n',
  },
  'injection': {
    'greet.py': [
      'import sqlite3',
      '',
      'def find(name):',
      '    cur.execute("SELECT * FROM users WHERE name = \'" + name + "\'")',
    ].join('\n') + '\n',
    'sqli.py': 'the same query, built with a parameter instead\n',
  },
  'untrusted-input': {
    'calc.py': [
      'def calc(expr):',
      '    return eval(expr)',
    ].join('\n') + '\n',
  },
  'how-a-web-request-works': {
    'webserver.py': [
      'from http.server import HTTPServer, BaseHTTPRequestHandler',
      '',
      'class H(BaseHTTPRequestHandler):',
      '    def do_GET(self):',
      '        self.send_response(200)',
      '        self.end_headers()',
      '        self.wfile.write(b"hello")',
    ].join('\n') + '\n',
    'rawview.py': 'prints a request line by line\n',
  },
  'alerting-on-your-own-device': {
    'base.txt': 'port 22 open\nport 8022 open\n',
    'now.txt': 'port 22 open\nport 8022 open\nport 9999 open\n',
  },
  'build-a-hash-tool': {
    'a.txt': 'hello termux\n',
    'b.txt': 'hello termux\n',
    'nope.txt': 'something else\n',
  },
  'build-a-jwt-inspector': {
    'token.txt': 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJwbGF5ZXIifQ.signature\n',
  },
  'build-a-password-generator': {
    'notes.txt': 'length is worth more than symbols\n',
  },
  'build-an-encoder': {
    'notes.txt': 'base64 is encoding, not encryption\n',
  },
};

/** Build the Challenge-shaped object the existing shell engine expects. */
export function sandboxChallenge(slug: string, title = 'this lesson'): Challenge {
  const seed = SEEDS[slug] ?? DEFAULT_SEED;
  return {
    id: `sandbox-${slug}`,
    slug: `sandbox-${slug}`,
    title,
    category: 'Sandbox',
    difficulty: 'Easy',
    points: 0,
    summary: 'A shell seeded with this lesson files.',
    briefing: '',
    objective: '',
    // Unreachable, and with no validation rules the shell treats the sandbox as
    // never solved, so nothing can mark a lesson complete from here.
    flag: 'FLAG{no-flag-in-a-sandbox}',
    hints: [],
    cwd: SANDBOX_HOME,
    user: 'player',
    host: 'termux',
    fs: buildTree(seed),
    env: {},
    overrides: {},
    validation: [],
  };
}

/** The seed a lesson gets, for tests and for showing the file list. */
export function seedFor(slug: string): Seed {
  return SEEDS[slug] ?? DEFAULT_SEED;
}

export const seededLessons = Object.keys(SEEDS);
