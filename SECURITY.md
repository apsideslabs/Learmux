# Security

## Reporting

Email the studio at the address on the [contact page](https://apsideslabs.github.io/Learmux/contact/)
rather than opening a public issue. Please include what you found, where, and how
to reproduce it. You will get a reply, and credit if you want it.

## Scope

This is a static site. There is no server, no database, no accounts, and no
authentication, so the interesting surface is small:

- The page scripts, including the shell that runs in the browser.
- The content pipeline, and anything that could inject markup into a page.
- The GitHub Actions workflow that builds and deploys.

## What the shell is not

The terminal on a lesson page and in the challenges is a virtual filesystem
running in your browser. It does not touch your real files, it cannot run real
programs, and nothing you type leaves the page. It is a teaching aid, not a
sandbox to attack.

## What is stored

Progress and your certificate name are kept in your browser's `localStorage` and
are never sent anywhere. Clearing site data removes them.

## Please do not

Test against infrastructure you do not own. The CTF challenges are designed for
the in-page sandbox and the bundled Termux challenge set, both of which run
locally. The [rules of engagement lesson](https://apsideslabs.github.io/Learmux/learn/rules-of-engagement/)
covers the rest.
