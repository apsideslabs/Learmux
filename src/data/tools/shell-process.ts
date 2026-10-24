import type { Tool } from './types';

export const shellProcessTools: Tool[] = [
  {
    slug: 'bash',
    name: 'Bash',
    category: 'shell',
    tagline: 'The default login shell on Termux and most Linux systems',
    about:
      'Bash is the Bourne Again Shell, the command interpreter you land in when you open a terminal. It reads your commands, runs them, and connects them together with pipes and redirection. Reach for it whenever you need a script that behaves the same way on almost any Linux box.',
    developer: 'Free Software Foundation',
    license: 'GPL-3.0-or-later',
    url: 'https://www.gnu.org/software/bash/',
    bin: 'bash',
    install: 'Included with Termux',
    glyph: 'terminal',
    commands: [
      {
        args: 'script.sh',
        what: 'Run a saved script file in a fresh shell, which is how you test automation before trusting it on important files',
      },
      {
        args: '-c "ls | wc -l"',
        what: 'Run a short command string directly without opening an interactive session, which is handy inside other scripts and one-off checks',
      },
      {
        args: '-n script.sh',
        what: 'Parse a script and report syntax errors without executing anything, so you can catch typos safely',
      },
      {
        args: '-x script.sh',
        what: 'Trace every command as it runs by printing each line before it executes, the fastest way to find where a script goes wrong',
      },
      {
        args: '--version',
        what: 'Print the shell version so you know which features are available on this device',
      },
    ],
    example: {
      args: 'deploy.sh',
      out: `Building assets
Uploading 3 files
Deploy finished in 2.4s`,
    },
  },
  {
    slug: 'zsh',
    name: 'Zsh',
    category: 'shell',
    tagline: 'A powerful shell with spelling correction and rich tab completion',
    about:
      'Zsh is an extended Bourne-style shell that adds smarter completion, globbing and prompt customisation. Many people prefer it over Bash for interactive work because it guesses what you mean and lets you theme the prompt. On Termux you install it, then start it once to set up its files.',
    developer: 'Zsh Development Group',
    url: 'https://www.zsh.org/',
    bin: 'zsh',
    install: 'pkg install zsh',
    glyph: 'braces',
    commands: [
      {
        args: '',
        what: 'Start an interactive session in this shell; your current session stays untouched until you exit back to the parent shell',
      },
      {
        args: '-l',
        what: 'Start as a login shell so it reads your profile files and sets up the environment the way a fresh terminal would',
      },
      {
        args: '-f',
        what: 'Start without reading any startup files, which isolates a problem to your configuration rather than the shell itself',
      },
      {
        args: '-n setup',
        what: 'Check a script for syntax errors and exit without running a single line of it',
      },
      {
        args: '--version',
        what: 'Print the installed version so you can confirm which release and feature set you have',
      },
    ],
    example: {
      args: '-c "print -l a b c"',
      out: `a
b
c`,
    },
  },
  {
    slug: 'tmux',
    name: 'tmux',
    category: 'shell',
    tagline: 'Keep sessions alive and split one terminal into many panes',
    about:
      'tmux is a terminal multiplexer: it runs a session in the background so your work survives a dropped connection, and it lets you split the screen into windows and panes. It is the standard way to keep long jobs running on a phone you might close at any moment.',
    developer: 'Nicholas Marriott',
    license: 'ISC',
    url: 'https://github.com/tmux/tmux',
    bin: 'tmux',
    install: 'pkg install tmux',
    glyph: 'split',
    commands: [
      {
        args: 'new -s work',
        what: 'Create a named session so you can detach from it and reattach later without losing what was running',
      },
      {
        args: 'attach -t work',
        what: 'Reconnect to a session you detached from earlier, restoring every window and pane exactly as you left them',
      },
      {
        args: 'ls',
        what: 'List all running sessions with their names and how long they have been up, so you can pick the right one to rejoin',
      },
      {
        args: 'new-window -n logs',
        what: 'Add another window inside the current session and give it a name, keeping related work together but out of the way',
      },
      {
        args: 'split-window -h',
        what: 'Divide the current window into two side-by-side panes so you can watch output while typing in the other',
      },
      {
        args: 'kill-session -t work',
        what: 'End a session and everything running inside it once you are finished with that piece of work',
      },
    ],
    example: {
      args: 'ls',
      out: `work: 3 windows (created Sat Oct 24 09:12:03 2026) (attached)
build: 1 windows (created Sat Oct 24 10:40:11 2026)
logs: 2 windows (created Sat Oct 24 10:41:52 2026)`,
    },
  },
  {
    slug: 'screen',
    name: 'GNU Screen',
    category: 'shell',
    tagline: 'A veteran terminal multiplexer for detaching and resuming sessions',
    about:
      'GNU Screen was the original terminal multiplexer, letting you detach a session and come back to it later, even after logging out. It is lighter and more widely preinstalled than newer alternatives, so it is a dependable fallback. Use it to protect a long download or build from a flaky connection.',
    developer: 'GNU Project',
    license: 'GPL-3.0-or-later',
    url: 'https://www.gnu.org/software/screen/',
    bin: 'screen',
    install: 'pkg install screen',
    glyph: 'columns',
    commands: [
      {
        args: '-S build',
        what: 'Start a new named session so you can find and reattach to it by name later',
      },
      {
        args: '-r build',
        what: 'Reattach to a session that is still running in the background after you disconnected',
      },
      {
        args: '-ls',
        what: 'List the sessions that currently exist along with whether each one is attached or detached',
      },
      {
        args: '-d -r build',
        what: 'Force a detached session to reattach here, which rescues it when another terminal is stuck holding it open',
      },
      {
        args: '-dmS job build-all.sh',
        what: 'Start a session detached and run a command inside it, so the job keeps going after you close the terminal',
      },
    ],
  },
  {
    slug: 'zellij',
    name: 'Zellij',
    category: 'shell',
    tagline: 'A modern terminal workspace with built-in layouts and hints',
    about:
      'Zellij is a newer terminal multiplexer that shows its keybindings on screen and supports shareable layout files. It aims to be friendlier for newcomers than older tools while still handling panes, tabs and detaching. Try it if you like the idea of sessions but find the default keybindings hard to remember.',
    developer: 'Zellij contributors',
    license: 'MIT',
    url: 'https://zellij.dev/',
    bin: 'zellij',
    install: 'pkg install zellij',
    glyph: 'columns',
    commands: [
      {
        args: '',
        what: 'Start a new workspace with the default layout and an on-screen hint bar showing the keys you can press',
      },
      {
        args: '-s work',
        what: 'Give the new session a name so you can list and attach to it later',
      },
      {
        args: 'attach work',
        what: 'Rejoin a session you left running in the background, restoring its tabs and panes',
      },
      {
        args: 'list-sessions',
        what: 'Show every session currently alive with its name and how long it has existed',
      },
      {
        args: 'setup --check',
        what: 'Inspect the environment and report whether anything needed for full terminal support is missing',
      },
    ],
    example: {
      args: 'list-sessions',
      out: `work   [Created 12m ago]  (current)
build  [Created 2h ago]
scratch [Created 3d ago]`,
    },
  },
  {
    slug: 'byobu',
    name: 'Byobu',
    category: 'shell',
    tagline: 'Friendly wrappers and a status bar around a terminal multiplexer',
    about:
      'Byobu is a set of profiles and keybindings layered over a multiplexer such as tmux or screen, plus a status line showing load, battery and notifications. It is designed so the common actions are one keypress away. Use it if you want sessions and a useful status bar without learning every raw command.',
    developer: 'Dustin Kirkland',
    license: 'GPL-3.0-or-later',
    url: 'https://www.byobu.org/',
    bin: 'byobu',
    install: 'pkg install byobu',
    glyph: 'gauge',
    commands: [
      {
        args: '',
        what: 'Launch a new managed session with the status bar enabled at the bottom of the screen',
      },
      {
        args: 'new-session -s work',
        what: 'Start a named session so you can return to it by name later',
      },
      {
        args: 'attach -t work',
        what: 'Reattach to a session you detached earlier without recreating any of its windows',
      },
      {
        args: 'list-sessions',
        what: 'Show the sessions that exist so you can choose which one to rejoin',
      },
      {
        args: 'kill-session -t work',
        what: 'Close a named session and everything running inside it when that work is done',
      },
    ],
    example: {
      args: 'list-sessions',
      out: `work: 2 windows (created Sat Oct 24 09:12:03 2026) (attached)
build: 1 windows (created Sat Oct 24 10:40:11 2026)
logs: 3 windows (created Sat Oct 24 10:41:52 2026)`,
    },
  },
  {
    slug: 'fzf',
    name: 'fzf',
    category: 'shell',
    tagline: 'Interactive fuzzy finder you can pipe anything into',
    about:
      'fzf turns a list of lines into a searchable menu you can filter by typing. Pipe history, file names or any command output into it and pick a line interactively. It is the quickest way to add fuzzy selection to your own shell functions.',
    developer: 'Junegunn Choi',
    license: 'MIT',
    url: 'https://github.com/junegunn/fzf',
    bin: 'fzf',
    install: 'pkg install fzf',
    glyph: 'magnifier',
    commands: [
      {
        args: '',
        what: 'Read lines from standard input and let you filter them interactively; the chosen line is printed so it can be fed into the next command',
      },
      {
        args: '--height 40%',
        what: 'Open the picker in a panel instead of taking over the whole screen, so the surrounding context stays visible',
      },
      {
        args: '--multi',
        what: 'Allow selecting several lines at once with the tab key, which is useful when you want to act on a batch of files',
      },
      {
        args: '--preview "cat {}"',
        what: 'Show a live preview of the highlighted item beside the list so you can inspect it before choosing',
      },
      {
        args: '--bind ctrl-a:select-all',
        what: 'Add a custom key binding so one keystroke selects every entry in the current filtered list',
      },
    ],
    example: {
      args: '--multi',
      out: `/scratch/work/notes.txt
/scratch/work/todo.md
/scratch/work/draft.docx`,
    },
  },
  {
    slug: 'zoxide',
    name: 'Zoxide',
    category: 'shell',
    tagline: 'Jump to directories by typing part of their name',
    about:
      'Zoxide remembers the directories you visit and ranks them by how often and how recently you use them. Instead of typing a long path, you type a fragment and it takes you to the best match. Set it up once and navigation across a deep folder tree becomes a few keystrokes.',
    developer: "Ajeet D'Souza",
    license: 'MIT',
    url: 'https://github.com/ajeetdsouza/zoxide',
    bin: 'zoxide',
    install: 'pkg install zoxide',
    glyph: 'route',
    commands: [
      {
        args: 'init',
        what: 'Print the shell snippet that hooks the directory jumper into your session; you add it to your startup file once',
      },
      {
        args: 'add /sdcard/Download',
        what: 'Record a directory in the database manually so it is available to jump to even before you have visited it',
      },
      {
        args: 'query',
        what: 'List the directories that have been learned, ranked so you can see which one the jumper will pick first',
      },
      {
        args: 'query -l notes',
        what: 'Show every remembered directory whose path contains the given text, so you can pick the exact one',
      },
      {
        args: 'remove /sdcard/Download',
        what: 'Forget a directory that you no longer want suggested',
      },
    ],
    example: {
      args: 'query',
      out: `/sdcard/Download
/scratch/work
/data/data/com.termux/files/home`,
    },
  },
  {
    slug: 'tldr',
    name: 'tldr',
    category: 'shell',
    tagline: 'Community cheat sheets that show the common uses of a command',
    about:
      'tldr shows short, example-driven help pages for command-line tools, written by the community. Where a manual page lists every option, tldr gives you the handful of invocations people actually use. Reach for it when you have forgotten the common flags for something.',
    developer: 'tldr-pages contributors',
    url: 'https://tldr.sh/',
    bin: 'tldr',
    install: 'pkg install tldr',
    glyph: 'pager',
    commands: [
      {
        args: 'tar',
        what: 'Show the common uses of the tar archiver, including how to create and unpack archives',
      },
      {
        args: '-u tar',
        what: 'Update the cached pages from the community repository before reading, so you get the latest examples',
      },
      {
        args: '-l',
        what: 'List every page that is currently cached locally so you can see what is available offline',
      },
      {
        args: '-p',
        what: 'Render the page for the current platform only, hiding examples that do not apply to this system',
      },
      {
        args: '-L en tar',
        what: 'Read the page in a specific language when translations are available',
      },
    ],
    example: {
      args: 'df',
      out: `# df
> Gives an overview of the filesystem disk space usage.
- Display all filesystems and their disk usage:
  df
- Display usage in a human readable format:
  df -h`,
    },
  },
  {
    slug: 'ps',
    name: 'ps',
    category: 'process',
    tagline: 'List running processes with their resource use',
    about:
      'ps prints a snapshot of the processes on the system, showing their identifiers, owners and resource consumption. It is the go-to command for a quick, scriptable look at what is running right now. Unlike a live monitor it exits immediately, which makes it easy to pipe into other tools.',
    developer: 'procps-ng project',
    license: 'GPL-2.0-or-later',
    url: 'https://gitlab.com/procps-ng/procps',
    bin: 'ps',
    install: 'pkg install procps',
    glyph: 'list',
    commands: [
      {
        args: 'aux',
        what: 'Show every process on the system with its full command line and memory usage, the quickest way to spot something running that should not be',
      },
      {
        args: '-e',
        what: 'List all running processes on the machine, one per line, when you want a plain system-wide view',
      },
      {
        args: 'u 4321',
        what: 'Show detailed information for a single process identifier, including its owner and processor time',
      },
      {
        args: 'aux --sort=-%mem',
        what: 'Sort the full listing by memory so the heaviest consumers sit at the top',
      },
      {
        args: '-o pid,comm,%cpu,%mem',
        what: 'Choose exactly which columns appear, so the output stays narrow and easy to read inside a script',
      },
      {
        args: 'axjf',
        what: 'Display the process hierarchy as a tree so you can see which parent spawned which child',
      },
    ],
    example: {
      args: 'aux',
      out: `USER       PID %CPU %MEM    VSZ   RSS TTY   STAT START   TIME COMMAND
u0_a123   4321  0.7  2.3 1234567 23456 pts/0 S    10:12   0:03 com.termux
root       201  0.0  0.4  123456  7890 ?     Ss   09:00   0:00 init`,
    },
  },
  {
    slug: 'top',
    name: 'top',
    category: 'process',
    tagline: 'Live view of CPU and memory with the busiest processes',
    about:
      'top refreshes a full-screen table every couple of seconds showing overall load and the processes using the most processor time. It is present on nearly every Unix-like system, so it is the reliable choice when nothing fancier is installed. Watch it to catch a runaway task as it happens.',
    developer: 'procps-ng project',
    license: 'GPL-2.0-or-later',
    url: 'https://gitlab.com/procps-ng/procps',
    bin: 'top',
    install: 'pkg install procps',
    glyph: 'activity',
    commands: [
      {
        args: '',
        what: 'Open the live monitor with a default refresh interval and a summary of load, memory and the busiest tasks',
      },
      {
        args: '-d 1',
        what: 'Refresh once a second instead of the default few seconds, which makes short spikes easier to catch',
      },
      {
        args: '-b -n 1',
        what: 'Print a single snapshot in plain text and exit, which is what you want when saving output to a file',
      },
      {
        args: '-o %MEM',
        what: 'Order the task list by memory use rather than processor time',
      },
      {
        args: '-p 4321',
        what: 'Restrict the view to a single process identifier so you can watch one task without noise',
      },
      {
        args: '-u u0_a123',
        what: 'Show only the processes owned by one user, keeping the list short on a busy system',
      },
    ],
    example: {
      args: '-b -n 1',
      out: `Tasks: 187 total,   1 running, 186 sleeping
Mem:   3721M total,  2103M used,  1618M free
Swap:  1024M total,   120M used,   904M free
  PID USER      %CPU %MEM COMMAND
 4321 u0_a123   12.5  2.3 com.termux`,
    },
  },
  {
    slug: 'htop',
    name: 'htop',
    category: 'process',
    tagline: 'Colourful interactive process viewer with scrolling and shortcuts',
    about:
      'htop is an interactive process viewer that shows load, memory and a scrollable list of tasks with colour coding. You can sort, search and send signals without leaving the interface. It is friendlier than a bare monitor and worth installing on a phone for a readable overview.',
    developer: 'Hisham Muhammad and contributors',
    license: 'GPL-2.0-or-later',
    url: 'https://htop.dev/',
    bin: 'htop',
    install: 'pkg install htop',
    glyph: 'activity',
    commands: [
      {
        args: '',
        what: 'Open the interactive viewer with bars for load and memory and a sortable list of tasks below',
      },
      {
        args: '-u u0_a123',
        what: 'Show only tasks belonging to one user, which trims the list on a shared system',
      },
      {
        args: '-s PERCENT_MEM',
        what: 'Start with the list sorted by memory use instead of processor time',
      },
      {
        args: '-d 5',
        what: 'Set the refresh delay in tenths of a second, so a larger number slows the updates down',
      },
      {
        args: '-t',
        what: 'Display the process tree so parent and child tasks are grouped together',
      },
      {
        args: '-C',
        what: 'Run in monochrome, which helps when colours render badly over a remote connection',
      },
    ],
    example: {
      args: '-u u0_a123',
      out: `  1  [|||||        35.2%]   Tasks: 42, 130 thr; 1 running
  2  [||||||||||   68.4%]   Load average: 1.24 1.10 0.95
  Mem[||||||||   2.10G/3.63G]
  Swp[|            120M/1.0G]`,
    },
  },
  {
    slug: 'btop',
    name: 'btop',
    category: 'process',
    tagline: 'Rich resource monitor with graphs for CPU, memory and network',
    about:
      'btop is a resource monitor that draws live graphs for processor, memory, disk and network activity alongside a list of tasks. It is visually detailed and themeable, and it runs well in a modern terminal. Use it when you want the whole picture of what the device is doing at a glance.',
    developer: 'Aristocratos',
    license: 'Apache-2.0',
    url: 'https://github.com/aristocratos/btop',
    bin: 'btop',
    install: 'pkg install btop',
    glyph: 'gauge',
    commands: [
      {
        args: '',
        what: 'Open the full dashboard with live graphs for processor, memory, disk and network',
      },
      {
        args: '--utf-force',
        what: 'Force the use of Unicode drawing characters when the terminal does not advertise support, so the graphs render properly',
      },
      {
        args: '--preset 0',
        what: 'Start with a particular layout preset instead of your saved configuration',
      },
      {
        args: '--tty',
        what: 'Run in a low-resolution mode suited to a plain console where advanced drawing is unavailable',
      },
      {
        args: '--low-color',
        what: 'Reduce the number of colours used, which suits terminals with a limited palette',
      },
    ],
    example: {
      args: '--low-color',
      out: `CPU  [||||||||||        ] 42%
Mem  [||||||||          ] 58%  2.1G/3.6G
Net  [||                ] 128K/s
Proc 1 running, 186 sleeping`,
    },
  },
  {
    slug: 'procs',
    name: 'procs',
    category: 'process',
    tagline: 'Modern replacement for ps with colour and sensible defaults',
    about:
      'procs is a process viewer written in Rust that replaces the classic listing with colour-coded, human-readable columns. It shows the tree by default, understands simple filters, and prints a layout that is easy to scan. Use it when you want a nicer default view than a traditional snapshot.',
    developer: 'dalance',
    license: 'MIT',
    url: 'https://github.com/dalance/procs',
    bin: 'procs',
    install: 'pkg install procs',
    glyph: 'list',
    commands: [
      {
        args: '',
        what: 'List processes with colour, showing the command, user and resource use in readable columns',
      },
      {
        args: '--tree',
        what: 'Draw the parent and child relationships as a tree so you can follow what spawned what',
      },
      {
        args: '--sortd cpu',
        what: 'Order the list by processor use with the heaviest first',
      },
      {
        args: 'firefox',
        what: 'Filter the list to rows matching the given text, which narrows a long list to the tasks you care about',
      },
      {
        args: '--watch',
        what: 'Refresh the display continuously instead of printing once, giving a lightweight live view',
      },
      {
        args: '--insert 4321',
        what: 'Include only the processes you name, so a fixed set stays visible while others are hidden',
      },
    ],
    example: {
      args: '--tree',
      out: `  PID  PPID USER     CPU MEM  COMMAND
    1     0 root     0.0 0.4  init
  201     1 root     0.0 0.2  ├─ sshd
 4321   201 u0_a123  1.2 2.3  │  └─ com.termux`,
    },
  },
  {
    slug: 'kill',
    name: 'kill',
    category: 'process',
    tagline: 'Send signals to processes to stop or reload them',
    about:
      'kill sends a signal to a process, most often to ask it to stop. The pkill variant that ships alongside it selects processes by name rather than identifier. Learn it so you can end a hung task cleanly instead of restarting the whole device.',
    developer: 'procps-ng project',
    license: 'GPL-2.0-or-later',
    url: 'https://gitlab.com/procps-ng/procps',
    bin: 'kill',
    install: 'Included with Termux',
    glyph: 'signal',
    commands: [
      {
        args: '4321',
        what: 'Send the default polite termination signal to a process by its identifier, giving it a chance to clean up',
      },
      {
        args: '-9 4321',
        what: 'Force a process to end immediately when it ignores the polite request, at the cost of skipping cleanup',
      },
      {
        args: '-l',
        what: 'List the names and numbers of every available signal so you can pick the right one',
      },
      {
        args: '-HUP 4321',
        what: 'Ask a process to reload its configuration without stopping, which many background services support',
      },
      {
        args: '-STOP 4321',
        what: 'Pause a running process in place so it can be resumed later with the continue signal',
      },
      {
        args: '-0 4321',
        what: 'Check whether a process exists and whether you are allowed to signal it, without actually sending anything',
      },
    ],
  },
  {
    slug: 'strace',
    name: 'strace',
    category: 'process',
    tagline: 'Trace the system calls a program makes',
    about:
      'strace records the system calls and signals a program makes as it runs, showing each request and its result. It is the tool you reach for when a command fails with a confusing message and you need to see which file or socket it actually touched. It can also attach to a process that is already running.',
    developer: 'strace project',
    url: 'https://strace.io/',
    bin: 'strace',
    install: 'pkg install strace',
    glyph: 'bug',
    commands: [
      {
        args: 'ls /sdcard',
        what: 'Run a command and print every system call it makes, so you can see exactly which files it opens',
      },
      {
        args: '-p 4321',
        what: 'Attach to a process that is already running and follow its calls without restarting it',
      },
      {
        args: '-f',
        what: 'Follow child processes created by the target, which matters for programs that spawn helpers',
      },
      {
        args: '-e trace=openat',
        what: 'Show only the calls that open files, cutting the noise down to the part you care about',
      },
      {
        args: '-c ls',
        what: 'Summarise calls by count and time instead of printing each one, giving a quick performance overview',
      },
      {
        args: '-o calls.txt ls',
        what: 'Write the trace to a file so a long or fast run can be read afterwards',
      },
    ],
    example: {
      args: '-e trace=openat ls /sdcard',
      out: `openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
openat(AT_FDCWD, "/sdcard", O_RDONLY|O_NONBLOCK|O_DIRECTORY) = 3
openat(AT_FDCWD, "/sdcard/Download", O_RDONLY|O_NONBLOCK|O_DIRECTORY) = 4`,
    },
  },
  {
    slug: 'ncdu',
    name: 'ncdu',
    category: 'monitor',
    tagline: 'Browse disk usage interactively and delete from the tree',
    about:
      'ncdu scans a directory and presents the result as a navigable tree with sizes, so you can drill into whatever is taking space. You can delete files from inside it, which makes cleaning up a full phone much quicker. Run it first when storage is nearly full.',
    developer: 'Yorhel (Yoran Heling)',
    license: 'MIT',
    url: 'https://dev.yorhel.nl/ncdu',
    bin: 'ncdu',
    install: 'pkg install ncdu',
    glyph: 'disk',
    commands: [
      {
        args: '/sdcard',
        what: 'Scan a directory tree and show the biggest items first, then let you step into any folder to see what fills it',
      },
      {
        args: '-x',
        what: 'Stay on the one filesystem and skip mounted volumes, so external storage is not counted by accident',
      },
      {
        args: '-e',
        what: 'Show apparent sizes rather than disk usage, which is more accurate when files are sparse or compressed',
      },
      {
        args: '--exclude "*.zip"',
        what: 'Skip files matching a pattern so archives you do not intend to remove stay out of the totals',
      },
      {
        args: '-o report.json /sdcard',
        what: 'Save the scan to a file so it can be reopened or compared later without walking the tree again',
      },
      {
        args: '-f report.json',
        what: 'Open a previously saved scan for browsing instead of scanning the disk again',
      },
    ],
    example: {
      args: '/sdcard',
      out: `    4.2 GiB [##########] /Download
    1.8 GiB [####      ] /DCIM
  812.0 MiB [##        ] /Android`,
    },
  },
  {
    slug: 'duf',
    name: 'duf',
    category: 'monitor',
    tagline: 'Colourful table of mounted filesystems and free space',
    about:
      'duf is a disk usage viewer that replaces the plain filesystem listing with a colour-coded table showing size, used, available and mount point. It groups and sorts the results so real storage stands out from virtual filesystems. It is the readable way to answer how much space is left.',
    developer: 'Christian Muehlhaeuser',
    license: 'MIT',
    url: 'https://github.com/muesli/duf',
    bin: 'duf',
    install: 'pkg install duf',
    glyph: 'disk',
    commands: [
      {
        args: '',
        what: 'Show a table of mounted filesystems with size, usage and mount point, sorted so the fullest are easy to find',
      },
      {
        args: '-only local',
        what: 'Restrict the table to local devices and hide network and virtual mounts that only add clutter',
      },
      {
        args: '-hide-fs tmpfs',
        what: 'Hide filesystems of a given type so temporary in-memory mounts drop out of the report',
      },
      {
        args: '-sort size',
        what: 'Order the table by total size so the largest devices appear first',
      },
      {
        args: '--output json',
        what: 'Emit the data as JSON so it can be parsed by another program rather than read by eye',
      },
      {
        args: '-hide-mountpoints /proc,/sys',
        what: 'Exclude specific mount points so system directories stay out of the listing',
      },
    ],
    example: {
      args: '-only local',
      out: `MOUNT POINT       SIZE  USED  AVAIL  USAGE%  TYPE
/                24.0G  9.1G  14.9G    38%   ext4
/sdcard         119.2G  61.4G  57.8G    52%   sdcardfs
/data            48.0G  20.3G  27.7G    42%   ext4`,
    },
  },
  {
    slug: 'dust',
    name: 'dust',
    category: 'monitor',
    tagline: 'Show which directories are using the most space',
    about:
      'dust is a disk usage tool that prints a tree of directories with bar charts of their sizes, sorted largest first. It gives you an instant answer to what is filling a folder without any navigation. It works well as a one-shot alternative to an interactive browser.',
    developer: 'bootandy',
    license: 'Apache-2.0',
    url: 'https://github.com/bootandy/dust',
    bin: 'dust',
    install: 'pkg install dust',
    glyph: 'tree',
    commands: [
      {
        args: '',
        what: 'Print the current directory as a tree of sizes with bars, largest entries first',
      },
      {
        args: '-d 2',
        what: 'Limit the tree to a chosen depth so the output stays short and readable',
      },
      {
        args: '-n 20',
        what: 'Show only the twenty largest items so the noise at the bottom is trimmed',
      },
      {
        args: '/sdcard',
        what: 'Measure a specific directory rather than the one you are standing in',
      },
      {
        args: '-s',
        what: 'Print only the grand total for the directory without the per-entry breakdown',
      },
      {
        args: '-X /proc',
        what: 'Exclude a directory from the walk, which is useful for skipping system trees that report odd sizes',
      },
    ],
    example: {
      args: '-d 1',
      out: ` 3.8G ┌── Download
 1.2G ├── DCIM
 640M ├── Android
  12M └── Documents`,
    },
  },
  {
    slug: 'free',
    name: 'free',
    category: 'monitor',
    tagline: 'Report how much memory is used, available and cached',
    about:
      'free prints a snapshot of physical and swap memory, splitting it into used, available and cached amounts. It answers whether the device is genuinely short of memory or merely caching files. Run it with a human-readable flag to get sizes you can read at a glance.',
    developer: 'procps-ng project',
    license: 'GPL-2.0-or-later',
    url: 'https://gitlab.com/procps-ng/procps',
    bin: 'free',
    install: 'Included with Termux',
    glyph: 'chip',
    commands: [
      {
        args: '-h',
        what: 'Show memory amounts with human-readable units so you do not have to count digits',
      },
      {
        args: '-m',
        what: 'Report everything in mebibytes, which keeps the numbers comparable across runs',
      },
      {
        args: '-t',
        what: 'Add a totals line combining memory and swap, useful for a one-line summary',
      },
      {
        args: '-s 2',
        what: 'Repeat the report every two seconds so you can watch memory rise and fall',
      },
      {
        args: '-w',
        what: 'Separate the cached and buffer columns so you can see how much memory the kernel is holding aside',
      },
    ],
    example: {
      args: '-h',
      out: `               total        used        avail
Mem:           3.6Gi       2.1Gi       1.4Gi
Swap:          1.0Gi       120Mi       904Mi`,
    },
  },
  {
    slug: 'uptime',
    name: 'uptime',
    category: 'monitor',
    tagline: 'Show how long the device has been running and the load average',
    about:
      'uptime prints the current time, how long the system has been up, how many users are logged in and the one, five and fifteen minute load averages. The load figures tell you whether the device is keeping up with its work. It is a one-line health check you can drop into any script.',
    developer: 'procps-ng project',
    license: 'GPL-2.0-or-later',
    url: 'https://gitlab.com/procps-ng/procps',
    bin: 'uptime',
    install: 'Included with Termux',
    glyph: 'clock',
    commands: [
      {
        args: '',
        what: 'Print the time, how long the system has been running, the user count and the load averages in one line',
      },
      {
        args: '-p',
        what: 'Show only how long the system has been running in a friendly form, which is easier to quote',
      },
      {
        args: '-s',
        what: 'Print the date and time the system last started, useful for correlating with log entries',
      },
      {
        args: '--help',
        what: 'Print the available options and a short description of each when you have forgotten them',
      },
      {
        args: '-V',
        what: 'Print the program version so you can confirm which release is installed',
      },
    ],
  },
  {
    slug: 'lsof',
    name: 'lsof',
    category: 'monitor',
    tagline: 'List the files and sockets open processes are holding',
    about:
      'lsof lists the open files of running processes, including regular files, pipes and network sockets. On a phone it answers questions such as which program is using the camera, or which process holds a port. Run it when a file is busy or a socket will not release.',
    developer: 'lsof project',
    url: 'https://github.com/lsof-org/lsof',
    bin: 'lsof',
    install: 'pkg install lsof',
    glyph: 'magnifier',
    commands: [
      {
        args: '-i',
        what: 'List only network sockets, showing which process holds each connection and its state',
      },
      {
        args: '-i :8022',
        what: 'Narrow the socket list to one port so you can see who is listening or connected there',
      },
      {
        args: '/sdcard/Download/report.pdf',
        what: 'Show which processes have a particular file open, which explains a file that refuses to delete',
      },
      {
        args: '-p 4321',
        what: 'List everything a single process has open, giving a picture of its files and sockets',
      },
      {
        args: '-u u0_a123',
        what: "Restrict the listing to one user's processes so the output stays manageable",
      },
      {
        args: '+D /sdcard/Download',
        what: 'Recursively list open files under a directory, which is useful for finding what is holding a folder busy',
      },
    ],
    example: {
      args: '-i :8022',
      out: `COMMAND    PID     USER  TYPE NODE NAME
sshd      1204     root  IPv4  TCP *:8022 (LISTEN)
sshd      1180     root  IPv4  TCP localhost:8022->localhost:51234 (ESTABLISHED)`,
    },
  },
];
