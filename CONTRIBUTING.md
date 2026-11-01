# Contributing

Learmux is a Termux and Linux command-line course, plus a shell that runs in the
page so a reader can try a command where they read it. Contributions are welcome,
especially corrections to lesson content.

## The rules that are enforced

These are checked by `npm run validate` and will fail the build, so they are not
style preferences:

- **No em or en dashes** in lesson prose. Use a full stop, a comma, or "and".
- **Every lesson has a practice set** with at least one question and one output
  task, and the set's `slug` must equal the lesson's filename.
- **Every lesson has a `track` that exists** in `src/lib/curriculum.ts`, a
  `category`, a `level`, and an `order` unique within its track.
- **Every output task's command must be runnable** and must produce output its
  own rules accept. The test harness runs it for real.
- **Every task must say where the command runs.** A command box on a web page
  looks like something the page might run for you.
- **Every glossary term must be unique, have a definition, and any `see` link
  must point at a term that exists.**
- **Every lesson sandbox seed must belong to a real lesson and must not be
  empty.**

## Running it

```bash
npm install
npm run dev            # local dev server
npm run build          # build to dist/
npm test               # the shell engine
npm run test:practice  # grades every output task for real
npm run test:utilities # the calculator logic
npm run test:validator # the content rules above
npm run validate       # content, links and the built output
```

Node 20. There is a `.nvmrc`.

## Adding a lesson

1. Add `src/content/tutorials/<slug>.mdx`. The filename is the URL and the id.
2. Give it a `track`, an `order` unique within that track, a `category` and a
   `level` in the frontmatter.
3. Add a practice set in `src/data/practice/` with the same `slug`.
4. Add a sandbox seed in `src/lib/lesson-sandbox.ts` if the lesson's commands
   need files to work on.
5. Add a thumbnail entry in `scripts/generate-thumbs.mjs`, then run
   `npm run generate:thumbs` and `npm run generate:og`.
6. Run `npm run validate` and `npm run test:practice`.

## The shell

`src/lib/shell.ts` parses and dispatches, `src/lib/commands.ts` holds the command
set, `src/lib/fs.ts` is the virtual filesystem, and `src/lib/git.ts` is the small
git. Behaviour should match the real tool: `grep` is a basic regular expression
unless `-E` is passed, `\d` is not a digit class, and `sed -i` writes back.
Where the sandbox cannot match the real thing, it says so rather than pretending.

## Commits

Small commits with a message that says what changed and why. No credentials, no
secrets, and no `.env` files.
