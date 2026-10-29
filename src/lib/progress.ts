/**
 * Progress tracking.
 *
 * For the prototype we keep this in localStorage — no accounts, no backend.
 * The shape is deliberately tiny so it can be swapped for an API later without
 * touching the components.
 */

const KEY = 'Learmux:progress:v1';

export interface Progress {
  solved: Record<string, string>; // slug -> ISO timestamp
}

function read(): Progress {
  if (typeof localStorage === 'undefined') return { solved: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { solved: {} };
    const parsed = JSON.parse(raw) as Progress;
    return { solved: parsed.solved ?? {} };
  } catch {
    return { solved: {} };
  }
}

function write(p: Progress): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new CustomEvent('Learmux:progress'));
  } catch {
    /* storage full or blocked — ignore */
  }
}

export function isSolved(slug: string): boolean {
  return Boolean(read().solved[slug]);
}

export function markSolved(slug: string): void {
  const p = read();
  if (!p.solved[slug]) {
    p.solved[slug] = new Date().toISOString();
    write(p);
  }
}

/**
 * Undo a completion.
 *
 * A reader who ticked a lesson by accident needs a way back, and a checkbox
 * that cannot be unticked is a lie about what it is.
 */
export function clearSolved(slug: string): void {
  const p = read();
  if (p.solved[slug]) {
    delete p.solved[slug];
    write(p);
  }
}

export function solvedSlugs(): string[] {
  return Object.keys(read().solved);
}

export function resetProgress(): void {
  write({ solved: {} });
}

export function solvedCount(): number {
  return Object.keys(read().solved).length;
}
