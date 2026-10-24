/**
 * The Learmux command set.
 *
 * Every command is a pure-ish function of (virtual fs, argv, stdin) → output.
 * There is no real OS underneath: this is what "explicit command parsing and
 * predictable challenge state" buys us. Commands that would normally talk to a
 * network or the device (nmap, curl, pkg, ps, ifconfig, ...) consult a
 * per-challenge `overrides` table so the output is authored, not random.
 */

import type { Command, CmdContext, CmdResult } from './types';
import { FsError } from './fs';
import { sha256Hex } from './hash';

const ok = (stdout = ''): CmdResult => ({ stdout });
const fail = (stderr: string, code = 1): CmdResult => ({ stderr, code });

/** Simple glob matcher supporting * and ?. */
function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`);
}

function parseFlags(argv: string[]): { flags: Set<string>; args: string[] } {
  const flags = new Set<string>();
  const args: string[] = [];
  for (const token of argv) {
    if (token.startsWith('--')) flags.add(token);
    else if (token.startsWith('-') && token.length > 1 && !/^-\d/.test(token)) {
      for (const ch of token.slice(1)) flags.add('-' + ch);
    } else args.push(token);
  }
  return { flags, args };
}

function flagValue(argv: string[], short: string): string | undefined {
  const i = argv.indexOf(short);
  if (i >= 0 && i + 1 < argv.length) return argv[i + 1];
  return undefined;
}

function typeOf(node: { type: string }): string {
  return node.type === 'dir' ? 'directory' : 'ASCII text';
}

/** Render an octal mode (e.g. "666") as ls-style symbols ("-rw-rw-rw-"). */
function symbolicMode(mode: string | undefined, isDir = false): string {
  const oct = (mode ?? (isDir ? '755' : '644')).replace(/\D/g, '').padStart(3, '0').slice(-3);
  let out = isDir ? 'd' : '-';
  for (const digit of oct) {
    const n = parseInt(digit, 10) || 0;
    out += (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
  }
  return out;
}

function longEntry(name: string, node: { type: string; mode?: string; owner?: string; content?: string }): string {
  const owner = node.owner ?? 'u0_a0';
  const size = node.type === 'dir' ? 4096 : (node.content ?? '').length;
  const perms = symbolicMode(node.mode, node.type === 'dir');
  return `${perms} 1 ${owner} ${owner} ${String(size).padStart(6)}  Jan  1 00:00 ${name}`;
}

function readInputs(ctx: CmdContext, args: string[]): { text: string; error?: string } {
  if (args.length === 0) return { text: ctx.stdin };
  const parts: string[] = [];
  for (const a of args) {
    try {
      const text = ctx.fs.readFile(a, ctx.cwd);
      // record the read so explicit validation rules can see it
      ctx.record?.('read', ctx.fs.normalize(a, ctx.cwd));
      parts.push(text);
    } catch (e) {
      return { text: '', error: (e as FsError).message };
    }
  }
  return { text: parts.join('\n') };
}

// ─────────────────────────────────────────────────────────────────────────────

const commands: Command[] = [];

function def(name: string, summary: string, run: Command['run'], usage?: string) {
  commands.push({ name, summary, run, usage });
}

// --- navigation & listing ---------------------------------------------------

def('pwd', 'Print the working directory', (ctx) => ok(ctx.cwd));

def('cd', 'Change the working directory', (ctx) => {
  const target = ctx.argv[0] ?? '~';
  const abs = ctx.fs.normalize(target, ctx.cwd);
  if (!ctx.fs.exists(abs, ctx.cwd)) return fail(`cd: ${target}: No such file or directory`);
  if (!ctx.fs.isDir(abs, ctx.cwd)) return fail(`cd: ${target}: Not a directory`);
  return { cwd: abs };
}, 'cd [dir]');

def('ls', 'List directory contents', (ctx) => {
  const { flags, args } = parseFlags(ctx.argv);
  const showAll = flags.has('-a') || flags.has('--all');
  const long = flags.has('-l');
  const targets = args.length ? args : ['.'];
  const lines: string[] = [];
  let multiple = targets.length > 1;

  for (const target of targets) {
    const abs = ctx.fs.normalize(target, ctx.cwd);
    const node = ctx.fs.child(abs, ctx.cwd);
    if (!node) {
      lines.push(`ls: ${target}: No such file or directory`);
      continue;
    }
    if (node.type === 'file') {
      lines.push(long ? longEntry(target, node) : target);
      continue;
    }
    if (multiple) lines.push(`${target}:`);
    let names = Object.keys(node.children).sort();
    if (!showAll) names = names.filter((n) => !n.startsWith('.'));
    if (showAll) names = ['.', '..', ...names];
    if (long) {
      for (const n of names) {
        if (n === '.' || n === '..') lines.push(longEntry(n, { type: 'dir' }));
        else lines.push(longEntry(n, node.children[n]));
      }
    } else {
      lines.push(names.join('  '));
    }
    if (multiple) lines.push('');
  }
  return ok(lines.join('\n').replace(/\n+$/, ''));
}, 'ls [-la] [dir...]');

def('tree', 'Display a directory tree', (ctx) => {
  const target = ctx.argv.filter((a) => !a.startsWith('-'))[0] ?? '.';
  const abs = ctx.fs.normalize(target, ctx.cwd);
  if (!ctx.fs.isDir(abs, ctx.cwd)) return fail(`tree: ${target}: Not a directory`);
  const out: string[] = [abs];
  const rec = (path: string, prefix: string) => {
    const names = (ctx.fs.list(path, ctx.cwd) ?? []).sort();
    names.forEach((name, i) => {
      const last = i === names.length - 1;
      const childPath = (path === '/' ? '' : path) + '/' + name;
      const node = ctx.fs.child(childPath, ctx.cwd)!;
      out.push(prefix + (last ? '└── ' : '├── ') + name);
      if (node.type === 'dir') rec(childPath, prefix + (last ? '    ' : '│   '));
    });
  };
  rec(abs, '');
  return ok(out.join('\n'));
}, 'tree [dir]');

def('find', 'Search for files in a directory hierarchy', (ctx) => {
  const { args } = parseFlags(ctx.argv);
  const nameFlag = flagValue(ctx.argv, '-name');
  const typeFlag = flagValue(ctx.argv, '-type');
  const start = args[0] ?? '.';
  const files = ctx.fs.walkFiles(start, ctx.cwd);
  let results = files;
  if (nameFlag) {
    const re = globToRegExp(nameFlag);
    results = results.filter((f) => re.test(f.split('/').pop() ?? ''));
  }
  if (typeFlag === 'f') results = results.filter((f) => ctx.fs.isFile(f, ctx.cwd));
  return ok(results.join('\n'));
}, 'find [path] [-name pattern] [-type f|d]');

// --- reading & writing ------------------------------------------------------

def('cat', 'Concatenate and print files', (ctx) => {
  const { flags, args } = parseFlags(ctx.argv);
  const number = flags.has('-n');
  const { text, error } = readInputs(ctx, args);
  if (error) return fail(error);
  if (number) {
    return ok(text.split('\n').map((l, i) => `${String(i + 1).padStart(6)}\t${l}`).join('\n'));
  }
  return ok(text);
}, 'cat [-n] [file...]');

def('head', 'Output the first part of files', (ctx) => {
  const n = parseInt(flagValue(ctx.argv, '-n') ?? '10', 10);
  const args = ctx.argv.filter((a) => a !== '-n' && !/^\d+$/.test(a));
  const { text, error } = readInputs(ctx, args);
  if (error) return fail(error);
  return ok(text.split('\n').slice(0, n).join('\n'));
}, 'head [-n N] [file...]');

def('tail', 'Output the last part of files', (ctx) => {
  const n = parseInt(flagValue(ctx.argv, '-n') ?? '10', 10);
  const args = ctx.argv.filter((a) => a !== '-n' && !/^\d+$/.test(a));
  const { text, error } = readInputs(ctx, args);
  if (error) return fail(error);
  return ok(text.split('\n').slice(-n).join('\n'));
}, 'tail [-n N] [file...]');

def('echo', 'Display a line of text', (ctx) => {
  const noNewline = ctx.argv[0] === '-n';
  const parts = noNewline ? ctx.argv.slice(1) : ctx.argv;
  const text = parts.join(' ').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  return ok(text + (noNewline ? '' : '\n'));
}, 'echo [-n] [text...]');

def('printf', 'Format and print data', (ctx) => {
  const fmt = ctx.argv[0] ?? '';
  const rest = ctx.argv.slice(1);
  let i = 0;
  return ok(fmt.replace(/\\n/g, '\n').replace(/%s/g, () => rest[i++] ?? ''));
}, 'printf FORMAT [args...]');

def('touch', 'Create empty files', (ctx) => {
  if (!ctx.argv.length) return fail('touch: missing file operand');
  for (const a of ctx.argv) {
    try { ctx.fs.touch(a, ctx.cwd); } catch (e) { return fail((e as FsError).message); }
  }
  return ok();
}, 'touch file...');

def('mkdir', 'Create directories', (ctx) => {
  const { flags, args } = parseFlags(ctx.argv);
  if (!args.length) return fail('mkdir: missing operand');
  for (const a of args) {
    try { ctx.fs.mkdir(a, ctx.cwd, flags.has('-p')); } catch (e) { return fail((e as FsError).message); }
  }
  return ok();
}, 'mkdir [-p] dir...');

def('rm', 'Remove files or directories', (ctx) => {
  const { flags, args } = parseFlags(ctx.argv);
  if (!args.length) return fail('rm: missing operand');
  for (const a of args) {
    try { ctx.fs.remove(a, ctx.cwd, flags.has('-r') || flags.has('-R')); }
    catch (e) { if (!flags.has('-f')) return fail((e as FsError).message); }
  }
  return ok();
}, 'rm [-rf] path...');

def('cp', 'Copy files', (ctx) => {
  const { flags, args } = parseFlags(ctx.argv);
  if (args.length < 2) return fail('cp: missing destination file operand');
  const [src, dest] = args;
  try {
    if (ctx.fs.isDir(src, ctx.cwd)) {
      if (!(flags.has('-r') || flags.has('-R'))) return fail(`cp: -r not specified; omitting directory '${src}'`);
      const tree = ctx.fs.child(src, ctx.cwd)!;
      ctx.fs.mkdir(dest, ctx.cwd, true);
      for (const f of ctx.fs.walkFiles(src, ctx.cwd)) {
        const rel = f.slice(ctx.fs.normalize(src, ctx.cwd).length);
        ctx.fs.writeFile(ctx.fs.normalize(dest, ctx.cwd) + rel, ctx.cwd, ctx.fs.readFile(f, ctx.cwd));
      }
      void tree;
    } else {
      const content = ctx.fs.readFile(src, ctx.cwd);
      if (ctx.fs.isDir(dest, ctx.cwd)) ctx.fs.writeFile(dest.replace(/\/$/, '') + '/' + src.split('/').pop(), ctx.cwd, content);
      else ctx.fs.writeFile(dest, ctx.cwd, content);
    }
  } catch (e) { return fail((e as FsError).message); }
  return ok();
}, 'cp [-r] src dest');

def('mv', 'Move / rename files', (ctx) => {
  const args = ctx.argv.filter((a) => !a.startsWith('-'));
  if (args.length < 2) return fail('mv: missing destination file operand');
  const [src, dest] = args;
  try {
    const content = ctx.fs.isDir(src, ctx.cwd) ? '' : ctx.fs.readFile(src, ctx.cwd);
    const isDir = ctx.fs.isDir(src, ctx.cwd);
    let finalDest = dest;
    if (ctx.fs.isDir(dest, ctx.cwd)) finalDest = dest.replace(/\/$/, '') + '/' + src.split('/').pop();
    if (isDir) ctx.fs.mkdir(finalDest, ctx.cwd, true);
    else ctx.fs.writeFile(finalDest, ctx.cwd, content);
    ctx.fs.remove(src, ctx.cwd, true);
  } catch (e) { return fail((e as FsError).message); }
  return ok();
}, 'mv src dest');

// --- text processing --------------------------------------------------------

def('grep', 'Search text for a pattern', (ctx) => {
  const { flags, args } = parseFlags(ctx.argv);
  if (!args.length) return fail('grep: missing pattern');
  const pattern = args[0];
  const files = args.slice(1);
  const flagsStr = (flags.has('-i') ? 'i' : '') + (flags.has('-E') ? '' : '');
  let re: RegExp;
  try { re = new RegExp(pattern, flagsStr); } catch { return fail(`grep: invalid pattern`); }
  const invert = flags.has('-v');
  const withLine = flags.has('-n');
  const count = flags.has('-c');
  const recursive = flags.has('-r') || flags.has('-R');

  const search = (text: string, label?: string): string[] => {
    const lines = text.split('\n');
    const hits: string[] = [];
    let matched = 0;
    lines.forEach((line, i) => {
      const m = re.test(line);
      if (m !== invert) {
        matched++;
        if (!count) {
          const prefix = label ? `${label}:` : '';
          hits.push(`${prefix}${withLine ? i + 1 + ':' : ''}${line}`);
        }
      }
    });
    if (count) return [`${label ? label + ':' : ''}${matched}`];
    return hits;
  };

  let out: string[] = [];
  if (recursive) {
    for (const f of ctx.fs.walkFiles(files[0] ?? '.', ctx.cwd)) {
      out.push(...search(ctx.fs.readFile(f, ctx.cwd), f));
    }
  } else if (files.length) {
    for (const f of files) {
      try { out.push(...search(ctx.fs.readFile(f, ctx.cwd), files.length > 1 ? f : undefined)); }
      catch (e) { return fail((e as FsError).message); }
    }
  } else {
    out = search(ctx.stdin);
  }
  return { stdout: out.join('\n'), code: out.length ? 0 : 1 };
}, 'grep [-invc r] PATTERN [file...]');

def('sed', 'Stream editor (s/find/replace/)', (ctx) => {
  const expr = ctx.argv[0];
  if (!expr) return fail('sed: missing script');
  const m = expr.match(/^s(.)(.*?)\1(.*?)\1([gi]*)$/);
  if (!m) return fail('sed: only s/find/replace/ is supported');
  const [, , find, repl, mods] = m;
  const re = new RegExp(find, mods.includes('g') ? 'g' : '');
  const { text, error } = readInputs(ctx, ctx.argv.slice(1));
  if (error) return fail(error);
  return ok(text.replace(re, repl));
}, 'sed s/find/replace/[g] [file]');

def('sort', 'Sort lines of text', (ctx) => {
  const { flags, args } = parseFlags(ctx.argv);
  const { text, error } = readInputs(ctx, args);
  if (error) return fail(error);
  let lines = text.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  lines.sort((a, b) => (flags.has('-n') ? parseFloat(a) - parseFloat(b) : a.localeCompare(b)));
  if (flags.has('-r')) lines.reverse();
  if (flags.has('-u')) lines = [...new Set(lines)];
  return ok(lines.join('\n'));
}, 'sort [-rnu] [file]');

def('uniq', 'Report or omit repeated lines', (ctx) => {
  const { flags, args } = parseFlags(ctx.argv);
  const { text, error } = readInputs(ctx, args);
  if (error) return fail(error);
  const lines = text.split('\n');
  const out: string[] = [];
  let prev: string | undefined;
  let n = 0;
  const flush = () => { if (prev !== undefined) out.push(flags.has('-c') ? `${String(n).padStart(7)} ${prev}` : prev); };
  for (const line of lines) {
    if (line === prev) n++;
    else { flush(); prev = line; n = 1; }
  }
  flush();
  return ok(out.join('\n'));
}, 'uniq [-c] [file]');

def('cut', 'Remove sections from each line', (ctx) => {
  // Accept both "-d:" / "-f3" (attached) and "-d :" / "-f 3" (separate).
  let delim = '\t';
  let fieldsArg = '1';
  const files: string[] = [];
  for (let i = 0; i < ctx.argv.length; i++) {
    const a = ctx.argv[i];
    let m: RegExpMatchArray | null;
    if ((m = a.match(/^-d(.*)$/))) delim = m[1] || ctx.argv[++i] || '\t';
    else if ((m = a.match(/^-f(.*)$/))) fieldsArg = m[1] || ctx.argv[++i] || '1';
    else if (!a.startsWith('-')) files.push(a);
  }
  const fields = fieldsArg.split(',').map((n) => parseInt(n, 10));
  const { text, error } = readInputs(ctx, files);
  if (error) return fail(error);
  return ok(text.split('\n').map((l) => l.split(delim).filter((_, i) => fields.includes(i + 1)).join(delim)).join('\n'));
}, 'cut -d DELIM -f N [file]');

def('tr', 'Translate characters', (ctx) => {
  const [set1, set2 = ''] = ctx.argv;
  if (!set1) return fail('tr: missing operand');
  const out = ctx.stdin.split('').map((ch) => {
    const i = set1.indexOf(ch);
    return i >= 0 ? (set2[i] ?? set2[set2.length - 1] ?? ch) : ch;
  }).join('');
  return ok(out);
}, 'tr SET1 [SET2]  (reads stdin)');

def('rev', 'Reverse lines of text', (ctx) => {
  const { args } = parseFlags(ctx.argv);
  const { text, error } = readInputs(ctx, args);
  if (error) return fail(error);
  return ok(text.split('\n').map((l) => [...l].reverse().join('')).join('\n'));
}, 'rev [file]');

def('wc', 'Count lines, words and bytes', (ctx) => {
  const { flags, args } = parseFlags(ctx.argv);
  const { text, error } = readInputs(ctx, args);
  if (error) return fail(error);
  const lines = text === '' ? 0 : text.split('\n').length;
  const words = text.split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const label = args[0] ?? '';
  if (flags.has('-l')) return ok(`${lines}${label ? ' ' + label : ''}`);
  if (flags.has('-w')) return ok(`${words}${label ? ' ' + label : ''}`);
  if (flags.has('-c')) return ok(`${chars}${label ? ' ' + label : ''}`);
  return ok(`${lines} ${words} ${chars}${label ? ' ' + label : ''}`);
}, 'wc [-lwc] [file]');

def('strings', 'Print printable character sequences', (ctx) => {
  const { args } = parseFlags(ctx.argv);
  const { text, error } = readInputs(ctx, args);
  if (error) return fail(error);
  const found = text.match(/[\x20-\x7e]{4,}/g) ?? [];
  return ok(found.join('\n'));
}, 'strings [file]');

// --- encoding ---------------------------------------------------------------

def('base64', 'Base64 encode or decode', (ctx) => {
  const decode = ctx.argv.includes('-d') || ctx.argv.includes('--decode');
  const args = ctx.argv.filter((a) => !a.startsWith('-'));
  const { text, error } = readInputs(ctx, args);
  if (error) return fail(error);
  try {
    if (decode) {
      const clean = text.replace(/\s+/g, '');
      const bin = atob(clean);
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      return ok(new TextDecoder().decode(bytes));
    }
    const bytes = new TextEncoder().encode(text.replace(/\n$/, ''));
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return ok(btoa(bin));
  } catch {
    return fail('base64: invalid input');
  }
}, 'base64 [-d] [file]');

def('xxd', 'Hex dump', (ctx) => {
  const { args } = parseFlags(ctx.argv);
  const { text, error } = readInputs(ctx, args);
  if (error) return fail(error);
  const bytes = new TextEncoder().encode(text);
  const out: string[] = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const hex = Array.from(chunk, (b) => b.toString(16).padStart(2, '0')).join(' ');
    const ascii = Array.from(chunk, (b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.')).join('');
    out.push(`${i.toString(16).padStart(8, '0')}: ${hex.padEnd(47)}  ${ascii}`);
  }
  return ok(out.join('\n'));
}, 'xxd [file]');

def('hexdump', 'Hex dump (hexdump -C)', (ctx) => {
  const { args } = parseFlags(ctx.argv);
  const { text, error } = readInputs(ctx, args);
  if (error) return fail(error);
  const bytes = new TextEncoder().encode(text);
  const out: string[] = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const hex = Array.from(chunk, (b) => b.toString(16).padStart(2, '0')).join(' ');
    const ascii = Array.from(chunk, (b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.')).join('');
    out.push(`${i.toString(16).padStart(8, '0')}  ${hex.padEnd(47)}  |${ascii}|`);
  }
  return ok(out.join('\n'));
}, 'hexdump [-C] [file]');

def('sha256sum', 'Compute SHA-256 checksums', (ctx) => {
  const { args } = parseFlags(ctx.argv);
  if (!args.length) return ok(`${sha256Hex(ctx.stdin)}  -`);
  const lines = args.map((a) => {
    try {
      return `${sha256Hex(ctx.fs.readFile(a, ctx.cwd))}  ${a}`;
    } catch {
      return `sha256sum: ${a}: No such file or directory`;
    }
  });
  return ok(lines.join('\n'));
}, 'sha256sum [file...]');

def('rot13', 'ROT13 cipher helper', (ctx) => {
  const { args } = parseFlags(ctx.argv);
  const { text, error } = readInputs(ctx, args);
  if (error) return fail(error);
  const out = text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
  return ok(out);
}, 'rot13 [file]');

// --- metadata & permissions -------------------------------------------------

def('file', 'Determine file type', (ctx) => {
  if (!ctx.argv.length) return fail('file: missing operand');
  return ok(ctx.argv.map((a) => {
    const n = ctx.fs.stat(a, ctx.cwd);
    if (!n) return `${a}: cannot open (No such file or directory)`;
    return `${a}: ${typeOf(n)}`;
  }).join('\n'));
}, 'file file...');

def('stat', 'Display file status', (ctx) => {
  const a = ctx.argv[0];
  if (!a) return fail('stat: missing operand');
  const n = ctx.fs.stat(a, ctx.cwd);
  if (!n) return fail(`stat: cannot stat '${a}': No such file or directory`);
  return ok([
    `  File: ${a}`,
    `  Size: ${n.type === 'dir' ? 4096 : (n.content ?? '').length}\tType: ${n.type}`,
    `Access: (0${n.mode ?? (n.type === 'dir' ? '755' : '644')})  Uid: (10000/${n.owner ?? 'u0_a0'})`,
  ].join('\n'));
}, 'stat file');

def('chmod', 'Change file mode bits', (ctx) => {
  const [mode, path] = ctx.argv;
  if (!mode || !path) return fail('chmod: missing operand');
  const node = ctx.fs.stat(path, ctx.cwd);
  if (!node) return fail(`chmod: cannot access '${path}': No such file or directory`);
  node.mode = mode.replace(/^0/, '');
  return ok();
}, 'chmod MODE file');

def('chown', 'Change file owner', (ctx) => {
  const [, path] = ctx.argv;
  const node = path ? ctx.fs.stat(path, ctx.cwd) : undefined;
  if (node) node.owner = ctx.argv[0];
  return node ? ok() : fail(`chown: cannot access '${path}'`);
}, 'chown user file');

def('du', 'Estimate file space usage', (ctx) => {
  const target = ctx.argv.filter((a) => !a.startsWith('-'))[0] ?? '.';
  const files = ctx.fs.walkFiles(target, ctx.cwd);
  const total = files.reduce((sum, f) => sum + ctx.fs.readFile(f, ctx.cwd).length, 0);
  return ok(`${Math.ceil(total / 1024)}\t${target}`);
}, 'du [dir]');

def('df', 'Report filesystem usage', () => ok(
  'Filesystem     1K-blocks    Used Available Use% Mounted on\n' +
  '/dev/block/dm-5   4194304  512000   3682304  13% /data',
));

// --- system & identity ------------------------------------------------------

def('whoami', 'Print the current user', (ctx) => ok(ctx.user));
def('hostname', 'Print the host name', (ctx) => ok(ctx.host));
def('id', 'Print user identity', (ctx) => ok(`uid=10123(${ctx.user}) gid=10123(${ctx.user}) groups=10123(${ctx.user}) context=u:r:untrusted_app:s0`));

def('uname', 'Print system information', (ctx) => {
  const all = ctx.argv.includes('-a');
  return ok(all ? 'Linux localhost 5.15.94-android13 #1 SMP PREEMPT aarch64 Android' : 'Linux');
}, 'uname [-a]');

def('date', 'Print the current date', () => ok(new Date().toString()));
def('uptime', 'Show how long the system has been running', () => ok(' 14:32:07 up 2 days,  3:14,  1 user,  load average: 0.42, 0.31, 0.28'));

def('env', 'Print environment variables', (ctx) => ok(Object.entries(ctx.env).map(([k, v]) => `${k}=${v}`).join('\n')));
def('printenv', 'Print environment variables', (ctx) => {
  if (ctx.argv[0]) return ok(ctx.env[ctx.argv[0]] ?? '');
  return ok(Object.entries(ctx.env).map(([k, v]) => `${k}=${v}`).join('\n'));
});
def('export', 'Set an environment variable', (ctx) => {
  const [kv] = ctx.argv;
  if (!kv) return fail('export: usage: export KEY=value');
  const [k, ...rest] = kv.split('=');
  ctx.env[k] = rest.join('=');
  return ok();
}, 'export KEY=value');

def('ps', 'Report a snapshot of processes', (ctx) => {
  if (ctx.overrides?.ps) return ok(ctx.overrides.ps);
  return ok('  PID TTY          TIME CMD\n 1234 pts/0    00:00:00 bash\n 1288 pts/0    00:00:00 ps');
}, 'ps');

def('which', 'Locate a command', (ctx) => {
  const name = ctx.argv[0];
  if (!name) return fail('which: missing operand');
  return ok(`/data/data/com.termux/files/usr/bin/${name}`);
}, 'which cmd');

def('type', 'Show how a command would be interpreted', (ctx) => {
  const name = ctx.argv[0];
  return ok(name ? `${name} is /data/data/com.termux/files/usr/bin/${name}` : '');
}, 'type cmd');

def('history', 'Show command history', (ctx) => ok('')); // filled by the UI layer

def('hint', 'Reveal the next hint for this challenge', () => ok('No hints available for this challenge.'));

def('clear', 'Clear the screen', () => ({ clear: true }));
def('exit', 'Close the session', () => ({ exit: true }));
def('logout', 'Close the session', () => ({ exit: true }));
def('true', 'Do nothing, successfully', () => ok());
def('false', 'Do nothing, unsuccessfully', () => fail('', 1));

def('seq', 'Print a sequence of numbers', (ctx) => {
  const nums = ctx.argv.map(Number);
  let [start, step, end] = nums.length === 1 ? [1, 1, nums[0]] : nums.length === 2 ? [nums[0], 1, nums[1]] : [nums[0], nums[1], nums[2]];
  const out: number[] = [];
  if (step === 0 || (end - start) / step > 10000) return fail('seq: invalid or too large range');
  if (step > 0) for (let i = start; i <= end; i += step) out.push(i);
  else for (let i = start; i >= end; i += step) out.push(i);
  return ok(out.join('\n'));
}, 'seq [first [step]] last');

def('man', 'Display the manual for a command', (ctx) => {
  const name = ctx.argv[0];
  const cmd = name ? commands.find((c) => c.name === name) : undefined;
  if (!cmd) return ok('What manual page do you want?');
  return ok([`NAME`, `    ${cmd.name} — ${cmd.summary}`, '', `SYNOPSIS`, `    ${cmd.usage ?? cmd.name}`].join('\n'));
}, 'man cmd');

def('help', 'List available commands', () => {
  const lines = ['Learmux shell — available commands:', ''];
  const width = Math.max(...commands.map((c) => c.name.length));
  for (const c of [...commands].sort((a, b) => a.name.localeCompare(b.name))) {
    lines.push(`  ${c.name.padEnd(width + 2)}${c.summary}`);
  }
  lines.push('', 'Tip: pipes (|), redirection (> and >>) and history (↑/↓) all work.');
  return ok(lines.join('\n'));
});

// --- Termux-flavoured & network (challenge-authored output) ------------------

def('pkg', 'Termux package manager', (ctx) => {
  if (ctx.overrides?.pkg) return ok(ctx.overrides.pkg);
  const [action, pkg] = ctx.argv;
  if (action === 'install') return ok(`Reading package lists... Done\nBuilding dependency tree... Done\nSetting up ${pkg ?? 'package'} ...`);
  if (action === 'list-installed') return ok('bash\ncoreutils\nnmap\nopenssh\npython');
  return ok('usage: pkg [install|list-installed|update|upgrade] [package]');
}, 'pkg install <package>');

def('apt', 'Alias for pkg', (ctx) => commands.find((c) => c.name === 'pkg')!.run(ctx));
def('termux-info', 'Show Termux and device information', (ctx) => ok(ctx.overrides?.['termux-info'] ?? 'Termux Variables:\n  TERMUX_VERSION=0.118.0\n  TERMUX_MAIN_PACKAGE_FORMAT=debian\n\nPackages CPU architecture:\n  aarch64\n\nUpdatable packages:\n  All packages up to date'));
def('termux-setup-storage', 'Request storage permission', (ctx) => ok(ctx.overrides?.['termux-setup-storage'] ?? 'Storage permission granted.'));

def('ifconfig', 'Configure network interfaces', (ctx) => ok(ctx.overrides?.ifconfig ?? 'wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 10.0.2.15  netmask 255.255.255.0  broadcast 10.0.2.255\n        ether 02:42:ac:11:00:02  txqueuelen 1000'));
def('ip', 'Show / manipulate routing and devices', (ctx) => ok(ctx.overrides?.ip ?? '2: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 10.0.2.15/24 brd 10.0.2.255 scope global wlan0'));
def('ping', 'Send ICMP echo requests', (ctx) => ok(ctx.overrides?.ping ?? `PING ${ctx.argv[0] ?? 'localhost'} (10.0.2.2) 56(84) bytes of data.\n64 bytes from 10.0.2.2: icmp_seq=1 ttl=64 time=0.42 ms`));
def('netstat', 'Print network connections', (ctx) => ok(ctx.overrides?.netstat ?? 'Proto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 0.0.0.0:8022            0.0.0.0:*               LISTEN'));
def('nmap', 'Network port scanner', (ctx) => ok(ctx.overrides?.nmap ?? `Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for ${ctx.argv[ctx.argv.length - 1] ?? 'localhost'}\nPORT     STATE SERVICE\n8022/tcp open  ssh\nNmap done: 1 IP address (1 host up) scanned`), 'nmap <host>');
def('curl', 'Transfer data from a URL', (ctx) => ok(ctx.overrides?.curl ?? `<!DOCTYPE html>\n<html><body>Learmux demo server</body></html>`), 'curl <url>');
def('wget', 'Download files from the web', (ctx) => ok(ctx.overrides?.wget ?? `--2026-01-01--  ${ctx.argv[0] ?? 'http://localhost/'}\nSaving to: 'index.html'\nindex.html  100%[====>]  42  --.-KB/s`));
def('ssh', 'OpenSSH client', (ctx) => ok(ctx.overrides?.ssh ?? `The authenticity of host '${ctx.argv[0] ?? 'localhost'}' can't be established.\nConnection closed by remote host.`));
def('nc', 'Netcat', (ctx) => ok(ctx.overrides?.nc ?? `(UNKNOWN) [${ctx.argv[0] ?? 'localhost'}] ${ctx.argv[1] ?? ''} open`));
def('sudo', 'Execute as root', (ctx) => ok(ctx.overrides?.sudo ?? `[sudo] password for ${ctx.user}:\nsudo: permission denied (are you in the sudoers file?)`));
def('python', 'Python interpreter', (ctx) => {
  if (ctx.overrides?.python) return ok(ctx.overrides.python);
  if (ctx.argv[0] === '-c') return ok(''); // no real evaluation in the sandbox
  return ok('Python 3.12.4 (main, Termux) \nType "help", "copyright", "credits" or "license" for more information.\n>>> ');
});
def('nano', 'A simple text editor', () => fail('nano: terminal too small (this sandbox is read-only for editors — use echo > file)'));
def('vim', 'Vi IMproved', () => fail('vim: editors are disabled in the Learmux sandbox — use echo > file'));
def('less', 'View file contents page by page', (ctx) => commands.find((c) => c.name === 'cat')!.run(ctx));
def('more', 'View file contents page by page', (ctx) => commands.find((c) => c.name === 'cat')!.run(ctx));

// --- submission -------------------------------------------------------------

def('submit', 'Submit a flag for the current challenge', (ctx) => {
  const guess = ctx.argv.join(' ').trim();
  if (!guess) return fail('submit: usage: submit FLAG{...}');
  if (ctx.flag && guess === ctx.flag) return ok('✔ Correct flag accepted.');
  return fail('✘ That flag is not correct. Keep digging.');
}, 'submit FLAG{...}');

export const COMMANDS: Record<string, Command> = Object.fromEntries(commands.map((c) => [c.name, c]));

export const COMMAND_NAMES: string[] = Object.keys(COMMANDS).sort();

export { commands };
