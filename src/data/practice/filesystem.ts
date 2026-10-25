/**
 * Practice sets for the filesystem track: the shell, navigation, permissions.
 *
 * Questions are written so the wrong answers are the mistakes people actually
 * make, and the explanation says why the right answer is right rather than
 * just restating it.
 */

import type { PracticeSet } from './types';

export const filesystemSets: PracticeSet[] = [
  {
    slug: 'getting-started',
    title: 'Getting started with Termux',
    topic: 'getting-started',
    summary: 'The prompt, where you are, and what to do before installing anything.',
    intro:
      'Termux gives you a Linux environment inside an Android app, with its own filesystem under the com.termux package. These questions check that you know where you are and what to do first.',
    questions: [
      {
        id: 'gs-1',
        question: 'You have just installed Termux and opened it. What should you do before installing any packages?',
        options: [
          'Run pkg update && pkg upgrade',
          'Run rm -rf $HOME to clear old files',
          'Run chmod 777 / so everything is writable',
          'Nothing, packages are always current',
        ],
        answer: 0,
        explanation:
          'The package list Termux ships with is a snapshot from whenever the app was built. Updating refreshes that list, so packages resolve to their current versions and you avoid missing-dependency errors partway through an install. Removing your home directory or opening up the root permissions would damage your setup, and the fourth option is not true: the list ages as soon as the app is released.',
      },
      {
        id: 'gs-2',
        question: 'What does the tilde, ~, mean in a path?',
        options: [
          'Your home directory',
          'The root of the whole filesystem',
          'The directory you were in before this one',
          'A file that is hidden',
        ],
        answer: 0,
        explanation:
          'The shell expands ~ to your home directory, which in Termux is /data/data/com.termux/files/home. The root of the filesystem is /, a single slash. The previous directory is what - means to cd. And a name is hidden when it begins with a dot, which is a different thing entirely.',
      },
      {
        id: 'gs-3',
        question: 'You are in /data/data/com.termux/files/home and run cd .. Where are you now?',
        options: [
          '/data/data/com.termux/files',
          '/',
          'Still in home, because .. needs an argument',
          '/data/data/com.termux',
        ],
        answer: 0,
        explanation:
          '.. means the parent of the current directory, and one level up from home is /data/data/com.termux/files. Reaching / would take three more steps up. The third option is wrong because cd .. is a complete command, and the fourth would skip two levels.',
      },
      {
        id: 'gs-4',
        question: 'Which command prints the directory you are currently in?',
        options: ['pwd', 'cd', 'ls', 'whoami'],
        answer: 0,
        explanation:
          'pwd stands for print working directory, and working directory is the shell\'s name for where you are. cd changes that directory rather than reporting it, ls lists what is inside it, and whoami tells you which user you are running as.',
      },
    ],
    tasks: [
      {
        id: 'gs-t1',
        title: 'Show where you are',
        prompt:
          'This prints the directory you are currently in. It is a single line, and it tells you something specific about how Termux is put together.',
        command: 'pwd',
        hint: 'If the command prints nothing, check you copied the whole line.',
        expects:
          'You should have something like /data/data/com.termux/files/home. Two things are worth noticing. It is an absolute path, starting from the root, which is what makes it unambiguous wherever you run it from. And it sits inside com.termux, which is Termux\'s own private area. Your phone\'s shared storage is somewhere else entirely, under /sdcard, and Termux cannot see it until you ask for permission with termux-setup-storage.',
        rules: [
          { type: 'matches', pattern: '^\\s*/', label: 'the output is an absolute path' },
          { type: 'contains', value: 'com.termux', label: 'it is inside Termux\'s own filesystem' },
          { type: 'absent', pattern: 'command not found|No such file', label: 'the command actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'navigating-the-filesystem',
    title: 'Finding your way around',
    topic: 'navigating-the-filesystem',
    summary: 'Absolute and relative paths, hidden files, and reading a long listing.',
    intro:
      'Most confusion at the start comes from two things: not knowing where you are, and not knowing what a listing is telling you. These questions cover both.',
    questions: [
      {
        id: 'nav-1',
        question: 'Which of these is an absolute path?',
        options: [
          '/data/data/com.termux/files/home',
          'notes.txt',
          '../home',
          './scripts',
        ],
        answer: 0,
        explanation:
          'An absolute path begins at the root, with a leading slash, so it means the same thing wherever you run it. The other three are relative: they are resolved against wherever you happen to be standing, so ../home is a different place depending on your current directory.',
      },
      {
        id: 'nav-2',
        question: 'What does ls -a show that a plain ls does not?',
        options: [
          'Files whose names begin with a dot',
          'The permissions of each file',
          'Only directories',
          'Files sorted by size',
        ],
        answer: 0,
        explanation:
          'A name beginning with a dot is hidden from a plain listing, and -a asks for everything, including the . and .. entries. Permissions need -l, directories alone need -d, and sorting by size needs -S. This is why a directory can look empty without being empty.',
      },
      {
        id: 'nav-3',
        question: 'In the output of ls -l, what does the first column tell you?',
        options: [
          'The type of the file, then its permission string',
          'The size in bytes',
          'The number of links to the file',
          'When the file was last changed',
        ],
        answer: 0,
        explanation:
          'The first column is ten characters. The first says what kind of thing it is: a dash for a regular file, d for a directory, l for a symbolic link. The other nine are three groups of three: what the owner may do, what the group may do, and what everyone else may do.',
      },
      {
        id: 'nav-4',
        question: 'You want to find every .txt file under your home directory. Which command does that?',
        options: [
          'find ~ -name "*.txt"',
          'grep "*.txt" ~',
          'ls ~/*.txt',
          'cat ~/*.txt',
        ],
        answer: 0,
        explanation:
          'find walks a directory tree and tests each entry, and -name takes a pattern to match the name against. grep searches inside files rather than for files. The third option only looks at the top level of your home directory, and the fourth tries to print the contents of files that may not exist.',
      },
    ],
    tasks: [
      {
        id: 'nav-t1',
        title: 'Read a long listing',
        prompt:
          'A long listing of everything in your home directory, hidden files included. Read the first column of each row as well as the names.',
        command: 'ls -la ~',
        hint: 'The first line of the output is a summary rather than a file, so do not try to read it as one.',
        expects:
          'The first line begins with the word total and gives the disk blocks used by the entries. Every line after that is one file or directory, and they all have the same shape: a ten-character type and permission string, a link count, an owner, a group, a size, a date, and finally the name. Two entries near the top will be a single dot and a double dot, which stand for this directory and its parent. If you cannot see them, you did not pass -a.',
        rules: [
          { type: 'matches', pattern: '^\\s*total\\s+\\d+', label: 'the listing opens with a total line' },
          {
            // the optional [.+]? is the marker some filesystems print after
            // the permission string to flag a security context or an ACL
            type: 'matches',
            pattern: '^\\s*[-d][rwx-]{9}[.+]?\\s+\\d+',
            label: 'each entry starts with a type and a permission string',
          },
          {
            type: 'matches',
            pattern: '^\\s*[-d][rwx-]{9}[.+]?\\s+\\d+\\s+.*\\s+\\d+\\s+\\w{3}\\s+\\d+',
            label: 'the owner, group and size columns are present',
          },
        ],
      },
    ],
  },

  {
    slug: 'file-permissions',
    title: 'Permissions and ownership',
    topic: 'file-permissions',
    summary: 'Reading a mode string, setting one with chmod, and the world-writable risk.',
    intro:
      'Permissions are where Linux stops being forgiving. A file is readable or it is not, and the answer is in a string you can read once you know the three groups.',
    questions: [
      {
        id: 'perm-1',
        question: 'A file is -rw-r-----. Who can read it?',
        options: [
          'The owner and the group, but nobody else',
          'Everyone',
          'The owner only',
          'Nobody, until it is made executable',
        ],
        answer: 0,
        explanation:
          'Read the string in three groups of three. The owner has rw, so they can read and write. The group has r, so they can read. Everyone else has three dashes, so they get nothing. The dashes are the point: a permission that is not granted is simply absent.',
      },
      {
        id: 'perm-2',
        question: 'What does chmod 600 secret.txt do?',
        options: [
          'Gives the owner read and write, and nobody else anything',
          'Gives everyone read and write',
          'Makes the file executable',
          'Makes the file readable by the group only',
        ],
        answer: 0,
        explanation:
          'In octal, each digit is one group: read is 4, write is 2 and execute is 1, and they add up. So 6 is read and write. The three digits are owner, group and other, so 600 gives the owner read and write and leaves the other two groups at zero. This is the mode you want on anything holding a secret.',
      },
      {
        id: 'perm-3',
        question: 'Why is a world-writable directory a risk?',
        options: [
          'Anyone who can reach it can create files in it, or replace files already there',
          'It uses more disk space',
          'It cannot be backed up',
          'Files inside it lose their owner',
        ],
        answer: 0,
        explanation:
          'Write permission on a directory is the power to add, rename and delete entries in it. If everyone has that, then anyone who can reach the directory can drop a file in, or swap out something you trust for something you should not. The other three answers describe things that are not true of permissions at all.',
      },
      {
        id: 'perm-4',
        question: 'What does chmod +x script.sh change, and for whom?',
        options: [
          'It adds execute, for all three groups, unless a umask says otherwise',
          'It adds execute for the owner only',
          'It adds read and execute for everyone',
          'It removes write from everyone',
        ],
        answer: 0,
        explanation:
          'The symbolic form without a who part means all three: user, group and other. So +x adds execute for each of them. That is usually more than you want on a private script, which is why chmod u+x, naming the owner, is the tidier habit.',
      },
    ],
    tasks: [
      {
        id: 'perm-t1',
        title: 'Produce a mode and read it back',
        prompt:
          'This creates a file, sets it to owner-only, then shows you both the permission string and the octal value, so you can see the same mode written two ways.',
        command:
          'touch ~/secret.txt; chmod 600 ~/secret.txt; ls -l ~/secret.txt; stat -c "%a %n" ~/secret.txt',
        hint: 'You are looking for two different views of the same mode: the symbolic one from ls, and the octal one from stat.',
        expects:
          'The first line is from ls and should read -rw-------, which is the symbolic form: read and write for the owner, nothing for the group, nothing for anyone else. The second line is from stat and should be 600, which is the same thing written in octal. Being able to move between those two notations is the whole skill. If your ls line shows -rw-r--r--, the chmod did not take effect.',
        rules: [
          { type: 'matches', pattern: '^\\s*-rw-------', label: 'the symbolic mode is owner read and write only' },
          { type: 'matches', pattern: '^\\s*600\\s', label: 'the octal mode is 600' },
          { type: 'contains', value: 'secret.txt', label: 'the listing is for the file you created' },
        ],
      },
    ],
  },
];
