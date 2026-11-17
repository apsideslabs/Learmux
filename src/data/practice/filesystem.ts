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
  {
    slug: 'editing-a-file',
    title: 'Editing a file',
    topic: 'editing-a-file',
    summary: 'Get in and out of nano and vim, save what you wrote, and check a shell config before trusting it.',
    intro:
      'An editor is the one tool every later lesson assumes. This set checks that you know which mode vim opens in, what nano saves with, and how to prove a shell config is safe before you rely on it.',
    questions: [
      {
        id: 'edit-1',
        question: 'You open a file with vim and start typing, and nothing appears. Why?',
        options: [
          'vim opens in normal mode, where keys are commands rather than text',
          'vim is read-only until you save the file once',
          'The file is owned by another user, so it cannot be edited',
          'The terminal has lost focus and needs a click',
        ],
        answer: 0,
        explanation:
          'vim starts in normal mode on purpose: that is where the editing commands live, and it is why moving around a file does not require arrow keys. Pressing i switches to insert mode and your typing goes into the file. Pressing Esc always returns to normal mode, which is the first thing to try whenever vim seems to be ignoring you.',
      },
      {
        id: 'edit-2',
        question: 'In nano, which keys write the file to disk?',
        options: ['Ctrl-O', 'Ctrl-X', 'Ctrl-W', 'Ctrl-S'],
        answer: 0,
        explanation:
          'Ctrl-O is write-out, and it asks for the filename so you can confirm it. Ctrl-X exits, and it will offer to save if you have unsaved changes. Ctrl-W searches. Ctrl-S does nothing useful in a terminal, because the terminal uses it to pause output, which is a good way to think the editor has frozen when it has not.',
      },
      {
        id: 'edit-3',
        question: 'What does bash -n ~/.bashrc do?',
        options: [
          'Reads the file and reports syntax errors without running any of it',
          'Runs the file and prints the output to the screen',
          'Opens the file in nano at the first error',
          'Removes the file if it does not parse',
        ],
        answer: 0,
        explanation:
          'The -n flag means no execution: bash parses the file and stops. That is exactly what you want before opening a new shell, because a syntax error in .bashrc can leave you with a shell that starts badly. Silence means it parsed. An error names a line number, and the copy you made before editing is the way back.',
      },
    ],
    tasks: [
      {
        id: 'edit-t1',
        title: 'Write a file with an editor',
        prompt:
          'Open a new file called edited.txt in nano, type the two lines below, save it, exit, then print it back. The check grades the file that comes out, so any method passes, but do it in the editor: the point is the keystrokes, not the result.\n\nfirst\nsecond',
        command: 'cat ~/edited.txt',
        // The reader makes this file with the editor, which cannot be scripted.
        // The harness writes a correct one so the task can be graded at all.
        needs: { 'edited.txt': 'first\nsecond\n' },
        hint: 'In nano: type the two lines, then Ctrl-O and Enter to save, then Ctrl-X to exit. If you are in vim instead, press i, type, then Esc and :wq.',
        expects:
          'Two lines, first and second, exactly as written. If the file came out empty, the save did not happen: Ctrl-O asks for the filename and waits for Enter, and skipping that Enter is the usual cause. If you saw nothing when you typed in vim, you were in normal mode and needed i first.',
        rules: [
          { type: 'lines', min: 2, label: 'the file has at least two lines' },
          { type: 'contains', value: 'first', label: 'the first line is there' },
          { type: 'contains', value: 'second', label: 'the second line is there' },
          { type: 'absent', pattern: 'command not found|No such file', label: 'the command ran and found the file' },
        ],
      },
    ],
  },
  {
    slug: 'typing-on-a-phone',
    title: 'Typing on a phone',
    topic: 'typing-on-a-phone',
    summary: 'Reach Ctrl, Tab and Esc on a phone keyboard, stop a runaway command, and let completion do the typing.',
    intro:
      'The extra-keys row is the difference between fighting a phone keyboard and using it. This set checks the four keys that carry almost everything, and what each one is actually for.',
    questions: [
      {
        id: 'kb-1',
        question: 'A command is printing output and will not stop. What gets your prompt back?',
        options: [
          'Tap CTRL on the extra-keys row, then press C',
          'Close the Termux app and reopen it',
          'Press TAB twice',
          'Type exit and press Enter',
        ],
        answer: 0,
        explanation:
          'Ctrl-C sends an interrupt to the running program, which is the signal every well-behaved command expects. Closing the app also stops it, but it takes the whole session with it, including anything else you had running. Ctrl-C costs you only the one command.',
      },
      {
        id: 'kb-2',
        question: 'You have typed cd ~/proj and pressed TAB. What happens?',
        options: [
          'The shell completes the name if there is one match, and lists the options if there are several',
          'The shell runs the command immediately without waiting for Enter',
          'A literal tab character is inserted into the command',
          'Nothing, because TAB does not exist on a phone keyboard',
        ],
        answer: 0,
        explanation:
          'Completion is a feature of the shell prompt, not of the keyboard. One match fills itself in; several matches complete as far as they agree and a second TAB lists them. This is why long paths typed on a phone are rarely a source of mistakes: Tab cannot invent a character that is not there.',
      },
      {
        id: 'kb-3',
        question: 'What is the difference between Ctrl-C and Ctrl-D?',
        options: [
          'Ctrl-C cancels the running command; Ctrl-D means end of input, and at a prompt it closes the shell',
          'They are the same thing on Termux',
          'Ctrl-C closes the shell; Ctrl-D cancels the running command',
          'Ctrl-C pauses the command; Ctrl-D resumes it',
        ],
        answer: 0,
        explanation:
          'Ctrl-C interrupts, which stops whatever is running and returns you to a prompt. Ctrl-D is not a signal at all: it tells the program reading the keyboard that there is no more input. At an empty prompt that means the shell exits. Inside a program waiting for input, it means finish. Pausing is a third thing, Ctrl-Z, and fg brings the job back.',
      },
    ],
    tasks: [
      {
        id: 'kb-t1',
        title: 'Type a pipe on your phone keyboard',
        prompt:
          'The pipe symbol turns one command output into another command input, and it is used in most lessons after this one. Find it on your phone keyboard rather than copying it from here, then run the command below in Termux.\n\nThe result is a single number: how many entries are in your home directory.',
        command: 'ls | wc -l',
        hint: 'On most phone keyboards the pipe lives on the symbols page, often a page past the digits. On the Termux extra-keys row you can also long press some keys to reach it.',
        expects:
          'One number, and nothing else. If you got a wall of filenames, the pipe was not read as a pipe: check you did not type a capital i or a lowercase L. If you got a syntax error, the character came out as something else, which is worth finding now rather than mid-exercise.',
        rules: [
          { type: 'matches', pattern: '^\\s*[0-9]+\\s*$', label: 'the output is a single number' },
          { type: 'absent', pattern: 'command not found|syntax error|not found', label: 'the pipe was read as a pipe' },
        ],
      },
    ],
  },
  {
    slug: 'termux-beyond-the-basics',
    title: 'Termux beyond the basics',
    topic: 'termux-beyond-the-basics',
    summary: 'Keep a job alive, run a distribution Termux does not have, and reach the phone from the shell.',
    intro:
      'Three add-ons turn Termux from a small Linux box into something that fits a phone: a wake lock so Android stops killing your jobs, proot for software Termux has no package for, and the API for the clipboard and notifications.',
    questions: [
      {
        id: 'tx-1',
        question: 'You start a long rsync, switch to another app, and come back to find it stopped. What fixes this?',
        options: [
          'Run termux-wake-lock before starting the job',
          'Run the command with sudo',
          'Close every other app first',
          'Run it in the background with &',
        ],
        answer: 0,
        explanation:
          'Android freezes or kills backgrounded apps to save battery, and a frozen process stops working. A wake lock asks the system to leave Termux alone until you release it. Backgrounding with & does not help, because the process is still inside an app Android is free to suspend. sudo is unrelated, and is not available on a stock phone anyway.',
      },
      {
        id: 'tx-2',
        question: 'A tool you need has no Termux package. What is the intended answer?',
        options: [
          'Install a full distribution with proot-distro and use it there',
          'Download a random binary and run it',
          'Enable developer mode and install it system-wide',
          'It cannot be done on a phone',
        ],
        answer: 0,
        explanation:
          'proot-distro runs Debian, Ubuntu or another distribution inside Termux, with its own package manager and its own libraries. That is the supported route when a package genuinely does not exist for Termux, and it is also what you need when something expects glibc. It costs a few hundred megabytes, so use pkg install when that works.',
      },
      {
        id: 'tx-3',
        question: 'What does Termux:API give you that the plain terminal does not?',
        options: [
          'Access to the phone itself: clipboard, notifications, battery, camera and sensors',
          'Root access to the Android system',
          'A graphical desktop environment',
          'Faster package downloads',
        ],
        answer: 0,
        explanation:
          'The termux-api package plus the Termux:API app expose the device hardware as commands, so a script can read the battery, post a notification, or read the clipboard. It does not grant root, and it is not a display server: X11 is a separate app. That access to the device is what makes Termux more than a Linux shell on a phone.',
      },
    ],
    tasks: [
      {
        id: 'tx-t1',
        title: 'Ask the phone about its battery',
        prompt:
          'Install the API package in Termux with pkg install termux-api, and make sure the Termux:API app is installed from F-Droid as well. Then run the command below in Termux. It prints JSON describing the battery right now.',
        command: 'termux-battery-status',
        hint: 'If the command prints nothing at all, the app is usually missing rather than the package. Both are needed: the package provides the command, the app provides the access.',
        expects:
          'A JSON object with a percentage and a status such as CHARGING or DISCHARGING, plus temperature and health. The numbers will not match anyone else figures, which is the point: this is your phone being read by a script. If you got an empty line, check the app is installed and open it once so Android grants the permission.',
        rules: [
          { type: 'contains', value: 'percentage', label: 'the output includes a percentage' },
          { type: 'contains', value: 'health', label: 'the output includes battery health' },
          { type: 'absent', pattern: 'command not found', label: 'the termux-api package is installed' },
        ],
      },
    ],
  },
];
