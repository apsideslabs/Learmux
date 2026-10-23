/**
 * The shell: an explicit tokenizer + pipeline executor on top of the command
 * table.
 *
 * Nothing here guesses. A line is tokenised into words and operators, split on
 * `;` into statements, each statement split on `|` into pipeline stages, and
 * redirection (`>` / `>>`) is handled at the stage level. That explicitness is
 * what makes challenge state predictable: given the same input line and the
 * same seeded filesystem, you always get the same output.
 */

import { VirtualFS } from './fs';
import { COMMANDS } from './commands';

export type Token = { type: 'word' | 'pipe' | 'gt' | 'append' | 'semi'; value: string };

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let cur = '';
  let hasWord = false;
  let i = 0;
  let inSingle = false;
  let inDouble = false;

  const flush = () => {
    if (hasWord) tokens.push({ type: 'word', value: cur });
    cur = '';
    hasWord = false;
  };

  while (i < input.length) {
    const ch = input[i];
    if (inSingle) {
      if (ch === "'") inSingle = false;
      else cur += ch;
      i++;
      continue;
    }
    if (inDouble) {
      if (ch === '"') inDouble = false;
      else if (ch === '\\' && i + 1 < input.length) { cur += input[i + 1]; i += 2; continue; }
      else cur += ch;
      i++;
      continue;
    }
    if (ch === "'") { inSingle = true; hasWord = true; i++; continue; }
    if (ch === '"') { inDouble = true; hasWord = true; i++; continue; }
    if (ch === '\\' && i + 1 < input.length) { cur += input[i + 1]; hasWord = true; i += 2; continue; }
    if (ch === '|') { flush(); tokens.push({ type: 'pipe', value: '|' }); i++; continue; }
    if (ch === '>') {
      flush();
      if (input[i + 1] === '>') { tokens.push({ type: 'append', value: '>>' }); i += 2; }
      else { tokens.push({ type: 'gt', value: '>' }); i++; }
      continue;
    }
    if (ch === ';') { flush(); tokens.push({ type: 'semi', value: ';' }); i++; continue; }
    if (/\s/.test(ch)) { flush(); i++; continue; }
    cur += ch;
    hasWord = true;
    i++;
  }
  flush();
  return tokens;
}

export interface ShellOptions {
  fs: VirtualFS;
  cwd: string;
  user: string;
  host: string;
  env?: Record<string, string>;
  overrides?: Record<string, string>;
  flag?: string;
}

export interface LineResult {
  stdout: string;
  stderr: string;
  code: number;
  clear: boolean;
  exit: boolean;
  cwd: string;
  /** First command word of the line (for the UI to react to). */
  command: string;
  /** True when this line revealed the flag (or a correct `submit`). */
  solved: boolean;
}

interface Stage {
  argv: string[];
  redirect?: { file: string; append: boolean };
}

export class Shell {
  fs: VirtualFS;
  cwd: string;
  user: string;
  host: string;
  env: Record<string, string>;
  overrides: Record<string, string>;
  flag?: string;
  history: string[] = [];

  constructor(opts: ShellOptions) {
    this.fs = opts.fs;
    this.cwd = opts.cwd;
    this.user = opts.user;
    this.host = opts.host;
    this.env = { HOME: opts.cwd, USER: opts.user, SHELL: '/data/data/com.termux/files/usr/bin/bash', PWD: opts.cwd, TERM: 'xterm-256color', ...(opts.env ?? {}) };
    this.overrides = opts.overrides ?? {};
    this.flag = opts.flag;
  }

  /** Prompt string, e.g. `~/backup $` or `/sdcard $`. */
  prompt(): string {
    let dir = this.cwd;
    const home = this.env.HOME;
    if (dir === home) dir = '~';
    else if (dir.startsWith(home + '/')) dir = '~' + dir.slice(home.length);
    const root = this.user === 'root' ? '#' : '$';
    return `${dir} ${root}`;
  }

  runLine(raw: string): LineResult {
    const result: LineResult = { stdout: '', stderr: '', code: 0, clear: false, exit: false, cwd: this.cwd, command: '', solved: false };
    const line = raw.trim();
    if (line === '') return result;
    this.history.push(line);

    const tokens = tokenize(line);

    // Split into statements on `;`.
    const statements: Token[][] = [[]];
    for (const tok of tokens) {
      if (tok.type === 'semi') statements.push([]);
      else statements[statements.length - 1].push(tok);
    }

    const outs: string[] = [];
    const errs: string[] = [];

    for (const stmt of statements) {
      if (!stmt.length) continue;
      const stages = this.splitStages(stmt);
      let stdin = '';
      for (let s = 0; s < stages.length; s++) {
        const stage = stages[s];
        const res = this.execStage(stage, stdin);
        if (res.clear) result.clear = true;
        if (res.exit) result.exit = true;
        if (res.cwd) { this.cwd = res.cwd; this.env.PWD = res.cwd; }
        result.code = res.code ?? 0;
        if (res.stderr) errs.push(res.stderr);
        const out = res.stdout ?? '';
        if (stage.redirect) {
          try {
            this.fs.writeFile(stage.redirect.file, this.cwd, out.endsWith('\n') ? out : out + '\n', stage.redirect.append);
          } catch (e) {
            errs.push((e as Error).message);
          }
          stdin = '';
        } else {
          stdin = out;
          if (s === stages.length - 1) outs.push(out);
        }
      }
    }

    result.stdout = outs.join('\n');
    result.stderr = errs.join('\n');
    result.command = tokens.find((t) => t.type === 'word')?.value ?? '';
    result.cwd = this.cwd;

    const combined = result.stdout + '\n' + result.stderr;
    if (this.flag && combined.includes(this.flag)) result.solved = true;
    if (result.command === 'submit' && result.code === 0) result.solved = true;
    return result;
  }

  private splitStages(tokens: Token[]): Stage[] {
    const stages: Stage[] = [];
    let current: Stage = { argv: [] };
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.type === 'word') current.argv.push(tok.value);
      else if (tok.type === 'pipe') { stages.push(current); current = { argv: [] }; }
      else if (tok.type === 'gt' || tok.type === 'append') {
        const next = tokens[i + 1];
        if (next && next.type === 'word') {
          current.redirect = { file: next.value, append: tok.type === 'append' };
          i++;
        }
      }
    }
    stages.push(current);
    return stages;
  }

  private execStage(stage: Stage, stdin: string): { stdout?: string; stderr?: string; code?: number; cwd?: string; clear?: boolean; exit?: boolean } {
    const [name, ...argv] = stage.argv;
    if (!name) return { stdout: '' };

    if (name === 'history') {
      const out = this.history.map((h, i) => `${String(i + 1).padStart(5)}  ${h}`).join('\n');
      return { stdout: out };
    }

    const cmd = COMMANDS[name];
    if (!cmd) {
      return { stderr: `bash: ${name}: command not found`, code: 127 };
    }

    try {
      const res = cmd.run({
        fs: this.fs,
        cwd: this.cwd,
        env: this.env,
        user: this.user,
        host: this.host,
        argv,
        stdin,
        raw: stage.argv.join(' '),
        flag: this.flag,
        overrides: this.overrides,
      });
      return res;
    } catch (e) {
      return { stderr: `${name}: ${(e as Error).message}`, code: 1 };
    }
  }
}
