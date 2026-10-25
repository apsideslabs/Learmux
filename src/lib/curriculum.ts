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
    'Twelve tracks, in order, from opening a prompt for the first time to assessing your own systems, understanding how web applications break, and writing up what you find. Every lesson is done on the phone in your pocket, offline and without root.',
  audience:
    'Written for someone starting from nothing on an Android phone. You do not need prior Linux, a laptop, or root. If you already work at a prompt, the later tracks stand on their own.',
  requirements: 'An Android device with Termux installed from F-Droid. Budget about 20 minutes per lesson.',
  outcome:
    'You will be comfortable at a Linux prompt, able to write small scripts and explain what happens on a network, and able to assess your own devices, reason about how something could fail, and write the result up so another person can act on it.',
  timeEstimate: 'about 21 hours',
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
    id: 'python',
    number: 3,
    title: 'Python you can run here',
    tagline: 'Write Python and run it in the page.',
    description:
      'Every cell in this track runs real Python in your browser. There is nothing to install and no server: press Run and the code executes, so you can make a mistake, read the error, and change it, which is the way anyone actually learns. The track starts from a print statement and ends at the standard library modules the rest of the course uses.',
    outcome: 'you can write and run small Python programs, read a traceback, and use the standard library.',
    level: 'Beginner',
    prereq: 'Nothing. This one stands on its own.',
  },
  {
    id: 'networking',
    number: 4,
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
    number: 5,
    title: 'Security fundamentals',
    tagline: 'Learn how to think about security before you touch a tool.',
    description:
      'The conceptual heart of the course. It opens with the security mindset and threat modelling, which are ways of reasoning rather than pieces of software, then moves to the practical work: hashing, passwords and keys, reading a log, and reducing what your phone exposes. Everything here is defensive and aimed at your own device.',
    outcome: 'you can say what security actually protects, reason about what could go wrong with a system, and harden your own.',
    level: 'Beginner',
    prereq: 'Foundations and the shell-in-practice track.',
  },
  {
    id: 'recon',
    number: 6,
    title: 'Reconnaissance and assessment',
    tagline: 'Find out what is exposed before somebody else does.',
    description:
      'Every assessment starts by answering a boring question: what do I actually have? This track teaches the phases security work moves through, how to inventory your own devices, how to read a port scan rather than just run one, what a service version tells you, and how to judge whether a finding is worth acting on. You scan your own device and your own network, and nothing else.',
    outcome: 'you can describe what is running on your own devices, read a scan properly, and judge a version or a finding on evidence.',
    level: 'Intermediate',
    prereq: 'Networking, and the security fundamentals track.',
  },
  {
    id: 'websecurity',
    number: 7,
    title: 'Web and application security',
    tagline: 'How web applications break, and how each break is fixed.',
    description:
      'The bug classes behind most real breaches, each one shown against a small server you write and run on your own phone. You trace a request end to end, learn why any input you did not create is hostile until proven otherwise, then work through injection, cross-site scripting, broken access control and misconfiguration. Every lesson ends with the fix, not only the flaw.',
    outcome: 'you can explain how a request is handled, recognise the common bug classes, and say how each one is prevented.',
    level: 'Intermediate',
    prereq: 'HTTP from the networking track, and some Python or willingness to read it.',
  },
  {
    id: 'cryptography',
    number: 8,
    title: 'Cryptography in practice',
    tagline: 'What the padlock means, and where crypto goes wrong.',
    description:
      'The cryptography a working person actually meets, taught by doing it rather than by proving theorems. You separate the three things people constantly confuse, work with symmetric and asymmetric keys, read a certificate and follow the chain of trust, sign a file and verify somebody else\'s signature, and then look at the mistakes that break real systems.',
    outcome: 'you can tell hashing from encoding from encryption, read a certificate, and verify a signature.',
    level: 'Intermediate',
    prereq: 'Encoding and hashes from the security track, and some comfort with the shell.',
  },
  {
    id: 'defence',
    number: 9,
    title: 'Defence and monitoring',
    tagline: 'Know what normal looks like, then notice what does not.',
    description:
      'The defender\'s half of the course, done on a phone. You write down what normal is, watch the files that matter for a change, read logs as a story rather than line by line, make the device tell you when something moves, and walk the six phases of responding to a small incident calmly. Two ideas run through all of it: perfect security does not exist, and detection without a response achieves nothing.',
    outcome: 'you can baseline a device, notice a change, build a timeline from logs, and work an incident in order.',
    level: 'Intermediate',
    prereq: 'Logs and detection from the security track, and cron from the shell track.',
  },
  {
    id: 'utilities',
    number: 10,
    title: 'Utilities you build yourself',
    tagline: 'Six small tools, each built twice.',
    description:
      'A password generator, an encoder, a checksum tool, a token inspector, a permissions converter and a subnet calculator. Each one exists twice: as something you can use, and as a lesson that shows you how to write it. Every one runs on commands the earlier tracks already gave you, and every one is a job people reach for a website to do.',
    outcome: 'you can build a small tool that does the job, and check its answers rather than trusting them.',
    level: 'Intermediate',
    prereq: 'The shell in practice track, and either security fundamentals or networking for the later tools.',
  },
  {
    id: 'projects',
    number: 11,
    title: 'Projects',
    tagline: 'Build three small tools end to end.',
    description:
      'Three guided builds that tie the earlier tracks together. Each one starts from an empty file and ends with something you can run: a backup script, a log analyser, and a terminal dashboard. Nothing is left as an exercise.',
    outcome: 'you have three working tools of your own, and the habit of building more.',
    level: 'Advanced',
    prereq: 'Everything above, especially shell scripting.',
  },
  {
    id: 'profession',
    number: 12,
    title: 'Working in security',
    tagline: 'Report it well, practise legally, and keep going.',
    description:
      'The part that turns skill into work. What written authorisation actually means and why verbal permission is not enough, how to write a finding somebody can act on, what to do when you find a problem in something you do not own, and what certifications and labs do and do not prove. This is not legal advice, and the law differs by country.',
    outcome: 'you can write a finding, disclose a problem responsibly, and choose what to learn next on evidence.',
    level: 'Intermediate',
    prereq: 'Any of the security tracks. This one is about practice rather than tools.',
  },
];

export function trackById(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}
