/**
 * Random generation, done properly.
 *
 * Two things here are easy to get wrong and both matter:
 *
 *   1. `Math.random` is not suitable for anything a person will use as a
 *      secret. It is a fast PRNG seeded from a value an attacker can often
 *      infer. Every byte here comes from `crypto.getRandomValues`.
 *
 *   2. Taking `random % alphabet.length` introduces modulo bias. If the range
 *      of the random source is not a whole multiple of the alphabet size, the
 *      first few characters come up more often than the rest. The fix is
 *      rejection sampling: discard values above the largest whole multiple,
 *      then take the remainder.
 */

import { WORD_LIST, BITS_PER_WORD } from './words';

export const CHAR_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
} as const;

export type CharSetName = keyof typeof CHAR_SETS;

/** Characters that are easy to confuse when reading aloud or copying by hand. */
const AMBIGUOUS = /[Il1O0o]/g;

export interface PasswordOptions {
  length: number;
  sets: CharSetName[];
  excludeAmbiguous: boolean;
  requireEachSet: boolean;
}

export interface PassphraseOptions {
  words: number;
  separator: string;
  capitalise: boolean;
  appendNumber: boolean;
}

/**
 * A uniform integer in [0, maxExclusive).
 *
 * Rejection sampling, so every value is equally likely. The loop runs more than
 * once only when maxExclusive does not divide 2^32 evenly, which is rare.
 */
export function randomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1) {
    throw new RangeError('randomInt needs a positive integer');
  }
  if (maxExclusive === 1) return 0;

  // Largest multiple of maxExclusive that fits in 32 bits.
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  let v: number;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % maxExclusive;
}

export function randomFrom<T>(items: readonly T[]): T {
  return items[randomInt(items.length)];
}

/** Fisher-Yates, using the same unbiased source. */
export function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** The alphabet a set of options actually draws from, after any exclusions. */
export function alphabetFor(sets: CharSetName[], excludeAmbiguous: boolean): string {
  let pool = sets.map((s) => CHAR_SETS[s]).join('');
  if (excludeAmbiguous) pool = pool.replace(AMBIGUOUS, '');
  // De-duplicate: some sets can overlap if this is ever extended.
  return [...new Set(pool)].join('');
}

/**
 * Entropy in bits for a password drawn uniformly from an alphabet.
 *
 * This is the honest figure: log2(alphabet size) per character. It assumes
 * every character really is independent and uniform, which is exactly what
 * `randomInt` above gives you.
 */
export function passwordEntropyBits(alphabetSize: number, length: number): number {
  if (alphabetSize < 2 || length < 1) return 0;
  return length * Math.log2(alphabetSize);
}

/** Entropy in bits for a Diceware passphrase. */
export function passphraseEntropyBits(words: number, extraChoices = 1): number {
  if (words < 1) return 0;
  return words * BITS_PER_WORD + (extraChoices > 1 ? Math.log2(extraChoices) : 0);
}

export interface GeneratedPassword {
  value: string;
  alphabetSize: number;
  bits: number;
  /** Character classes that ended up represented, for the caller to report. */
  present: CharSetName[];
}

export function generatePassword(opts: PasswordOptions): GeneratedPassword {
  const pool = alphabetFor(opts.sets, opts.excludeAmbiguous);
  const length = Math.max(1, Math.min(256, Math.floor(opts.length)));

  if (pool.length < 2) {
    return { value: '', alphabetSize: pool.length, bits: 0, present: [] };
  }

  const chars: string[] = [];

  // Satisfy "at least one from each class" first, then fill the rest, then
  // shuffle. Placing required characters last would leave them in a known
  // position, which is a real (if small) weakness.
  if (opts.requireEachSet) {
    for (const name of opts.sets) {
      let set = CHAR_SETS[name];
      if (opts.excludeAmbiguous) set = set.replace(AMBIGUOUS, '');
      const usable = [...new Set(set)];
      if (usable.length === 0) continue;
      if (chars.length < length) chars.push(randomFrom(usable));
    }
  }

  while (chars.length < length) chars.push(randomFrom([...pool]));
  shuffle(chars);

  const value = chars.join('');
  const present = opts.sets.filter((name) => {
    let set = CHAR_SETS[name];
    if (opts.excludeAmbiguous) set = set.replace(AMBIGUOUS, '');
    return [...value].some((c) => set.includes(c));
  });

  return {
    value,
    alphabetSize: pool.length,
    // Entropy is computed from the alphabet and the length, which is what the
    // generator actually guarantees. Forcing one of each class removes a
    // sliver of the space, so the true figure is a hair under this one.
    bits: passwordEntropyBits(pool.length, length),
    present,
  };
}

export interface GeneratedPassphrase {
  value: string;
  words: string[];
  bits: number;
}

export function generatePassphrase(opts: PassphraseOptions): GeneratedPassphrase {
  const count = Math.max(1, Math.min(20, Math.floor(opts.words)));
  const picked: string[] = [];
  for (let i = 0; i < count; i++) picked.push(randomFrom(WORD_LIST));

  let extraChoices = 1;
  if (opts.appendNumber) extraChoices *= 100;

  const shown = picked.map((w) =>
    opts.capitalise ? w.charAt(0).toUpperCase() + w.slice(1) : w,
  );

  let value = shown.join(opts.separator);
  if (opts.appendNumber) value += opts.separator + String(randomInt(100)).padStart(2, '0');

  return { value, words: picked, bits: passphraseEntropyBits(count, extraChoices) };
}

export type Strength = 'weak' | 'fair' | 'strong' | 'excellent';

/**
 * A verdict on an entropy figure.
 *
 * The thresholds are about offline cracking, and they are deliberately blunt:
 * a well-resourced attacker with a fast hash can try billions of guesses a
 * second, so 40 bits falls in hours and 128 bits does not fall at all.
 */
export function strengthOf(bits: number): { verdict: Strength; label: string; note: string } {
  if (bits < 40) {
    return {
      verdict: 'weak',
      label: 'Weak',
      note: 'A determined attacker with a fast hash can work through this space in hours or less.',
    };
  }
  if (bits < 60) {
    return {
      verdict: 'fair',
      label: 'Fair',
      note: 'Fine for a throwaway account, too thin for anything that matters.',
    };
  }
  if (bits < 90) {
    return {
      verdict: 'strong',
      label: 'Strong',
      note: 'Beyond a brute-force attack against a properly stored password.',
    };
  }
  return {
    verdict: 'excellent',
    label: 'Excellent',
    note: 'Long enough that guessing is not the attack anyone would choose.',
  };
}
