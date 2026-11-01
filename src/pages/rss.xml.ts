/**
 * The lesson feed.
 *
 * Written as a plain endpoint rather than with a feed library, because the
 * whole feed is a few hundred lines of XML and a dependency to produce them
 * would be more to maintain than the output is worth.
 *
 * ## No dates
 *
 * Every other feed would put a `pubDate` on each item. This site has no real
 * publication dates: they were removed because they were invented, and putting
 * them back here would just move the same fiction somewhere less visible. An
 * RSS item without a date is valid, and readers show the list in the order it
 * arrives, which is curriculum order. That is the honest answer.
 */

import type { APIRoute } from 'astro';
import { allTutorials } from '../lib/tutorials';
import { site } from '../lib/site';

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');
const ORIGIN = import.meta.env.SITE.replace(/\/+$/, '');

/** XML has five characters that must never appear raw in text. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const lessons = await allTutorials();
  const home = `${ORIGIN}${BASE}/`;

  const items = lessons
    .map((l) => {
      const url = `${ORIGIN}${BASE}/learn/${l.id}/`;
      return [
        '    <item>',
        `      <title>${esc(l.data.title)}</title>`,
        `      <link>${esc(url)}</link>`,
        `      <guid isPermaLink="true">${esc(url)}</guid>`,
        `      <description>${esc(l.data.excerpt ?? l.data.description)}</description>`,
        `      <category>${esc(l.data.category)}</category>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)} lessons</title>
    <link>${esc(home)}</link>
    <description>${esc(site.description)}</description>
    <language>en</language>
    <atom:link href="${esc(`${ORIGIN}${BASE}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
