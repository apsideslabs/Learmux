## What this changes

<!-- One or two sentences. What was wrong or missing, and what you did about it. -->

## Why

<!-- The reason, not the diff. Link the issue if there is one: Closes #123 -->

## Type

- [ ] Lesson content (correction, clarification, new lesson)
- [ ] A tool, glossary term or practice set
- [ ] The shell, a command, or the filesystem
- [ ] The site: layout, pages, styles
- [ ] Tooling, tests or CI

## Checks

- [ ] `npm run validate` passes
- [ ] `npm test` passes
- [ ] `npm run test:practice` passes (required if you touched a practice task)
- [ ] I have read [CONTRIBUTING.md](../CONTRIBUTING.md)

## If this is a new lesson

- [ ] The practice set's `slug` matches the lesson's filename
- [ ] The lesson has a `track`, an `order` unique within that track, a `category` and a `level`
- [ ] There is a sandbox seed in `src/lib/lesson-sandbox.ts` if the commands need files
- [ ] `npm run generate:thumbs` and `npm run generate:og` have been run

## Anything you are unsure about

<!-- Say so here rather than leaving it out. An honest "I think this is right but
     have not tested it on a real device" is more useful than silence. -->
