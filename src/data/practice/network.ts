/**
 * Practice sets for the network track: text processing, logs, DNS, HTTP,
 * file transfer and SSH.
 *
 * Each set follows one lesson. The questions test what that lesson actually
 * teaches, and each set ends with one output task. The task commands are
 * chosen so a learner can run them on their own device and produce a real
 * result, and the rules describe the meaning of that result rather than its
 * exact characters, because no two devices print the same thing.
 */

import type { PracticeSet } from './types';

export const networkSets: PracticeSet[] = [
  {
    slug: 'text-processing-awk-sed',
    title: 'Shaping text with awk and sed',
    topic: 'text-processing-awk-sed',
    summary: 'Rewriting lines with sed, pulling fields out with awk, and totalling a column.',
    intro:
      'These two tools sit in the middle of a pipeline and change what passes through. sed edits the line as a whole, and awk takes it apart into fields. Knowing which of the two you want is most of the skill.',
    questions: [
      {
        id: 'awk-1',
        question: 'What does the g flag do in sed \'s/cat/CAT/g\' words.txt?',
        options: [
          'It replaces every match on each line, not only the first',
          'It replaces only the first match on each line',
          'It deletes every line that contains the pattern',
          'It makes the match ignore case',
        ],
        answer: 0,
        explanation:
          'Without the flag, the s command replaces only the first match it finds on a line, so a line holding three cats has just the first one changed. The g stands for global and tells sed to carry on to the end of that line. It does not touch other lines and it is not a case flag: sed matches exactly what you wrote unless you ask it to do otherwise.',
      },
      {
        id: 'awk-2',
        question: 'What does awk \'{print $NF}\' scores.txt print?',
        options: [
          'The last field of each line',
          'The first field of each line',
          'The number of fields on each line',
          'The whole line, unchanged',
        ],
        answer: 0,
        explanation:
          'awk numbers the fields from the left, so $1 is the first. NF is the count of fields on the current line, so $NF is whatever the last one happens to be, which is useful when the lines are not all the same length. The first field is $1, the count itself is NF without a dollar sign, and the whole line is $0.',
      },
      {
        id: 'awk-3',
        question: 'What does awk -F: \'{print $2}\' servers.txt do?',
        options: [
          'It splits each line on the colon and prints the second field',
          'It prints the second line of the file',
          'It prints every line that contains a colon',
          'It prints the first two fields of each line',
        ],
        answer: 0,
        explanation:
          'By default awk splits a line on runs of whitespace. The -F option sets a different separator, here a colon, which is what colon-separated data like name:address:port needs. Every line is still processed, so this is a field selection rather than a line selection, and the option applies to the whole run rather than to one line.',
      },
      {
        id: 'awk-4',
        question: 'In awk \'{sum+=$1} END {print sum}\' numbers.txt, when does the END block run?',
        options: [
          'Once, after the last line has been read',
          'Once, before the first line is read',
          'After every line, printing a running total',
          'Only if a line matches a pattern',
        ],
        answer: 0,
        explanation:
          'The first block runs once for each line, adding the value into sum as the file is read. The END block runs a single time after the input is exhausted, which is where a total or an average belongs. Moving the print into the first block would print a running total on every line instead of one final number, which is a common way to get a column of numbers when you wanted a single figure.',
      },
    ],
    tasks: [
      {
        id: 'awk-t1',
        title: 'Pull one field out of a colon-separated file',
        prompt:
          'This writes a small inventory file, one machine per line, with a name, an address and a port separated by colons. It then prints a single field from every line.',
        command:
          'printf "web1:10.0.0.11:8080\\nweb2:10.0.0.12:8080\\ndb1:10.0.0.21:5432\\n" > ~/servers.txt; awk -F: \'{print $2}\' ~/servers.txt',
        hint: 'Three lines should come back, and the names and ports should be gone.',
        expects:
          'Three lines, each a bare address and nothing else: 10.0.0.11, 10.0.0.12 and 10.0.0.21. The colon told awk where the field boundaries are, so $2 is the middle piece of each line and the names and ports are dropped. Notice that the order of the lines is unchanged, because awk works through the file from top to bottom. Without the -F option awk would have split on whitespace, found one field per line, and printed the whole line instead.',
        rules: [
          {
            type: 'matches',
            pattern: '^\\s*10\\.0\\.0\\.11\\s*$',
            label: 'the first server address is printed',
          },
          {
            type: 'matches',
            pattern: '^\\s*10\\.0\\.0\\.21\\s*$',
            label: 'the database server address is printed',
          },
          { type: 'lines', min: 3, label: 'one address per line, three in all' },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the command actually ran',
          },
        ],
      },
    ],
  },

  {
    slug: 'logs-and-detection',
    title: 'Reading logs and spotting oddities',
    topic: 'logs-and-detection',
    summary: 'Counting failed logins per source, ranking them, and reading the shape of a burst.',
    intro:
      'A log is a record of what happened, and most trouble leaves a trace in it before you notice anything else. The skill is asking it a narrow question and letting a pipeline answer with a count.',
    questions: [
      {
        id: 'log-1',
        question: 'Why does the counting pipeline run sort before uniq -c?',
        options: [
          'uniq only counts lines that sit next to each other, so the repeats must be grouped first',
          'uniq needs the input sorted to be case insensitive',
          'sort removes the blank lines that uniq cannot read',
          'uniq only accepts numbers as input',
        ],
        answer: 0,
        explanation:
          'uniq compares each line with the one just before it and ignores the rest, so identical lines scattered through the file are counted separately. Sorting first brings them together. Leaving the sort out is the commonest mistake in this pattern because it fails quietly, handing back a wrong count rather than an error you would notice.',
      },
      {
        id: 'log-2',
        question: 'In grep \'result=fail\' auth.log | cut -d" " -f3, what does -f3 keep?',
        options: [
          'The third space-separated field, which here is the src=... value',
          'The third line of the file',
          'The first three characters of every line',
          'The three lines that follow each match',
        ],
        answer: 0,
        explanation:
          'cut splits each line on the delimiter given by -d and keeps the field named by -f. In this log the fields are the timestamp, the user and the source, so field three is src=.... Reducing every line to just that value is what makes the later count a count per source rather than a count per line, which is the question you actually wanted answered.',
      },
      {
        id: 'log-3',
        question: 'What does sort -nr do to the output of uniq -c?',
        options: [
          'It orders the lines numerically, with the largest count first',
          'It orders the lines alphabetically in reverse',
          'It removes duplicate lines and counts them',
          'It rewrites the file in place',
        ],
        answer: 0,
        explanation:
          'The -n option tells sort to compare the leading number as a number rather than as text, so 6 ranks above 10 instead of below it. The -r option reverses the order, which puts the biggest count on top. Without -n the comparison would be alphabetical, and a count of 10 would sort before a count of 6, so the ranking would be wrong in a way that is easy to miss.',
      },
      {
        id: 'log-4',
        question: 'In a log, why is a success that comes right after a run of failures worth a closer look?',
        options: [
          'It can be the moment a guessed password finally worked, so the account should be checked',
          'It proves the account was never attacked',
          'It shows the log file itself is damaged',
          'It means the source is a person typing slowly',
        ],
        answer: 0,
        explanation:
          'A run of failures from one source followed at once by a success is the shape a successful guess leaves behind. It is not proof, because a broken script or a forgotten saved password can produce the same pattern, so the log raises the question and you then check the account and the source before deciding anything. The burst itself only tells you where to look.',
      },
    ],
    tasks: [
      {
        id: 'log-t1',
        title: 'Count the failed logins per source',
        prompt:
          'This writes a short auth log into your home directory, keeps only the failed lines, reduces each one to its source field, and ranks the sources by how many failures each produced.',
        command:
          '{ for i in 1 2 3 4 5 6; do echo "user=mira src=203.0.113.14 result=fail"; done; for i in 1 2; do echo "user=root src=198.51.100.7 result=fail"; done; echo "user=dev src=192.0.2.55 result=fail"; echo "user=mira src=203.0.113.14 result=ok"; } > ~/auth.log; grep "result=fail" ~/auth.log | cut -d" " -f2 | sort | uniq -c | sort -nr',
        hint: 'Three lines, each a count followed by a source. The top count should stand well clear of the others.',
        expects:
          'Three lines, each a count then a source, largest first: 6 src=203.0.113.14 on top, then 2 src=198.51.100.7, then 1 src=192.0.2.55. The counts add up to nine, which is how many failed lines the file holds. The top source has six failures against the next one\'s two, so it stands out and is the one to read around. The two result=ok lines are absent, because grep kept only the failures before any counting began. Leaving out the sort in the middle would make uniq -c count each source separately, and the numbers would be wrong.',
        rules: [
          {
            type: 'matches',
            pattern: '^\\s*6\\s+src=203\\.0\\.113\\.14\\s*$',
            label: 'the busiest source is counted as six failures',
          },
          {
            type: 'matches',
            pattern: '^\\s*2\\s+src=198\\.51\\.100\\.7\\s*$',
            label: 'the next source is counted as two',
          },
          { type: 'absent', pattern: 'result=ok', label: 'only failed attempts are counted' },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the commands actually ran',
          },
        ],
      },
    ],
  },

  {
    slug: 'dns-and-addresses',
    title: 'DNS and addresses',
    topic: 'dns-and-addresses',
    summary: 'Turning a name into an address, reading the reply, and telling the two apart.',
    intro:
      'Every request begins by turning a name into an address, and that translation is DNS. The lookups here read from the device itself, so they show the same name and address idea without needing a network connection.',
    questions: [
      {
        id: 'dns-1',
        question: 'What is the difference between a name and an address?',
        options: [
          'The name is what you remember and the address is where it points right now, so the name can stay the same while the address changes',
          'The name is the IPv6 form and the address is the IPv4 form',
          'A name is used locally and an address is used remotely',
          'They are two words for the same thing',
        ],
        answer: 0,
        explanation:
          'example.com is a name and 93.184.216.34 is the address it resolves to at this moment. When a service moves, its operator changes the address and leaves the name alone, which is exactly why you share a name and never hard-code an address into a script. The two are separate layers, not two spellings of one value.',
      },
      {
        id: 'dns-2',
        question: 'What is a CNAME record?',
        options: [
          'An alias that makes one name point at another name',
          'A record that holds an IPv4 address',
          'A record that names a domain\'s mail servers',
          'The length of time a resolver may cache an answer',
        ],
        answer: 0,
        explanation:
          'A CNAME makes one name an alias of another, which is how the www name is often pointed at the plain domain so both reach the same place. An IPv4 address lives in an A record and an IPv6 address in an AAAA record. The cache lifetime is a different field again, the time to live, which appears on every answer line.',
      },
      {
        id: 'dns-3',
        question: 'In a dig reply, what does the number 3600 on an answer line mean?',
        options: [
          'The time to live, the seconds a resolver may keep the answer before asking again',
          'The port the answering server listens on',
          'The number of records in the answer',
          'The size of the reply in bytes',
        ],
        answer: 0,
        explanation:
          'An answer line carries the name, the time to live, the record type and the value. The time to live is measured in seconds and tells a resolver how long it may reuse the answer before asking again. A small value means a change propagates quickly, while a large one means the old answer is cached for longer and a change may take a while to be seen.',
      },
      {
        id: 'dns-4',
        question: 'What does dig +short example.com print?',
        options: [
          'Only the answer value, without the full report',
          'The whole reply, headers and all',
          'A shortened list of every record type',
          'The address of the resolver it used',
        ],
        answer: 0,
        explanation:
          'The +short option drops the header, the question section and the timing information, leaving only the value or values you asked for. That is the form to use in a script or a quick check. The full report is what you get by default, and it is worth reading when you need the status code and the flags rather than just the address.',
      },
    ],
    tasks: [
      {
        id: 'dns-t1',
        title: 'Resolve a name to an address',
        prompt:
          'This asks the system to turn the name localhost into an address, then asks it to turn the loopback address back into a name. Both lookups read from the machine\'s own hosts file, so they work with no network at all.',
        command: 'getent hosts localhost; getent hosts 127.0.0.1',
        hint: 'Two lines should come back. On some devices the first is the IPv6 loopback and on others the IPv4 one.',
        expects:
          'Two lines, each an address followed by the name it belongs to. The first lookup turns the name localhost into an address, and the second turns 127.0.0.1 back into the name, so the two directions of the same mapping are shown side by side. Your first line may read ::1 or 127.0.0.1 depending on how the device orders its hosts file, and that is the lesson: the name stays fixed while the address it answers with can differ. It is why you share a name and never hard-code an address.',
        rules: [
          {
            type: 'matches',
            pattern: '^\\s*(127\\.0\\.0\\.1|::1)\\s+localhost',
            label: 'the name localhost resolves to a loopback address',
          },
          {
            type: 'matches',
            pattern: '^\\s*127\\.0\\.0\\.1\\s+localhost',
            label: 'the address 127.0.0.1 resolves back to the name',
          },
          { type: 'contains', value: 'localhost', label: 'the name itself appears in the answer' },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the commands actually ran',
          },
        ],
      },
    ],
  },

  {
    slug: 'http-and-apis-from-the-shell',
    title: 'HTTP and APIs from the shell',
    topic: 'http-and-apis-from-the-shell',
    summary: 'Reading a response, what the status code means, and shaping a JSON reply.',
    intro:
      'A request says what you want and a response says what happened. Most of the reading is in the status line and the headers, and the body is usually JSON that needs shaping before you can see its structure.',
    questions: [
      {
        id: 'http-1',
        question: 'What does curl -i add to the output?',
        options: [
          'The response headers, printed before the body',
          'A request header of your choosing',
          'The body alone, with the headers removed',
          'The status code on its own',
        ],
        answer: 0,
        explanation:
          'By default curl prints only the body. The -i option makes it print the status line and the response headers first, then a blank line, then the body, which is how you see the status code and the content type alongside the data. Adding a request header is done with -H, which is a different option doing a different job.',
      },
      {
        id: 'http-2',
        question: 'What does a 404 status code mean?',
        options: [
          'The address is valid but nothing is there',
          'The server failed while handling the request',
          'The request succeeded and the body holds the result',
          'The resource has moved permanently',
        ],
        answer: 0,
        explanation:
          'The classes tell you whose side the problem is on. A 4xx means the request had a problem and a 5xx means the server did. A 404 sits in the 4xx class and means the path is a valid route but no resource is there. A 500 is the server failing, and a 301 says the resource moved for good, which is a reason to update a saved address.',
      },
      {
        id: 'http-3',
        question: 'Which curl option sends a body with the request?',
        options: [
          '-d, which sends the value as form data and switches the request to a POST',
          '-i, which prints the response headers',
          '-o, which writes the reply to a file',
          '-H, which adds a request header',
        ],
        answer: 0,
        explanation:
          'The -d option supplies the data, and its presence is what turns the request into a POST, with the value sent as form data by default. The -o option writes the reply body to a file instead of the screen, and -H adds a request header. Neither of those changes the method on its own, which is why -d is the one that sends a body.',
      },
      {
        id: 'http-4',
        question: 'Why is a JSON formatter such as python -m json.tool useful on a reply?',
        options: [
          'It reprints the JSON one key per line so the shape is readable, and it fails loudly when the text is not valid JSON',
          'It sends the request for you',
          'It encrypts the file so it is safe to store',
          'It compresses the reply to save space',
        ],
        answer: 0,
        explanation:
          'A JSON object on a single line grows unreadable very quickly, and the tool reprints it with indentation so each key and its value sit on their own line. When the text is not valid JSON it stops and names the line where it failed, which usually means you saved an error page rather than the data you expected. It does not make the request; that is curl\'s job.',
      },
    ],
    tasks: [
      {
        id: 'http-t1',
        title: 'Pretty-print a saved JSON reply',
        prompt:
          'This writes a small JSON reply to a file, the way a saved API response would sit on disk, then reformats it so each key and value is on its own line. The lesson writes the interpreter as python; Termux also ships the versioned name python3, which is what this uses.',
        command:
          'printf "{\\"id\\": 42, \\"name\\": \\"ada\\", \\"created\\": true}\\n" > ~/people.json; python3 -m json.tool ~/people.json',
        hint: 'Four lines should come back, one key per line, each indented.',
        expects:
          'Four lines, each key on its own line and indented, with the braces on lines of their own: the id with its number, the name with its string, and created with the boolean true. The tool has not changed the data, only its layout, so the values still mean what they did in the one-line form. Notice that true is written without quotes, because JSON has real booleans rather than only text, and the formatter keeps that. Had the file held an error page instead of JSON, the tool would have stopped and named the line where it failed.',
        rules: [
          {
            type: 'matches',
            pattern: '^\\s*"id":\\s*42',
            label: 'the id key and its number are printed on their own line',
          },
          {
            type: 'matches',
            pattern: '^\\s*"name":\\s*"ada"',
            label: 'the name key and its string value are printed',
          },
          {
            type: 'matches',
            pattern: '^\\s*"created":\\s*true',
            label: 'the boolean value is kept as true',
          },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the command actually ran',
          },
        ],
      },
    ],
  },

  {
    slug: 'transferring-files',
    title: 'Moving files between machines',
    topic: 'transferring-files',
    summary: 'Copying with scp, sending only the difference with rsync, and previewing a transfer.',
    intro:
      'Sooner or later a file you need is on another machine. scp copies over an encrypted link, and rsync does the same job while sending only what has changed. The safest habit is to preview the change before you commit to it.',
    questions: [
      {
        id: 'xfer-1',
        question: 'What does scp -r notes ada@example.com:~/ do?',
        options: [
          'It copies the notes directory and everything inside it to the host',
          'It copies only the files sitting directly in notes',
          'It copies a directory from the host back to here',
          'It renames notes on the host',
        ],
        answer: 0,
        explanation:
          'scp copies a single file by default, so a directory needs the -r option for recursive, which walks the tree and sends every file inside it. Without it scp refuses the directory outright. The direction is set by which argument carries the colon, so because the colon is on the destination side this command sends rather than receives.',
      },
      {
        id: 'xfer-2',
        question: 'What is the difference between rsync src/ and rsync src when src is the source?',
        options: [
          'A trailing slash means the contents of the directory, and no slash means the directory itself',
          'The slash is what makes rsync recurse into subdirectories',
          'The slash makes the copy faster by skipping the comparison',
          'There is no difference, the slash is ignored',
        ],
        answer: 0,
        explanation:
          'With the trailing slash the contents go straight into the destination. Without it the directory name is carried across, so the files land one level deeper under the destination. That is why the same command can quietly put your files in the wrong place if the slash is not what you meant, and it is worth checking before a run with --delete.',
      },
      {
        id: 'xfer-3',
        question: 'What does --dry-run do for rsync?',
        options: [
          'It shows what would be sent without sending anything',
          'It sends only the files that have changed',
          'It deletes the files that are missing on the source',
          'It repeats the transfer until it succeeds',
        ],
        answer: 0,
        explanation:
          'A dry run performs the whole comparison and prints the file list it would transfer, then stops before moving anything. That is the safe way to check a command, and it matters most alongside --delete, because the dry run shows you the deletions before they happen. Sending only what changed is what rsync does on every run, not something --dry-run adds.',
      },
      {
        id: 'xfer-4',
        question: 'Why is a second rsync run usually far cheaper than the first?',
        options: [
          'It compares the two sides and sends only what differs, so an unchanged tree moves almost nothing',
          'It remembers the files from the first run in a cache on disk',
          'It skips the comparison and copies everything again',
          'It compresses every file a second time',
        ],
        answer: 0,
        explanation:
          'rsync compares the source and the destination before it moves any data, so on a second run the file list is empty or short and almost nothing crosses the link. scp, by contrast, sends every file again each time you run it, which is the difference the lesson draws out. That comparison step is also what makes the dry run meaningful, since it is the same work without the transfer.',
      },
    ],
    tasks: [
      {
        id: 'xfer-t1',
        title: 'Preview a transfer before it happens',
        prompt:
          'This builds a small directory of notes and an empty destination, then asks rsync to show what it would copy across. The dry run compares the two sides and prints the list, but moves nothing.',
        command:
          'mkdir -p ~/notes ~/backup; printf "draft\\n" > ~/notes/draft.md; printf "final\\n" > ~/notes/final.md; rsync -av --dry-run ~/notes/ ~/backup/',
        hint: 'The list should name the two files, and the last line should say the run was a dry run.',
        expects:
          'The line sending incremental file list, then the names of the files that would move, then a blank line and a short summary ending with (DRY RUN). The trailing slash on ~/notes/ is what puts the contents into the destination rather than the directory itself, so the file names appear at the top level of the list. Nothing was copied: the summary reports the bytes that would be sent, and the marker confirms the run stopped short of moving them. That is the safe way to check a command, and it matters most when you later add --delete.',
        rules: [
          {
            type: 'matches',
            pattern: '^\\s*sending incremental file list',
            label: 'rsync reports the file list it would send',
          },
          {
            type: 'matches',
            pattern: '^\\s*draft\\.md\\s*$',
            label: 'the draft file appears in the list',
          },
          { type: 'contains', value: 'DRY RUN', label: 'the run was a dry run, so nothing moved' },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the commands actually ran',
          },
        ],
      },
    ],
  },

  {
    slug: 'ssh-and-remote-work',
    title: 'SSH and remote work',
    topic: 'ssh-and-remote-work',
    summary: 'Making a key pair, trusting a host once, and running the SSH server on the phone.',
    intro:
      'SSH lets you log in to another machine from your phone and run commands there as if you were sitting in front of it. The key pair is the part to get right, because the two halves have very different jobs.',
    questions: [
      {
        id: 'ssh-1',
        question: 'In a key pair, which file is the private key?',
        options: [
          'The one without .pub on the end, which stays on your phone and is never sent anywhere',
          'The one ending in .pub, which is the one to share',
          'Both files, which are interchangeable',
          'The known_hosts file',
        ],
        answer: 0,
        explanation:
          'ssh-keygen writes two files. The .pub file is the public key and is safe to copy to a server, which is what ssh-copy-id does for you. The file with no suffix is the private key and must stay on your device, because anyone who holds it can act as you. known_hosts is a different file, recording the servers you have connected to.',
      },
      {
        id: 'ssh-2',
        question: 'Why does the SSH server on Termux listen on port 8022 rather than 22?',
        options: [
          'Ports below 1024 are privileged, and an ordinary app cannot bind them',
          'Port 22 is reserved for Windows machines',
          '8022 is faster because it is a less busy port',
          'Termux picks a random port each time it starts',
        ],
        answer: 0,
        explanation:
          'On Unix-like systems, binding a port below 1024 needs root, and Termux runs as an ordinary Android app with no root at all. OpenSSH is therefore configured to use 8022, which sits above the privileged range. That is also why you connect with ssh -p 8022 rather than the default, and why 8022 is the port to expect when you scan your own device.',
      },
      {
        id: 'ssh-3',
        question: 'What is the point of checking the host-key fingerprint the first time you connect?',
        options: [
          'It is the one moment a man in the middle could substitute its own key, so you compare the fingerprint with one the admin published',
          'It confirms that the password you typed was correct',
          'It makes the connection faster on later logins',
          'It tells the server which port to listen on',
        ],
        answer: 0,
        explanation:
          'SSH has no prior knowledge of the server, so on the first connection it shows a fingerprint and asks you to trust it. If the fingerprint matches the value the server\'s admin published, you are talking to the right machine. If it ever changes without warning, that is the signal to stop and ask, because the server keys may have been replaced or the connection may be intercepted.',
      },
      {
        id: 'ssh-4',
        question: 'What does ssh-keygen -A do?',
        options: [
          'It generates the host keys the local SSH server needs before it will start',
          'It adds your public key to a server account',
          'It lists the fingerprints of your existing keys',
          'It creates a new user key pair',
        ],
        answer: 0,
        explanation:
          'The first time you run sshd on Termux it exits with no hostkeys available, because the server needs keys of its own to identify itself. ssh-keygen -A generates that set, after which sshd starts and listens on 8022. Installing your own public key on another machine is ssh-copy-id, which is a different job on a different file.',
      },
    ],
    tasks: [
      {
        id: 'ssh-t1',
        title: 'Generate a key pair and read the public half',
        prompt:
          'This creates an ed25519 key pair and then prints the public key, which is the half you copy to a server. It writes to a demonstration filename and creates the key without a passphrase, so it never stops to ask you anything. The lesson covers protecting a key with a passphrase, which is what you want for a key you actually use.',
        command:
          'mkdir -p ~/.ssh; rm -f ~/.ssh/learmux-demo ~/.ssh/learmux-demo.pub; ssh-keygen -t ed25519 -C "you@phone" -f ~/.ssh/learmux-demo -N ""; cat ~/.ssh/learmux-demo.pub',
        hint: 'You should see the banner, a fingerprint line, the randomart block, and then a single line beginning ssh-ed25519. It is the last line that gets copied to a server.',
        expects:
          'The banner Generating public/private ed25519 key pair, a line saying where each half was saved, then a line naming the fingerprint as SHA256: followed by a short string. After that comes the randomart block, and then the public key itself: one line beginning ssh-ed25519, a long block of characters, and the label you@phone. The label is only a comment, which is why it carries no secret, and the fingerprint is what an admin compares to check they are talking to the right machine. The private key sits beside the public one in the file with no .pub on the end, and that one never leaves the phone.',
        rules: [
          {
            type: 'matches',
            pattern: 'Generating public/private ed25519 key pair',
            label: 'a new ed25519 key pair was generated',
          },
          { type: 'matches', pattern: 'SHA256:', label: 'a fingerprint is printed for the key' },
          {
            type: 'matches',
            pattern: '^\\s*ssh-ed25519\\s+AAAA',
            label: 'the public key is printed in the ssh-ed25519 format',
          },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the commands actually ran',
          },
        ],
      },
    ],
  },
];
