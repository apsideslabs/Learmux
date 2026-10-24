/**
 * The tool directory.
 *
 * Every entry is a real command-line tool that runs under Termux. Fields are
 * authored here rather than fetched, so the site ships no third-party data at
 * runtime. `logo` names a Simple Icons slug where a real project logo exists;
 * where it does not, the build draws an original monogram instead — so no tile
 * is ever a blank box.
 */

export type CategoryId =
  | 'files'
  | 'text'
  | 'shell'
  | 'process'
  | 'network'
  | 'transfer'
  | 'security'
  | 'forensics'
  | 'packages'
  | 'dev'
  | 'editors'
  | 'media'
  | 'monitor';

export interface ToolCommand {
  /** The command as typed, when the binary name is not a fixed prefix. */
  cmd?: string;
  /** The part after the binary name, when the binary is fixed (see Tool.bin). */
  args?: string;
  what: string;
}

export interface Tool {
  slug: string;
  name: string;
  category: CategoryId;
  tagline: string;
  about: string;
  developer: string;
  license?: string;
  url: string;
  install?: string;
  /** The command you actually type, when it differs from the display name. */
  bin?: string;
  commands: ToolCommand[];
  /** Simple Icons slug, when the project has a real mark. */
  logo?: string;
  /** Fallback monogram letters (1–2 characters). */
  mono?: string;
}

export interface ToolCategory {
  id: CategoryId;
  name: string;
  blurb: string;
}

export const toolCategories: ToolCategory[] = [
  { id: 'files', name: 'Files and navigation', blurb: 'Finding, moving, packing and unpacking files.' },
  { id: 'text', name: 'Text and data', blurb: 'Reading, searching and reshaping text and JSON.' },
  { id: 'shell', name: 'Shell and sessions', blurb: 'The shell itself, and keeping work alive between sessions.' },
  { id: 'process', name: 'Processes and system', blurb: 'Seeing what runs, and stopping it cleanly.' },
  { id: 'network', name: 'Networking', blurb: 'Addresses, ports, name lookups and reachability.' },
  { id: 'transfer', name: 'Web and transfer', blurb: 'Fetching, downloading and moving files between hosts.' },
  { id: 'security', name: 'Security and cryptography', blurb: 'Keys, hashes, encryption and authorised testing.' },
  { id: 'forensics', name: 'Forensics and reversing', blurb: 'Pulling apart packets, binaries and images.' },
  { id: 'packages', name: 'Package managers', blurb: 'Installing and tracking software.' },
  { id: 'dev', name: 'Languages and build tools', blurb: 'Writing and running code on the phone.' },
  { id: 'editors', name: 'Editors', blurb: 'Editing files from the terminal.' },
  { id: 'media', name: 'Media and documents', blurb: 'Converting audio, video, images and documents.' },
  { id: 'monitor', name: 'Monitoring and diagnostics', blurb: 'Disk, memory, open files and system state.' },
];

export const tools: Tool[] = [
  /* ── files ─────────────────────────────────────────────────────────────── */
  {
    slug: 'coreutils',
    name: 'GNU Coreutils',
    category: 'files',
    tagline: 'The everyday file commands: ls, cp, mv, rm, mkdir, df, du.',
    about:
      'The base set of file and text utilities present on every Linux system. Most of what you type in a first week of Termux comes from here.',
    developer: 'GNU Project',
    license: 'GPL-3.0',
    url: 'https://www.gnu.org/software/coreutils/',
    logo: 'gnu',
    install: 'Included with Termux',
    commands: [
      { cmd: 'ls -la', what: 'List everything, including hidden files, in long form' },
      { cmd: 'cp -r src/ backup/', what: 'Copy a directory and its contents' },
      { cmd: 'mkdir -p a/b/c', what: 'Create nested directories in one go' },
      { cmd: 'du -sh *', what: 'Show how much space each item uses' },
    ],
  },
  {
    slug: 'findutils',
    name: 'find',
    category: 'files',
    tagline: 'Walk a directory tree and select files by name, type, size or age.',
    about:
      'Searches a tree rather than a single directory, and can act on what it matches. The workhorse for "where did that file go".',
    developer: 'GNU Project',
    license: 'GPL-3.0',
    url: 'https://www.gnu.org/software/findutils/',
    mono: 'fi',
    install: 'pkg install findutils',
    commands: [
      { cmd: 'find . -name "*.log"', what: 'Match by filename pattern' },
      { cmd: 'find . -type d', what: 'List directories only' },
      { cmd: 'find . -size +10M', what: 'Files larger than ten megabytes' },
      { cmd: 'find . -name "*.tmp" -delete', what: 'Find and remove in one pass' },
    ],
  },
  {
    slug: 'tar',
    name: 'tar',
    category: 'files',
    tagline: 'Bundle many files into one archive, optionally compressed.',
    about:
      'The standard archiver on Linux. Its flags look cryptic at first, but there are only four you use daily.',
    developer: 'GNU Project',
    license: 'GPL-3.0',
    url: 'https://www.gnu.org/software/tar/',
    mono: 'ta',
    install: 'pkg install tar',
    commands: [
      { cmd: 'tar -czf out.tar.gz folder/', what: 'Create a gzip-compressed archive' },
      { cmd: 'tar -tzf out.tar.gz', what: 'List the contents without extracting' },
      { cmd: 'tar -xzf out.tar.gz', what: 'Extract an archive' },
      { cmd: 'tar -xzf out.tar.gz -C /tmp', what: 'Extract into a chosen directory' },
    ],
  },
  {
    slug: 'rsync',
    name: 'rsync',
    category: 'files',
    tagline: 'Copy only what changed, locally or over SSH.',
    about:
      'Compares source and destination and transfers the difference. The right tool for backups and for keeping two trees in step.',
    developer: 'Andrew Tridgell and Wayne Davison',
    license: 'GPL-3.0',
    url: 'https://rsync.samba.org/',
    mono: 'rs',
    install: 'pkg install rsync',
    commands: [
      { cmd: 'rsync -av src/ dst/', what: 'Archive mode, verbose, recurse' },
      { cmd: 'rsync -av --dry-run src/ dst/', what: 'Show what would happen first' },
      { cmd: 'rsync -av --delete src/ dst/', what: 'Mirror, removing extras at the destination' },
    ],
  },
  {
    slug: 'tree',
    name: 'tree',
    category: 'files',
    tagline: 'Print a directory as an indented tree.',
    about:
      'The fastest way to understand a project layout at a glance. Pairs well with piping into less on a large tree.',
    developer: 'Steve Baker',
    license: 'GPL-2.0',
    url: 'http://mama.indstate.edu/users/ice/tree/',
    mono: 'tr',
    install: 'pkg install tree',
    commands: [
      { cmd: 'tree', what: 'Draw the current directory' },
      { cmd: 'tree -L 2', what: 'Limit the depth' },
      { cmd: 'tree -d', what: 'Directories only' },
      { cmd: 'tree -h', what: 'Include human-readable sizes' },
    ],
  },
  {
    slug: 'fd',
    name: 'fd',
    category: 'files',
    tagline: 'A friendlier find, with sensible defaults and colour.',
    about:
      'Ignores hidden files and .gitignore entries by default, uses a regex, and is far quicker to type than find.',
    developer: 'David Peter',
    license: 'MIT / Apache-2.0',
    url: 'https://github.com/sharkdp/fd',
    mono: 'fd',
    install: 'pkg install fd',
    commands: [
      { cmd: 'fd report', what: 'Match any path containing report' },
      { cmd: 'fd -e md', what: 'Match by extension' },
      { cmd: 'fd -H', what: 'Include hidden files' },
      { cmd: 'fd -x rm', what: 'Run a command on each match' },
    ],
  },

  /* ── text ──────────────────────────────────────────────────────────────── */
  {
    slug: 'grep',
    name: 'grep',
    category: 'text',
    tagline: 'Print the lines that match a pattern.',
    about:
      'The single most useful text tool there is. Nearly every log investigation starts with grep.',
    developer: 'GNU Project',
    license: 'GPL-3.0',
    url: 'https://www.gnu.org/software/grep/',
    mono: 'gr',
    install: 'pkg install grep',
    commands: [
      { cmd: 'grep error app.log', what: 'Lines containing error' },
      { cmd: 'grep -i error app.log', what: 'Ignore case' },
      { cmd: 'grep -rn TODO src/', what: 'Recurse, with line numbers' },
      { cmd: 'grep -v "#" config', what: 'Invert: drop matching lines' },
    ],
  },
  {
    slug: 'sed',
    name: 'sed',
    category: 'text',
    tagline: 'Edit a stream of text without opening an editor.',
    about:
      'Built for substitutions and deletions inside a pipeline. Substituting with sed is a daily habit once it clicks.',
    developer: 'GNU Project',
    license: 'GPL-3.0',
    url: 'https://www.gnu.org/software/sed/',
    mono: 'se',
    install: 'pkg install sed',
    commands: [
      { cmd: "sed 's/old/new/' file", what: 'Replace the first match on each line' },
      { cmd: "sed 's/old/new/g' file", what: 'Replace every match' },
      { cmd: "sed '/^#/d' file", what: 'Delete comment lines' },
      { cmd: "sed -n '10,20p' file", what: 'Print a line range' },
    ],
  },
  {
    slug: 'gawk',
    name: 'awk',
    category: 'text',
    tagline: 'Pick fields out of text and total them up.',
    about:
      'A tiny programming language aimed at columns. When cut is not enough, awk is the next step.',
    developer: 'GNU Project',
    license: 'GPL-3.0',
    url: 'https://www.gnu.org/software/gawk/',
    mono: 'aw',
    install: 'pkg install gawk',
    commands: [
      { cmd: "awk '{print $1}' file", what: 'Print the first field of each line' },
      { cmd: "awk '{print $NF}' file", what: 'Print the last field' },
      { cmd: 'awk -F: {print $1}', what: 'Split on a colon and take the first field' },
      { cmd: "awk '{s+=$1} END {print s}'", what: 'Sum a numeric column' },
    ],
  },
  {
    slug: 'ripgrep',
    name: 'ripgrep',
    category: 'text',
    tagline: 'A grep that respects .gitignore and is much faster.',
    about:
      'Recursive by default, skips binaries and ignored files, and prints results grouped by file. The default search tool in most modern setups.',
    developer: 'Andrew Gallant',
    license: 'MIT / Unlicense',
    url: 'https://github.com/BurntSushi/ripgrep',
    mono: 'rg',
    install: 'pkg install ripgrep',
    commands: [
      { cmd: 'rg TODO', what: 'Search the current tree' },
      { cmd: 'rg -i todo', what: 'Case-insensitive' },
      { cmd: 'rg -t py import', what: 'Restrict to one file type' },
      { cmd: 'rg -l error', what: 'List matching files only' },
    ],
  },
  {
    slug: 'jq',
    name: 'jq',
    category: 'text',
    tagline: 'Query and reshape JSON on the command line.',
    about:
      'Reads JSON, lets you pick fields with a small path language, and writes JSON back out. Essential when an API reply is large.',
    developer: 'Stephen Dolan and contributors',
    license: 'MIT',
    url: 'https://jqlang.github.io/jq/',
    mono: 'jq',
    install: 'pkg install jq',
    commands: [
      { cmd: 'jq . data.json', what: 'Pretty-print a file' },
      { cmd: 'jq .name data.json', what: 'Read one key' },
      { cmd: 'jq ".[] | .id" data.json', what: 'Take one field from every array item' },
      { cmd: 'jq -r .token data.json', what: 'Raw output, no quotes' },
    ],
  },
  {
    slug: 'bat',
    name: 'bat',
    category: 'text',
    tagline: 'cat with syntax highlighting and line numbers.',
    about:
      'Shows a file the way an editor would, with a header and a scroll pager. A drop-in replacement for cat when reading code.',
    developer: 'David Peter',
    license: 'MIT / Apache-2.0',
    url: 'https://github.com/sharkdp/bat',
    logo: 'bat',
    install: 'pkg install bat',
    commands: [
      { cmd: 'bat script.sh', what: 'Print with highlighting' },
      { cmd: 'bat -n script.sh', what: 'Force line numbers' },
      { cmd: 'bat -A file', what: 'Show non-printing characters' },
    ],
  },
  {
    slug: 'less',
    name: 'less',
    category: 'text',
    tagline: 'Page through a file without loading all of it.',
    about:
      'A pager: search, scroll and quit without dumping a huge file into your scrollback. Press q to leave.',
    developer: 'Mark Nudelman',
    url: 'https://www.greenwoodsoftware.com/less/',
    mono: 'le',
    install: 'pkg install less',
    commands: [
      { cmd: 'less big.log', what: 'Open a file' },
      { cmd: 'less +F big.log', what: 'Follow a growing file' },
      { cmd: '/error', what: 'Search forward inside less' },
    ],
  },

  /* ── shell ─────────────────────────────────────────────────────────────── */
  {
    slug: 'bash',
    name: 'Bash',
    category: 'shell',
    tagline: 'The shell Termux starts you in.',
    about:
      'A command interpreter and a small scripting language. Everything else in this directory is something you run from it.',
    developer: 'Brian Fox and Chet Ramey, GNU Project',
    license: 'GPL-3.0',
    url: 'https://www.gnu.org/software/bash/',
    logo: 'gnubash',
    install: 'Included with Termux',
    commands: [
      { cmd: 'echo $SHELL', what: 'Show the current shell' },
      { cmd: 'history', what: 'List recent commands' },
      { cmd: 'source ~/.bashrc', what: 'Reload your shell config' },
      { cmd: 'set -e', what: 'Stop a script at the first error' },
    ],
  },
  {
    slug: 'zsh',
    name: 'Zsh',
    category: 'shell',
    tagline: 'An alternative shell with richer completion and globbing.',
    about:
      'Widely used with the Oh My Zsh framework. If you want better tab completion and theming, this is the usual upgrade from Bash.',
    developer: 'Peter Stephenson and the Zsh community',
    license: 'MIT-like',
    url: 'https://www.zsh.org/',
    logo: 'zsh',
    install: 'pkg install zsh',
    commands: [
      { cmd: 'chsh -s zsh', what: 'Make it your login shell' },
      { cmd: 'echo $ZSH_VERSION', what: 'Confirm it is active' },
      { cmd: 'autoload -Uz compinit && compinit', what: 'Set up completion' },
    ],
  },
  {
    slug: 'tmux',
    name: 'tmux',
    category: 'shell',
    tagline: 'Split the terminal into panes that survive a disconnect.',
    about:
      'A terminal multiplexer. Sessions keep running when the app closes, so a long download or build is never lost.',
    developer: 'Nicholas Marriott and contributors',
    license: 'ISC',
    url: 'https://github.com/tmux/tmux',
    logo: 'tmux',
    install: 'pkg install tmux',
    commands: [
      { cmd: 'tmux new -s work', what: 'Start a named session' },
      { cmd: 'tmux ls', what: 'List sessions' },
      { cmd: 'tmux attach -t work', what: 'Reattach after a disconnect' },
      { cmd: 'Ctrl-b %', what: 'Split the window vertically' },
    ],
  },
  {
    slug: 'fzf',
    name: 'fzf',
    category: 'shell',
    tagline: 'Fuzzy-find anything from a list, interactively.',
    about:
      'Pipe a list into it and pick one with a few keystrokes. Works on files, history, branches, processes — anything printable.',
    developer: 'Junegunn Choi',
    license: 'MIT',
    url: 'https://github.com/junegunn/fzf',
    mono: 'fz',
    install: 'pkg install fzf',
    commands: [
      { cmd: 'fzf', what: 'Pick from piped input' },
      { cmd: 'history | fzf', what: 'Search your command history' },
      { cmd: 'Ctrl-r', what: 'Recall a command fuzzily (once bound)' },
    ],
  },

  /* ── process ───────────────────────────────────────────────────────────── */
  {
    slug: 'procps',
    name: 'ps and friends',
    category: 'process',
    tagline: 'List running processes and signal them.',
    about:
      'The procps-ng suite: ps for a snapshot, top for a live view, and kill for sending signals. On a phone, ps aux is a quick privacy check.',
    developer: 'procps-ng project',
    license: 'GPL-2.0',
    url: 'https://gitlab.com/procps-ng/procps',
    mono: 'ps',
    install: 'pkg install procps',
    commands: [
      { cmd: 'ps aux', what: 'Every process with its full command line' },
      { cmd: 'ps -ef | grep ssh', what: 'Find a specific process' },
      { cmd: 'kill 1234', what: 'Ask a process to stop (SIGTERM)' },
      { cmd: 'kill -9 1234', what: 'Force it (SIGKILL)' },
    ],
  },
  {
    slug: 'htop',
    name: 'htop',
    category: 'process',
    tagline: 'An interactive process viewer with colour and a load meter.',
    about:
      'A friendlier top: scroll the process list, sort by memory or CPU, and kill without leaving the screen.',
    developer: 'Hisham Muhammad and the htop team',
    license: 'GPL-2.0',
    url: 'https://htop.dev/',
    logo: 'htop',
    install: 'pkg install htop',
    commands: [
      { cmd: 'htop', what: 'Open the viewer' },
      { cmd: 'F6', what: 'Choose the sort column' },
      { cmd: 'F9', what: 'Send a signal to the selected process' },
    ],
  },
  {
    slug: 'btop',
    name: 'btop',
    category: 'process',
    tagline: 'A modern resource monitor for CPU, memory, disk and network.',
    about:
      'Graphs in the terminal. Useful on a phone for watching memory pressure and battery-hungry processes.',
    developer: 'aristocratos',
    license: 'Apache-2.0',
    url: 'https://github.com/aristocratos/btop',
    mono: 'bt',
    install: 'pkg install btop',
    commands: [
      { cmd: 'btop', what: 'Open the monitor' },
      { cmd: 'btop --utf-force', what: 'Force box-drawing characters' },
      { cmd: 'Esc', what: 'Leave the monitor' },
    ],
  },
  {
    slug: 'strace',
    name: 'strace',
    category: 'process',
    tagline: 'Watch the system calls a program makes.',
    about:
      'Shows every file it opens, every network call, and where it fails. The tool you reach for when something exits with no explanation.',
    developer: 'Dmitry Levin and contributors',
    license: 'LGPL-2.1',
    url: 'https://strace.io/',
    mono: 'st',
    install: 'pkg install strace',
    commands: [
      { cmd: 'strace ./program', what: 'Trace a command' },
      { cmd: 'strace -e openat ./program', what: 'Only file opens' },
      { cmd: 'strace -p 1234', what: 'Attach to a running process' },
      { cmd: 'strace -c ./program', what: 'Summarise by call' },
    ],
  },

  /* ── network ───────────────────────────────────────────────────────────── */
  {
    slug: 'nmap',
    name: 'Nmap',
    category: 'network',
    tagline: 'Discover hosts and see which ports they are listening on.',
    about:
      'The standard port scanner. Point it at a machine you own to learn what is exposed, and read the service banner it reports.',
    developer: 'Gordon Lyon (Fyodor) and the Nmap Project',
    license: 'Nmap Public Source License',
    url: 'https://nmap.org/',
    mono: 'nm',
    install: 'pkg install nmap',
    commands: [
      { cmd: 'nmap 192.168.1.1', what: 'Scan the common ports of one host' },
      { cmd: 'nmap -sV -p 22,80 host', what: 'Identify the service and version' },
      { cmd: 'nmap -sn 192.168.1.0/24', what: 'Ping sweep a subnet' },
    ],
  },
  {
    slug: 'tcpdump',
    name: 'tcpdump',
    category: 'network',
    tagline: 'Capture and print packets from the command line.',
    about:
      'The packet capture tool that needs no interface. Everything Wireshark shows on screen, tcpdump can print to your terminal.',
    developer: 'The Tcpdump Group',
    license: 'BSD-3-Clause',
    url: 'https://www.tcpdump.org/',
    mono: 'td',
    install: 'pkg install tcpdump',
    commands: [
      { cmd: 'tcpdump -i any -n', what: 'Capture without name lookups' },
      { cmd: 'tcpdump -i any port 53', what: 'Only DNS traffic' },
      { cmd: 'tcpdump -w out.pcap', what: 'Write a capture file' },
      { cmd: 'tcpdump -r out.pcap', what: 'Read one back' },
    ],
  },
  {
    slug: 'bind-utils',
    name: 'dig',
    category: 'network',
    tagline: 'Ask DNS questions and read the answers.',
    about:
      'Ships with BIND. dig shows the full answer, including the record type and the time to live, which is more than a browser ever tells you.',
    developer: 'Internet Systems Consortium',
    license: 'MPL-2.0',
    url: 'https://www.isc.org/bind/',
    mono: 'dg',
    install: 'pkg install dnsutils',
    commands: [
      { cmd: 'dig example.com A', what: 'Look up an address' },
      { cmd: 'dig +short example.com', what: 'Just the answer' },
      { cmd: 'dig example.com MX', what: 'Mail servers for a domain' },
      { cmd: 'dig -x 93.184.216.34', what: 'Reverse lookup' },
    ],
  },
  {
    slug: 'iproute2',
    name: 'ip',
    category: 'network',
    tagline: 'Show and change interfaces, addresses and routes.',
    about:
      'The modern replacement for ifconfig and route. One command, with an object first: ip addr, ip route, ip link.',
    developer: 'Stephen Hemminger and the iproute2 project',
    license: 'GPL-2.0',
    url: 'https://wiki.linuxfoundation.org/networking/iproute2',
    mono: 'ip',
    install: 'pkg install iproute2',
    commands: [
      { cmd: 'ip addr', what: 'List interfaces and their addresses' },
      { cmd: 'ip route', what: 'Show the routing table' },
      { cmd: 'ip link', what: 'Interface state and MAC addresses' },
    ],
  },
  {
    slug: 'iputils',
    name: 'ping',
    category: 'network',
    tagline: 'Test whether a host answers, and how quickly.',
    about:
      'Sends a small packet and waits for a reply. The first thing to try when something "does not work".',
    developer: 'The iputils project',
    license: 'GPL-2.0',
    url: 'https://github.com/iputils/iputils',
    mono: 'pi',
    install: 'pkg install iputils',
    commands: [
      { cmd: 'ping -c 4 1.1.1.1', what: 'Send four packets and stop' },
      { cmd: 'ping -i 0.2 host', what: 'Send every 0.2 seconds' },
      { cmd: 'ping6 host', what: 'Use IPv6' },
    ],
  },
  {
    slug: 'traceroute',
    name: 'traceroute',
    category: 'network',
    tagline: 'Show every hop a packet takes to reach a host.',
    about:
      'Reveals where the path slows down or stops. Useful for telling "the internet is down" apart from "that one host is down".',
    developer: 'Dmitry Butskoy and contributors',
    license: 'GPL-2.0',
    url: 'https://traceroute.sourceforge.net/',
    mono: 'tc',
    install: 'pkg install traceroute',
    commands: [
      { cmd: 'traceroute example.com', what: 'Trace the path' },
      { cmd: 'traceroute -n host', what: 'Skip name resolution' },
      { cmd: 'traceroute -m 5 host', what: 'Stop after five hops' },
    ],
  },

  /* ── transfer ──────────────────────────────────────────────────────────── */
  {
    slug: 'curl',
    name: 'curl',
    category: 'transfer',
    tagline: 'Make an HTTP request and print the reply.',
    about:
      'The Swiss army knife of transferring data by URL, supporting dozens of protocols. With -i you see the response headers, not just the body.',
    developer: 'Daniel Stenberg and the curl project',
    license: 'curl licence (MIT-like)',
    url: 'https://curl.se/',
    logo: 'curl',
    bin: 'curl',
    install: 'pkg install curl',
    commands: [
      { args: '-i', what: 'Show the status line and headers, then the body' },
      { args: '-I', what: 'Ask for the headers only' },
      { args: '-o file', what: 'Save the body to a file' },
      { args: '-H "Accept: application/json"', what: 'Send a request header' },
    ],
  },
  {
    slug: 'wget',
    name: 'wget',
    category: 'transfer',
    tagline: 'Download files, following redirects, resuming on failure.',
    about:
      'Built for downloading rather than for scripting requests. Its -c flag resumes an interrupted download, which matters on mobile data.',
    developer: 'GNU Project',
    license: 'GPL-3.0',
    url: 'https://www.gnu.org/software/wget/',
    mono: 'wg',
    bin: 'wget',
    install: 'pkg install wget',
    commands: [
      { args: '', what: 'Download a file from a URL' },
      { args: '-c', what: 'Continue an interrupted download' },
      { args: '-O name', what: 'Save under a chosen name' },
      { args: '-r -l 1', what: 'Mirror one level deep' },
    ],
  },
  {
    slug: 'aria2',
    name: 'aria2',
    category: 'transfer',
    tagline: 'Download from several connections or mirrors at once.',
    about:
      'A lightweight downloader that splits a file across multiple connections, and can pull a torrent while it is still downloading.',
    developer: 'Tatsuhiro Tsujikawa',
    license: 'GPL-2.0',
    url: 'https://aria2.github.io/',
    mono: 'ar',
    install: 'pkg install aria2',
    commands: [
      { cmd: 'aria2c URL', what: 'Download with multiple connections' },
      { cmd: 'aria2c -x 8 -s 8 URL', what: 'Set connections and splits' },
      { cmd: 'aria2c -i urls.txt', what: 'Download a list of URLs' },
    ],
  },
  {
    slug: 'openssh',
    name: 'OpenSSH',
    category: 'transfer',
    tagline: 'Encrypted remote shells and file copies.',
    about:
      'The ssh, scp, sftp and ssh-keygen suite. On Termux it also runs the server side, so your phone can be the host on port 8022.',
    developer: 'The OpenBSD Project',
    license: 'BSD-style',
    url: 'https://www.openssh.com/',
    mono: 'ss',
    install: 'pkg install openssh',
    commands: [
      { cmd: 'ssh user@host', what: 'Open a remote shell' },
      { cmd: 'ssh-keygen -t ed25519', what: 'Create a key pair' },
      { cmd: 'scp file user@host:~', what: 'Copy a file to a host' },
      { cmd: 'sshd', what: 'Start the server on this device' },
    ],
  },
  {
    slug: 'rclone',
    name: 'rclone',
    category: 'transfer',
    tagline: 'Sync files with cloud storage from the terminal.',
    about:
      'Speaks to dozens of storage backends and mounts them like a filesystem. Useful for pushing a phone backup somewhere off-device.',
    developer: 'Nick Craig-Wood and the rclone project',
    license: 'MIT',
    url: 'https://rclone.org/',
    logo: 'rclone',
    install: 'pkg install rclone',
    commands: [
      { cmd: 'rclone config', what: 'Set up a remote' },
      { cmd: 'rclone ls remote:path', what: 'List what is there' },
      { cmd: 'rclone sync src remote:path', what: 'Make the remote match the source' },
      { cmd: 'rclone copy -P src remote:path', what: 'Copy with live progress' },
    ],
  },

  /* ── security ──────────────────────────────────────────────────────────── */
  {
    slug: 'openssl',
    name: 'OpenSSL',
    category: 'security',
    tagline: 'Keys, certificates, hashes and encryption, by hand.',
    about:
      'The toolkit behind TLS. From the shell you use it to generate keys, inspect a certificate, and encrypt a file with a passphrase.',
    developer: 'The OpenSSL Project',
    license: 'Apache-2.0',
    url: 'https://www.openssl.org/',
    logo: 'openssl',
    install: 'pkg install openssl',
    commands: [
      { cmd: 'openssl rand -base64 24', what: 'Generate a random secret' },
      { cmd: 'openssl dgst -sha256 file', what: 'Hash a file' },
      { cmd: 'openssl enc -aes-256-cbc -in f -out f.enc', what: 'Encrypt with a passphrase' },
      { cmd: 'openssl x509 -in cert.pem -text -noout', what: 'Read a certificate' },
    ],
  },
  {
    slug: 'gnupg',
    name: 'GnuPG',
    category: 'security',
    tagline: 'Public-key encryption and signing from the shell.',
    about:
      'The gpg command. Encrypt a file so only one recipient can read it, or verify that a download really came from who it claims.',
    developer: 'Werner Koch and the GnuPG project',
    license: 'GPL-3.0',
    url: 'https://gnupg.org/',
    logo: 'gnuprivacyguard',
    install: 'pkg install gnupg',
    commands: [
      { cmd: 'gpg --gen-key', what: 'Create a key pair' },
      { cmd: 'gpg --list-keys', what: 'List public keys you hold' },
      { cmd: 'gpg -e -r alice file', what: 'Encrypt for one recipient' },
      { cmd: 'gpg --verify file.sig file', what: 'Check a signature' },
    ],
  },
  {
    slug: 'hashcat',
    name: 'Hashcat',
    category: 'security',
    tagline: 'Recover passwords from hashes, using your own hardware.',
    about:
      'The fastest password recovery tool available. It exists to test how well your own passwords hold up against a hash dump.',
    developer: 'Jens Steube (atom) and the Hashcat team',
    license: 'MIT',
    url: 'https://hashcat.net/hashcat/',
    logo: 'hashcat',
    install: 'pkg install hashcat',
    commands: [
      { cmd: 'hashcat --example-hashes', what: 'List supported hash types' },
      { cmd: 'hashcat -m 0 hash.txt words.txt', what: 'Try a wordlist against MD5' },
      { cmd: 'hashcat -b', what: 'Benchmark this device' },
    ],
  },
  {
    slug: 'john',
    name: 'John the Ripper',
    category: 'security',
    tagline: 'A classic password cracker with many hash formats.',
    about:
      'Older than Hashcat and friendlier on CPU-only machines. It can also detect the hash format for you, which is handy on a phone.',
    developer: 'Openwall Project',
    license: 'GPL-2.0',
    url: 'https://www.openwall.com/john/',
    mono: 'jo',
    install: 'pkg install john',
    commands: [
      { cmd: 'john hashes.txt', what: 'Detect the format and start' },
      { cmd: 'john --wordlist=words.txt hashes.txt', what: 'Use a wordlist' },
      { cmd: 'john --show hashes.txt', what: 'Show what it recovered' },
    ],
  },
  {
    slug: 'burpsuite',
    name: 'Burp Suite',
    category: 'security',
    tagline: 'Intercept and edit web requests between browser and server.',
    about:
      'A proxy that sits in the middle of an HTTP conversation so you can see and change what is sent. The Community edition is free; use it only on systems you are authorised to test.',
    developer: 'PortSwigger',
    license: 'Proprietary (free Community edition)',
    url: 'https://portswigger.net/burp',
    logo: 'burpsuite',
    mono: 'bu',
    commands: [
      { cmd: 'Proxy > Intercept is on', what: 'Pause each request for inspection' },
      { cmd: 'Proxy > HTTP history', what: 'Review everything already sent' },
      { cmd: 'Repeater', what: 'Resend a request with edits' },
    ],
  },
  {
    slug: 'wireguard',
    name: 'WireGuard',
    category: 'security',
    tagline: 'A small, fast VPN tunnel built into modern kernels.',
    about:
      'Creates an encrypted tunnel to a server you control. On a public network it moves your traffic out of reach of the local network.',
    developer: 'Jason A. Donenfeld',
    license: 'GPL-2.0',
    url: 'https://www.wireguard.com/',
    logo: 'wireguard',
    install: 'Requires root on Android',
    commands: [
      { cmd: 'wg-quick up wg0', what: 'Bring a tunnel up' },
      { cmd: 'wg show', what: 'Show the current peers' },
      { cmd: 'wg-quick down wg0', what: 'Take it down' },
    ],
  },

  /* ── forensics ─────────────────────────────────────────────────────────── */
  {
    slug: 'wireshark',
    name: 'Wireshark and tshark',
    category: 'forensics',
    tagline: 'Read a packet capture in depth.',
    about:
      'Wireshark is the graphical analyser; tshark is the same engine in the terminal. Together with tcpdump they answer "what actually went over the wire".',
    developer: 'The Wireshark Foundation',
    license: 'GPL-2.0',
    url: 'https://www.wireshark.org/',
    logo: 'wireshark',
    install: 'pkg install tshark',
    commands: [
      { cmd: 'tshark -r capture.pcap', what: 'Summarise a capture file' },
      { cmd: 'tshark -r capture.pcap -Y http', what: 'Filter to HTTP' },
      { cmd: 'tshark -r capture.pcap -T fields -e ip.src', what: 'Print chosen fields' },
    ],
  },
  {
    slug: 'binwalk',
    name: 'binwalk',
    category: 'forensics',
    tagline: 'Find embedded files inside a binary.',
    about:
      'Scans for known signatures and reports the archives, filesystems and compressed blocks hidden inside firmware or an image.',
    developer: 'Craig Heffner and ReFirmLabs',
    license: 'MIT',
    url: 'https://github.com/ReFirmLabs/binwalk',
    mono: 'bw',
    install: 'pkg install binwalk',
    commands: [
      { cmd: 'binwalk firmware.bin', what: 'Scan for signatures' },
      { cmd: 'binwalk -e firmware.bin', what: 'Extract what it finds' },
      { cmd: 'binwalk -A file', what: 'Look for executable code' },
    ],
  },
  {
    slug: 'exiftool',
    name: 'ExifTool',
    category: 'forensics',
    tagline: 'Read and strip the metadata hidden in a photo.',
    about:
      'Every phone photo carries GPS coordinates, a timestamp and a device model. ExifTool shows all of it, and can remove it before you share the file.',
    developer: 'Phil Harvey',
    license: 'Perl Artistic / GPL',
    url: 'https://exiftool.org/',
    mono: 'ex',
    install: 'pkg install exiftool',
    commands: [
      { cmd: 'exiftool photo.jpg', what: 'Show all metadata' },
      { cmd: 'exiftool -gps:all photo.jpg', what: 'Show location only' },
      { cmd: 'exiftool -all= photo.jpg', what: 'Strip every tag' },
    ],
  },
  {
    slug: 'radare2',
    name: 'radare2',
    category: 'forensics',
    tagline: 'Disassemble and inspect a binary.',
    about:
      'A reversing framework with a command language of its own. Start by looking at strings and headers before you disassemble anything.',
    developer: 'pancake and the radare2 contributors',
    license: 'LGPL-3.0',
    url: 'https://rada.re/n/',
    mono: 'r2',
    install: 'pkg install radare2',
    commands: [
      { cmd: 'r2 ./binary', what: 'Open a file' },
      { cmd: 'aaa', what: 'Analyse everything' },
      { cmd: 'iz', what: 'List strings in the data section' },
      { cmd: 'pdf @ main', what: 'Disassemble a function' },
    ],
  },
  {
    slug: 'ghidra',
    name: 'Ghidra',
    category: 'forensics',
    tagline: 'Decompile binaries back into readable code.',
    about:
      'A reversing suite released by the NSA, with a decompiler that turns assembly into something close to C. Runs on a desktop, not on the phone.',
    developer: 'National Security Agency (NSA)',
    license: 'Apache-2.0',
    url: 'https://ghidra-sre.org/',
    mono: 'gh',
    commands: [
      { cmd: 'New Project > Import File', what: 'Load a binary' },
      { cmd: 'Analyze > Auto Analyze', what: 'Run the analysis passes' },
      { cmd: 'Window > Decompile', what: 'Read the pseudo-C output' },
    ],
  },

  /* ── packages ──────────────────────────────────────────────────────────── */
  {
    slug: 'pkg',
    name: 'pkg (Termux)',
    category: 'packages',
    tagline: 'Install software into Termux.',
    about:
      'A thin wrapper over apt that points at the Termux repositories. Everything else in this directory arrives through it.',
    developer: 'The Termux project',
    license: 'GPL-3.0 (wrapper)',
    url: 'https://github.com/termux/termux-packages',
    mono: 'pk',
    install: 'Included with Termux',
    commands: [
      { cmd: 'pkg update', what: 'Refresh the package index' },
      { cmd: 'pkg install nmap', what: 'Install a package' },
      { cmd: 'pkg list-installed', what: 'See what is installed' },
      { cmd: 'pkg search json', what: 'Search the repositories' },
    ],
  },
  {
    slug: 'apt',
    name: 'apt',
    category: 'packages',
    tagline: 'The Debian package manager that pkg sits on.',
    about:
      'Resolves dependencies, upgrades and removes packages. On Termux you can use it directly when you need an option pkg does not expose.',
    developer: 'The Debian Project',
    license: 'GPL-2.0',
    url: 'https://wiki.debian.org/Apt',
    mono: 'ap',
    install: 'Included with Termux',
    commands: [
      { cmd: 'apt update', what: 'Refresh the index' },
      { cmd: 'apt install git', what: 'Install a package' },
      { cmd: 'apt remove git', what: 'Remove it' },
      { cmd: 'apt list --upgradable', what: 'See what can be updated' },
    ],
  },
  {
    slug: 'dpkg',
    name: 'dpkg',
    category: 'packages',
    tagline: 'Inspect the low-level package database.',
    about:
      'apt talks to dpkg, which owns the actual .deb files. dpkg -L is the quickest way to see what files a package put on disk.',
    developer: 'The Debian Project',
    license: 'GPL-2.0',
    url: 'https://wiki.debian.org/dpkg',
    mono: 'dp',
    install: 'Included with Termux',
    commands: [
      { cmd: 'dpkg -l', what: 'List installed packages' },
      { cmd: 'dpkg -L nmap', what: 'List the files a package installed' },
      { cmd: 'dpkg -S /usr/bin/nmap', what: 'Which package owns a file' },
    ],
  },

  /* ── dev ───────────────────────────────────────────────────────────────── */
  {
    slug: 'git',
    name: 'Git',
    category: 'dev',
    tagline: 'Track changes to files and share them.',
    about:
      'Distributed version control. On a phone it is how you clone a project, keep your own notes under version control, and push a site like this one.',
    developer: 'Linus Torvalds and the Git community',
    license: 'GPL-2.0',
    url: 'https://git-scm.com/',
    logo: 'git',
    install: 'pkg install git',
    commands: [
      { cmd: 'git clone URL', what: 'Copy a repository' },
      { cmd: 'git status', what: 'See what changed' },
      { cmd: 'git add -A && git commit -m "msg"', what: 'Stage and record' },
      { cmd: 'git log --oneline -10', what: 'Read recent history' },
    ],
  },
  {
    slug: 'python',
    name: 'Python',
    category: 'dev',
    tagline: 'A general-purpose language that ships with Termux.',
    about:
      'Readable, batteries-included, and the language most security tooling is written in. Termux already has it, so a script is always one command away.',
    developer: 'Guido van Rossum and the Python Software Foundation',
    license: 'PSF-2.0',
    url: 'https://www.python.org/',
    logo: 'python',
    bin: 'python',
    install: 'pkg install python',
    commands: [
      { args: '--version', what: 'Check which interpreter is installed' },
      { args: '-m json.tool', what: 'Reformat JSON piped into it' },
      { args: '-m http.server', what: 'Serve the current directory over HTTP' },
      { args: 'script.py', what: 'Run a file' },
    ],
  },
  {
    slug: 'nodejs',
    name: 'Node.js',
    category: 'dev',
    tagline: 'Run JavaScript outside a browser.',
    about:
      'A JavaScript runtime with an enormous package ecosystem. Handy for quick scripts and for building static sites.',
    developer: 'Ryan Dahl, now the OpenJS Foundation',
    license: 'MIT',
    url: 'https://nodejs.org/',
    logo: 'nodedotjs',
    install: 'pkg install nodejs',
    commands: [
      { cmd: 'node --version', what: 'Check the runtime' },
      { cmd: 'node script.js', what: 'Run a file' },
      { cmd: 'node -e "console.log(process.arch)"', what: 'Run an expression' },
    ],
  },
  {
    slug: 'npm',
    name: 'npm',
    category: 'dev',
    tagline: 'Install and manage JavaScript packages.',
    about:
      'The package manager that comes with Node. It reads package.json, resolves the tree, and records exact versions in a lockfile.',
    developer: 'npm, Inc. (GitHub) and contributors',
    license: 'Artistic-2.0',
    url: 'https://www.npmjs.com/',
    logo: 'npm',
    install: 'pkg install nodejs',
    commands: [
      { cmd: 'npm install', what: 'Install from package.json' },
      { cmd: 'npm run build', what: 'Run a script defined in package.json' },
      { cmd: 'npm outdated', what: 'List packages with newer versions' },
    ],
  },
  {
    slug: 'pip',
    name: 'pip',
    category: 'dev',
    tagline: 'Install Python packages.',
    about:
      'The standard Python package installer. Prefer installing into a virtual environment so system packages stay untouched.',
    developer: 'The Python Packaging Authority',
    license: 'MIT',
    url: 'https://pip.pypa.io/',
    mono: 'pp',
    install: 'pkg install python-pip',
    commands: [
      { cmd: 'pip install requests', what: 'Install a package' },
      { cmd: 'pip list', what: 'List what is installed' },
      { cmd: 'pip install --upgrade pip', what: 'Update pip itself' },
      { cmd: 'pip freeze > requirements.txt', what: 'Record exact versions' },
    ],
  },
  {
    slug: 'gcc',
    name: 'GCC and Clang',
    category: 'dev',
    tagline: 'Compile C and C++ on the device.',
    about:
      'Termux ships a full toolchain, so you can compile a small C program or build a package from source without a desktop.',
    developer: 'GNU Project (GCC); LLVM Project (Clang)',
    license: 'GPL-3.0 (GCC); Apache-2.0 (Clang)',
    url: 'https://gcc.gnu.org/',
    mono: 'cc',
    install: 'pkg install clang',
    commands: [
      { cmd: 'clang -o hello hello.c', what: 'Compile to an executable' },
      { cmd: 'clang -Wall -Wextra -o hello hello.c', what: 'Compile with warnings' },
      { cmd: './hello', what: 'Run the result' },
    ],
  },

  /* ── editors ───────────────────────────────────────────────────────────── */
  {
    slug: 'vim',
    name: 'Vim',
    category: 'editors',
    tagline: 'A modal editor that is on every Unix machine.',
    about:
      'You press i to insert, Esc to stop inserting, and :wq to save and quit. The muscle memory transfers to any server you ever log into.',
    developer: 'Bram Moolenaar and the Vim community',
    license: 'Vim licence (GPL-compatible)',
    url: 'https://www.vim.org/',
    logo: 'vim',
    install: 'pkg install vim',
    commands: [
      { cmd: 'vim file.txt', what: 'Open a file' },
      { cmd: ':wq', what: 'Save and quit' },
      { cmd: ':q!', what: 'Quit without saving' },
      { cmd: '/word', what: 'Search inside the file' },
    ],
  },
  {
    slug: 'neovim',
    name: 'Neovim',
    category: 'editors',
    tagline: 'A modern rebuild of Vim with Lua configuration.',
    about:
      'Same editing model, better defaults, asynchronous plugins and a built-in language server client. The usual choice if you want an editor you configure once.',
    developer: 'Thiago de Arruda and the Neovim contributors',
    license: 'Apache-2.0',
    url: 'https://neovim.io/',
    logo: 'neovim',
    install: 'pkg install neovim',
    commands: [
      { cmd: 'nvim file.txt', what: 'Open a file' },
      { cmd: ':checkhealth', what: 'Check the install is complete' },
      { cmd: ':Lazy', what: 'Manage plugins (with lazy.nvim)' },
    ],
  },
  {
    slug: 'nano',
    name: 'Nano',
    category: 'editors',
    tagline: 'A plain editor that lists its shortcuts on screen.',
    about:
      'No modes, no configuration. If you need to change one line in a config file right now, this is the fastest route.',
    developer: 'Chris Allegretta and the GNU Project',
    license: 'GPL-3.0',
    url: 'https://www.nano-editor.org/',
    mono: 'na',
    install: 'pkg install nano',
    commands: [
      { cmd: 'nano file.txt', what: 'Open a file' },
      { cmd: 'Ctrl-O', what: 'Write the file out' },
      { cmd: 'Ctrl-X', what: 'Exit' },
      { cmd: 'Ctrl-W', what: 'Search' },
    ],
  },
  {
    slug: 'micro',
    name: 'Micro',
    category: 'editors',
    tagline: 'A terminal editor with the shortcuts you already know.',
    about:
      'Ctrl-S saves and Ctrl-Q quits, like a desktop editor, with syntax highlighting and mouse support. The easiest step up from nano.',
    developer: 'Zachary Yedidia',
    license: 'MIT',
    url: 'https://micro-editor.github.io/',
    mono: 'mi',
    install: 'pkg install micro',
    commands: [
      { cmd: 'micro file.txt', what: 'Open a file' },
      { cmd: 'Ctrl-S', what: 'Save' },
      { cmd: 'Ctrl-Q', what: 'Quit' },
    ],
  },

  /* ── media ─────────────────────────────────────────────────────────────── */
  {
    slug: 'ffmpeg',
    name: 'FFmpeg',
    category: 'media',
    tagline: 'Convert, trim and compress audio and video.',
    about:
      'The tool every other media app is built on. It reads almost any format and writes almost any other one.',
    developer: 'Fabrice Bellard, Michael Niedermayer and the FFmpeg team',
    license: 'LGPL-2.1 / GPL-2.0',
    url: 'https://ffmpeg.org/',
    logo: 'ffmpeg',
    install: 'pkg install ffmpeg',
    commands: [
      { cmd: 'ffmpeg -i in.mp4 out.mkv', what: 'Change container' },
      { cmd: 'ffmpeg -i in.mp4 -ss 00:01:00 -t 30 out.mp4', what: 'Cut 30 seconds from 1:00' },
      { cmd: 'ffmpeg -i in.wav -b:a 128k out.mp3', what: 'Convert audio and set bitrate' },
      { cmd: 'ffmpeg -i in.mp4 -vf scale=720:-1 out.mp4', what: 'Resize the video' },
    ],
  },
  {
    slug: 'imagemagick',
    name: 'ImageMagick',
    category: 'media',
    tagline: 'Resize, crop and convert images in a batch.',
    about:
      'The convert and magick commands handle over a hundred image formats. Ideal for making a folder of screenshots a sensible size.',
    developer: 'ImageMagick Studio LLC',
    license: 'ImageMagick licence (Apache-style)',
    url: 'https://imagemagick.org/',
    mono: 'im',
    install: 'pkg install imagemagick',
    commands: [
      { cmd: 'magick in.png out.jpg', what: 'Convert between formats' },
      { cmd: 'magick in.jpg -resize 50% small.jpg', what: 'Halve the dimensions' },
      { cmd: 'magick in.jpg -strip out.jpg', what: 'Remove metadata' },
      { cmd: 'magick montage *.png grid.jpg', what: 'Build a contact sheet' },
    ],
  },
  {
    slug: 'pandoc',
    name: 'Pandoc',
    category: 'media',
    tagline: 'Convert between document formats.',
    about:
      'Markdown to PDF, HTML to Word, anything to anything. It is the standard tool for turning plain text into a finished document.',
    developer: 'John MacFarlane',
    license: 'GPL-2.0',
    url: 'https://pandoc.org/',
    logo: 'pandoc',
    install: 'pkg install pandoc',
    commands: [
      { cmd: 'pandoc in.md -o out.pdf', what: 'Markdown to PDF' },
      { cmd: 'pandoc in.md -o out.html', what: 'Markdown to a web page' },
      { cmd: 'pandoc in.md -t plain', what: 'Strip the markup' },
    ],
  },
  {
    slug: 'tesseract',
    name: 'Tesseract',
    category: 'media',
    tagline: 'Turn an image of text into actual text.',
    about:
      'Optical character recognition, trained on over a hundred languages. Point it at a screenshot or a photo of a page and get selectable text back.',
    developer: 'Ray Smith, now maintained by the community (originally HP, then Google)',
    license: 'Apache-2.0',
    url: 'https://github.com/tesseract-ocr/tesseract',
    mono: 'te',
    install: 'pkg install tesseract',
    commands: [
      { cmd: 'tesseract image.png out', what: 'Write recognised text to out.txt' },
      { cmd: 'tesseract image.png out -l eng', what: 'Choose the language' },
      { cmd: 'tesseract image.png stdout', what: 'Print instead of writing a file' },
    ],
  },

  /* ── monitor ───────────────────────────────────────────────────────────── */
  {
    slug: 'ncdu',
    name: 'ncdu',
    category: 'monitor',
    tagline: 'Find what is eating your storage, interactively.',
    about:
      'Walks a directory and shows sizes you can drill into with the arrow keys. The quickest answer to "why is my phone full".',
    developer: 'Yoran Heling',
    license: 'MIT',
    url: 'https://dev.yorhel.nl/ncdu',
    mono: 'nc',
    install: 'pkg install ncdu',
    commands: [
      { cmd: 'ncdu', what: 'Scan the current directory' },
      { cmd: 'ncdu /sdcard', what: 'Scan shared storage' },
      { cmd: 'ncdu -x ~', what: 'Stay on one filesystem' },
    ],
  },
  {
    slug: 'lsof',
    name: 'lsof',
    category: 'monitor',
    tagline: 'List the files and sockets a process has open.',
    about:
      'Answers "what is holding this file" and "what is listening on this port". Especially useful when something will not unmount or stop.',
    developer: 'Victor A. Abell and the lsof project',
    license: 'BSD-style',
    url: 'https://github.com/lsof-org/lsof',
    mono: 'lo',
    install: 'pkg install lsof',
    commands: [
      { cmd: 'lsof -i', what: 'List network connections' },
      { cmd: 'lsof -i :8022', what: 'What is using one port' },
      { cmd: 'lsof /path/to/file', what: 'Which process holds a file' },
    ],
  },
  {
    slug: 'fastfetch',
    name: 'fastfetch',
    category: 'monitor',
    tagline: 'Print a summary of your system at a glance.',
    about:
      'Device, kernel, shell, uptime and memory in one compact panel. It is the first thing many people put in their shell profile.',
    developer: 'Linus Dierheimer and the fastfetch community',
    license: 'MIT',
    url: 'https://github.com/fastfetch-cli/fastfetch',
    mono: 'ff',
    install: 'pkg install fastfetch',
    commands: [
      { cmd: 'fastfetch', what: 'Print the summary' },
      { cmd: 'fastfetch --logo none', what: 'Skip the ASCII art' },
      { cmd: 'fastfetch -s Memory', what: 'Show one section only' },
    ],
  },
  {
    slug: 'chafa',
    name: 'chafa',
    category: 'monitor',
    tagline: 'Show an image in the terminal using text characters.',
    about:
      'Renders pictures with Unicode blocks and colour, so you can check an image without leaving the shell or opening a viewer.',
    developer: 'Hans Petter Jansson',
    license: 'LGPL-3.0',
    url: 'https://hpjansson.org/chafa/',
    mono: 'ch',
    install: 'pkg install chafa',
    commands: [
      { cmd: 'chafa image.png', what: 'Render an image' },
      { cmd: 'chafa -s 60x30 image.png', what: 'Choose the output size' },
      { cmd: 'chafa --symbols block image.png', what: 'Use solid blocks' },
    ],
  },
];

export function toolsByCategory(): { category: ToolCategory; items: Tool[] }[] {
  return toolCategories
    .map((category) => ({ category, items: tools.filter((t) => t.category === category.id) }))
    .filter((g) => g.items.length > 0);
}

export function toolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function categoryById(id: CategoryId): ToolCategory | undefined {
  return toolCategories.find((c) => c.id === id);
}
