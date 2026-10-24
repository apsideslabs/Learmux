/**
 * The curriculum.
 *
 * Content is organised into ordered tracks (modules), and every lesson belongs
 * to exactly one track via its `track` frontmatter field. Tracks are ordered,
 * numbered, and each one states what the learner will be able to do at the end
 * — so the site can present a real learning path rather than a flat list.
 *
 * Keep this in sync with `track:` values in src/content/tutorials/*.mdx.
 */

export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Track {
  id: string;
  number: number;
  title: string;
  tagline: string;
  /** Two or three sentences shown on the track landing page. */
  description: string;
  /** What the learner can do once the track is finished. */
  outcome: string;
  level: Level;
  /** What the learner should already have done, in plain words. */
  prereq: string;
}

export const course = {
  title: 'Termux and the command line',
  summary:
    'A complete, ordered path from installing Termux to automating your phone and thinking about security. Every lesson pairs with a challenge you can play in the browser.',
  audience:
    'Written for someone starting from nothing on an Android phone. No prior Linux, no laptop and no root required.',
  requirements: 'An Android device with Termux installed from F-Droid. About 20 minutes per lesson.',
  outcome:
    'By the end you will be comfortable at a Linux prompt, able to read and write small scripts, understand what happens on a network, and know how to keep your own device tidy and locked down.',
  /** Rough reading-and-practice estimate, stated honestly rather than precisely. */
  timeEstimate: 'about 9 hours',
};

export const tracks: Track[] = [
  {
    id: 'foundations',
    number: 1,
    title: 'Foundations',
    tagline: 'Get comfortable at the prompt.',
    description:
      'Start from a fresh Termux install and learn the handful of commands everything else is built on. You will move around the filesystem, read and search files, chain commands together, and set sensible permissions. Nothing here is advanced — it is the vocabulary the rest of the course assumes.',
    outcome: 'you can find your way around a Linux filesystem and pull the information you need out of a file.',
    level: 'Beginner',
    prereq: 'Nothing. This is the starting point.',
  },
  {
    id: 'practice',
    number: 2,
    title: 'The shell in practice',
    tagline: 'Make the shell do the work.',
    description:
      'Typing commands one at a time is fine until you need to do the same thing twice. This track turns commands into scripts, scripts into scheduled jobs, and shows you how the shell keeps state between them. You will also learn the text tools that make short work of big files.',
    outcome: 'you can write a small script, run it on a schedule, and process a large file without opening it.',
    level: 'Intermediate',
    prereq: 'Finish Foundations, especially pipes and redirection.',
  },
  {
    id: 'networking',
    number: 3,
    title: 'Networking and the internet',
    tagline: 'Understand what travels the wire.',
    description:
      'Most of what a phone does is a conversation over a network. This track makes that conversation visible: how names become addresses, how an HTTP request is actually shaped, and how to move files between two machines without a cable.',
    outcome: 'you can explain what happens when you open a page, read a response by hand, and copy files between hosts.',
    level: 'Intermediate',
    prereq: 'Foundations, and comfort with pipes.',
  },
  {
    id: 'security',
    number: 4,
    title: 'Security fundamentals',
    tagline: 'Think defensively about your own device.',
    description:
      'Security starts with knowing what normal looks like. This track covers hashing and why passwords are stored the way they are, how to read a log and notice what does not belong, and the practical habits that reduce your exposure. Everything here is defensive and targets your own device.',
    outcome: 'you can check a file against its hash, spot odd entries in a log, and reduce what your phone exposes.',
    level: 'Intermediate',
    prereq: 'Foundations and the shell-in-practice track.',
  },
  {
    id: 'projects',
    number: 5,
    title: 'Projects',
    tagline: 'Build three small tools end to end.',
    description:
      'Three guided builds that tie the earlier tracks together. Each one starts from an empty file and ends with something you can actually run: a backup script, a log analyser, and a terminal dashboard. Nothing is left as an exercise.',
    outcome: 'you have three working tools of your own and the habit of building more.',
    level: 'Advanced',
    prereq: 'Everything above, particularly shell scripting.',
  },
];

export function trackById(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}
