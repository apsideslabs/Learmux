import type { Tool } from './types';

export const textTools: Tool[] = [
  {
    slug: 'grep',
    name: 'grep',
    category: 'text',
    tagline: 'Search text line by line and print the matches',
    about:
      'The classic pattern matcher that reads lines and prints those containing a match, with regular-expression support. It recurses, counts, inverts and colourises, and is the backbone of countless pipelines. Reach for it whenever you need to pull matching lines out of text or command output.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/grep/',
    bin: 'grep',
    install: 'pkg install grep',
    glyph: 'magnifier',
    commands: [
      {
        args: '-i error app.log',
        what: 'print every line of a log containing the word, ignoring upper and lower case',
      },
      {
        args: '-rn "TODO" src/',
        what: 'walk a directory and show matching lines prefixed with their path and line number',
      },
      {
        args: '-c "GET" access.log',
        what: 'count matching lines and print only the total instead of the lines',
      },
      {
        args: '-v "^#" config.ini',
        what: 'invert the match so everything that does not begin with a comment marker is shown',
      },
      {
        args: '-E "warn|error" app.log',
        what: 'use extended regular expressions so alternation works without escaping',
      },
      {
        args: '-A2 -B2 "panic" app.log',
        what: 'include two lines of context before and after each match',
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
    tagline: 'A very fast recursive search that respects ignore rules',
    about:
      'A modern search tool that skips hidden entries and anything listed in ignore files by default, making it ideal inside code repositories. It is multi-threaded, colourises output and understands many archive and encoding cases. Use it in place of the older recursive search when speed and sensible defaults matter.',
    developer: 'Andrew Gallant',
    url: 'https://github.com/BurntSushi/ripgrep',
    bin: 'rg',
    install: 'pkg install ripgrep',
    glyph: 'magnifier',
    commands: [
      {
        args: 'TODO src/',
        what: 'search a directory hierarchy for the pattern and print each hit with its path and line number',
      },
      {
        args: '-i timeout',
        what: 'match case-insensitively wherever the search goes',
      },
      {
        args: '-t js',
        what: 'limit the search to a single language type',
      },
      {
        args: '-l "import React"',
        what: 'list only the names of paths that contain a match, not the matching lines',
      },
      {
        args: '-w error',
        what: 'match whole words only, so substrings inside longer words are ignored',
      },
      {
        args: '-uu',
        what: 'include hidden entries and ignored paths in the search',
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
    tagline: 'Edit a stream of text with find-and-replace rules',
    about:
      'A non-interactive stream editor that applies a script of substitutions, deletions and insertions to text as it flows past. It is the standard way to rewrite one pattern across many lines or paths without opening an editor. Use it for quick in-place edits in scripts.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/sed/',
    bin: 'sed',
    install: 'pkg install sed',
    glyph: 'replace',
    commands: [
      {
        args: 's/http/https/g config.txt',
        what: 'replace every occurrence of a pattern on each line with another value',
      },
      {
        args: '-i "s/localhost/127.0.0.1/g" app.conf',
        what: 'rewrite matches directly in the given path instead of printing to the screen',
      },
      {
        args: '-n "5,10p" notes.txt',
        what: 'suppress the default output and print only lines five through ten',
      },
      {
        args: '/^$/d app.log',
        what: 'delete every blank line from the stream',
      },
      {
        args: 's/^[ \t]*// data.txt',
        what: 'strip leading spaces and tabs from the beginning of each line',
      },
      {
        args: '-n "/ERROR/=" app.log',
        what: 'print only the line numbers of lines matching a pattern',
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
    tagline: 'Process and summarise column-based text with a small language',
    about:
      'A full implementation of the awk programming language, built for records and fields. It splits each line into columns, applies patterns and actions, and can total, reformat or filter data on the fly. Reach for it when the simpler column tools are not expressive enough for a report.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/gawk/',
    bin: 'awk',
    install: 'pkg install gawk',
    glyph: 'braces',
    commands: [
      {
        args: '{print $1, $3} data.txt',
        what: 'split each line on whitespace and print the first and third columns',
      },
      {
        args: '-F: {print $1} users.txt',
        what: 'set the field separator to a colon and print only the first column',
      },
      {
        args: '{sum += $2} END {print sum} sales.txt',
        what: 'accumulate a running total across every row and print it once at the end',
      },
      {
        args: '$3 > 100 {print $0} report.txt',
        what: 'print whole lines only where the third column exceeds a threshold',
      },
      {
        args: 'NR==1 || $2 != prev {print} {prev=$2} log.txt',
        what: 'print the header and any row whose second column differs from the previous one',
      },
      {
        args: '{count[$1]++} END {for (k in count) print k, count[k]} log.txt',
        what: 'count how many times each value in the first column appears',
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
    tagline: 'Pull selected columns or character ranges out of lines',
    about:
      'A small filter that keeps only the fields, bytes or characters you name and drops the rest. It works on a fixed delimiter or on character positions, so it suits simple, regular data. Use it when a table needs narrowing before the next stage of a pipeline.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/coreutils/',
    bin: 'cut',
    install: 'Included with Termux',
    glyph: 'columns',
    commands: [
      {
        args: '-d: -f1 users.txt',
        what: 'split each line on a colon and keep only the first field',
      },
      {
        args: '-d, -f2,4 data.csv',
        what: 'keep the second and fourth comma-separated columns and drop the rest',
      },
      {
        args: '-c1-10 notes.txt',
        what: 'keep only the first ten characters of every line',
      },
      {
        args: '-f3 --complement report.txt',
        what: 'print everything except the third field',
      },
      {
        args: '-s -d: -f1 users.txt',
        what: 'skip lines that contain no delimiter at all, avoiding stray output',
      },
      {
        args: '--output-delimiter=" " -d: -f1,7 users.txt',
        what: 'rejoin the kept fields with a different separator',
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
    tagline: 'Order lines alphabetically, numerically or by a key',
    about:
      'Rearranges the lines of its input according to the comparison you choose, and can remove duplicates or merge already-ordered streams. Key selection lets you order by a particular column while keeping whole lines intact. It underpins most report pipelines that need tidy output.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/coreutils/',
    bin: 'sort',
    install: 'Included with Termux',
    glyph: 'list',
    commands: [
      {
        args: 'names.txt',
        what: 'arrange lines in ascending alphabetical order',
      },
      {
        args: '-n scores.txt',
        what: 'compare as numbers so 10 comes after 9 rather than after 1',
      },
      {
        args: '-r scores.txt',
        what: 'reverse the order so the largest values appear first',
      },
      {
        args: '-k2 -n data.txt',
        what: 'order rows by the second column treated as a number',
      },
      {
        args: '-u emails.txt',
        what: 'collapse duplicate adjacent lines so each value appears once',
      },
      {
        args: '-h sizes.txt',
        what: 'compare human-readable sizes such as 4K and 2M by their real magnitude',
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
    tagline: 'Collapse or count repeated adjacent lines',
    about:
      'Removes consecutive duplicate lines, or reports how many times each run repeats. It only sees neighbours, so its input is usually piped through the ordering command first. Handy for frequency counts and for cleaning logs.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/coreutils/',
    bin: 'uniq',
    install: 'Included with Termux',
    glyph: 'list',
    commands: [
      {
        args: 'ips.txt',
        what: 'drop consecutive duplicate lines, keeping one copy of each run',
      },
      {
        args: '-c ips.txt',
        what: 'prefix each distinct line with the number of times it appeared in a row',
      },
      {
        args: '-d ips.txt',
        what: 'print only the lines that were repeated',
      },
      {
        args: '-u ips.txt',
        what: 'print only the lines that appeared exactly once',
      },
      {
        args: '-i names.txt',
        what: 'treat lines that differ only in case as duplicates',
      },
      {
        args: '-f1 log.txt',
        what: 'skip the first field when deciding whether two lines match',
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
    tagline: 'Translate or delete individual characters in a stream',
    about:
      'A tiny filter that maps one set of characters to another, or deletes them outright. It works character by character rather than on words or lines, which makes it perfect for case changes and cleanup. Commonly used to normalise whitespace before further processing.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/coreutils/',
    bin: 'tr',
    install: 'Included with Termux',
    glyph: 'replace',
    commands: [
      {
        args: 'a-z A-Z',
        what: 'map every lowercase letter to its uppercase counterpart',
      },
      {
        args: '-d "0-9"',
        what: 'delete all digits from the input',
      },
      {
        args: '-s " "',
        what: 'squeeze runs of spaces down to a single space',
      },
      {
        args: '-c "a-zA-Z0-9" " "',
        what: 'replace every character that is not a letter or digit with a space',
      },
      {
        args: '-d "[:punct:]"',
        what: 'delete all punctuation characters from the input',
      },
      {
        args: 'A-Z N-ZA-M',
        what: 'rotate the alphabet so each letter shifts by thirteen places',
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
      'Reports how many lines, words, characters and bytes its input holds, alone or together. It is the quickest way to size up a log or a document before working with it. With several inputs it prints a total line as well.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/coreutils/',
    bin: 'wc',
    install: 'Included with Termux',
    glyph: 'gauge',
    commands: [
      {
        args: '-l app.log',
        what: 'count only the number of lines, a fast way to see how busy a log is',
      },
      {
        args: '-w essay.txt',
        what: 'count whitespace-separated words in a document',
      },
      {
        args: '-c payload.json',
        what: 'report the byte size of the input',
      },
      {
        args: '-m notes.txt',
        what: 'count characters rather than bytes, which matters for non-ASCII text',
      },
      {
        args: '*.txt',
        what: 'report a count for each path and a combined total at the end',
      },
      {
        args: '-L src/main.c',
        what: 'print the length of the longest line, useful for spotting runaway rows',
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
      'A pager that shows text one screen at a time and lets you scroll both ways, search and jump. It reads from a pipe as happily as from a path, so it tames the output of any command. The standard way to read a long log without drowning in it.',
    developer: 'Mark Nudelman',
    url: 'https://www.greenwoodsoftware.com/less/',
    bin: 'less',
    install: 'pkg install less',
    glyph: 'pager',
    commands: [
      {
        args: 'app.log',
        what: 'open a long log in a scrollable view instead of dumping it all at once',
      },
      {
        args: '+F app.log',
        what: 'start in follow mode so new lines appear as they are written, like a live tail',
      },
      {
        args: '-N app.log',
        what: 'show line numbers down the left side of the screen',
      },
      {
        args: '-S data.csv',
        what: 'stop long lines from wrapping so wide rows can be scrolled sideways',
      },
      {
        args: '-R app.log',
        what: 'display raw colour escape codes correctly so tinted output keeps its colours',
      },
      {
        args: '+/ERROR app.log',
        what: 'open the pager already scrolled to the first line matching the pattern',
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
      'A drop-in pager that adds syntax highlighting, a grid and line numbers, and integrates with the version-control diff view. It is easier on the eye than a plain dump when reading code or configuration. Use it whenever you would otherwise print a source path to the screen.',
    developer: 'David Peter',
    url: 'https://github.com/sharkdp/bat',
    bin: 'bat',
    install: 'pkg install bat',
    glyph: 'doc',
    commands: [
      {
        args: 'main.ts',
        what: 'print a source path with syntax highlighting, line numbers and a header',
      },
      {
        args: '-p main.ts',
        what: 'show the plain highlighted text without line numbers or the header',
      },
      {
        args: '-n main.ts',
        what: 'force line numbers on even when output is piped',
      },
      {
        args: '--line-range 20:40 main.ts',
        what: 'display only a slice of lines from the middle of a long path',
      },
      {
        args: '-A main.ts',
        what: 'show non-printing characters such as tabs and trailing spaces',
      },
      {
        args: '-l json payload.json',
        what: 'override the detected language so highlighting uses the right rules',
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
    tagline: 'Slice, filter and reshape JSON on the command line',
    about:
      'A small query language for JSON that turns tangled documents into exactly the fields you want. It filters, maps, orders and reformats, and can pretty-print or minify. Indispensable when reading API responses or configuration in the terminal.',
    developer: 'Stephen Dolan',
    url: 'https://jqlang.github.io/jq/',
    bin: 'jq',
    install: 'pkg install jq',
    glyph: 'braces',
    commands: [
      {
        args: '. payload.json',
        what: 'pretty-print a compact document with consistent indentation',
      },
      {
        args: '.items[].name data.json',
        what: 'extract one field from every element of an array',
      },
      {
        args: '-r .version package.json',
        what: 'print a value as raw text without surrounding quotes',
      },
      {
        args: '.[] | select(.price > 100) catalog.json',
        what: 'keep only the objects whose numeric field exceeds a threshold',
      },
      {
        args: '-c . data.json',
        what: 'emit compact output on a single line, the opposite of pretty-printing',
      },
      {
        args: 'keys data.json',
        what: 'list the top-level field names of an object',
      },
    ],
    example: {
      args: '.items[].name data.json',
      out: ['widget', 'sprocket', 'cog'].join('\n'),
    },
  },
];

