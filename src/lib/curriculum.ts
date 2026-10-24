/**
 * The curriculum.
 *
 * Lessons sit in ordered tracks, and each lesson names its track in its own
 * frontmatter. Tracks are numbered and each one says what you can do when you
 * finish it. Keep the ids here in step with `track:` in the lessons.
 */

export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Track {
  id: string;
  number: number;
  title: string;
  tagline: string;
  /** A short paragraph for the track page. */
  description: string;
  /** What you can do once the track is finished. */
  outcome: string;
  level: Level;
  /** What to do first. */
  prereq: string;
}

export const course = {
  title: 'Termux and the command line',
  summary:
    'Five tracks, in order, from installing Termux to automating your phone and thinking about security. Every lesson has a challenge you can play in the browser.',
  audience:
    'Written for someone starting from nothing on an Android phone. You do not need prior Linux, a laptop, or root.',
  requirements: 'An Android device with Termux installed from F-Droid. Budget about 20 minutes per lesson.',
  outcome:
    'You will be comfortable at a Linux prompt. You will be able to write small scripts, explain what happens on a network, and keep your own device tidy and locked down.',
  timeEstimate: 'about 9 hours',
};

export const tracks: Track[] = [
  {
    id: 'foundations',
    number: 1,
    title: 'Foundations',
    tagline: 'Get comfortable at the prompt.',
    description:
      'Start from a fresh Termux install and learn the commands everything else is built on. You will move around the filesystem, read and search files, chain commands together, and set sensible permissions. Nothing here is advanced. It is the vocabulary the rest of the course assumes.',
    outcome: 'you can find your way around a Linux filesystem and get what you need out of a file.',
    level: 'Beginner',
    prereq: 'Nothing. Start here.',
  },
  {
    id: 'practice',
    number: 2,
    title: 'The shell in practice',
    tagline: 'Make the shell do the work.',
    description:
      'Typing commands one at a time gets old when you need to do the same thing twice. This track turns commands into scripts and scripts into scheduled jobs. You will also learn the text tools that make short work of big files.',
    outcome: 'you can write a small script, run it on a timer, and process a large file without opening it.',
    level: 'Intermediate',
    prereq: 'Finish Foundations first, especially pipes and redirection.',
  },
  {
    id: 'networking',
    number: 3,
    title: 'Networking and the internet',
    tagline: 'Understand what travels the wire.',
    description:
      'Most of what a phone does is a conversation over a network. This track makes that conversation visible. You will see how names become addresses, how an HTTP request is shaped, and how to move files between two machines without a cable.',
    outcome: 'you can explain what happens when you open a page, read a response by hand, and copy files between hosts.',
    level: 'Intermediate',
    prereq: 'Foundations, and some comfort with pipes.',
  },
  {
    id: 'security',
    number: 4,
    title: 'Security fundamentals',
    tagline: 'Think defensively about your own device.',
    description:
      'Security starts with knowing what normal looks like. This track covers hashing and why passwords are stored the way they are, how to read a log and notice what does not belong, and the habits that reduce your exposure. Everything here is defensive and aimed at your own device.',
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
      'Three guided builds that tie the earlier tracks together. Each one starts from an empty file and ends with something you can run: a backup script, a log analyser, and a terminal dashboard. Nothing is left as an exercise.',
    outcome: 'you have three working tools of your own, and the habit of building more.',
    level: 'Advanced',
    prereq: 'Everything above, especially shell scripting.',
  },
];

export function trackById(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}
