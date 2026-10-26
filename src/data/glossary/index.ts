/**
 * The glossary, assembled.
 *
 * Every term is plain data so the build can check it. The validator rejects a
 * duplicate headword, a term pointing at a lesson that does not exist, and a
 * category that is not one of the six. A glossary with a dead link in it is
 * worse than no glossary, because it looks authoritative while being wrong.
 */

import type { Category, CategoryId, Term } from './types';
import { foundations } from './foundations';
import { security } from './security';
import { crypto } from './crypto';
import { offensive } from './offensive';
import { web } from './web';
import { cs } from './cs';

export { categories } from './types';
export type { Category, CategoryId, Term } from './types';

/** Every term, sorted by headword, ignoring a leading "the" or punctuation. */
export const terms: Term[] = [...foundations, ...security, ...crypto, ...offensive, ...web, ...cs].sort(
  (a, b) => sortKey(a.term).localeCompare(sortKey(b.term)),
);

function sortKey(term: string): string {
  return term
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9]/g, '');
}

export function termsIn(category: CategoryId): Term[] {
  return terms.filter((t) => t.category === category);
}

export function countIn(category: CategoryId): number {
  return termsIn(category).length;
}

/** The letters that actually have a term under them, for the A to Z bar. */
export function initials(): string[] {
  const set = new Set<string>();
  for (const t of terms) {
    const c = sortKey(t.term)[0];
    if (c) set.add(c.toUpperCase());
  }
  return [...set].sort();
}

/**
 * The searchable text of a term.
 *
 * Aliases are included so that searching for "2FA" finds MFA, and "SQLi" finds
 * SQL injection. Searching for a word that appears only in the detail sentence
 * also works, which is usually what somebody half-remembering a term wants.
 */
export function haystack(t: Term): string {
  return [t.term, ...(t.also ?? []), t.short, t.detail ?? '', t.category].join(' ').toLowerCase();
}

export const totalTerms = terms.length;
