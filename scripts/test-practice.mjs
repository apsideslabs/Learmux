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
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
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
  'net-t1': {
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
function runTask(command) {
  const root = mkdtempSync(join(tmpdir(), 'learn-practice-'));
  const home = join(root, 'data', 'data', 'com.termux', 'files', 'home');
  mkdirSync(home, { recursive: true });
  try {
    const r = spawnSync('bash', ['-c', command], {
      encoding: 'utf8',
      timeout: 30000,
      // run from the home directory, the way a learner would, because one of
      // the tasks asks for pwd and that reports the working directory
      cwd: home,
      env: { ...process.env, HOME: home, NO_COLOR: '1' },
    });
    return `${r.stdout ?? ''}${r.stderr ?? ''}`;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

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

    const sample = SAMPLES[task.id];

    if (sample) {
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

    // No sample: run it for real.
    const out = runTask(task.command);
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
