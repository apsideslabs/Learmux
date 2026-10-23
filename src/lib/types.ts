/**
 * Core types for the Learmux CTF engine.
 *
 * A challenge is a self-contained, deterministic little sandbox: a virtual
 * filesystem, a starting working directory, a flag, and some metadata. Because
 * the whole state is declared up-front in JSON, the shell is fully predictable
 * and reproducible — no database, no backend.
 */

export type FileNode = {
  type: 'file';
  content: string;
  mode?: string;
  owner?: string;
};

export type DirNode = {
  type: 'dir';
  children: Record<string, FSNode>;
  mode?: string;
  owner?: string;
};

export type FSNode = FileNode | DirNode;

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  points: number;
  summary: string;
  /** Markdown briefing shown above the terminal. */
  briefing: string;
  /** One-line mission statement. */
  objective: string;
  /** The secret. Anything the player types that reveals this counts. */
  flag: string;
  hints: string[];
  /** A couple of example commands to get unstuck. */
  starters?: string[];
  /** Absolute starting directory. */
  cwd: string;
  user: string;
  host: string;
  /** Root directory node of the virtual filesystem. */
  fs: FSNode;
  /** Optional starting environment variables. */
  env?: Record<string, string>;
  /** Authored output for commands that would otherwise be non-deterministic. */
  overrides?: Record<string, string>;
}

/** A single challenge entry, kept lightweight for index pages. */
export type ChallengeMeta = Pick<
  Challenge,
  'id' | 'slug' | 'title' | 'category' | 'difficulty' | 'points' | 'summary' | 'objective'
>;

export interface CmdContext {
  fs: import('./fs').VirtualFS;
  /** Absolute current working directory. */
  cwd: string;
  env: Record<string, string>;
  user: string;
  host: string;
  /** Arguments after the command name. */
  argv: string[];
  /** Text piped in from a previous command (or ''). */
  stdin: string;
  /** Full raw command line, for `history` and friends. */
  raw: string;
  /** Current challenge's flag, so `submit` can check a guess. */
  flag?: string;
  /** Authored, per-challenge output for device/network commands. */
  overrides?: Record<string, string>;
}

export interface CmdResult {
  stdout?: string;
  stderr?: string;
  /** Exit code; defaults to 0. */
  code?: number;
  /** Set when the command changed the working directory. */
  cwd?: string;
  /** Set to request the UI clear its scrollback. */
  clear?: boolean;
  /** Set to end the session (exit / logout). */
  exit?: boolean;
}

export interface Command {
  name: string;
  summary: string;
  usage?: string;
  run: (ctx: CmdContext) => CmdResult;
}
