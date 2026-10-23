/**
 * A tiny in-memory POSIX-ish virtual filesystem.
 *
 * Everything the player does to files happens here, on a plain JS object tree
 * that was seeded from the challenge's JSON. That keeps challenge state fully
 * predictable and lets us snapshot / reset a challenge instantly.
 */

import type { FSNode, DirNode, FileNode } from './types';

export const HOME = '/data/data/com.termux/files/home';

export class FsError extends Error {}

export class VirtualFS {
  root: DirNode;

  constructor(root: FSNode) {
    if (root.type !== 'dir') throw new FsError('root must be a directory');
    this.root = root;
  }

  /** Deep clone a seeded tree so a reset restores the original state. */
  static clone<T extends FSNode>(node: T): T {
    return JSON.parse(JSON.stringify(node)) as T;
  }

  private split(path: string): string[] {
    return path.split('/').filter((p) => p.length > 0);
  }

  /** Turn a possibly-relative path into a normalised absolute path. */
  normalize(path: string, cwd: string): string {
    if (path === '~' || path.startsWith('~/')) {
      path = HOME + path.slice(1);
    }
    let base: string[];
    if (path.startsWith('/')) {
      base = [];
      path = path.slice(1);
    } else {
      base = this.split(cwd);
    }
    for (const part of this.split(path)) {
      if (part === '.') continue;
      if (part === '..') {
        base.pop();
        continue;
      }
      base.push(part);
    }
    return '/' + base.join('/');
  }

  private walk(path: string): FSNode | undefined {
    const parts = this.split(path);
    let node: FSNode = this.root;
    for (const part of parts) {
      if (node.type !== 'dir') return undefined;
      const next = node.children[part];
      if (!next) return undefined;
      node = next;
    }
    return node;
  }

  exists(path: string, cwd: string): boolean {
    return this.walk(this.normalize(path, cwd)) !== undefined;
  }

  isDir(path: string, cwd: string): boolean {
    const n = this.walk(this.normalize(path, cwd));
    return !!n && n.type === 'dir';
  }

  isFile(path: string, cwd: string): boolean {
    const n = this.walk(this.normalize(path, cwd));
    return !!n && n.type === 'file';
  }

  stat(path: string, cwd: string): FSNode | undefined {
    return this.walk(this.normalize(path, cwd));
  }

  readFile(path: string, cwd: string): string {
    const n = this.walk(this.normalize(path, cwd));
    if (!n) throw new FsError(`cat: ${path}: No such file or directory`);
    if (n.type !== 'file') throw new FsError(`cat: ${path}: Is a directory`);
    return n.content;
  }

  /** Parent directory node + final segment name, or undefined if parent missing. */
  private parentOf(path: string, cwd: string): { parent: DirNode; name: string } | undefined {
    const abs = this.normalize(path, cwd);
    const parts = this.split(abs);
    const name = parts.pop();
    if (name === undefined) return undefined;
    const parentAbs = '/' + parts.join('/');
    const parent = this.walk(parentAbs);
    if (!parent || parent.type !== 'dir') return undefined;
    return { parent, name };
  }

  writeFile(path: string, cwd: string, content: string, append = false): void {
    const loc = this.parentOf(path, cwd);
    if (!loc) throw new FsError(`write: ${path}: No such file or directory`);
    const existing = loc.parent.children[loc.name];
    if (existing && existing.type === 'dir') {
      throw new FsError(`write: ${path}: Is a directory`);
    }
    if (existing && append) {
      (existing as FileNode).content += content;
      return;
    }
    loc.parent.children[loc.name] = { type: 'file', content, mode: '644', owner: 'u0_a0' };
  }

  mkdir(path: string, cwd: string, recursive = false): void {
    const abs = this.normalize(path, cwd);
    const parts = this.split(abs);
    let node: DirNode = this.root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const next = node.children[part];
      if (!next) {
        if (i < parts.length - 1 && !recursive) {
          throw new FsError(`mkdir: ${path}: No such file or directory`);
        }
        const created: DirNode = { type: 'dir', children: {}, mode: '755', owner: 'u0_a0' };
        node.children[part] = created;
        node = created;
      } else if (next.type === 'dir') {
        node = next;
      } else {
        throw new FsError(`mkdir: ${path}: File exists`);
      }
    }
  }

  touch(path: string, cwd: string): void {
    const loc = this.parentOf(path, cwd);
    if (!loc) throw new FsError(`touch: ${path}: No such file or directory`);
    if (!loc.parent.children[loc.name]) {
      loc.parent.children[loc.name] = { type: 'file', content: '', mode: '644', owner: 'u0_a0' };
    }
  }

  remove(path: string, cwd: string, recursive = false): void {
    const loc = this.parentOf(path, cwd);
    if (!loc) throw new FsError(`rm: ${path}: No such file or directory`);
    const target = loc.parent.children[loc.name];
    if (!target) throw new FsError(`rm: ${path}: No such file or directory`);
    if (target.type === 'dir' && !recursive) {
      throw new FsError(`rm: ${path}: Is a directory`);
    }
    delete loc.parent.children[loc.name];
  }

  /** List a directory's child names, or null if it isn't a directory. */
  list(path: string, cwd: string): string[] | null {
    const n = this.walk(this.normalize(path, cwd));
    if (!n || n.type !== 'dir') return null;
    return Object.keys(n.children);
  }

  child(path: string, cwd: string): FSNode | undefined {
    return this.walk(this.normalize(path, cwd));
  }

  /** Recursively collect file paths under a directory (for find/tree/grep -r). */
  walkFiles(path: string, cwd: string): string[] {
    const abs = this.normalize(path, cwd);
    const out: string[] = [];
    const rec = (node: FSNode, prefix: string) => {
      if (node.type === 'file') {
        out.push(prefix || '/');
        return;
      }
      for (const [name, child] of Object.entries(node.children)) {
        rec(child, prefix === '/' ? `/${name}` : `${prefix}/${name}`);
      }
    };
    const start = this.walk(abs);
    if (start) rec(start, abs === '/' ? '' : abs);
    return out;
  }
}
