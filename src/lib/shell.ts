/**
 * The shell: an explicit tokenizer + pipeline executor on top of the command
 * table.
 *
 * Nothing here guesses. A line is tokenised into words and operators, split on
 * `;` into statements, each statement split on `|` into pipeline stages, and
 * redirection (`>` / `>>`) is handled at the stage level. That explicitness is
 * what makes challenge state predictable: given the same input line and the
 * same seeded filesystem, you always get the same output.
 *
 * Completion is decided by the challenge's authored validation rules (see
 * ValidationRule), evaluated against a log of what the player actually did —
 * not by scanning output for a flag string.
 */

import { VirtualFS } from './fs';
import { COMMANDS } from './commands';
import type { ValidationRule } from './types';

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
  hints?: string[];
  validation?: ValidationRule[];
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
  /** True when the challenge's validation rules are now all satisfied. */
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
  hints: string[];
  validation: ValidationRule[];
  history: string[] = [];
  hintIndex = 0;
  /** Set when the player submits the correct flag directly. */
  private submittedCorrect = false;

  /** A log of what the player actually did, used to evaluate validation rules. */
  private log = {
    commands: [] as string[],
    reads: new Set<string>(),
    output: '',
    cwd: '',
  };

  constructor(opts: ShellOptions) {
    this.fs = opts.fs;
    this.cwd = opts.cwd;
    this.user = opts.user;
    this.host = opts.host;
    this.env = {
      HOME: opts.cwd,
      USER: opts.user,
      SHELL: '/data/data/com.termux/files/usr/bin/bash',
      PWD: opts.cwd,
      TERM: 'xterm-256color',
      ...(opts.env ?? {}),
    };
    this.overrides = opts.overrides ?? {};
    this.flag = opts.flag;
    this.hints = opts.hints ?? [];
    this.validation = opts.validation ?? [];
    this.log.cwd = opts.cwd;
  }

  /** Prompt string, e.g. `player@~ $`. */
  prompt(): string {
    let dir = this.cwd;
    const home = this.env.HOME;
    if (dir === home) dir = '~';
    else if (dir.startsWith(home + '/')) dir = '~' + dir.slice(home.length);
    const root = this.user === 'root' ? '#' : '$';
    return `${this.user}@${dir} ${root}`;
  }

  /** Evaluate the challenge's explicit validation rules against the action log. */
  isSolved(): boolean {
    if (this.submittedCorrect) return true;
    if (!this.validation.length) return false;
    return this.validation.every((rule) => {
      switch (rule.type) {
        case 'read':
          return this.log.reads.has(rule.path);
        case 'command': {
          const re = safeRegExp(rule.pattern);
          return !!re && this.log.commands.some((c) => re.test(c));
        }
        case 'output': {
          const re = safeRegExp(rule.pattern);
          return !!re && re.test(this.log.output);
        }
        case 'cwd':
          return this.log.cwd === rule.path;
        default:
          return false;
      }
    });
  }

  runLine(raw: string): LineResult {
    const result: LineResult = {
      stdout: '', stderr: '', code: 0, clear: false, exit: false,
      cwd: this.cwd, command: '', solved: false,
    };
    const line = raw.trim();
    if (line === '') return result;
    this.history.push(line);
    this.log.commands.push(line);

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
        if (res.cwd) { this.cwd = res.cwd; this.env.PWD = res.cwd; this.log.cwd = res.cwd; }
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

    // keep a rolling log of output for `output` validation rules
    this.log.output = (this.log.output + '\n' + result.stdout + '\n' + result.stderr).slice(-20000);

    result.solved = this.isSolved();
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

  private execStage(stage: Stage, stdin: string): {
    stdout?: string; stderr?: string; code?: number;
    cwd?: string; clear?: boolean; exit?: boolean;
  } {
    const [name, ...argv] = stage.argv;
    if (!name) return { stdout: '' };

    if (name === 'history') {
      const out = this.history.map((h, i) => `${String(i + 1).padStart(5)}  ${h}`).join('\n');
      return { stdout: out };
    }

    if (name === 'hint') {
      if (!this.hints.length) return { stdout: 'There are no hints for this challenge.' };
      if (this.hintIndex >= this.hints.length) {
        return { stdout: 'That was the last hint — you have them all.' };
      }
      const h = this.hints[this.hintIndex++];
      return { stdout: `Hint ${this.hintIndex}/${this.hints.length}: ${h}` };
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
        record: (kind, value) => {
          if (kind === 'read') this.log.reads.add(value);
        },
      });
      // an explicit correct flag submission also completes the challenge
      if (name === 'submit' && (res.code ?? 0) === 0) this.submittedCorrect = true;
      return res;
    } catch (e) {
      return { stderr: `${name}: ${(e as Error).message}`, code: 1 };
    }
  }
}

function safeRegExp(pattern: string): RegExp | null {
  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
}
