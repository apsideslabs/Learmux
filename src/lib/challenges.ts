/**
 * Challenge loading.
 *
 * Challenges live in a single JSON file (see src/data/challenges.json). Keeping
 * them as data — rather than code — means tutorials, the index page and the
 * terminal all read from one source of truth, and a database can be dropped in
 * later without changing the engine.
 */

import type { Challenge, ChallengeMeta, FSNode } from './types';
import raw from '../data/challenges.json';
import { VirtualFS } from './fs';
import { Shell } from './shell';

export const challenges = raw as unknown as Challenge[];

export function getChallenge(slug: string): Challenge | undefined {
  return challenges.find((c) => c.slug === slug);
}

export function challengeMeta(c: Challenge): ChallengeMeta {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    category: c.category,
    difficulty: c.difficulty,
    points: c.points,
    summary: c.summary,
    objective: c.objective,
  };
}

export function allMeta(): ChallengeMeta[] {
  return challenges.map(challengeMeta);
}

export function categories(): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const c of challenges) map.set(c.category, (map.get(c.category) ?? 0) + 1);
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
}

export const totalPoints = challenges.reduce((sum, c) => sum + c.points, 0);

/**
 * Build a fresh shell for a challenge. The filesystem is deep-cloned from the
 * seed so replaying a challenge always starts from the same predictable state.
 */
export function startShell(challenge: Challenge): Shell {
  const fs = new VirtualFS(VirtualFS.clone(challenge.fs as FSNode));
  return new Shell({
    fs,
    cwd: challenge.cwd,
    user: challenge.user,
    host: challenge.host,
    env: challenge.env,
    overrides: challenge.overrides,
    flag: challenge.flag,
    hints: challenge.hints,
    solutions: challenge.solutions,
    validation: challenge.validation,
  });
}
