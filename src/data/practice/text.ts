/**
 * Practice sets for the text track: reading, searching, pipes, encoding.
 */

import type { PracticeSet } from './types';

export const textSets: PracticeSet[] = [
  {
    slug: 'reading-and-searching-text',
    title: 'Reading and searching text',
    topic: 'reading-and-searching-text',
    summary: 'Printing part of a file, counting it, and finding the lines that matter.',
    intro:
      'A log file is the most common thing you will be handed. Reading all of it is rarely the right move, so the useful skill is asking for the part you want.',
    questions: [
      {
        id: 'txt-1',
        question: 'What does head -n 5 app.log print?',
        options: [
          'The first five lines of the file',
          'The last five lines of the file',
          'The five longest lines',
          'Every line containing the number five',
        ],
        answer: 0,
        explanation:
          'head prints from the top, and -n gives the count. Its counterpart is tail, which prints from the bottom, and tail -f keeps printing as new lines arrive, which is what you want when watching a log live.',
      },
      {
        id: 'txt-2',
        question: 'What does grep -c ERROR app.log print?',
        options: [
          'The number of lines that match, not the lines themselves',
          'The matching lines, with the count in front of each',
          'The number of characters in the file',
          'The lines that do not match',
        ],
        answer: 0,
        explanation:
          'The -c option replaces the output with a count. That is useful when you only want to know how bad things are. If you want both the lines and their numbers, -n prints the line number in front of each match instead.',
      },
      {
        id: 'txt-3',
        question: 'What does grep -r "ERROR" ~ do?',
        options: [
          'Searches every file under your home directory, and names the file each match came from',
          'Searches only files directly in your home directory',
          'Repeats the search until it finds something',
          'Searches your home directory for files named ERROR',
        ],
        answer: 0,
        explanation:
          '-r means recursive: it walks the whole tree rather than one directory. Because a match could come from any file, grep prints the file name alongside the line, which is information you do not get when searching a single file.',
      },
      {
        id: 'txt-4',
        question: 'Why would you open a large file with less rather than cat?',
        options: [
          'less pages the file, so it does not scroll past you',
          'less is faster because it reads the whole file first',
          'cat cannot open files over a certain size',
          'less edits the file as you read it',
        ],
        answer: 0,
        explanation:
          'cat prints everything at once, and on a big file the beginning is gone before you can read it. less shows one screen, waits for you, and lets you search inside it with a slash. It also does not read the whole file up front, which is where its name came from: less is more.',
      },
    ],
    tasks: [
      {
        id: 'txt-t1',
        title: 'Find only the errors',
        prompt:
          'This writes a small log file and then searches it, showing the line numbers of the matches rather than the whole file.',
        command:
          'printf "INFO start\\nERROR disk full\\nINFO retry\\nERROR timeout\\n" > ~/app.log; grep -n ERROR ~/app.log',
        hint: 'You should get two lines, and neither of them should be an INFO line.',
        expects:
          'Two lines, each starting with the line number, a colon, then the matching text: 2:ERROR disk full and 4:ERROR timeout. The line numbers are what -n adds, and they matter because they let you go straight to the place in the file. Notice that the INFO lines are absent. A search shows you matches, not the file.',
        rules: [
          { type: 'matches', pattern: '^\\s*2:ERROR', label: 'the first match is reported with its line number' },
          { type: 'matches', pattern: '^\\s*4:ERROR', label: 'the second match is reported with its line number' },
          { type: 'absent', pattern: 'INFO', label: 'no non-matching lines came through' },
        ],
      },
    ],
  },

  {
    slug: 'pipes-and-redirection',
    title: 'Pipes and redirection',
    topic: 'pipes-and-redirection',
    summary: 'Chaining commands, writing output to a file, and the sort-then-count habit.',
    intro:
      'A pipe is what turns a pile of small commands into a tool. The count-and-rank pattern below is worth knowing by heart, because it answers a question that comes up constantly.',
    questions: [
      {
        id: 'pipe-1',
        question: 'What does the | character do?',
        options: [
          'Sends the output of the command on its left into the command on its right',
          'Runs both commands at the same time on the same file',
          'Joins two files into one',
          'Compares two commands and prints the differences',
        ],
        answer: 0,
        explanation:
          'A pipe connects standard output of the left command to standard input of the right one, and nothing touches the disk in between. That is why pipes are cheap and why you can chain as many as you like. It is not a comparison operator, which is a different use of the same character in some shells.',
      },
      {
        id: 'pipe-2',
        question: 'Why must sort come before uniq -c?',
        options: [
          'uniq only collapses lines that are next to each other, so the repeats have to be grouped first',
          'uniq is case sensitive and sort is not',
          'sort removes blank lines that uniq cannot handle',
          'uniq only accepts sorted input as a rule of the tool',
        ],
        answer: 0,
        explanation:
          'uniq compares each line to the one before it and nothing else, so identical lines that are scattered through the file are counted separately. Sorting first brings them together. Leaving the sort out is the single most common mistake in this pattern, and it fails quietly by giving you a wrong number.',
      },
      {
        id: 'pipe-3',
        question: 'What is the difference between > and >>?',
        options: [
          '> replaces the contents of the file, >> adds to the end of it',
          '> writes to a file, >> writes to the screen',
          '> is for text, >> is for binary',
          '> appends, >> replaces',
        ],
        answer: 0,
        explanation:
          'Both redirect standard output into a file. A single arrow truncates the file first, so anything that was there is gone. A double arrow appends, leaving the existing contents alone. Getting this the wrong way round is how people lose a log they meant to keep.',
      },
      {
        id: 'pipe-4',
        question: 'What does 2>/dev/null do?',
        options: [
          'Throws away error messages, keeping normal output',
          'Throws away normal output, keeping errors',
          'Writes errors into a file called null',
          'Runs the command twice and keeps the second result',
        ],
        answer: 0,
        explanation:
          'Standard error is file descriptor 2, so 2> redirects it. /dev/null is a device that discards whatever is written to it. Together they silence the complaints while leaving the real output alone, which is useful in a script where you expect a command to grumble and do not want that in the report.',
      },
    ],
    tasks: [
      {
        id: 'pipe-t1',
        title: 'Count and rank the busiest address',
        prompt:
          'This writes a small access log, pulls the first column out of it, sorts the addresses, counts the repeats, and orders the result.',
        command:
          'printf "10.0.0.2 - - GET /index.html\\n10.0.0.1 - - GET /about.html\\n10.0.0.2 - - GET /index.html\\n10.0.0.3 - - GET /index.html\\n10.0.0.2 - - GET /about.html\\n" > ~/access.log; cut -d " " -f1 ~/access.log | sort | uniq -c | sort -n',
        hint: 'Three lines should come out, each with a count in front of an address.',
        expects:
          'Three lines, each a count followed by an address, in ascending order of count: 1 for 10.0.0.1, 1 for 10.0.0.3, and 3 for 10.0.0.2. That tells you 10.0.0.2 is the busiest, which is the answer the whole pipeline was built to produce. The order matters: cut takes the column, sort groups the repeats, uniq -c counts each group, and the final sort -n puts the biggest count last so it is easy to read. Swap that last one to sort -nr and the busiest address comes first instead.',
        rules: [
          { type: 'matches', pattern: '^\\s*3\\s+10\\.0\\.0\\.2', label: 'the busiest address is counted as 3' },
          { type: 'matches', pattern: '^\\s*1\\s+10\\.0\\.0\\.1', label: 'the quieter addresses are counted as 1' },
          { type: 'lines', min: 3, label: 'all three addresses appear' },
        ],
      },
    ],
  },

  {
    slug: 'encoding-and-hashes',
    title: 'Encoding and hashes',
    topic: 'encoding-and-hashes',
    summary: 'Why encoding is not encryption, and how to verify a file.',
    intro:
      'These two get confused constantly, and the confusion causes real mistakes, such as storing a password in base64 and believing it is safe. The difference is simple once you see it.',
    questions: [
      {
        id: 'enc-1',
        question: 'What is the difference between encoding and encryption?',
        options: [
          'Encoding changes the form of data so it can travel, and anyone can reverse it. Encryption hides it, and needs a key',
          'Encoding needs a key, encryption does not',
          'Encoding is for text, encryption is for files',
          'They are two names for the same operation',
        ],
        answer: 0,
        explanation:
          'An encoding is a published scheme with no secret in it. Base64 exists so that binary data can pass through systems that only carry text, and every decoder is the same. Encryption is only reversible by someone holding the key. If you can decode it without being told a secret, it was never encrypted.',
      },
      {
        id: 'enc-2',
        question: 'What does base64 -d do?',
        options: [
          'Decodes base64 text back to the original bytes',
          'Encodes a file and writes it to disk',
          'Checks whether a file is valid base64',
          'Removes the last character from each line',
        ],
        answer: 0,
        explanation:
          'The -d is for decode, and it is the inverse of the default behaviour, which encodes. Because base64 is a published scheme, decoding needs no key and no other input: you just need to know that is what it is. The padding equals signs at the end are what usually give it away.',
      },
      {
        id: 'enc-3',
        question: 'Two files produce the same SHA-256 digest. What does that tell you?',
        options: [
          'They are almost certainly identical',
          'They are definitely identical',
          'One is a copy of the other made by sha256sum',
          'Nothing useful, because digests are random',
        ],
        answer: 0,
        explanation:
          'Two different inputs producing the same digest is called a collision, and no one has ever found one for SHA-256. So identical digests mean the contents match, byte for byte, with overwhelming likelihood. It is still not a mathematical certainty, which is why "almost certainly" is the honest phrasing, but it is good enough to verify a download.',
      },
      {
        id: 'enc-4',
        question: 'Why can you not reverse a hash to get the original data back?',
        options: [
          'It is designed to be one-way: it throws information away on purpose',
          'It can be reversed, but only with the key',
          'It can be reversed, but it takes a long time',
          'You can, with the right tool',
        ],
        answer: 0,
        explanation:
          'A digest is a fixed length no matter how large the input is, so many inputs must share each digest. There is no key and no inverse function, by design. What people call cracking a hash is really guessing the input and hashing it again to see if it matches, which is why a long random password is not worth guessing.',
      },
    ],
    tasks: [
      {
        id: 'enc-t1',
        title: 'Produce and read a digest',
        prompt:
          'This writes a small file, then hashes it. One line comes back.',
        command: 'printf "learnt\\n" > ~/note.txt; sha256sum ~/note.txt',
        hint: 'One line, two columns: a long string of characters, then the file name.',
        expects:
          'One line, starting with sixty-four characters from 0 to 9 and a to f, then two spaces, then the file name. Sixty-four characters is thirty-two bytes written out in hex, which is what SHA-256 produces. This is what a download page gives you so you can check that a file arrived intact: hash what you received, and compare the string with the one published. If they match, nothing was corrupted or swapped on the way.',
        rules: [
          {
            type: 'matches',
            pattern: '^\\s*[0-9a-f]{64}\\s',
            label: 'a 64 character hexadecimal digest comes first',
          },
          { type: 'contains', value: 'note.txt', label: 'the file name is reported alongside it' },
          { type: 'absent', pattern: 'command not found|No such file', label: 'the commands actually ran' },
        ],
      },
    ],
  },
];
