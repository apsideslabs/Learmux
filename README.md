# Learmux

> A cybersecurity tutorial publication for Termux and the Linux command line.

Learmux is a learning site built around two things: short written lessons, and an
**interactive capture-the-flag terminal** that runs entirely in the browser. Pick a challenge, get
dropped into a shell with its own filesystem, and find the flag.

No backend. The whole thing builds to static files.

**Live site:** https://apsideslabs.github.io/Learmux/

---

## What's here

- **Editorial homepage** — featured tutorial cards with landscape thumbnails, category labels over
  each thumbnail, a Recent Posts feed, a CTF promotional panel, a Download Termux section and social
  links.
- **Article template** — breadcrumb (`Home › Category › Title`), author and date byline, and a body
  that supports headings, inline code, code blocks, callouts and responsive images.
- **Category and search pages** — every lesson grouped by topic, plus a compact client-side search.
- **Interactive CTF terminal** — a simulated shell with command history, pipes, redirection, hints
  and a progress indicator. Nothing you type ever reaches a real shell.
- **20 challenges** across 13 topics, defined as JSON.
- **Explicit challenge validation** — completion is decided by authored rules, not by scanning
  output for a flag string.
- **Responsive navigation drawer** — the spec's link set, focus management, Escape to close.

## Course structure

Content is a course, not a list. Lessons carry a `track` and a global `order`, and the tracks are
ordered with prerequisites:

| # | Track | Level | Lessons | Covers |
| --- | --- | --- | --- | --- |
| 1 | Foundations | Beginner | 7 | the filesystem, reading and searching text, pipes, permissions, packages, shell config |
| 2 | The shell in practice | Intermediate | 6 | scripting, processes, environment and PATH, sed and awk, archives, cron |
| 3 | Networking and the internet | Intermediate | 5 | interfaces and scanning, DNS, HTTP and APIs, SSH, moving files |
| 4 | Security fundamentals | Intermediate | 5 | encoding and hashes, passwords and keys, log reading, hardening, safe habits |
| 5 | Projects | Advanced | 3 | a backup script, a log analyser, a terminal dashboard |

Routes:

- `/course/` — the curriculum: who it is for, what you need, the path, every track and lesson
- `/course/<track>/` — a track landing page with its lessons in order and the next track
- `/learn/` — all lessons in reading order
- `/learn/<lesson>/` — the article, with its position in the track and previous/next navigation

Each lesson follows the same shape: an opening paragraph, a "What you'll be able to do" list, numbered
steps where every command is followed by its expected output, callouts, a quick-reference table and
next steps.

## The stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Astro** | Static output, file-based routing, first-class MDX |
| Language | **TypeScript** | The CTF engine: parser, virtual filesystem, shell |
| Styling | **Custom CSS** | No framework; total control of the interface and terminal |
| Articles | **Markdown / MDX** | Easy to write and maintain |
| Challenges | **JSON** | Data-driven; swappable for a database later |
| Hosting | **GitHub Pages** | Free, static, deployed from GitHub Actions |

## Project structure

```
Learmux/
├── astro.config.mjs             # Astro config (MDX, sitemap, Shiki, base-path links)
├── src/
│   ├── content.config.ts        # tutorial collection schema
│   ├── content/tutorials/*.mdx  # the lessons
│   ├── data/challenges.json     # 20 challenge definitions (generated)
│   ├── lib/
│   │   ├── types.ts             # core types + validation rule types
│   │   ├── fs.ts                # virtual filesystem
│   │   ├── shell.ts             # tokeniser, pipeline executor, rule evaluation
│   │   ├── commands.ts          # the command set
│   │   ├── hash.ts              # pure-JS SHA-256
│   │   ├── challenges.ts        # challenge loader
│   │   ├── curriculum.ts        # the course: tracks, order, outcomes
│   │   ├── tutorials.ts         # lesson helpers (ordering, tracks, categories)
│   │   ├── site.ts              # brand, nav and social config
│   │   ├── progress.ts          # localStorage progress
│   │   ├── md.ts                # small markdown renderer for briefings
│   │   └── terminal.ts          # the terminal DOM island
│   ├── components/              # Icon, ArticleCard, PostRow, Callout, Terminal, ChallengeRow
│   ├── layouts/BaseLayout.astro # header, drawer, footer
│   ├── pages/                   # home, learn, article, categories, category, search,
│   │                            # challenges, challenge, about, contact, privacy, 404
│   └── styles/                  # global.css, terminal.css
├── scripts/
│   ├── generate-challenges.mjs  # authors src/data/challenges.json (incl. validation rules)
│   ├── generate-thumbs.mjs      # draws the original SVG thumbnails
│   ├── test-engine.ts           # engine smoke tests
│   └── run-tests.mjs
└── public/thumbs/*.svg          # generated, locally-stored artwork
```

## Getting started

```bash
npm install
npm run dev              # http://localhost:4321
npm run build            # static output in dist/
npm run preview          # preview the production build
npm test                 # check every challenge is solvable
npm run generate         # rebuild src/data/challenges.json
npm run generate:thumbs  # redraw the SVG thumbnails
```

## How the sandbox works

A challenge declares a virtual filesystem as JSON. Opening it deep-clones that tree into a
`VirtualFS`, seeds a `Shell` with the challenge's working directory, user, host, hints and rules, and
you are in.

Your keystrokes are tokenised explicitly (quotes, `|`, `>`, `>>`, `;`), split into statements, split
into pipeline stages, and each stage is dispatched to a command. Commands are pure functions of
`(filesystem, argv, stdin)`. Commands that would touch a network or the device — `nmap`, `curl`,
`pkg`, `ps` — return **authored output** from the challenge's `overrides` map, so nothing depends on
the host.

### Challenge validation

Completion is decided by **explicit, authored rules** stored with each challenge, evaluated against a
log of what the player actually did:

```jsonc
"validation": [
  { "type": "command", "pattern": "\\bgrep\\b" },
  { "type": "output",  "pattern": "TERMUX\\{logs_never_lie\\}" }
]
```

Rule types: `read` (a path was read), `command` (a command line matched a regex), `output`
(accumulated output matched a regex) and `cwd` (the player moved into a directory). A challenge is
solved when every rule matches. Submitting the correct flag with `submit FLAG{...}` also completes it.

So in the logs challenge, `cat access.log` does **not** complete it — the rule requires that `grep`
was used. That is the difference between an explicit rule and "the output contained the flag".

## Authoring

Edit `scripts/generate-challenges.mjs`, then `npm run generate`. New challenges appear in the index,
the routes and the progress totals automatically. Lessons are just MDX files in
`src/content/tutorials/` with `category`, `author`, `date` and `excerpt` frontmatter.

## Deployment

Deployed to **GitHub Pages** by `.github/workflows/deploy.yml`: on every push to `main` it installs
dependencies, builds, and publishes `dist/`. Because the site is served from `/Learmux/`,
`astro.config.mjs` sets `site` and `base`, and root-absolute links in Markdown are rewritten by a
small remark plugin.

Any static host works: `npm run build`, then serve `dist/`.

## Notes

- This is an original implementation with its own branding and assets. The visual language follows a
  tutorial-publication layout; the site's own stack is documented above and nothing here claims to
  describe any other site's internals.
- Flags live in the client-side data, so a determined reader could find them early. That is fine for
  teaching; the next step would be moving challenge checks behind an API.

## Licence

MIT — see [LICENSE](./LICENSE).
