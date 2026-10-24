# Challenge format

A challenge is a self-contained sandbox: a virtual filesystem, a starting
directory, a flag, and a set of rules that decide when it is complete. The whole
thing is declared as data, so the engine stays predictable and the site needs no
backend.

This document is the authoring contract. `scripts/validate-content.mjs` enforces
everything in it, so if the validator passes, the engine can load your challenge.

---

## 1. How a challenge is authored

```
scripts/generate-challenges.mjs   authoring source (TypeScript-free JS)
        |
        |  node scripts/generate-challenges.mjs   (npm run generate)
        v
src/data/challenges.json          runtime source of truth
        |
        v
src/lib/challenges.ts             loads it, starts a Shell
        |
        v
src/pages/challenges/[slug].astro one page per challenge
```

The generator exists so computed values (SHA-256 digests, base64, rot13,
reversals) stay correct. If a challenge needs a hash that matches a file's
contents, compute it in the generator, never by hand.

The JSON is what the site and the test harness read. Regenerating it is safe:
the generator is deterministic.

---

## 2. Fields

Every challenge needs all of these. `id`, `user`, `host` and `cwd` are filled in
by the generator's `add()` helper.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Unique, e.g. `c01`. Used for ordering and test output. |
| `slug` | string | Unique, kebab-case. Becomes the URL: `/challenges/<slug>/`. |
| `title` | string | Shown as the page heading. |
| `category` | string | Free text, e.g. `Filesystem`. Groups the index page. |
| `difficulty` | `Easy` \| `Medium` \| `Hard` | Drives the chip colour and the index grouping. |
| `points` | integer > 0 | Score for capture. |
| `summary` | string | One line, for the index card. |
| `objective` | string | One line, shown under the briefing. |
| `briefing` | string | Markdown. The scenario. This is teaching text, so explain the concept, not the answer. |
| `flag` | string | The secret. Convention: `TERMUX{snake_case_slug}`. |
| `hints` | string[] | Progressive. The first should point at the approach, the last at the specific step. Never a copy-pasteable command in the first hint. |
| `solutions` | string[] | One or more command lines that genuinely solve it. **Never rendered.** The test harness runs these to prove the challenge is solvable. |
| `cwd` | string | Absolute starting directory. Must exist in `fs` and be a directory. |
| `user` | string | Prompt user. `player` for everything so far. |
| `host` | string | Prompt host. `termux`. |
| `fs` | FSNode | Root of the virtual filesystem. See section 5. |
| `env` | object? | Extra environment variables, merged over the defaults. |
| `overrides` | object? | Authored output, keyed by command name. See section 6. |
| `validation` | ValidationRule[] | Completion rules. See section 4. |

### Why `solutions` is separate from `hints`

They serve different readers. `hints` are for the learner and are shown, one at a
time. `solutions` are for the test suite and are never rendered. Keeping them
apart is what lets the site prove every challenge is winnable without publishing
the answer.

---

## 3. Constants

```js
HOME   = '/data/data/com.termux/files/home'
PREFIX = '/data/data/com.termux/files/usr'
USER   = 'player'
HOST   = 'termux'
```

The generator's `termuxRoot(homeChildren, extraRoot)` wraps your home-directory
contents in the real Termux path tree, so `cwd: HOME` and a normal-looking `pwd`
both work.

---

## 4. Validation rules

A challenge is solved when **every** rule matches. An empty `validation` array
means the challenge can never be solved by doing the work, which is almost always
a bug. Submitting the flag with `submit TERMUX{...}` always completes a challenge
regardless of rules.

Rules are evaluated against a log of what the player actually did, not by
scanning the screen for a flag string.

### `read`

```json
{ "type": "read", "path": "/data/data/com.termux/files/home/notes.txt" }
```

True when the player has read that file. Reading is recorded by `cat`, `less`,
`head`, `tail`, `grep` and friends. Use this when the point of the challenge is
finding and opening the right file.

### `command`

```json
{ "type": "command", "pattern": "\\bgrep\\b" }
```

True when any command line the player ran matches the pattern. The pattern is a
JavaScript regular expression tested against the raw command line. Use `\\b` word
boundaries so `grep` does not match `egrep` or a filename.

### `output`

```json
{ "type": "output", "pattern": "TERMUX\\{logs_never_lie\\}" }
```

True when the accumulated terminal output matches. The log is the last 20,000
characters of stdout and stderr, so it covers piped and redirected output too.

Brace characters must be escaped in the pattern (`\\{`), because they are regex
metacharacters.

### `cwd`

```json
{ "type": "cwd", "path": "/data/data/com.termux/files/home/archive" }
```

True when the player's working directory is exactly that path. Use sparingly: it
tests navigation rather than understanding, and it is brittle if a challenge has
more than one valid route.

### Choosing rules

| The learner should... | Use |
| --- | --- |
| find and open a file | `read` |
| use a particular tool | `command` |
| produce a particular value | `output` |
| end up somewhere | `cwd` |

Prefer `read` and `command`. They are stable across formatting changes. `output`
is the one that breaks when you reword a file, because the text it matches lives
in the filesystem.

A common and good pattern is `command` + `output` together: prove they ran the
right tool *and* that it produced the right result.

---

## 5. The virtual filesystem

Two node types, matching the real shape closely enough to be believable.

```json
{ "type": "file", "content": "text here\n", "mode": "644", "owner": "player" }
{ "type": "dir", "children": { "notes.txt": { "...": "..." } }, "mode": "755", "owner": "player" }
```

| Property | Default | Notes |
| --- | --- | --- |
| `mode` | `644` files, `755` dirs | Octal string. `ls -l` and `stat` read it. |
| `owner` | the challenge user | Shown by `ls -l`. |

**Paths.** The filesystem is rooted at `/`. `normalize()` handles `~` (maps to
`HOME`), relative paths against the current directory, and `.` / `..`. A `read`
or `cwd` rule path must be absolute, and must resolve to a node that exists in
`fs`. The validator checks this, because a typo produces a challenge that can
never be solved.

**Writable files.** If the challenge expects the player to create or modify
something, that is fine. Commands like `echo`, `touch` and `mkdir` write to the
virtual filesystem, and a reset restores the original tree.

---

## 6. Authored output (`overrides`)

Some commands are non-deterministic or would touch the real device: `ps`, `nmap`,
`curl`, `ifconfig`, `pkg`, `termux-info` and a few others. Each of these reads an
optional authored output from `overrides`, keyed by command name.

```json
{
  "overrides": {
    "ps": "  PID TTY          TIME CMD\n 1234 pts/0    00:00:00 bash\n 1420 pts/0    00:00:00 /usr/bin/backup --token TERMUX{process_hunt}\n"
  }
}
```

Commands that honour an override: `ps`, `pkg`, `termux-info`,
`termux-setup-storage`, `ifconfig`, `ip`, `ping`, `netstat`, `nmap`, `curl`,
`wget`, `ssh`, `nc`.

Every one of them has a sensible default, so an override is only needed when the
challenge depends on the output. The validator warns about an override key that
no command reads, since that is usually a typo.

---

## 7. Environment

Defaults are merged first, so `env` only needs to add or replace:

```
HOME   = cwd
USER   = user
SHELL  = /data/data/com.termux/files/usr/bin/bash
PWD    = cwd
TERM   = xterm-256color
```

Use `env` for challenges about secrets in the environment, or to seed a value
that a file refers to.

---

## 8. Available commands

```
apt      base64   cat      cd       chmod    chown    clear    cp
curl     cut      date     df       du       echo     env      exit
export   false    file     find     grep     head     help     hexdump
hint     history  hostname id       ifconfig ip       less     logout
ls       man      mkdir    more     mv       nano     nc       netstat
nmap     ping     pkg      printenv printf   ps       pwd      python
rev      rm       rot13    sed      seq      sha256sum sort    ssh
stat     strings  submit   sudo     tail     termux-info       termux-setup-storage
touch    tr       tree     true     type     uname    uniq     uptime
vim      wc       wget     which    whoami   xxd
```

Pipes (`|`), redirection (`>` and `>>`), and history are all supported.

A challenge should be solvable with commands from this list. If you need a new
one, add it to `src/lib/commands.ts` and to this list in the same change.

---

## 9. A complete worked example

A challenge about a file that only the owner can read, hidden among decoys.

```js
// scripts/generate-challenges.mjs
add({
  id: 'c99',
  slug: 'owner-only',
  title: 'Owner Only',
  category: 'Permissions',
  difficulty: 'Easy',
  points: 15,
  summary: 'Find the file that only your account can read.',
  objective: 'Read the file whose permissions exclude group and other.',
  briefing:
    'Every file has an owner and a permission string.\n\n' +
    '- `ls -l` prints the permissions in the first column.\n' +
    '- `r` is read, `w` is write, `x` is execute, and `-` means no permission.\n\n' +
    'One file here is readable only by you. Find it and read it.',
  flag: 'TERMUX{owner_only}',
  hints: [
    'A long listing shows the permissions for every file.',
    'Look for the file where the group and other permissions are all dashes.',
  ],
  solutions: ['ls -l', 'cat private.key'],
  fs: termuxRoot({
    'notes.txt': f('Shopping list.\n'),
    'backup.log': f('nothing here\n'),
    'private.key': f('TERMUX{owner_only}\n', '600'),
  }),
});

// and in the V map
'owner-only': [{ type: 'read', path: `${HOME}/private.key` }],
```

Note what makes this a fair challenge: the briefing teaches the concept without
naming the file, the first hint names the tool, the second narrows the search, and
the rule checks that the right file was actually read.

---

## 10. Authoring checklist

Before you run the generator:

- [ ] `slug` is unique and kebab-case
- [ ] `flag` follows `TERMUX{snake_case}`
- [ ] `hints` are progressive, and the first is not a copy-pasteable command
- [ ] `solutions` genuinely solve it, and you have actually run them
- [ ] `validation` is non-empty
- [ ] every `read` / `cwd` path exists in `fs`
- [ ] regex braces are escaped (`\\{`)
- [ ] the flag is reachable from the declared `fs` or an `override`
- [ ] `briefing` teaches the concept without giving the answer
- [ ] you ran `npm run generate && npm test && npm run validate`

### Gotchas

**The flag must be findable.** If it is not in `fs` and not in an `override`, the
challenge is unwinnable. The validator checks for this.

**`output` rules break when you reword a file.** The pattern matches text inside
the filesystem, so editing that text silently breaks the rule. Prefer `command`
rules where you can, and re-run the tests after any wording change.

**Points should reflect effort.** Easy 10 to 15, Medium 20 to 25, Hard 40.

**Do not use `cwd` for navigation the player might skip.** If a challenge can be
solved from two places, a `cwd` rule makes one of them wrong.
