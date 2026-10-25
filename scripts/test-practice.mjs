#!/usr/bin/env node
/**
 * Verifies the practice tasks.
 *
 * A pattern-graded task is only useful if two things are true:
 *
 *   1. the command it asks for really does produce output its rules accept
 *   2. output that is wrong in an interesting way is actually rejected
 *
 * Point 2 matters more than it looks. A rule set that accepts anything is
 * worse than no rule at all, because it tells the learner they were right when
 * they were not.
 *
 * So each task is run for real, in a throwaway HOME, and graded. Tasks whose
 * tools are not available on the build machine are graded against several
 * realistic outputs instead, and every task is also fed deliberately wrong
 * output which must fail.
 *
 *   node scripts/test-practice.mjs
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outfile = join(ROOT, '.practice-data.mjs');

await build({
  stdin: {
    contents: `export { practiceSets } from './src/data/practice/index.ts';
      export { gradeOutput } from './src/lib/practice-grade.ts';`,
    resolveDir: ROOT,
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile,
  logLevel: 'warning',
});

const { practiceSets, gradeOutput } = await import(pathToFileURL(outfile).href);

/**
 * Outputs for tasks whose tools are not installed here. These are real nmap
 * formats, including the variations a learner will actually see: with and
 * without -sV, a different port, different spacing.
 */
const SAMPLES = {
  'scan-t1': {
    tool: 'nmap',
    reason: 'nmap is not installed on this machine',
    pass: [
      {
        name: 'a scan of four ports with none open',
        text: [
          'Starting Nmap 7.95 ( https://nmap.org ) at 2026-10-25 10:00 IST',
          'Nmap scan report for localhost (127.0.0.1)',
          'Host is up (0.000078s latency).',
          '',
          'PORT     STATE  SERVICE',
          '22/tcp   closed ssh',
          '80/tcp   closed http',
          '443/tcp  closed https',
          '8022/tcp closed unknown',
          '',
          'Nmap done: 1 IP address (1 host up) scanned in 0.09 seconds',
        ].join('\n'),
      },
      {
        name: 'a scan with sshd listening on 8022',
        text: [
          'Starting Nmap 7.95 ( https://nmap.org ) at 2026-10-25 10:02 IST',
          'Nmap scan report for localhost (127.0.0.1)',
          'Host is up (0.00012s latency).',
          '',
          'PORT     STATE SERVICE',
          '22/tcp   closed ssh',
          '8022/tcp open  ssh',
          '',
          'Nmap done: 1 IP address (1 host up) scanned in 0.11 seconds',
        ].join('\n'),
      },
    ],
    fail: [
      {
        name: 'the command was never installed',
        why: 'the command did not run',
        text: 'bash: nmap: command not found',
      },
      {
        name: 'an empty paste',
        why: 'nothing at all',
        text: '   ',
      },
      {
        name: 'the wrong tool entirely',
        why: 'this is not a scan',
        text: 'Proto Recv-Q Send-Q Local Address  Foreign Address  State\ntcp  0  0 0.0.0.0:8022  0.0.0.0:*  LISTEN',
      },
    ],
  },

  'ver-t1': {
    tool: 'nmap',
    reason: 'nmap is not installed on this machine',
    pass: [
      {
        name: 'a service scan that identified the version',
        text: [
          'Starting Nmap 7.95 ( https://nmap.org ) at 2026-10-25 10:05 IST',
          'Nmap scan report for localhost (127.0.0.1)',
          'Host is up (0.000098s latency).',
          '',
          'PORT     STATE SERVICE VERSION',
          '8010/tcp open  http    SimpleHTTPServer 0.6 (Python 3.12.13)',
          '',
          'Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .',
          'Nmap done: 1 IP address (1 host up) scanned in 6.31 seconds',
        ].join('\n'),
      },
      {
        name: 'a service scan that could only name the service',
        text: [
          'Starting Nmap 7.95 ( https://nmap.org ) at 2026-10-25 10:06 IST',
          'Nmap scan report for localhost (127.0.0.1)',
          'Host is up (0.00011s latency).',
          '',
          'PORT     STATE SERVICE VERSION',
          '8022/tcp open  ssh     OpenSSH 9.6 (protocol 2.0)',
          '',
          'Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .',
          'Nmap done: 1 IP address (1 host up) scanned in 6.44 seconds',
        ].join('\n'),
      },
    ],
    fail: [
      {
        name: 'a scan with no service detection',
        why: 'there is no VERSION column, so -sV did not run',
        text: 'Starting Nmap 7.95 ( https://nmap.org ) at 2026-10-25 10:07 IST\nNmap scan report for localhost (127.0.0.1)\nHost is up.\n\nPORT     STATE SERVICE\n8022/tcp open  ssh\n\nNmap done: 1 IP address (1 host up) scanned in 0.09 seconds',
      },
      {
        name: 'nmap was never installed',
        why: 'the command did not run',
        text: 'bash: nmap: command not found',
      },
      {
        name: 'an empty paste',
        why: 'nothing at all',
        text: '   ',
      },
    ],
  },

  'xfer-t1': {
    tool: 'rsync',
    reason: 'rsync is not installed on the build machine',
    pass: [
      {
        name: 'a dry run over two files',
        text: [
          'sending incremental file list',
          './',
          'draft.md',
          'final.md',
          '',
          'sent 123 bytes  received 57 bytes  360.00 bytes/sec',
          'total size is 12  speedup is 0.07 (DRY RUN)',
        ].join('\n'),
      },
      {
        name: 'a dry run that also lists a nested directory',
        text: [
          'sending incremental file list',
          './',
          'draft.md',
          'final.md',
          'notes/',
          'notes/todo.txt',
          '',
          'sent 210 bytes  received 88 bytes  596.00 bytes/sec',
          'total size is 41  speedup is 0.14 (DRY RUN)',
        ].join('\n'),
      },
    ],
    fail: [
      {
        name: 'a real transfer rather than a dry run',
        why: 'nothing says DRY RUN, so files may already have moved',
        text: 'sending incremental file list\ndraft.md\nfinal.md\n\nsent 123 bytes  received 57 bytes  360.00 bytes/sec',
      },
      {
        name: 'rsync was never installed',
        why: 'the command did not run',
        text: 'bash: rsync: command not found',
      },
      { name: 'an empty paste', why: 'nothing at all', text: '   ' },
    ],
  },

  'ssh-t1': {
    tool: 'ssh-keygen',
    reason: 'ssh-keygen is not installed on the build machine',
    pass: [
      {
        name: 'a key generated at the default path',
        text: [
          'Generating public/private ed25519 key pair.',
          'Enter file in which to save the key (/data/data/com.termux/files/home/.ssh/id_ed25519): ',
          "Created directory '/data/data/com.termux/files/home/.ssh'.",
          'Enter passphrase (empty for no passphrase): ',
          'Enter same passphrase again: ',
          'Your identification has been saved in /data/data/com.termux/files/home/.ssh/id_ed25519',
          'Your public key has been saved in /data/data/com.termux/files/home/.ssh/id_ed25519.pub',
          'The key fingerprint is:',
          'SHA256:5xK9mN2pQrT7vWbYzA1cD3eF4gH6jK8lM0nO2pQ4rS you@phone',
          "The key's randomart image is:",
          '+--[ED25519 256]--+',
          '|    .o+..        |',
          '|   . +o=         |',
          '+----[SHA256]-----+',
          'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH8kZ2mNpQrT7vWbYzA1cD3eF4gH6jK8lM0nO2pQ4rS you@phone',
        ].join('\n'),
      },
      {
        name: 'a key written to a named file, with a different comment',
        text: [
          'Generating public/private ed25519 key pair.',
          'Your identification has been saved in /data/data/com.termux/files/home/.ssh/phone_key',
          'Your public key has been saved in /data/data/com.termux/files/home/.ssh/phone_key.pub',
          'The key fingerprint is:',
          'SHA256:Ab1Cd2Ef3Gh4Ij5Kl6Mn7Op8Qr9St0Uv1Wx2Yz3A phone',
          'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC7dE9fG1hI2jK3lM4nO5pQ6rS7tU8vW9xY0zA1 phone',
        ].join('\n'),
      },
    ],
    fail: [
      {
        name: 'the public key was never printed',
        why: 'there is no ssh-ed25519 line, so the public half is missing',
        text: 'Generating public/private ed25519 key pair.\nThe key fingerprint is:\nSHA256:5xK9mN2pQrT7vWbYzA1cD3eF4gH6jK8lM0nO2pQ4rS you@phone',
      },
      {
        name: 'ssh-keygen was never installed',
        why: 'the command did not run',
        text: 'bash: ssh-keygen: command not found\ncat: /data/data/com.termux/files/home/.ssh/id_ed25519.pub: No such file or directory',
      },
      { name: 'an empty paste', why: 'nothing at all', text: '   ' },
    ],
  },

  'net-t1': {
    tool: 'nmap',
    reason: 'nmap and sshd are not installed on the build machine',
    pass: [
      {
        name: 'the usual -sV output',
        text: [
          'Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-26 12:00 IST',
          'Nmap scan report for localhost (127.0.0.1)',
          'Host is up (0.000078s latency).',
          '',
          'PORT     STATE SERVICE  VERSION',
          '8022/tcp open  ssh      OpenSSH 9.6 (protocol 2.0)',
          '',
          'Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .',
          'Nmap done: 1 IP address (1 host up) scanned in 6.21 seconds',
        ].join('\n'),
      },
      {
        name: 'without -sV, so no version column',
        text: [
          'Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-26 12:00 IST',
          'Nmap scan report for localhost (127.0.0.1)',
          'Host is up (0.000078s latency).',
          '',
          'PORT     STATE SERVICE',
          '8022/tcp open  ssh',
          '',
          'Nmap done: 1 IP address (1 host up) scanned in 6.21 seconds',
        ].join('\n'),
      },
      {
        name: 'a different port, because their sshd is configured differently',
        text: [
          'Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-26 12:00 IST',
          'Nmap scan report for 127.0.0.1',
          'Host is up.',
          '',
          'PORT    STATE SERVICE',
          '22/tcp  open  ssh',
          '',
          'Nmap done: 1 IP address (1 host up) scanned in 0.09 seconds',
        ].join('\n'),
      },
      {
        name: 'an extra closed port alongside the open one',
        text: [
          'Nmap scan report for localhost (127.0.0.1)',
          '',
          'PORT     STATE  SERVICE  VERSION',
          '8022/tcp open   ssh      OpenSSH 9.6 (protocol 2.0)',
          '80/tcp   closed http',
          '',
          'Nmap done: 1 IP address (1 host up) scanned in 0.11 seconds',
        ].join('\n'),
      },
    ],
    fail: [
      {
        name: 'only a closed port',
        why: 'nothing is reported open',
        text: 'PORT     STATE  SERVICE\n8022/tcp closed unknown\n\nNmap done: 1 IP address (1 host up) scanned',
      },
      {
        name: 'netstat instead of nmap',
        why: 'that is a listening-sockets table, not a scan',
        text: 'Proto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 0.0.0.0:8022            0.0.0.0:*               LISTEN',
      },
      {
        name: 'nmap was never installed',
        why: 'the command did not run',
        text: 'bash: nmap: command not found',
      },
      {
        name: 'an empty paste',
        why: 'nothing at all',
        text: '   ',
      },
    ],
  },
};

/**
 * Run a task's command in a throwaway HOME and return its combined output.
 *
 * The home is shaped like Termux's, because one of the tasks checks that the
 * working directory sits inside com.termux. Running it under an ordinary
 * temporary path would test the verifier rather than the task.
 */
function runTask(command, fixture) {
  const root = mkdtempSync(join(tmpdir(), 'learn-practice-'));
  const termuxFiles = join(root, 'data', 'data', 'com.termux', 'files');
  const home = join(termuxFiles, 'home');
  const prefix = join(termuxFiles, 'usr');
  mkdirSync(home, { recursive: true });
  if (fixture) {
    const script = extractFinalScript(fixture.lesson);
    if (script !== null) writeFileSync(join(home, fixture.as), script, { mode: 0o755 });
  }
  // Termux sets PREFIX to its own usr directory, and one of the tasks reads it
  mkdirSync(join(prefix, 'bin'), { recursive: true });
  try {
    const r = spawnSync('bash', ['-c', command], {
      encoding: 'utf8',
      timeout: 30000,
      // run from the home directory, the way a learner would, because one of
      // the tasks asks for pwd and that reports the working directory
      cwd: home,
      env: { ...process.env, HOME: home, PREFIX: prefix, NO_COLOR: '1' },
    });
    return `${r.stdout ?? ''}${r.stderr ?? ''}`;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

/**
 * The complete program from a lesson's "The whole script" section.
 *
 * Returns null if the lesson has no such section, so a typo in a fixture shows
 * up as a failed check rather than a task that silently passes on nothing.
 */
function extractFinalScript(lessonSlug) {
  const file = resolve(ROOT, 'src/content/tutorials', `${lessonSlug}.mdx`);
  if (!existsSync(file)) return null;
  const text = readFileSync(file, 'utf8');
  const at = text.indexOf('## The whole script');
  if (at === -1) return null;
  const m = /```[a-z]*\n([\s\S]*?)\n```/.exec(text.slice(at));
  return m ? m[1] + '\n' : null;
}

const toolAvailable = (name) =>
  spawnSync('bash', ['-c', `command -v ${name} >/dev/null 2>&1`], { encoding: 'utf8' }).status === 0;

let checks = 0;
let failures = 0;

const pass = (label) => {
  checks++;
  console.log(`  ok    ${label}`);
};
const fail = (label, detail) => {
  checks++;
  failures++;
  console.log(`  FAIL  ${label}`);
  if (detail) console.log(`        ${detail}`);
};

console.log('── practice tasks ──');

for (const set of practiceSets) {
  for (const task of set.tasks) {
    console.log(`\n${set.slug} / ${task.id}`);

    // A sample is a fallback, not a substitute. If the tool the task needs is
    // installed, the real command runs and the sample is ignored, so a machine
    // that has the tool verifies the task properly and only a machine without
    // it falls back.
    const sample = SAMPLES[task.id];
    const toolMissing = sample ? !toolAvailable(sample.tool) : false;

    if (sample && toolMissing) {
      console.log(`  note  graded against samples: ${sample.reason}`);
      for (const c of sample.pass) {
        const r = gradeOutput(c.text, task);
        if (r.passed) pass(`accepts ${c.name}`);
        else fail(`should accept ${c.name}`, `failed rule(s): ${r.results.filter((x) => !x.ok).map((x) => x.label).join('; ')}`);
      }
      for (const c of sample.fail) {
        const r = gradeOutput(c.text, task);
        if (!r.passed) pass(`rejects ${c.name} (${c.why})`);
        else fail(`should reject ${c.name}`, 'it was accepted');
      }
      continue;
    }

    // A task may need the script the lesson built. runTask writes it into its
    // own throwaway HOME first, so the command stays short and the thing under
    // test is the program the lesson actually ships.
    if (task.fixture && extractFinalScript(task.fixture.lesson) === null) {
      fail(`no final code block found in lesson ${task.fixture.lesson}`);
      continue;
    }

    // No sample: run it for real.
    const out = runTask(task.command, task.fixture);
    if (!out.trim()) {
      fail('the command produced no output at all', task.command);
      continue;
    }
    const r = gradeOutput(out, task);
    if (r.passed) pass('its own command produces output the rules accept');
    else {
      fail(
        'its own command was rejected by its own rules',
        `failed: ${r.results.filter((x) => !x.ok).map((x) => x.label).join('; ')}\n        output was: ${JSON.stringify(out.slice(0, 160))}`,
      );
    }

    // and the obvious wrong answers must not pass
    for (const [name, text] of [
      ['an empty paste', ''],
      ['a blank paste', '   \n  '],
      ['an error message', 'bash: command not found'],
      ['unrelated text', 'hello, this is not output from anything'],
    ]) {
      const bad = gradeOutput(text, task);
      if (!bad.passed) pass(`rejects ${name}`);
      else fail(`should reject ${name}`, 'it was accepted');
    }
  }
}

// Every set needs at least one question and one task, or the page is empty.
console.log('\n── set shape ──');
for (const set of practiceSets) {
  if (set.questions.length >= 3) pass(`${set.slug} has ${set.questions.length} questions`);
  else fail(`${set.slug} has too few questions (${set.questions.length})`);

  if (set.tasks.length >= 1) pass(`${set.slug} has ${set.tasks.length} task(s)`);
  else fail(`${set.slug} has no tasks`);

  // a question whose answer index is out of range would mark everyone wrong
  for (const q of set.questions) {
    if (q.answer >= 0 && q.answer < q.options.length) pass(`${q.id} answer index is in range`);
    else fail(`${q.id} answer index ${q.answer} is out of range for ${q.options.length} options`);

    if (q.explanation.trim().length >= 80) pass(`${q.id} has a real explanation`);
    else fail(`${q.id} explanation is too short to teach anything`);

    if (new Set(q.options).size === q.options.length) pass(`${q.id} options are distinct`);
    else fail(`${q.id} has a duplicate option`);
  }

  // a rule whose pattern will not compile would never pass
  for (const t of set.tasks) {
    for (const rule of t.rules) {
      if (rule.type === 'contains' || rule.type === 'lines') continue;
      try {
        new RegExp(rule.pattern, 'im');
        pass(`${t.id} rule pattern compiles`);
      } catch (e) {
        fail(`${t.id} rule pattern does not compile`, `${rule.pattern}: ${e.message}`);
      }
    }
    if (t.expects.trim().length >= 100) pass(`${t.id} explains what a good answer looks like`);
    else fail(`${t.id} has no real explanation`);
  }
}

console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} failure(s)`}  (${checks} checks)`);
if (failures) process.exit(1);
