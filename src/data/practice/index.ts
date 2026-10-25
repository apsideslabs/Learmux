/**
 * Every practice set, in one list.
 *
 * A set is keyed by lesson slug where one exists, so the lesson page can find
 * its own set without a second mapping to keep in step.
 */

import type { PracticeSet } from './types';
import { filesystemSets } from './filesystem';
import { textSets } from './text';
import { systemSets } from './system';
import { environmentSets } from './environment';
import { networkSets } from './network';
import { securitySets } from './security';
import { reconSets } from './recon';
import { webSecuritySets } from './websecurity';
import { cryptographySets } from './cryptography';
import { defenceSets } from './defence';
import { mindsetSets } from './mindset';
import { professionSets } from './profession';
import { pythonSets } from './python';
import { utilitiesSets } from './utilities';
import { utilitiesBSets } from './utilities-b';
import { utilitiesCSets } from './utilities-c';

export type { PracticeSet, McqQuestion, OutputTask, OutputRule } from './types';
export { setSize, totalPoints } from './types';

export const practiceSets: PracticeSet[] = [
  ...filesystemSets,
  ...textSets,
  ...systemSets,
  ...environmentSets,
  ...networkSets,
  ...securitySets,
  ...reconSets,
  ...webSecuritySets,
  ...cryptographySets,
  ...defenceSets,
  ...mindsetSets,
  ...professionSets,
  ...pythonSets,
  ...utilitiesSets,
  ...utilitiesBSets,
  ...utilitiesCSets,
];

export function findSet(slug: string): PracticeSet | undefined {
  return practiceSets.find((s) => s.slug === slug);
}

export function allSets(): PracticeSet[] {
  return practiceSets;
}

export function questionCount(): number {
  return practiceSets.reduce((n, s) => n + s.questions.length, 0);
}

export function taskCount(): number {
  return practiceSets.reduce((n, s) => n + s.tasks.length, 0);
}
