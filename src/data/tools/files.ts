import type { Tool } from './types';

export const fileTools: Tool[] = [
  {
    slug: 'ls',
    name: 'ls',
    category: 'files',
    tagline: 'See what a folder holds, with sizes and permissions',
    about:
      'The core directory-listing command, and it ships with every Unix-like system. Land in an unfamiliar folder and run it first. Its flags set the ordering, the recursion and how much metadata appears.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/coreutils/',
    bin: 'ls',
    install: 'Included with Termux',
    glyph: 'list',
    commands: [
      {
        args: '-la',
        what: 'List every entry, hidden dotfiles included. You see permissions, owner, size and time.',
      },
      {
        args: '-lh',
        what: 'Same listing, friendlier sizes. 4.0K and 1.2M replace raw byte counts.',
      },
      {
        args: '-lt',
        what: 'Order entries by modification time, newest first. The freshest items sit at the top.',
      },
      {
        args: '-R',
        what: 'Recurse into every subdirectory. Prints the whole hierarchy, level by level.',
      },
      {
        args: '--color=auto',
        what: 'Colour coding, but only on a terminal. Directories, executables and archives get different tints.',
      },
      {
        args: '-1',
        what: 'One entry per line. Handy when you pipe the result onward.',
      },
    ],
    example: {
      args: '-lh',
      out: [
        'total 24K',
        'drwx------  3 u0_a123 u0_a123 4.0K Oct 24 09:15 storage',
        '-rw-r--r--  1 u0_a123 u0_a123  812 Oct 23 21:04 notes.txt',
        'drwxr-xr-x  2 u0_a123 u0_a123 4.0K Oct 20 11:30 scripts',
      ].join('\n'),
    },
  },
  {
    slug: 'find',
    name: 'find',
    category: 'files',
    tagline: 'Locate files by name, size, age or permissions',
    about:
      'A recursive directory walker. It matches entries against tests you supply and can act on each match. Reach for it to find items by attribute, not by known path; findutils provides it.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/findutils/',
    bin: 'find',
    install: 'pkg install findutils',
    glyph: 'folder-search',
    commands: [
      {
        args: '. -name "*.log"',
        what: 'Walk the current directory and every folder beneath it. Prints paths that match the pattern.',
      },
      {
        args: '/sdcard -type f -size +10M',
        what: 'Regular entries over ten megabytes, under the shared storage mount. Useful when hunting space hogs.',
      },
      {
        args: '. -mtime -1',
        what: 'Everything modified in the last twenty-four hours. A quick look at what changed today.',
      },
      {
        args: '. -type d -empty',
        what: 'Empty directories only. These often mark leftover build or cache folders.',
      },
      {
        args: '. -name "*.tmp" -delete',
        what: 'Match temporary items and delete each one as it turns up. Cleans a whole hierarchy in one pass.',
      },
      {
        args: '. -perm -o+w',
        what: 'Paths that are world-writable. A quick security smell on shared storage.',
      },
    ],
    example: {
      args: '. -name "*.md"',
      out: './notes/setup.md\n./notes/shortcuts.md\n./notes/backup.md',
    },
  },
  {
    slug: 'fd',
    name: 'fd',
    category: 'files',
    tagline: 'A faster, friendlier take on the classic search command',
    about:
      'A modern rewrite that walks directories in parallel. It skips build folders and hidden entries by default. The syntax is friendlier than the older tool, and colour plus smart-case matching come built in.',
    developer: 'David Peter',
    url: 'https://github.com/sharkdp/fd',
    bin: 'fd',
    install: 'pkg install fd',
    glyph: 'magnifier',
    commands: [
      {
        args: 'config',
        what: 'Search the hierarchy for any path containing the pattern. An all-lowercase pattern matches case-insensitively.',
      },
      {
        args: '-e md',
        what: 'Restrict matches to one extension, here Markdown documents.',
      },
      {
        args: '-t d',
        what: 'Directories only. Ordinary entries are filtered out.',
      },
      {
        args: '-H',
        what: 'Include hidden items and folders that are normally skipped.',
      },
      {
        args: '-x rm',
        what: 'Run a command once per match, passing each path as an argument.',
      },
      {
        args: '-s',
        what: 'Force case-sensitive matching, even for a lowercase pattern.',
      },
    ],
    example: {
      args: '-e md',
      out: ['README.md', 'docs/install.md', 'docs/usage.md'].join('\n'),
    },
  },
  {
    slug: 'tree',
    name: 'tree',
    category: 'files',
    tagline: 'Draw a directory hierarchy as an indented diagram',
    about:
      'Renders a folder as a branching diagram. The shape of a project becomes visible at a glance. It can cap the depth, filter by pattern and print sizes.',
    developer: 'Steve Baker',
    url: 'http://mama.indstate.edu/users/ice/tree/',
    bin: 'tree',
    install: 'pkg install tree',
    glyph: 'tree',
    commands: [
      {
        args: '-L 2',
        what: 'Limit the diagram to two levels. A large project will not flood the screen.',
      },
      {
        args: '-a',
        what: 'Include hidden dotfiles and folders in the output.',
      },
      {
        args: '-h',
        what: 'Append a human-readable size to each entry.',
      },
      {
        args: '-d',
        what: 'Directories only. You get a map of the folder skeleton.',
      },
      {
        args: '-I "node_modules|.git"',
        what: 'Exclude any path matching the patterns. Keeps the diagram focused.',
      },
      {
        args: '-P "*.ts"',
        what: 'Print only entries matching the pattern. Parent folders still appear.',
      },
    ],
    example: {
      args: '-L 1',
      out: [
        '.',
        '├── docs',
        '├── scripts',
        '├── src',
        '└── README.md',
        '',
        '3 directories, 1 file',
      ].join('\n'),
    },
  },
  {
    slug: 'ranger',
    name: 'ranger',
    category: 'files',
    tagline: 'A keyboard-driven file manager for the terminal',
    about:
      'A full-screen navigator with three columns: parent, current and preview. Movement is vi-like, and text, images or archives preview beside the selection. Browse and open things visually instead of typing paths.',
    developer: 'Roman Zimbelmann',
    url: 'https://ranger.github.io/',
    bin: 'ranger',
    install: 'pkg install ranger',
    glyph: 'columns',
    commands: [
      {
        args: '.',
        what: 'Open the browser at the current directory, with the three-pane layout.',
      },
      {
        args: '/sdcard',
        what: 'Start in the shared storage mount.',
      },
      {
        args: '--choosedir=/tmp/chosen-dir',
        what: 'Write the folder you quit from to a temporary note. A shell can then change into it.',
      },
      {
        args: '--copy-config=all',
        what: 'Write the default configuration and key bindings to your home directory. Customise them from there.',
      },
      {
        args: '-d',
        what: 'Open with the debug log on. Helps when a preview fails.',
      },
      {
        args: '--cmd=set colorscheme default',
        what: 'Override a setting for one session, here restoring the default colour scheme.',
      },
    ],
  },
  {
    slug: 'midnight-commander',
    name: 'Midnight Commander',
    category: 'files',
    tagline: 'An old-school dual-pane file manager for the terminal',
    about:
      'An old-school two-panel commander. Two directories sit side by side, with function-key actions along the bottom. Copying and moving between panes is quick, and a viewer plus an editor come built in.',
    developer: 'Miguel de Icaza',
    url: 'https://midnight-commander.org/',
    bin: 'mc',
    install: 'pkg install mc',
    glyph: 'columns',
    commands: [
      {
        args: '.',
        what: 'Start the dual-pane manager, current folder in the left panel.',
      },
      {
        args: '-b',
        what: 'Black-and-white mode, for terminals without colour support.',
      },
      {
        args: '--view notes.txt',
        what: 'Open the built-in viewer on the named path, read-only.',
      },
      {
        args: '--edit scripts/deploy.sh',
        what: 'Jump straight into the bundled editor on the given path.',
      },
      {
        args: '-x',
        what: 'Run inside the current terminal rather than a fresh subshell.',
      },
      {
        args: '-P /tmp/panel-dir',
        what: 'On exit, write the last directory you visited to the given location.',
      },
    ],
  },
  {
    slug: 'tar',
    name: 'tar',
    category: 'files',
    tagline: 'Pack many files into one archive, then unpack it',
    about:
      'The classic tape-archiver, now the standard way to pack a directory tree into one stream. Add a compressor and you get the familiar .tar.gz bundles. Use it to move or back up a hierarchy while keeping permissions and timestamps.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/tar/',
    bin: 'tar',
    install: 'pkg install tar',
    glyph: 'archive',
    commands: [
      {
        args: '-czf snapshot.tgz notes/',
        what: 'Create a compressed archive, snapshot.tgz, from the notes folder.',
      },
      {
        args: '-xzf snapshot.tgz',
        what: 'Unpack the compressed archive into the current directory.',
      },
      {
        args: '-tzf snapshot.tgz',
        what: 'List the contents without extracting. See what is inside first.',
      },
      {
        args: '-cjf photos.tbz Pictures/',
        what: 'Build an archive with the bzip2 compressor, chosen by the extension.',
      },
      {
        args: '-xzf snapshot.tgz -C /sdcard/Download',
        what: 'Extract into a chosen destination rather than the working directory.',
      },
      {
        args: '--exclude="*.log" -czf clean.tgz project/',
        what: 'Build an archive while skipping anything that matches the pattern.',
      },
    ],
    example: {
      args: '-tzf snapshot.tgz',
      out: [
        'notes/',
        'notes/todo.md',
        'notes/ideas.md',
        'notes/archive/2024.md',
      ].join('\n'),
    },
  },
  {
    slug: 'unzip',
    name: 'unzip',
    category: 'files',
    tagline: 'Extract and inspect ZIP archives from the terminal',
    about:
      'The companion to the classic ZIP packer. It lists and extracts .zip bundles, restores a single member, and picks an output directory. Password-protected archives are handled too.',
    developer: 'Info-ZIP',
    url: 'https://infozip.sourceforge.net/UnZip.html',
    bin: 'unzip',
    install: 'pkg install zip unzip',
    glyph: 'archive',
    commands: [
      {
        args: '-l bundle.zip',
        what: 'List the members with their sizes and timestamps. Nothing is extracted.',
      },
      {
        args: 'bundle.zip',
        what: 'Extract every member into the current directory.',
      },
      {
        args: 'bundle.zip -d /sdcard/Download',
        what: 'Extract into a chosen destination folder, created if missing.',
      },
      {
        args: 'bundle.zip "docs/*"',
        what: 'Restore only the members matching a pattern. The rest stay untouched.',
      },
      {
        args: '-o bundle.zip',
        what: 'Overwrite existing paths without prompting. Useful in scripts.',
      },
      {
        args: '-P secret bundle.zip',
        what: 'Supply the password for an encrypted archive without a prompt.',
      },
    ],
    example: {
      args: '-l bundle.zip',
      out: [
        'Archive:  bundle.zip',
        '  Length      Date    Time    Name',
        '---------  ---------- -----   ----',
        '     1024  2026-10-20 11:30   readme.txt',
        '     8192  2026-10-20 11:31   docs/guide.md',
        '---------                     -------',
        '     9216                     2 files',
      ].join('\n'),
    },
  },
  {
    slug: '7z',
    name: '7-Zip',
    category: 'files',
    tagline: 'Compresses hard, and reads and writes many formats',
    about:
      'The command-line face of the 7-Zip archiver, shipped in Termux as p7zip. It handles its own format plus ZIP, gzip and others, and often compresses better than the older tools. Reach for it when archive size matters, or when one program must cover several formats.',
    developer: 'Igor Pavlov',
    url: 'https://www.7-zip.org/',
    bin: '7z',
    install: 'pkg install p7zip',
    glyph: 'box',
    commands: [
      {
        args: 'a backup docs/',
        what: 'Create or update an archive from a folder, format chosen by extension.',
      },
      {
        args: 'l backup',
        what: 'List the members of an archive without unpacking it.',
      },
      {
        args: 'x backup -o/sdcard/out',
        what: 'Extract into the given output directory, keeping the internal structure.',
      },
      {
        args: 'e backup',
        what: 'Extract and flatten paths, so every member lands in one directory.',
      },
      {
        args: 't backup',
        what: 'Verify an archive and report any corruption.',
      },
      {
        args: 'a -mx=9 photos Pictures/',
        what: 'Pack with maximum compression. Slower, but the result is smaller.',
      },
    ],
    example: {
      args: 'l backup',
      out: [
        'Scanning the drive for archives',
        '   Date      Time    Attr         Size   Compressed  Name',
        '----------- -------- ---------- ---------- ----------- ----------------',
        '2026-10-20 11:30 ....A         1024          512  readme.txt',
        '2026-10-20 11:31 ....A         8192         2048  docs/guide.md',
      ].join('\n'),
    },
  },
  {
    slug: 'gzip',
    name: 'gzip',
    category: 'files',
    tagline: 'Compress single files with the widespread deflate format',
    about:
      'The standard single-item compressor. Its .gz output is understood almost everywhere. The original name and timestamp are kept inside the stream, and it pairs with the archiver for whole trees.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/gzip/',
    bin: 'gzip',
    install: 'pkg install gzip',
    glyph: 'archive',
    commands: [
      {
        args: '-k notes.txt',
        what: 'Compress an entry in place. The original stays beside the smaller copy.',
      },
      {
        args: '-d notes.txt.gz',
        what: 'Decompress an archive back to its original form.',
      },
      {
        args: '-l notes.txt.gz',
        what: 'Report the compressed and uncompressed sizes plus the ratio. Nothing changes.',
      },
      {
        args: '-9 backup.sql',
        what: 'Compress with the slowest, smallest setting. For when space beats speed.',
      },
      {
        args: '-r logs/',
        what: 'Walk a directory and compress every entry inside it.',
      },
      {
        args: '-c notes.txt',
        what: 'Write the compressed stream to standard output. Another command can then take it.',
      },
    ],
    example: {
      args: '-l *.gz',
      out: [
        '         compressed        uncompressed  ratio uncompressed_name',
        '                812                2048  60.4% notes.txt',
        '               1204                4096  70.6% todo.txt',
      ].join('\n'),
    },
  },
  {
    slug: 'rsync',
    name: 'rsync',
    category: 'files',
    tagline: 'Synchronise directories over local or remote paths',
    about:
      'A copy tool that sends only the differences between two locations. It can delete extras to keep both sides identical. Permissions and timestamps are preserved, and a secure shell connection works as easily as local storage.',
    developer: 'Andrew Tridgell',
    url: 'https://rsync.samba.org/',
    bin: 'rsync',
    install: 'pkg install rsync',
    glyph: 'sync',
    commands: [
      {
        args: '-av src/ dst/',
        what: 'Copy a hierarchy, keeping permissions, times and symlinks. Each item is shown as it goes.',
      },
      {
        args: '-av --delete src/ dst/',
        what: 'Mirror a source onto a destination. Anything gone from the source is removed there too.',
      },
      {
        args: '-av --dry-run src/ dst/',
        what: 'Report what would change without touching anything. A safe rehearsal.',
      },
      {
        args: '-avz user@example.com:/var/www/ ./site/',
        what: 'Pull a remote folder over a secure shell connection, compressed on the wire.',
      },
      {
        args: '-av --exclude="*.log" src/ dst/',
        what: 'Skip anything matching a pattern, and copy the rest.',
      },
      {
        args: '-avh --progress src/ dst/',
        what: 'Human-readable sizes and a per-item progress meter during the transfer.',
      },
    ],
    example: {
      args: '-av --dry-run src/ dst/',
      out: [
        'sending incremental file list',
        './',
        'notes.txt',
        'docs/guide.md',
        'sent 128 bytes  received 34 bytes  324.00 bytes/sec',
        'total size is 9,216  speedup is 56.89 (DRY RUN)',
      ].join('\n'),
    },
  },
  {
    slug: 'file',
    name: 'file',
    category: 'files',
    tagline: 'Identify what a path really contains',
    about:
      'Reports a path type by inspecting its leading bytes, not the extension. It tells text, images, executables and archives apart, among dozens of formats. Useful when a download arrives unnamed, or a script misbehaves.',
    developer: 'Ian Darwin',
    url: 'https://www.darwinsys.com/file/',
    bin: 'file',
    install: 'pkg install file',
    glyph: 'hex',
    commands: [
      {
        args: 'photo.jpg',
        what: 'Report the detected type of one path, such as JPEG image data.',
      },
      {
        args: '-b photo.jpg',
        what: 'Print only the type description, without the leading name and colon.',
      },
      {
        args: '-i photo.jpg',
        what: 'Emit the MIME type rather than a prose description.',
      },
      {
        args: '-s /dev/block/mmcblk0',
        what: 'Read block and character devices too. Needed for raw disk paths.',
      },
      {
        args: '-z bundle.zip',
        what: 'Look inside compressed archives and describe their contents.',
      },
      {
        args: '-e soft docs/',
        what: 'Treat symbolic links as the target type, not the link itself.',
      },
    ],
    example: {
      args: '-i notes.txt',
      out: [
        'notes.txt: text/plain; charset=us-ascii',
        'photo.jpg: image/jpeg',
        'scripts/run.sh: text/x-shellscript; charset=us-ascii',
      ].join('\n'),
    },
  },

];
