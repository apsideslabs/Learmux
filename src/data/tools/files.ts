import type { Tool } from './types';

export const fileTools: Tool[] = [
  {
    slug: 'ls',
    name: 'ls',
    category: 'files',
    tagline: 'List directory contents with sizes, permissions and dates',
    about:
      'The core directory-listing command that ships with every Unix-like system, Termux included. Reach for it the moment you land in an unfamiliar folder to see what is there and how it is protected. Its flags control ordering, recursion and how much metadata is shown.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/coreutils/',
    bin: 'ls',
    install: 'Included with Termux',
    glyph: 'list',
    commands: [
      {
        args: '-la',
        what: 'list every entry including hidden dotfiles, with permissions, owner, size and modification time — the first thing to run in a directory you do not know',
      },
      {
        args: '-lh',
        what: 'show the same listing with human-readable sizes such as 4.0K and 1.2M instead of raw bytes',
      },
      {
        args: '-lt',
        what: 'order entries by modification time, newest first, so the most recently touched items sit at the top',
      },
      {
        args: '-R',
        what: 'recurse into every subdirectory and print the whole hierarchy level by level',
      },
      {
        args: '--color=auto',
        what: 'enable colour coding when the output is a terminal, tinting directories, executables and archives differently',
      },
      {
        args: '-1',
        what: 'print one entry per line, which helps when piping the result into another command',
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
    tagline: 'Search the filesystem by name, size, age or permissions',
    about:
      'A recursive directory walker that matches entries against tests you supply and can act on each match. Use it when you need to locate items by attributes rather than by a known path, such as everything changed in the last day. It is provided by the findutils package.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/findutils/',
    bin: 'find',
    install: 'pkg install findutils',
    glyph: 'folder-search',
    commands: [
      {
        args: '. -name "*.log"',
        what: 'walk the current directory and every folder beneath it, printing paths whose name matches the given pattern',
      },
      {
        args: '/sdcard -type f -size +10M',
        what: 'list regular entries larger than ten megabytes under the shared storage mount, useful when hunting for space hogs',
      },
      {
        args: '. -mtime -1',
        what: 'show everything modified within the last twenty-four hours, a quick way to see what changed today',
      },
      {
        args: '. -type d -empty',
        what: 'print directories that contain nothing, which often marks leftover build or cache folders',
      },
      {
        args: '. -name "*.tmp" -delete',
        what: 'match temporary items and remove each one as it is encountered, cleaning a hierarchy in a single pass',
      },
      {
        args: '. -perm -o+w',
        what: 'surface paths that are world-writable, a quick security smell on shared storage',
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
    tagline: 'A fast, friendly alternative to the classic search command',
    about:
      'A modern rewrite that walks directories in parallel and skips build folders and hidden entries by default. It aims for a friendlier syntax than the older tool, with colour and smart-case matching built in. Reach for it when interactive searches need to be quick and readable.',
    developer: 'David Peter',
    url: 'https://github.com/sharkdp/fd',
    bin: 'fd',
    install: 'pkg install fd',
    glyph: 'magnifier',
    commands: [
      {
        args: 'config',
        what: 'search the hierarchy for any path whose name contains the pattern, with case-insensitivity applied when the pattern is all lowercase',
      },
      {
        args: '-e md',
        what: 'restrict matches to a single extension, here Markdown documents',
      },
      {
        args: '-t d',
        what: 'return directories only, filtering out ordinary entries',
      },
      {
        args: '-H',
        what: 'include hidden items and folders that are normally skipped',
      },
      {
        args: '-x rm',
        what: 'run a command once per match, passing each path as an argument',
      },
      {
        args: '-s',
        what: 'force case-sensitive matching even when the pattern is lowercase',
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
    tagline: 'Print a directory hierarchy as an indented diagram',
    about:
      'Renders the contents of a folder as a branching diagram so the shape of a project is visible at a glance. It can cap the depth, filter by pattern and print sizes. Useful for documentation and for understanding an unfamiliar codebase.',
    developer: 'Steve Baker',
    url: 'http://mama.indstate.edu/users/ice/tree/',
    bin: 'tree',
    install: 'pkg install tree',
    glyph: 'tree',
    commands: [
      {
        args: '-L 2',
        what: 'limit the diagram to two levels of depth so a large project does not flood the screen',
      },
      {
        args: '-a',
        what: 'include hidden dotfiles and folders in the output',
      },
      {
        args: '-h',
        what: 'append a human-readable size to each entry',
      },
      {
        args: '-d',
        what: 'show directories only, giving a map of the folder skeleton',
      },
      {
        args: '-I "node_modules|.git"',
        what: 'exclude any path matching the given patterns, keeping the diagram focused',
      },
      {
        args: '-P "*.ts"',
        what: 'print only entries matching the pattern while still showing their parent folders',
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
    tagline: 'A keyboard-driven file manager that runs in the terminal',
    about:
      'A full-screen navigator with three columns showing the parent, current and preview panes. Movement is vi-like, and a preview of text, images or archives appears beside the selection. Reach for it when you would rather browse and open things visually than type paths.',
    developer: 'Roman Zimbelmann',
    url: 'https://ranger.github.io/',
    bin: 'ranger',
    install: 'pkg install ranger',
    glyph: 'columns',
    commands: [
      {
        args: '.',
        what: 'open the browser rooted at the current directory with the three-pane layout',
      },
      {
        args: '/sdcard',
        what: 'start with the shared storage mount as the working location',
      },
      {
        args: '--choosedir=/tmp/chosen-dir',
        what: 'write the folder you quit from into a temporary note so a shell can change into it afterwards',
      },
      {
        args: '--copy-config=all',
        what: 'write the default configuration and key bindings into your home directory so you can customise them',
      },
      {
        args: '-d',
        what: 'open with the debug log enabled, which helps when a preview fails',
      },
      {
        args: '--cmd=set colorscheme default',
        what: 'override a setting for a single session, here restoring the default colour scheme',
      },
    ],
  },
  {
    slug: 'midnight-commander',
    name: 'Midnight Commander',
    category: 'files',
    tagline: 'A dual-pane orthodox file manager for the terminal',
    about:
      'An old-school two-panel commander that shows two directories side by side with function-key actions along the bottom. Copying, moving and comparing between panes is quick, and an internal viewer and editor are built in. Good when you want classic file-management muscle without leaving the terminal.',
    developer: 'Miguel de Icaza',
    url: 'https://midnight-commander.org/',
    bin: 'mc',
    install: 'pkg install mc',
    glyph: 'columns',
    commands: [
      {
        args: '.',
        what: 'start the dual-pane manager with the current folder in the left panel',
      },
      {
        args: '-b',
        what: 'run in black-and-white mode for terminals without colour support',
      },
      {
        args: '--view notes.txt',
        what: 'open the built-in viewer directly on the named path, read-only',
      },
      {
        args: '--edit scripts/deploy.sh',
        what: 'jump straight into the bundled editor on the given path',
      },
      {
        args: '-x',
        what: 'force the program to run inside the current terminal instead of spawning a subshell',
      },
      {
        args: '-P /tmp/panel-dir',
        what: 'write the last directory you visited to the given location when the program exits',
      },
    ],
  },
  {
    slug: 'tar',
    name: 'tar',
    category: 'files',
    tagline: 'Bundle many files into one archive and unpack it again',
    about:
      'The classic tape-archiver, now the standard way to package a directory hierarchy into a single stream. Combined with a compressor it produces the familiar .tar.gz bundles shipped by most projects. Use it to move or back up a whole hierarchy while preserving permissions and timestamps.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/tar/',
    bin: 'tar',
    install: 'pkg install tar',
    glyph: 'archive',
    commands: [
      {
        args: '-czf snapshot.tgz notes/',
        what: 'create a compressed archive named snapshot.tgz from the notes folder',
      },
      {
        args: '-xzf snapshot.tgz',
        what: 'unpack the compressed archive into the current directory',
      },
      {
        args: '-tzf snapshot.tgz',
        what: 'list the contents without extracting anything, so you can see what is inside first',
      },
      {
        args: '-cjf photos.tbz Pictures/',
        what: 'build an archive using the bzip2 compressor, selected by the extension',
      },
      {
        args: '-xzf snapshot.tgz -C /sdcard/Download',
        what: 'extract into a chosen destination instead of the working directory',
      },
      {
        args: '--exclude="*.log" -czf clean.tgz project/',
        what: 'build an archive while skipping anything matching the pattern',
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
    tagline: 'Extract and inspect ZIP archives from the command line',
    about:
      'The companion to the classic ZIP packer, used to list and extract .zip bundles. It can restore a single member, choose an output directory and handle password-protected archives. Handy for unpacking downloads and Android app bundles.',
    developer: 'Info-ZIP',
    url: 'https://infozip.sourceforge.net/UnZip.html',
    bin: 'unzip',
    install: 'pkg install zip unzip',
    glyph: 'archive',
    commands: [
      {
        args: '-l bundle.zip',
        what: 'list the members of an archive with their sizes and timestamps without extracting anything',
      },
      {
        args: 'bundle.zip',
        what: 'extract every member into the current directory',
      },
      {
        args: 'bundle.zip -d /sdcard/Download',
        what: 'extract into a chosen destination folder, creating it if needed',
      },
      {
        args: 'bundle.zip "docs/*"',
        what: 'restore only the members matching a pattern, leaving the rest untouched',
      },
      {
        args: '-o bundle.zip',
        what: 'overwrite existing paths without prompting, useful in scripts',
      },
      {
        args: '-P secret bundle.zip',
        what: 'supply the password for an encrypted archive non-interactively',
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
    tagline: 'High-ratio archiver that reads and writes many formats',
    about:
      'The command-line face of the 7-Zip archiver, shipped in Termux through the p7zip package. It handles its own format plus ZIP, gzip and others, and often compresses better than the older tools. Reach for it when archive size matters or when you need one program for several formats.',
    developer: 'Igor Pavlov',
    url: 'https://www.7-zip.org/',
    bin: '7z',
    install: 'pkg install p7zip',
    glyph: 'box',
    commands: [
      {
        args: 'a backup docs/',
        what: 'create or update an archive from a folder, choosing the format by extension',
      },
      {
        args: 'l backup',
        what: 'list the members of an archive without unpacking it',
      },
      {
        args: 'x backup -o/sdcard/out',
        what: 'extract an archive into the given output directory, preserving the internal structure',
      },
      {
        args: 'e backup',
        what: 'extract while flattening paths so all members land in one directory',
      },
      {
        args: 't backup',
        what: 'verify an archive for integrity and report any corruption',
      },
      {
        args: 'a -mx=9 photos Pictures/',
        what: 'pack with maximum compression, trading time for a smaller result',
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
    tagline: 'Compress single files with the ubiquitous deflate format',
    about:
      'The standard single-item compressor whose .gz output is understood almost everywhere. It keeps the original name and timestamp inside the stream and can be paired with the archiver for whole hierarchies. Use it when you need a small, widely readable compressed copy of one item.',
    developer: 'GNU Project',
    url: 'https://www.gnu.org/software/gzip/',
    bin: 'gzip',
    install: 'pkg install gzip',
    glyph: 'archive',
    commands: [
      {
        args: '-k notes.txt',
        what: 'compress an entry in place while keeping the original alongside the smaller copy',
      },
      {
        args: '-d notes.txt.gz',
        what: 'decompress an archive back to its original form',
      },
      {
        args: '-l notes.txt.gz',
        what: 'report the uncompressed and compressed sizes plus the ratio without changing anything',
      },
      {
        args: '-9 backup.sql',
        what: 'compress with the slowest, smallest setting when space matters more than speed',
      },
      {
        args: '-r logs/',
        what: 'walk a directory and compress every matching entry inside it',
      },
      {
        args: '-c notes.txt',
        what: 'write the compressed stream to standard output so another command can receive it',
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
    tagline: 'Synchronise directories efficiently over local or remote paths',
    about:
      'A copy tool that transfers only the differences between two locations and can delete extras to keep them identical. It preserves permissions and timestamps and works over a secure shell connection as easily as on local storage. The go-to for backups and for mirroring a project to a server.',
    developer: 'Andrew Tridgell',
    url: 'https://rsync.samba.org/',
    bin: 'rsync',
    install: 'pkg install rsync',
    glyph: 'sync',
    commands: [
      {
        args: '-av src/ dst/',
        what: 'copy a hierarchy while preserving permissions, times and symlinks, showing each item as it goes',
      },
      {
        args: '-av --delete src/ dst/',
        what: 'mirror a source onto a destination, removing anything in the destination that no longer exists in the source',
      },
      {
        args: '-av --dry-run src/ dst/',
        what: 'report what would change without touching anything, a safe rehearsal before a real run',
      },
      {
        args: '-avz user@example.com:/var/www/ ./site/',
        what: 'pull a remote folder down over a secure shell connection with compression on the wire',
      },
      {
        args: '-av --exclude="*.log" src/ dst/',
        what: 'skip anything matching a pattern while copying the rest',
      },
      {
        args: '-avh --progress src/ dst/',
        what: 'show human-readable sizes and a per-item progress meter during the transfer',
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
    tagline: 'Identify what a given path actually contains',
    about:
      'Reports the type of a path by inspecting its leading bytes rather than trusting the extension. It distinguishes text, images, executables, archives and dozens of other formats. Useful when a download arrives without a sensible name or when a script misbehaves.',
    developer: 'Ian Darwin',
    url: 'https://www.darwinsys.com/file/',
    bin: 'file',
    install: 'pkg install file',
    glyph: 'hex',
    commands: [
      {
        args: 'photo.jpg',
        what: 'report the detected type of a single path, such as JPEG image data',
      },
      {
        args: '-b photo.jpg',
        what: 'print only the type description, without the leading name and colon',
      },
      {
        args: '-i photo.jpg',
        what: 'emit the MIME type instead of a prose description',
      },
      {
        args: '-s /dev/block/mmcblk0',
        what: 'read block and character devices as well, which is needed for raw disk paths',
      },
      {
        args: '-z bundle.zip',
        what: 'look inside compressed archives and describe their contents',
      },
      {
        args: '-e soft docs/',
        what: 'treat symbolic links as the target type rather than reporting the link itself',
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
