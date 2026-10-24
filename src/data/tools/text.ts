import type { Tool } from './types';

export const textTools: Tool[] = [
  {
    slug: 'grep',
    name: 'grep',
    category: 'text',
    tagline: 'Search text line by line, printing every match',
    about:
      'The classic pattern matcher. It reads lines, prints those containing a match, and understands regular expressions. It also recurses, counts, inverts and colourises, and it is the backbone of countless pipelines.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/grep/',
    bin: 'grep',
    install: 'pkg install grep',
    glyph: 'magnifier',
    commands: [
      {
        args: '-i error app.log',
        what: 'Print every log line containing the word, ignoring case.',
      },
      {
        args: '-rn "TODO" src/',
        what: 'Walk a directory and show matching lines with path and line number.',
      },
      {
        args: '-c "GET" access.log',
        what: 'Count matching lines and print only the total.',
      },
      {
        args: '-v "^#" config.ini',
        what: 'Invert the match. Everything not starting with a comment marker is shown.',
      },
      {
        args: '-E "warn|error" app.log',
        what: 'Use extended regular expressions, so alternation works without escaping.',
      },
      {
        args: '-A2 -B2 "panic" app.log',
        what: 'Include two lines of context before and after each match.',
      },
    ],
    example: {
      args: '-rn "TODO" src/',
      out: [
        'src/main.ts:14:// TODO: handle empty input',
        'src/util.ts:3:// TODO: cache results',
        'src/api.ts:52:// TODO: retry on timeout',
      ].join('\n'),
    },
  },
  {
    slug: 'ripgrep',
    name: 'ripgrep',
    category: 'text',
    tagline: 'A very fast recursive search that honours ignore rules',
    about:
      'A modern search tool that skips hidden entries and anything in ignore files by default. It is multi-threaded, colourises output, and handles many archive and encoding cases. Use it in place of the older recursive search when speed and good defaults matter.',
    developer: 'Andrew Gallant',
    url: 'https://github.com/BurntSushi/ripgrep',
    bin: 'rg',
    install: 'pkg install ripgrep',
    glyph: 'magnifier',
    commands: [
      {
        args: 'TODO src/',
        what: 'Search a directory tree for the pattern. Each hit shows its path and line number.',
      },
      {
        args: '-i timeout',
        what: 'Match case-insensitively wherever the search goes.',
      },
      {
        args: '-t js',
        what: 'Limit the search to one language type.',
      },
      {
        args: '-l "import React"',
        what: 'List only the paths that contain a match, not the lines.',
      },
      {
        args: '-w error',
        what: 'Match whole words only. Substrings inside longer words are ignored.',
      },
      {
        args: '-uu',
        what: 'Include hidden entries and ignored paths in the search.',
      },
    ],
    example: {
      args: '-i timeout',
      out: [
        'src/api.ts:52:// TODO: retry on timeout',
        'src/api.ts:88:const TIMEOUT_MS = 5000',
        'docs/guide.md:12:increase the timeout if requests fail',
      ].join('\n'),
    },
  },
  {
    slug: 'sed',
    name: 'sed',
    category: 'text',
    tagline: 'Rewrite a stream of text with find-and-replace rules',
    about:
      'A non-interactive stream editor. It applies substitutions, deletions and insertions to text as it flows past. That makes it the standard way to rewrite one pattern across many lines or files without opening an editor.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/sed/',
    bin: 'sed',
    install: 'pkg install sed',
    glyph: 'replace',
    commands: [
      {
        args: 's/http/https/g config.txt',
        what: 'Replace every occurrence of a pattern on each line with another value.',
      },
      {
        args: '-i "s/localhost/127.0.0.1/g" app.conf',
        what: 'Rewrite matches directly in the given path, not on screen.',
      },
      {
        args: '-n "5,10p" notes.txt',
        what: 'Suppress the default output and print only lines five through ten.',
      },
      {
        args: '/^$/d app.log',
        what: 'Delete every blank line from the stream.',
      },
      {
        args: 's/^[ \t]*// data.txt',
        what: 'Strip leading spaces and tabs from the start of each line.',
      },
      {
        args: '-n "/ERROR/=" app.log',
        what: 'Print only the line numbers of lines matching a pattern.',
      },
    ],
    example: {
      args: 's/http/https/g config.txt',
      out: [
        'base_url = https://example.com/api',
        'mirror = https://example.org',
        'retries = 3',
      ].join('\n'),
    },
  },
  {
    slug: 'gawk',
    name: 'GNU Awk',
    category: 'text',
    tagline: 'Process and total column-based text with a small language',
    about:
      'A full implementation of the awk programming language, built for records and fields. Each line is split into columns, and patterns plus actions do the rest. Reach for it when the simpler column tools cannot express what you need.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/gawk/',
    bin: 'awk',
    install: 'pkg install gawk',
    glyph: 'braces',
    commands: [
      {
        args: '{print $1, $3} data.txt',
        what: 'Split each line on whitespace and print the first and third columns.',
      },
      {
        args: '-F: {print $1} users.txt',
        what: 'Set the field separator to a colon and print only the first column.',
      },
      {
        args: '{sum += $2} END {print sum} sales.txt',
        what: 'Add up a running total across every row, printed once at the end.',
      },
      {
        args: '$3 > 100 {print $0} report.txt',
        what: 'Print whole lines only where the third column exceeds a threshold.',
      },
      {
        args: 'NR==1 || $2 != prev {print} {prev=$2} log.txt',
        what: 'Print the header and any row whose second column differs from the one before.',
      },
      {
        args: '{count[$1]++} END {for (k in count) print k, count[k]} log.txt',
        what: 'Count how many times each value in the first column appears.',
      },
    ],
    example: {
      args: '{print $1, $3} data.txt',
      out: ['alice 42', 'bob 17', 'carol 88'].join('\n'),
    },
  },
  {
    slug: 'cut',
    name: 'cut',
    category: 'text',
    tagline: 'Pull chosen columns or character ranges out of lines',
    about:
      'A small filter. It keeps only the fields, bytes or characters you name and drops the rest. It works on a fixed delimiter or on character positions, which suits simple, regular data.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/coreutils/',
    bin: 'cut',
    install: 'Included with Termux',
    glyph: 'columns',
    commands: [
      {
        args: '-d: -f1 users.txt',
        what: 'Split each line on a colon and keep only the first field.',
      },
      {
        args: '-d, -f2,4 data.csv',
        what: 'Keep the second and fourth comma-separated columns. The rest are dropped.',
      },
      {
        args: '-c1-10 notes.txt',
        what: 'Keep only the first ten characters of every line.',
      },
      {
        args: '-f3 --complement report.txt',
        what: 'Print everything except the third field.',
      },
      {
        args: '-s -d: -f1 users.txt',
        what: 'Skip lines with no delimiter at all. That avoids stray output.',
      },
      {
        args: '--output-delimiter=" " -d: -f1,7 users.txt',
        what: 'Rejoin the kept fields with a different separator.',
      },
    ],
    example: {
      args: '-d, -f2,4 data.csv',
      out: ['price,qty', '199,3', '249,1'].join('\n'),
    },
  },
  {
    slug: 'sort',
    name: 'sort',
    category: 'text',
    tagline: 'Order lines alphabetically, numerically, or by a key',
    about:
      'Rearranges input lines according to the comparison you choose. It can also remove duplicates or merge already-ordered streams. Key selection orders by a particular column while whole lines stay intact.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/coreutils/',
    bin: 'sort',
    install: 'Included with Termux',
    glyph: 'list',
    commands: [
      {
        args: 'names.txt',
        what: 'Arrange lines in ascending alphabetical order.',
      },
      {
        args: '-n scores.txt',
        what: 'Compare as numbers, so 10 comes after 9 and not after 1.',
      },
      {
        args: '-r scores.txt',
        what: 'Reverse the order, largest values first.',
      },
      {
        args: '-k2 -n data.txt',
        what: 'Order rows by the second column, treated as a number.',
      },
      {
        args: '-u emails.txt',
        what: 'Collapse duplicate adjacent lines, so each value appears once.',
      },
      {
        args: '-h sizes.txt',
        what: 'Compare human-readable sizes such as 4K and 2M by real magnitude.',
      },
    ],
    example: {
      args: '-n scores.txt',
      out: ['9 alice', '17 bob', '42 carol', '88 dave'].join('\n'),
    },
  },
  {
    slug: 'uniq',
    name: 'uniq',
    category: 'text',
    tagline: 'Collapse or count repeated lines that sit together',
    about:
      'Removes consecutive duplicate lines, or reports how many times each run repeats. It only sees neighbours, so feed it ordered input. Handy for frequency counts and for cleaning logs.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/coreutils/',
    bin: 'uniq',
    install: 'Included with Termux',
    glyph: 'list',
    commands: [
      {
        args: 'ips.txt',
        what: 'Drop consecutive duplicate lines, keeping one copy of each run.',
      },
      {
        args: '-c ips.txt',
        what: 'Prefix each distinct line with how many times it appeared in a row.',
      },
      {
        args: '-d ips.txt',
        what: 'Print only the lines that were repeated.',
      },
      {
        args: '-u ips.txt',
        what: 'Print only the lines that appeared exactly once.',
      },
      {
        args: '-i names.txt',
        what: 'Treat lines that differ only in case as duplicates.',
      },
      {
        args: '-f1 log.txt',
        what: 'Skip the first field when deciding whether two lines match.',
      },
    ],
    example: {
      args: '-c ips.txt',
      out: [
        '      3 203.0.113.7',
        '      1 198.51.100.2',
        '      2 192.0.2.55',
      ].join('\n'),
    },
  },
  {
    slug: 'tr',
    name: 'tr',
    category: 'text',
    tagline: 'Translate or delete single characters in a stream',
    about:
      'A tiny filter that maps one set of characters to another, or deletes them. It works character by character, not on words or lines. That suits case changes and cleanup, and normalising whitespace before further processing.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/coreutils/',
    bin: 'tr',
    install: 'Included with Termux',
    glyph: 'replace',
    commands: [
      {
        args: 'a-z A-Z',
        what: 'Map every lowercase letter to its uppercase counterpart.',
      },
      {
        args: '-d "0-9"',
        what: 'Delete all digits from the input.',
      },
      {
        args: '-s " "',
        what: 'Squeeze runs of spaces down to a single space.',
      },
      {
        args: '-c "a-zA-Z0-9" " "',
        what: 'Replace every character that is not a letter or digit with a space.',
      },
      {
        args: '-d "[:punct:]"',
        what: 'Delete all punctuation characters from the input.',
      },
      {
        args: 'A-Z N-ZA-M',
        what: 'Rotate the alphabet, each letter shifting thirteen places.',
      },
    ],
    example: {
      args: 'a-z A-Z',
      out: [
        'HELLO FROM TERMUX',
        'THE QUICK BROWN FOX',
        'GOOD MORNING',
      ].join('\n'),
    },
  },
  {
    slug: 'wc',
    name: 'wc',
    category: 'text',
    tagline: 'Count lines, words, characters and bytes',
    about:
      'Reports how many lines, words, characters and bytes its input holds, alone or together. It is the quickest way to size up a log or document. With several inputs it adds a total line.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/coreutils/',
    bin: 'wc',
    install: 'Included with Termux',
    glyph: 'gauge',
    commands: [
      {
        args: '-l app.log',
        what: 'Count only the lines. A fast way to see how busy a log is.',
      },
      {
        args: '-w essay.txt',
        what: 'Count whitespace-separated words in a document.',
      },
      {
        args: '-c payload.json',
        what: 'Report the byte size of the input.',
      },
      {
        args: '-m notes.txt',
        what: 'Count characters rather than bytes. That matters for non-ASCII text.',
      },
      {
        args: '*.txt',
        what: 'Report a count for each path, then a combined total.',
      },
      {
        args: '-L src/main.c',
        what: 'Print the length of the longest line. Useful for spotting runaway rows.',
      },
    ],
    example: {
      args: '*.txt',
      out: [
        '  42  210 1280 notes.txt',
        '  17   88  512 todo.txt',
        '  59  298 1792 total',
      ].join('\n'),
    },
  },
  {
    slug: 'less',
    name: 'less',
    category: 'text',
    tagline: 'Page through long output with search and scroll',
    about:
      'A pager that shows text one screen at a time. You can scroll both ways, search and jump. It reads from a pipe as happily as from a file, and tames the output of any command.',
    developer: 'Mark Nudelman',
    url: 'https://www.greenwoodsoftware.com/less/',
    bin: 'less',
    install: 'pkg install less',
    glyph: 'pager',
    commands: [
      {
        args: 'app.log',
        what: 'Open a long log in a scrollable view, not all at once.',
      },
      {
        args: '+F app.log',
        what: 'Start in follow mode, like a live tail. New lines appear as they are written.',
      },
      {
        args: '-N app.log',
        what: 'Show line numbers down the left side of the screen.',
      },
      {
        args: '-S data.csv',
        what: 'Stop long lines from wrapping, so wide rows scroll sideways.',
      },
      {
        args: '-R app.log',
        what: 'Display raw colour escape codes correctly, keeping tinted output intact.',
      },
      {
        args: '+/ERROR app.log',
        what: 'Open the pager already scrolled to the first line matching the pattern.',
      },
    ],
    example: {
      args: '-N app.log',
      out: [
        '   1 2026-10-24 09:15 INFO  starting service',
        '   2 2026-10-24 09:15 INFO  listening on port 8080',
        '   3 2026-10-24 09:16 WARN  slow query took 1200ms',
        ':',
      ].join('\n'),
    },
  },
  {
    slug: 'bat',
    name: 'bat',
    category: 'text',
    tagline: 'A colourful pager with syntax highlighting and line numbers',
    about:
      'A drop-in pager that adds syntax highlighting, a grid and line numbers. It also integrates with the version-control diff view. Easier on the eye than a plain dump when you read code or configuration.',
    developer: 'David Peter',
    url: 'https://github.com/sharkdp/bat',
    bin: 'bat',
    install: 'pkg install bat',
    glyph: 'doc',
    commands: [
      {
        args: 'main.ts',
        what: 'Print a source file with syntax highlighting, line numbers and a header.',
      },
      {
        args: '-p main.ts',
        what: 'Show plain highlighted text, without line numbers or the header.',
      },
      {
        args: '-n main.ts',
        what: 'Force line numbers on, even when output is piped.',
      },
      {
        args: '--line-range 20:40 main.ts',
        what: 'Display only a slice of lines from the middle of a long file.',
      },
      {
        args: '-A main.ts',
        what: 'Show non-printing characters such as tabs and trailing spaces.',
      },
      {
        args: '-l json payload.json',
        what: 'Override the detected language, so highlighting uses the right rules.',
      },
    ],
    example: {
      args: '--line-range 1:3 main.ts',
      out: [
        '─── main.ts ───',
        "   1 import { Tool } from './types';",
        '   2 ',
        '   3 export const filesTextTools: Tool[] = [];',
      ].join('\n'),
    },
  },
  {
    slug: 'jq',
    name: 'jq',
    category: 'text',
    tagline: 'Slice, filter and reshape JSON from the terminal',
    about:
      'A small query language for JSON. It turns tangled documents into exactly the fields you want. It filters, maps, orders and reformats, and can pretty-print or minify.',
    developer: 'Stephen Dolan',
    url: 'https://jqlang.github.io/jq/',
    bin: 'jq',
    install: 'pkg install jq',
    glyph: 'braces',
    commands: [
      {
        args: '. payload.json',
        what: 'Pretty-print a compact document with consistent indentation.',
      },
      {
        args: '.items[].name data.json',
        what: 'Extract one field from every element of an array.',
      },
      {
        args: '-r .version package.json',
        what: 'Print a value as raw text, without surrounding quotes.',
      },
      {
        args: '.[] | select(.price > 100) catalog.json',
        what: 'Keep only the objects whose numeric field exceeds a threshold.',
      },
      {
        args: '-c . data.json',
        what: 'Emit compact output on a single line, the opposite of pretty-printing.',
      },
      {
        args: 'keys data.json',
        what: 'List the top-level field names of an object.',
      },
    ],
    example: {
      args: '.items[].name data.json',
      out: ['widget', 'sprocket', 'cog'].join('\n'),
    },
  },
];

