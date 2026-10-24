import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Tutorials are Markdown/MDX files under src/content/tutorials. Writing them as
 * content (not hand-built pages) keeps authoring easy: add a file, it shows up
 * in the Learn index, the category pages, the search index, the sitemap and the
 * article route automatically.
 */
const tutorials = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tutorials' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Short teaser used on cards and in the feed. */
    excerpt: z.string(),
    /** Drives the category pages and the label on each card. */
    category: z.string(),
    author: z.string().default('The Study Cipher'),
    /** ISO date, shown in the article byline. */
    date: z.string(),
    /** Lower sorts first on index pages. */
    order: z.number().default(999),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
    tags: z.array(z.string()).default([]),
    updated: z.string().optional(),
  }),
});

export const collections = { tutorials };
