/**
 * A real, small git.
 *
 * The course taught git only as a package you install, never as something you
 * use. Adding the lesson meant the sandbox had to be able to run it, and a
 * fake that prints canned text would teach the wrong thing the first time
 * somebody typed a command it did not know.
 *
 * So this is an actual implementation of the parts the lesson covers, over the
 * same virtual filesystem every other command uses: a repository is a `.git`
 * directory holding a HEAD, an index and a log, exactly as the real thing does.
 *
 * ## What it deliberately does not do
 *
 * No branches beyond the one, no remotes, no merges, no rebase. Each of those
 * is a lesson of its own and a half-built version would be worse than absent.
 * `git log` also prints no date, because the sandbox has no clock and inventing
 * one would put a false line in front of a learner.
 */

import type { CmdContext, CmdResult } from './types';
import { sha256Hex } from './hash';

const ok = (stdout = ''): CmdResult => ({ stdout });
const fail = (stderr: string, code = 1): CmdResult => ({ stderr, code });

const INDEX_PATH = '.git/index.json';
const LOG_PATH = '.git/log.json';
const BRANCH = 'main';

/** A snapshot of the working tree: relative path to contents. */
type Tree = Record<string, string>;

interface Commit {
  hash: string;
  message: string;
  files: Tree;
}

/** Walk up from the working directory looking for a repository. */
function findRoot(ctx: CmdContext): string | null {
  let dir = ctx.cwd;
  for (;;) {
    if (ctx.fs.exists(`${dir}/.git`, '/')) return dir;
    if (dir === '/') return null;
    const cut = dir.lastIndexOf('/');
    dir = cut <= 0 ? '/' : dir.slice(0, cut);
  }
}

function readJson<T>(ctx: CmdContext, path: string, fallback: T): T {
  try {
    if (!ctx.fs.exists(path, '/')) return fallback;
    return JSON.parse(ctx.fs.readFile(path, '/')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(ctx: CmdContext, path: string, value: unknown): void {
  ctx.fs.writeFile(path, '/', `${JSON.stringify(value, null, 2)}\n`);
}

/** Every tracked candidate file, ignoring the repository itself. */
function workTree(ctx: CmdContext, root: string): Tree {
  const out: Tree = {};
  let files: string[] = [];
  try {
    files = ctx.fs.walkFiles(root, '/');
  } catch {
    return out;
  }
  for (const abs of files) {
    const rel = abs.slice(root.length).replace(/^\//, '');
    if (!rel || rel === '.git' || rel.startsWith('.git/')) continue;
    try {
      out[rel] = ctx.fs.readFile(abs, '/');
    } catch {
      /* unreadable, skip it */
    }
  }
  return out;
}

const same = (a: Tree, b: Tree): boolean => {
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && a[k] === b[k]);
};

/** Longest common subsequence, for a diff that shows real changes only. */
function lcs(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const t: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
    }
  }
  const out: string[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      out.push(` ${a[i]}`);
      i++;
      j++;
    } else if (t[i + 1][j] >= t[i][j + 1]) {
      out.push(`-${a[i++]}`);
    } else {
      out.push(`+${b[j++]}`);
    }
  }
  while (i < m) out.push(`-${a[i++]}`);
  while (j < n) out.push(`+${b[j++]}`);
  return out;
}

function status(ctx: CmdContext, root: string): CmdResult {
  const index = readJson<Tree>(ctx, `${root}/${INDEX_PATH}`, {});
  const log = readJson<Commit[]>(ctx, `${root}/${LOG_PATH}`, []);
  const head = log.length ? log[log.length - 1].files : {};
  const work = workTree(ctx, root);

  const staged: string[] = [];
  for (const path of Object.keys(index).sort()) {
    if (!(path in head)) staged.push(`new file:   ${path}`);
    else if (index[path] !== head[path]) staged.push(`modified:   ${path}`);
  }

  const unstaged: string[] = [];
  const untracked: string[] = [];
  for (const path of Object.keys(work).sort()) {
    if (!(path in index)) untracked.push(path);
    else if (work[path] !== index[path]) unstaged.push(`modified:   ${path}`);
  }
  for (const path of Object.keys(index).sort()) {
    if (!(path in work)) unstaged.push(`deleted:    ${path}`);
  }

  const lines = [`On branch ${BRANCH}`, ''];
  if (!staged.length && !unstaged.length && !untracked.length) {
    lines.push('nothing to commit, working tree clean');
    return ok(lines.join('\n'));
  }
  if (!log.length && !staged.length) {
    lines.push('No commits yet', '');
  }
  if (staged.length) {
    lines.push('Changes to be committed:', '  (use "git commit -m <message>" to commit)');
    for (const s of staged) lines.push(`        ${s}`);
    lines.push('');
  }
  if (unstaged.length) {
    lines.push('Changes not staged for commit:', '  (use "git add <file>..." to update what will be committed)');
    for (const s of unstaged) lines.push(`        ${s}`);
    lines.push('');
  }
  if (untracked.length) {
    lines.push('Untracked files:', '  (use "git add <file>..." to include in what will be committed)');
    for (const u of untracked) lines.push(`        ${u}`);
    lines.push('');
  }
  return ok(lines.join('\n').replace(/\n+$/, ''));
}

function add(ctx: CmdContext, root: string, args: string[]): CmdResult {
  if (!args.length) return fail('git add: nothing specified, nothing added');
  const index = readJson<Tree>(ctx, `${root}/${INDEX_PATH}`, {});
  const work = workTree(ctx, root);

  const targets: string[] = [];
  for (const a of args) {
    if (a === '.' || a === '-A' || a === '--all') {
      targets.push(...Object.keys(work));
      continue;
    }
    const abs = ctx.fs.normalize(a, ctx.cwd);
    if (!abs.startsWith(root)) return fail(`git add: ${a}: outside the repository`);
    const rel = abs.slice(root.length).replace(/^\//, '');
    if (rel.startsWith('.git')) return fail('git add: cannot stage the repository itself');
    if (!(rel in work)) return fail(`git add: ${a}: no such file`);
    targets.push(rel);
  }
  for (const rel of targets) index[rel] = work[rel];
  writeJson(ctx, `${root}/${INDEX_PATH}`, index);
  return ok();
}

function commit(ctx: CmdContext, root: string, argv: string[]): CmdResult {
  const mIndex = argv.indexOf('-m');
  const message = mIndex >= 0 ? argv[mIndex + 1] : undefined;
  if (!message) {
    return fail('git commit: this sandbox has no editor, so pass a message: git commit -m "what changed"');
  }

  const index = readJson<Tree>(ctx, `${root}/${INDEX_PATH}`, {});
  const log = readJson<Commit[]>(ctx, `${root}/${LOG_PATH}`, []);
  const head = log.length ? log[log.length - 1].files : {};

  if (same(index, head)) {
    return fail('git commit: nothing staged. Use "git add <file>" first.');
  }

  const hash = sha256Hex(JSON.stringify(index) + message).slice(0, 7);
  log.push({ hash, message, files: { ...index } });
  writeJson(ctx, `${root}/${LOG_PATH}`, log);
  // After a commit the index matches the commit, the way real git leaves it.
  writeJson(ctx, `${root}/${INDEX_PATH}`, { ...index });

  const files = Object.keys(index).length;
  return ok(`[${BRANCH} ${hash}] ${message}\n ${files} file${files === 1 ? '' : 's'} changed`);
}

function log_(ctx: CmdContext, root: string): CmdResult {
  const log = readJson<Commit[]>(ctx, `${root}/${LOG_PATH}`, []);
  if (!log.length) return fail('git log: no commits yet');
  const blocks = [...log].reverse().map((c) => `commit ${c.hash}\n\n    ${c.message}`);
  return ok(blocks.join('\n\n'));
}

function diff(ctx: CmdContext, root: string): CmdResult {
  const index = readJson<Tree>(ctx, `${root}/${INDEX_PATH}`, {});
  const work = workTree(ctx, root);
  const out: string[] = [];

  for (const path of Object.keys(index).sort()) {
    const before = index[path];
    const after = path in work ? work[path] : '';
    if (before === after) continue;
    out.push(`diff --git a/${path} b/${path}`, `--- a/${path}`, `+++ b/${path}`, '@@');
    out.push(...lcs(before.split('\n'), after.split('\n')).filter((l) => l[0] !== ' '));
    out.push('');
  }
  if (!out.length) return ok('');
  return ok(out.join('\n').replace(/\n+$/, ''));
}

function init(ctx: CmdContext): CmdResult {
  const existing = findRoot(ctx);
  if (existing) return ok(`Reinitialised existing repository in ${existing}/.git/`);
  const root = ctx.cwd;
  try {
    ctx.fs.mkdir(`${root}/.git`, '/');
  } catch (e) {
    return fail(`git init: ${(e as Error).message}`);
  }
  ctx.fs.writeFile(`${root}/.git/HEAD`, '/', `ref: refs/heads/${BRANCH}\n`);
  writeJson(ctx, `${root}/${INDEX_PATH}`, {});
  writeJson(ctx, `${root}/${LOG_PATH}`, []);
  return ok(`Initialised empty repository in ${root}/.git/`);
}

/** The `git` command itself. */
export function gitRun(ctx: CmdContext): CmdResult {
  const sub = ctx.argv[0];
  if (!sub || sub === '--version') {
    if (sub === '--version') return ok('git version 2.45.2');
    return fail('git: a subcommand is required. Try: init, status, add, commit, log, diff');
  }

  if (sub === 'init') return init(ctx);

  const root = findRoot(ctx);
  if (!root) return fail('git: not a git repository. Run "git init" first.');

  switch (sub) {
    case 'status':
      return status(ctx, root);
    case 'add':
      return add(ctx, root, ctx.argv.slice(1));
    case 'commit':
      return commit(ctx, root, ctx.argv.slice(1));
    case 'log':
      return log_(ctx, root);
    case 'diff':
      return diff(ctx, root);
    default:
      return fail(`git: '${sub}' is not supported in this sandbox. Try: init, status, add, commit, log, diff`);
  }
}
