#!/usr/bin/env node
/**
 * Tests the content validator.
 *
 * A validator that passes on everything is worse than none, because it looks
 * like coverage. This deliberately breaks one thing at a time, asserts the
 * validator rejects it, and puts the file back.
 *
 * Every mutation is restored in a finally block, so an interrupted run cannot
 * leave the repo modified.
 *
 *   node scripts/test-validator.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VALIDATOR = join(ROOT, 'scripts/validate-content.mjs');

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });

/** Run the validator and return { code, out }. */
function runValidator(extraArgs = []) {
  const r = spawnSync(process.execPath, [VALIDATOR, ...extraArgs], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 120000,
  });
  return { code: r.status ?? 1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

/**
 * Apply a mutation, run the validator, restore, and assert it failed with
 * something matching `expect`.
 */
function expectRejection(name, file, find, replace, expect, extraArgs = []) {
  const path = join(ROOT, file);
  if (!existsSync(path)) return check(name, false, `fixture missing: ${file}`);

  const original = readFileSync(path, 'utf8');
  if (!original.includes(find)) {
    return check(name, false, `could not apply the mutation, anchor not found in ${file}`);
  }

  try {
    writeFileSync(path, original.replace(find, replace), 'utf8');
    const { code, out } = runValidator(extraArgs);
    if (code === 0) return check(name, false, 'validator accepted a broken file');
    if (!expect.test(out)) {
      return check(name, false, `failed, but not for the expected reason: ${out.slice(0, 200)}`);
    }
    return check(name, true);
  } finally {
    writeFileSync(path, original, 'utf8');
  }
}

// ── challenges ──────────────────────────────────────────────────────────────
expectRejection(
  'challenge: read rule pointing at a file that does not exist',
  'src/data/challenges.json',
  '"path": "/data/data/com.termux/files/home/welcome.txt"',
  '"path": "/data/data/com.termux/files/home/does-not-exist.txt"',
  /read path does not exist in fs/,
);

expectRejection(
  'challenge: flag that cannot be found anywhere',
  'src/data/challenges.json',
  '"flag": "TERMUX{hello_world}"',
  '"flag": "TERMUX{nowhere_at_all}"',
  /cannot be found/,
);

expectRejection(
  'challenge: regex pattern that does not compile',
  'src/data/challenges.json',
  '"pattern": "\\\\bgrep\\\\b"',
  '"pattern": "\\\\bgrep("',
  /not a valid regular expression/,
);

expectRejection(
  'challenge: empty validation array',
  'src/data/challenges.json',
  '    "validation": [\n      {\n        "type": "read",\n        "path": "/data/data/com.termux/files/home/welcome.txt"\n      }\n    ]',
  '    "validation": []',
  /validation must be a non-empty array/,
);

// ── tools ───────────────────────────────────────────────────────────────────
expectRejection(
  'tool: command args repeat the binary name',
  'src/data/tools/files.ts',
  "args: '-la'",
  "args: 'ls -la'",
  /repeats the binary name/,
);

expectRejection(
  'tool: unknown category',
  'src/data/tools/files.ts',
  "category: 'files'",
  "category: 'nonsense'",
  /unknown category/,
);

// ── lessons ─────────────────────────────────────────────────────────────────
expectRejection(
  'lesson: track that is not in the curriculum',
  'src/content/tutorials/getting-started.mdx',
  'track: "foundations"',
  'track: "made-up-track"',
  /is not in src\/lib\/curriculum\.ts/,
);

expectRejection(
  'lesson: em dash in the prose',
  'src/content/tutorials/getting-started.mdx',
  '## Step 1',
  '## Step 1 \u2014',
  /em or en dash/,
);

expectRejection(
  'lesson: unbalanced code fences',
  'src/content/tutorials/getting-started.mdx',
  '\n```\n',
  '\n',
  /unbalanced code fences/,
);

// ── links (only when dist exists) ───────────────────────────────────────────
if (existsSync(join(ROOT, 'dist'))) {
  expectRejection(
    'link: internal link to a page that was never built',
    'dist/index.html',
    '</body>',
    '<a href="/Learmux/definitely-not-a-page/">broken</a></body>',
    /was not built/,
    ['--links'],
  );
} else {
  check('link: internal link to a page that was never built', true, 'skipped, no dist/');
}

// ── the clean tree must still pass ──────────────────────────────────────────
{
  const { code, out } = runValidator();
  check('clean tree passes', code === 0, code === 0 ? '' : out.slice(0, 300));
}

// ── report ──────────────────────────────────────────────────────────────────
let failed = 0;
for (const r of results) {
  if (r.ok) console.log(`OK   ${r.name}`);
  else {
    failed++;
    console.log(`FAIL ${r.name}${r.detail ? `\n       ${r.detail}` : ''}`);
  }
}
console.log(`\n${results.length - failed}/${results.length} validator tests passed`);
if (failed) process.exit(1);
