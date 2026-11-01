# Changelog

Notable changes, newest first. The site has no release tags; this is a record of
what changed and when it mattered.

## Unreleased

- A shell beside every lesson, seeded with that lesson's own files. Collapsed on
  a phone, sticky beside the lesson on a wide screen.
- Every lesson can record completion, and a fully passed practice set marks its
  lesson. The profile and the certificate count from that.
- A real git in the shell engine: `init`, `status`, `add`, `commit`, `log`,
  `diff`, with the three-place model and a real line diff.
- A lesson on editing a file, and a lesson on regular expressions, closing the
  last two gaps in the curriculum.
- `grep` now behaves like grep: basic regular expressions unless `-E` is passed,
  POSIX character classes understood, and `\d` treated as a literal `d`.
  `sed` gained `-i` and `-E`. `wc -l` no longer counts one line too many, and
  `head -1` works.
- `robots.txt`, an RSS feed, and a tags page.
- Fonts are self-hosted; the Google Fonts request is gone.
- The glossary page stopped shipping every definition twice.
- Repo housekeeping: `.nvmrc`, `.editorconfig`, `CONTRIBUTING.md`, `SECURITY.md`.

## Earlier

- 12 tracks, 66 lessons, 66 practice sets, 105 documented tools, 392 glossary
  terms, 12 in-browser challenges and 6 Termux CTF challenges.
- Interactive Python in the page, with fill-in-the-blank exercises.
- A profile page and a downloadable certificate.
