/**
 * The shape of a glossary entry.
 *
 * A definition here has to earn its place. `short` is the meaning in one
 * sentence, which is all most readers want. `detail` is the second sentence
 * that turns a definition into understanding: what it implies, what it gets
 * confused with, or what goes wrong without it.
 *
 * Terms link back to the lesson that teaches them, because a glossary that
 * cannot take you anywhere is a dictionary, and this site is a course.
 */

export type CategoryId = 'foundations' | 'security' | 'crypto' | 'offensive' | 'web' | 'cs';

export interface Category {
  id: CategoryId;
  label: string;
  /** One line, shown under the filter chips. */
  blurb: string;
}

export interface Term {
  /** The headword, as it is usually written. */
  term: string;
  /** One sentence. The definition. */
  short: string;
  /** A second sentence: the consequence, the confusion, the example. */
  detail?: string;
  category: CategoryId;
  /** Other names the same thing goes by, including abbreviations. */
  also?: string[];
  /** A lesson slug, without the /learn/ prefix. */
  see?: string;
}

export const categories: Category[] = [
  {
    id: 'foundations',
    label: 'IT and the system',
    blurb: 'Operating systems, files, processes and the network underneath everything else.',
  },
  {
    id: 'security',
    label: 'Cybersecurity',
    blurb: 'The words used to describe what can go wrong, and who is trying to make it go wrong.',
  },
  {
    id: 'crypto',
    label: 'Cryptography',
    blurb: 'Keys, digests, certificates, and the difference between them.',
  },
  {
    id: 'offensive',
    label: 'Hacking and testing',
    blurb: 'Reconnaissance, exploitation, and the tools on both sides of a test.',
  },
  {
    id: 'web',
    label: 'Web security',
    blurb: 'How web applications break, and the names for each kind of break.',
  },
  {
    id: 'cs',
    label: 'Computer science',
    blurb: 'Data structures, complexity, concurrency, and how code becomes something a machine runs.',
  },
];
