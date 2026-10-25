/**
 * Practice sets for the security track and the three security-flavoured
 * projects: secrets and keys, hardening, safe habits, and the backup, log
 * analyser and dashboard builds.
 *
 * The output tasks here are graded against rules that describe meaning, not
 * exact characters. A key fingerprint, a permission string and a disk figure
 * all differ from device to device, so each rule asks whether the output says
 * the right thing rather than whether it says it the same way.
 */

import type { PracticeSet } from './types';

export const securitySets: PracticeSet[] = [
  {
    slug: 'passwords-and-keys',
    title: 'Passwords and keys',
    topic: 'passwords-and-keys',
    summary: 'How hashing, long passphrases and a protected key keep a secret yours.',
    intro:
      'A password is checked by hashing it again and comparing, never by reversing a stored value. This set covers why that matters, how to make a strong secret, and how the permissions on a private key tell you whether it is safe.',
    questions: [
      {
        id: 'key-1',
        question: 'Why are passwords stored as hashes rather than as encrypted text?',
        options: [
          'A hash cannot be run backwards to recover the password, so a leaked hash file is far less damaging',
          'A hash takes less space to store than the password',
          'A hash can be reversed, but only with the right key',
          'A hash is faster for a person to type than the password',
        ],
        answer: 0,
        explanation:
          'Encryption is meant to be undone, so a stolen key turns ciphertext back into plaintext. A hash is one way: the system hashes what you type and compares the two hashes, and it never needs your original password. That is why a leaked hash file is far less damaging than a leaked password file, and why a service that can email you your old password is storing it wrongly.',
      },
      {
        id: 'key-2',
        question: 'What does the -n do in echo -n "correct horse battery staple" | sha256sum?',
        options: [
          'It stops echo adding a trailing newline, so you hash exactly the characters you typed',
          'It prints the hash in numeric form instead of hexadecimal',
          'It hides the passphrase so it does not appear on screen',
          'It repeats the hash until the result is unique',
        ],
        answer: 0,
        explanation:
          'By default echo adds a newline to the end of its output, and that newline would become part of the text being hashed. The -n suppresses it, so the hash matches one taken from the bare string. Leave it out and you get a different hash for what looks like the same passphrase, which is a common source of confusion when checking a password against a stored hash.',
      },
      {
        id: 'key-3',
        question: 'In the listing of ~/.ssh, the private key shows -rw-------. What does that mean?',
        options: [
          'Only the owner can read and write it, and nobody else has any access',
          'Everyone can read it, but only the owner can write it',
          'It is a directory rather than a file',
          'It is a symbolic link to the public key',
        ],
        answer: 0,
        explanation:
          'Read the nine permission characters in three groups. The owner has rw, so they can read and write the file. The group has three dashes and everyone else has three dashes, so neither can do anything with it. A leading dash, rather than a d or an l, means it is a regular file. This is the mode a private key should have, because anyone who can read it can use it.',
      },
      {
        id: 'key-4',
        question: 'Why is a long passphrase of several ordinary words stronger than a short password full of symbols?',
        options: [
          'Length gives an attacker a far larger space to search than a few symbol substitutions do',
          'Long words cannot be guessed by any method at all',
          'Most systems strip symbols before hashing',
          'A passphrase is never stored as a hash',
        ],
        answer: 0,
        explanation:
          'Every extra character multiplies the number of combinations an attacker must try, so length grows the search space faster than a handful of symbol swaps. A passphrase of four unrelated words is also easier to remember than a scrambled short password, which matters because a secret you cannot recall tends to get written down. It is still hashed like any other password, so nothing about it is exempt.',
      },
    ],
    tasks: [
      {
        id: 'key-t1',
        title: 'Hash a passphrase, then make a real secret',
        prompt:
          'This hashes the same passphrase twice, then reads 32 random bytes from the system. Watch the first two lines and then the third: the hash is identical both times, and the random secret would be different every time you ran it.',
        command:
          'echo -n "correct horse battery staple" | sha256sum; echo -n "correct horse battery staple" | sha256sum; head -c 32 /dev/urandom | base64',
        hint: 'When sha256sum reads from a pipe rather than a file, it prints the digest, two spaces, then a single dash.',
        expects:
          'Three lines. The first two are identical, because the same input always produces the same digest. That is exactly what makes a hash useful for checking a password without storing the password itself. The third line changes every time you run the command, because it came from the random device rather than from words you chose. The contrast is the lesson: a hash is predictable, and a secret must not be.',
        rules: [
          {
            type: 'matches',
            pattern: '^\\s*([0-9a-f]{64})\\s.*\\n\\s*\\1\\s',
            label: 'the same passphrase produces the same digest twice',
          },
          {
            type: 'matches',
            pattern: '^\\s*[A-Za-z0-9+/]{43}=$',
            label: 'a base64 secret of 32 random bytes follows',
          },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'hardening-your-termux',
    title: 'Hardening your Termux setup',
    topic: 'hardening-your-termux',
    summary: 'Fewer listeners, current packages, and permissions that keep others out.',
    intro:
      'Hardening is the work of shrinking what an attacker can reach. This set covers the listeners on your device, reading a permission string, and confirming that your shell is not running as root.',
    questions: [
      {
        id: 'hard-1',
        question: 'What does netstat -tuln show you?',
        options: [
          'The TCP and UDP ports your device is listening on, in numeric form',
          'Every file your user is allowed to write to',
          'The packages installed on your device',
          'The other devices on your network',
        ],
        answer: 0,
        explanation:
          'The -t and -u ask for TCP and UDP, -l keeps only the listeners, and -n prints numbers rather than looking names up. What you get is a list of the doors that are open on your device. An empty list is a good default, so start a listener only while you are using it. It says nothing about other machines, which is a different tool entirely.',
      },
      {
        id: 'hard-2',
        question: 'Your notes.txt shows -rw-rw-rw-. What is wrong, and how do you fix it?',
        options: [
          'Everyone can read and write it, so chmod 600 tightens it to owner only',
          'It is a directory that should have been a file',
          'It is executable and should not be',
          'It has lost its owner, so you must chown it',
        ],
        answer: 0,
        explanation:
          'The last six characters are rw for the group and rw for everyone else, so any account that can reach the file may change it. That is too loose for anything you care about. chmod 600 sets read and write for the owner and nothing for the other two groups, which is the mode you want on a file holding a secret. The file still has an owner, so chown is not the fix here.',
      },
      {
        id: 'hard-3',
        question: 'What does id tell you on Termux?',
        options: [
          'Your user id and groups, which should be a normal app id rather than root',
          'The id of the last process you started',
          'The list of packages you have installed',
          'The ports your device is listening on',
        ],
        answer: 0,
        explanation:
          'id prints your user id, your primary group and any other groups you belong to. On Termux your id is a normal app id such as u0_a231, not root, and that is what you want, because root can change anything on the device. If a guide tells you to run a whole session as root, treat that as a warning sign and look for a way to do the task as your ordinary user.',
      },
      {
        id: 'hard-4',
        question: 'The lesson notes that 6 is read plus write and 4 is read only. What does chmod 644 do to a file?',
        options: [
          'The owner can read and write it, and everyone else can read it',
          'Everyone can read and write it',
          'The owner can read it only, and everyone else can write it',
          'Nobody but the owner can read it',
        ],
        answer: 0,
        explanation:
          'Each octal digit is one group, in the order owner, group, then other. The 6 gives the owner read and write, and the two 4s give the group and everyone else read only. This is the usual mode for a file that is not secret, such as a script you share or a page you serve. It is not a mode to put on a private key, which is where 600 belongs.',
      },
    ],
    tasks: [
      {
        id: 'hard-t1',
        title: 'Lock a directory and a file down',
        prompt:
          'This makes a private directory, puts a file inside it, and then tightens both. Read the two octal modes printed at the end, and the permission string above them.',
        command:
          'mkdir -p ~/private; printf "secret\\n" > ~/private/notes.txt; chmod 600 ~/private/notes.txt; chmod 700 ~/private; ls -l ~/private/notes.txt; stat -c "%a %n" ~/private ~/private/notes.txt',
        hint: '700 and 600 differ in one digit, and that digit is the difference between a directory you can walk into and one you cannot.',
        expects:
          'Three lines. The first is a long listing of the file and should read -rw-------, which is read and write for you and nothing at all for anyone else. Then stat prints the same two permissions in octal, which is the shorter notation the lesson uses: 700 for the directory, so only you can enter it, and 600 for the file. If the file showed 644, the group and everyone else could read your secret.',
        rules: [
          { type: 'matches', pattern: '^\\s*-rw-------', label: 'the file is readable and writable by the owner only' },
          { type: 'matches', pattern: '^\\s*\\d?700\\s', label: 'the directory is 700, so only you can enter it' },
          { type: 'matches', pattern: '^\\s*\\d?600\\s', label: 'the file is 600' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'safe-habits-and-privacy',
    title: 'Safe habits and privacy',
    topic: 'safe-habits-and-privacy',
    summary: 'What your shell leaves behind, and where a secret can end up.',
    intro:
      'The quiet risk on a phone is not a dramatic attack. It is a secret typed on the command line, a file left in shared storage, or a permission you granted months ago and forgot. This set covers the trail your own work leaves.',
    questions: [
      {
        id: 'priv-1',
        question: 'A secret typed as part of a command now sits in your history. Why is that a problem?',
        options: [
          'History is a plain text file, readable by anything that can read your home directory',
          'History is uploaded to the internet automatically',
          'History cannot be edited or deleted once written',
          'History is encrypted with your screen lock',
        ],
        answer: 0,
        explanation:
          'Every command you type is written to a history file, and that file is ordinary text with ordinary permissions. Anything that can read your home directory can read it, and the entry survives across many sessions until you remove it. It can be edited, which is what history -d is for, but avoiding the recording in the first place is easier than chasing it afterwards. Nothing here is uploaded anywhere.',
      },
      {
        id: 'priv-2',
        question: 'What does history -d 5 do?',
        options: [
          'It removes entry number 5 from the history list, leaving the rest alone',
          'It deletes the fifth file in your home directory',
          'It shows only the last five commands',
          'It wipes the whole history file',
        ],
        answer: 0,
        explanation:
          'The number you pass is the one shown in the left column of the history listing, so history -d 5 drops that single entry and closes the gap. It does not touch your files and it does not clear everything, which is the point: you can remove one careless command without losing the rest. The file on disk is rewritten when the shell exits, so close the session cleanly if you are being careful.',
      },
      {
        id: 'priv-3',
        question: 'In ls -la ~/storage/shared, the line starts with l and shows an arrow to /storage/emulated/0. What does that tell you?',
        options: [
          'It is a symbolic link into shared storage, which other apps on the phone can also reach',
          'It is a locked file that only root can read',
          'It is the largest file in the directory',
          'It is a private copy that never leaves Termux',
        ],
        answer: 0,
        explanation:
          'A leading l marks a symbolic link, and the arrow shows the path it points to. Here it leads to the top of your phone shared storage, which other apps holding the storage permission can also read. That is why a secret belongs in your private home directory and not in anything under that link. readlink prints the target on its own when you want just the path.',
      },
      {
        id: 'priv-4',
        question: 'What does a VPN actually do on a public Wi-Fi network?',
        options: [
          'It encrypts traffic from your phone to the VPN provider, so the local network sees only the tunnel',
          'It stops malware and makes you anonymous',
          'It repairs sites that were already unencrypted',
          'It removes the need for HTTPS',
        ],
        answer: 0,
        explanation:
          'A VPN moves the problem rather than removing it. It hides your traffic from the local network by tunnelling it to the provider, which helps against a snooping network, but it does not stop malware, does not make you anonymous, and does not protect an app that ignores the tunnel. It also means you now trust the provider instead. Use HTTPS everywhere, and reach for a VPN when you must trust a network you do not control.',
      },
    ],
    tasks: [
      {
        id: 'priv-t1',
        title: 'See what a history file keeps',
        prompt:
          'This writes three lines into a file in your home directory, in the shape a shell history file takes, then counts them and prints them. Look at the middle line and think about where it came from.',
        command:
          'printf "ls -la\\nssh deploy@example.com\\ncd ~/work\\n" > ~/history-demo.txt; wc -l ~/history-demo.txt; cat ~/history-demo.txt',
        hint: 'Nothing here is encrypted or hidden. It is a plain text file, and cat reads it.',
        expects:
          'Four lines: the count, which is 3, then the three commands. The middle one is stored in full, including the account it was aimed at, in a file that anything running as you can read. That is what the lesson means by treating anything typed into a terminal as recorded. A secret belongs in a prompt or in a file with tight permissions, never on a command line.',
        rules: [
          { type: 'matches', pattern: '^\\s*3\\s', label: 'three lines were counted' },
          { type: 'contains', value: 'ssh deploy@example.com', label: 'the whole command line is stored in plain text' },
          { type: 'lines', min: 4, label: 'the count and all three lines are there' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'project-backup-script',
    title: 'Project: a backup script',
    topic: 'project-backup-script',
    summary: 'A dated archive, a repeat-run guard, and a meaningful exit code.',
    intro:
      'The backup script is a handful of decisions rather than a lot of code: build a filename from the date, create the destination safely, refuse to run twice on the same day, and report the outcome with a status code another program can read.',
    questions: [
      {
        id: 'bk-1',
        question: 'What does mkdir -p "$HOME/backups" do when the directory already exists?',
        options: [
          'It creates any missing parents and reports no error, so it is safe on every run',
          'It fails with an error because the directory is already there',
          'It deletes the directory and creates it again',
          'It creates a file of that name instead',
        ],
        answer: 0,
        explanation:
          'The -p option means create the whole chain of parents and do not treat an existing directory as an error. That is what lets the script call it on every run without guarding it with a test first. Plain mkdir would complain when the directory exists, and it would not create the parents either. The script never removes the directory, because doing so would throw away the archives already inside it.',
      },
      {
        id: 'bk-2',
        question: 'In tar -czf "$ARCHIVE" -C "$SRC" ., what is the -C "$SRC" for?',
        options: [
          'It changes into the source folder first, so the archive holds that folder and its contents',
          'It compresses the output with a higher ratio',
          'It checks the archive after writing it',
          'It copies only files whose names begin with C',
        ],
        answer: 0,
        explanation:
          'The -C flag changes directory before tar collects anything, and the trailing dot then means everything in that folder. The result is an archive whose entries are relative to the source, so they unpack cleanly wherever you are. Without -C, the dot would refer to your current directory and you would archive the wrong tree. The compression comes from -z, not from -C.',
      },
      {
        id: 'bk-3',
        question: 'The script tests [ -f "$ARCHIVE" ] and exits 0 when the archive already exists. Why exit 0 and not 1?',
        options: [
          'Skipping work that is already done is a success, not a failure',
          'Because the archive file could not be written',
          'Because exit 0 deletes the old archive',
          'Because tar requires a zero status before it will overwrite',
        ],
        answer: 0,
        explanation:
          'An exit code is a message to whatever ran the script. A run that found the day archive already present did exactly what it should, so it reports success with 0. A failure would be tar being unable to write, which the script reports with 1, or a missing source folder, which it reports with 2. Using 1 for a skip would make a scheduled job look broken when nothing was wrong.',
      },
      {
        id: 'bk-4',
        question: 'Why does the script test [ ! -d "$SRC" ] before it runs tar?',
        options: [
          'So a missing source folder gives a clear message and status 2 rather than a confusing tar error',
          'Because tar cannot compress a directory',
          'Because the source folder must be emptied first',
          'Because -d makes tar run in the background',
        ],
        answer: 0,
        explanation:
          'The test is true when the path is not a directory, which covers both a folder that is missing and one that is a file. Catching it first lets the script print its own message and exit with 2, so the two failure cases are easy to tell apart. Left to tar, the same problem produces a longer and less obvious error. tar can compress a directory perfectly well, so that is not the reason.',
      },
    ],
    tasks: [
      {
        id: 'bk-t1',
        title: 'Build and list a dated archive',
        prompt:
          'This makes a small source folder, packs it into a dated archive the way the script does, then lists the archive back to confirm what went in. The date in the filename is today.',
        command: 'mkdir -p "$HOME/notes" "$HOME/backups"; printf \'call the plumber\\n\' > "$HOME/notes/todo.txt"; STAMP=$(date +%Y-%m-%d); ARCHIVE="$HOME/backups/notes-$STAMP.tar.gz"; tar -czf "$ARCHIVE" -C "$HOME/notes" .; echo "wrote $ARCHIVE"; tar -tzf "$ARCHIVE"',
        hint: 'The listing prints one entry per line, and the first is the folder itself as a single dot.',
        expects:
          'The first line is your own message naming the archive, and it should contain the date stamp in the form year-month-day followed by .tar.gz. After that comes the archive listing from tar -tzf, which shows a single dot for the folder and a line for todo.txt, the file you put inside. The entries are relative to the source folder, which is why they begin with a dot rather than the full path. If the listing is empty, tar did not run or the source folder was wrong.',
        rules: [
          { type: 'matches', pattern: '^\\s*wrote\\s', label: 'the script reports the archive it wrote' },
          { type: 'matches', pattern: 'notes-\\d{4}-\\d{2}-\\d{2}\\.tar\\.gz', label: 'the archive name carries a date stamp' },
          { type: 'matches', pattern: 'todo\\.txt', label: 'the file from the source folder is inside the archive' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'project-log-analyzer',
    title: 'Project: a log analyser',
    topic: 'project-log-analyzer',
    summary: 'Rank the top talkers, count the errors, and find the busiest hour.',
    intro:
      'The log analyser is built from small pipelines. This set covers the field syntax of awk, why sort has to come before uniq -c, and how a timestamp is sliced down to its hour.',
    questions: [
      {
        id: 'log-1',
        question: 'Why must sort come before uniq -c in the count-and-rank pipeline?',
        options: [
          'uniq only collapses lines that are next to each other, so the repeats have to be grouped first',
          'uniq requires its input in reverse order',
          'sort removes blank lines that uniq cannot handle',
          'uniq only accepts numbers, which sort produces',
        ],
        answer: 0,
        explanation:
          'uniq compares each line with the one before it, so it counts a run of identical lines and nothing else. If the same address appears in two separate places, uniq sees two runs of one and reports each separately. Sorting first brings every copy together so there is a single run to collapse. Leave the sort out and the totals come out wrong, which is the mistake this pair is famous for.',
      },
      {
        id: 'log-2',
        question: 'What does the awk program that prints the first field output for each line of sample.log?',
        options: [
          'The first whitespace-separated field of every line, which is the source address',
          'The whole first line of the file',
          'Every line that begins with a digit',
          'The number of fields on each line',
        ],
        answer: 0,
        explanation:
          'awk splits each line on whitespace by default and numbers the fields from one, so the first field is taken from every line, not just the first line. In a web server log that field is the source address, which is exactly what the ranking needs. Printing the count of fields on a line would be a different variable, and selecting lines by their first character is a job for grep rather than awk.',
      },
      {
        id: 'log-3',
        question: 'Why does the error count use a grep pattern of a space, 5[0-9][0-9], then a space?',
        options: [
          'The spaces stop the pattern matching a three-digit number that is part of a longer number',
          'grep requires a space to begin a pattern',
          'The spaces make the search case insensitive',
          'The spaces make grep count words instead of lines',
        ],
        answer: 0,
        explanation:
          'The pattern matches any number from 500 to 599, but without the surrounding spaces it would also match those digits inside a longer number such as the size 15003. Wrapping the pattern in spaces means only a standalone three-digit field matches, which is what a status code is. The -c option is what turns the output into a count of matching lines rather than the lines themselves.',
      },
      {
        id: 'log-4',
        question: 'The timestamp is 10/Oct/2026:11:03:22 inside square brackets. How does the script get the hour?',
        options: [
          'awk splits on the brackets and prints the second field, then cut on the colon takes the hour out of it',
          'grep finds the hour directly with its pattern option',
          'sort -nr orders the lines by hour',
          'head -n 1 prints the hour of the first line',
        ],
        answer: 0,
        explanation:
          'The field separator is set to a set containing the two bracket characters, so awk splits each line on either bracket and field two is the whole timestamp. Cutting that on the colon and keeping field two leaves the hour. Only then does the same sort, uniq -c and sort -nr pipeline rank the hours. A pattern search could pull out a shape of text, but it would not isolate the hour from the rest of the timestamp.',
      },
    ],
    tasks: [
      {
        id: 'log-t1',
        title: 'Run the report on a sample log',
        prompt:
          'This writes the sample log the project uses and then runs the three parts of the report: the ranked source addresses, the count of server errors, and the busiest hour. Read the shape of each section rather than the exact numbers.',
        command: 'printf \'203.0.113.7 - - [10/Oct/2026:09:12:01 +0000] "GET /index.html HTTP/1.1" 200 1043\n198.51.100.4 - - [10/Oct/2026:09:12:05 +0000] "GET /style.css HTTP/1.1" 200 512\n203.0.113.7 - - [10/Oct/2026:09:15:44 +0000] "GET /about.html HTTP/1.1" 200 2210\n192.0.2.55 - - [10/Oct/2026:10:01:10 +0000] "POST /login HTTP/1.1" 302 0\n198.51.100.4 - - [10/Oct/2026:10:02:33 +0000] "GET /index.html HTTP/1.1" 200 1043\n203.0.113.7 - - [10/Oct/2026:10:30:00 +0000] "GET /missing.html HTTP/1.1" 404 153\n192.0.2.55 - - [10/Oct/2026:10:41:59 +0000] "GET /index.html HTTP/1.1" 200 1043\n203.0.113.7 - - [10/Oct/2026:10:55:12 +0000] "GET /boom HTTP/1.1" 500 21\n198.51.100.4 - - [10/Oct/2026:10:55:40 +0000] "GET /boom HTTP/1.1" 500 21\n192.0.2.55 - - [10/Oct/2026:11:03:22 +0000] "GET /index.html HTTP/1.1" 200 1043\n203.0.113.7 - - [10/Oct/2026:11:07:07 +0000] "GET /about.html HTTP/1.1" 200 2210\n198.51.100.4 - - [10/Oct/2026:11:22:18 +0000] "GET /style.css HTTP/1.1" 200 512\n192.0.2.55 - - [10/Oct/2026:11:44:59 +0000] "GET /index.html HTTP/1.1" 200 1043\n203.0.113.7 - - [10/Oct/2026:11:50:31 +0000] "GET /index.html HTTP/1.1" 200 1043\n198.51.100.4 - - [10/Oct/2026:11:58:02 +0000] "GET /boom HTTP/1.1" 500 21\n192.0.2.55 - - [10/Oct/2026:12:00:01 +0000] "GET /index.html HTTP/1.1" 200 1043\n203.0.113.7 - - [10/Oct/2026:12:14:14 +0000] "GET /index.html HTTP/1.1" 200 1043\n198.51.100.4 - - [10/Oct/2026:12:19:19 +0000] "GET /style.css HTTP/1.1" 200 512\n192.0.2.55 - - [10/Oct/2026:12:25:25 +0000] "GET /index.html HTTP/1.1" 200 1043\n203.0.113.7 - - [10/Oct/2026:12:30:30 +0000] "GET /index.html HTTP/1.1" 200 1043\n\' > "$HOME/sample.log"; echo "-- Top 10 source addresses --"; awk \'{print $1}\' "$HOME/sample.log" | sort | uniq -c | sort -nr | head -n 10; echo "-- Errors (5xx) --"; grep -c \' 5[0-9][0-9] \' "$HOME/sample.log"; echo "-- Busiest hour --"; awk -F\'[][]\' \'{print $2}\' "$HOME/sample.log" | cut -d: -f2 | sort | uniq -c | sort -nr | head -n 1',
        hint: 'The address rows are a count and an address, and the busiest hour is a count and a bare two-digit hour.',
        expects:
          'Three headed sections. Under the addresses you get one row per address, each a count then the address, with the largest count first because sort -nr ranks them. Under the errors you get a single number, the count of lines whose status code is in the 500 range. Under the busiest hour you get a count then a two-digit hour, the hour with the most requests. If a section is empty, one of the pipelines lost its input along the way.',
        rules: [
          { type: 'matches', pattern: '^\\s*\\d+\\s+\\d{1,3}(\\.\\d{1,3}){3}', label: 'the top addresses are ranked with their request counts' },
          { type: 'matches', pattern: '^\\s*\\d+\\s+\\d{1,2}\\s*$', label: 'the busiest hour is reported as a count and an hour' },
          { type: 'lines', min: 4, label: 'the report has a heading and several result rows' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'project-personal-dashboard',
    title: 'Project: a terminal dashboard',
    topic: 'project-personal-dashboard',
    summary: 'Aligned output, disk and memory figures, and a line that needs no network.',
    intro:
      'The dashboard gathers a few facts about the phone and lays them out under clear headings. This set covers printing figures with printf, guarding a read that may not exist, and choosing a section that always works offline.',
    questions: [
      {
        id: 'dash-1',
        question: 'Why does the battery section test that the capacity file is readable before reading it?',
        options: [
          'Not every phone exposes a battery to Termux, and an unguarded read of a missing path prints an error and fails',
          'Because the file has to be written before it can be read',
          'Because the readable test turns the number into a percentage',
          'Because cat cannot read files under /sys',
        ],
        answer: 0,
        explanation:
          'The battery path is a device detail, so the file may simply not be there. An unguarded read of a missing path prints an error and returns a non-zero status, which would spoil the rest of the dashboard. Testing that the file is readable first, which is true only when it exists and can be read, lets the script print a fallback line instead. The test has nothing to do with the value itself, only with whether it can be read.',
      },
      {
        id: 'dash-2',
        question: 'In the disk line, what does printf with three %s placeholders, fed $3, $2 and $5, do?',
        options: [
          'It fills the three placeholders in order with the used size, the total and the percentage',
          'It prints the raw df line unchanged',
          'It sorts the filesystems by size',
          'It rounds each figure to a whole number',
        ],
        answer: 0,
        explanation:
          'printf takes a format string and a list of values, and each %s is replaced by the next argument in turn, so the sentence is built from three columns of the df output. The column order matters: the third column is used, the second is the total and the fifth is the percentage, which is why the words come out in a sensible order. It does not round anything and it does not sort, because those would be different tools.',
      },
      {
        id: 'dash-3',
        question: 'In the case statement, why does the empty pattern have a branch of its own, separate from the wildcard?',
        options: [
          'The empty pattern matches no argument at all, which should run the full dashboard, while the wildcard catches an unrecognised flag',
          'Because case cannot have two wildcard patterns',
          'Because an empty string is an error in sh',
          'Because --brief is treated the same as no argument',
        ],
        answer: 0,
        explanation:
          'Running the script with no argument leaves the first parameter empty, and the empty pattern matches that case, so it sets the full-dashboard choice. The wildcard pattern is the fallback for anything else, which here means a flag the script does not know, so it prints a usage line and exits with 2. If both cases were handled by the wildcard, an unknown flag would silently run the dashboard instead of being reported.',
      },
      {
        id: 'dash-4',
        question: 'The last section prints the time zone and the current time rather than a weather line. Why?',
        options: [
          'date works with no network, so the dashboard never hangs waiting for a reply',
          'Because weather is not available in Termux',
          'Because date needs root to read the time zone',
          'Because the time zone can only be read once a day',
        ],
        answer: 0,
        explanation:
          'A dashboard that opens whenever you start the app should not depend on a network call that might be slow or fail. date reads the clock and the zone from the device, so the section always prints and always returns quickly. The other three are not true: date needs no root, the zone is read as often as you like, and the choice is about reliability rather than the availability of any particular service.',
      },
    ],
    tasks: [
      {
        id: 'dash-t1',
        title: 'Print the disk and local lines',
        prompt:
          'This prints the disk section and the local section the way the dashboard builds them, so you can see the figures filled into their sentences. The disk line is trimmed from df, and the local lines come from date.',
        command: 'echo "Disk"; df -h / | tail -n +2 | awk \'{printf "  %s used of %s (%s)\\n", $3, $2, $5}\'; echo "Local"; echo "  timezone $(date +%Z)"; echo "  now      $(date \'+%H:%M\')"',
        hint: 'tail -n +2 drops the header row of df, so only the data line is left for awk to read.',
        expects:
          'A Disk heading, then a line built from the df columns that reads as a used figure, the words used of, the total, and a percentage in brackets. Then a Local heading, then a timezone line naming the current zone and a now line with the time in hours and minutes. The figures differ on every phone, which is the point: the sentence is assembled from whatever df reports. If the disk line is missing, tail or awk lost the data row.',
        rules: [
          { type: 'matches', pattern: '^\\s*\\S+\\s+used of\\s+\\S+\\s+\\(\\d+%\\)', label: 'the disk line gives used, total and a percentage' },
          { type: 'matches', pattern: '^\\s*timezone\\s+\\S+', label: 'the time zone line names the current zone' },
          { type: 'matches', pattern: '^\\s*now\\s+\\d{2}:\\d{2}', label: 'the local line gives the current time' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },
];
