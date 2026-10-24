import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Tutorials are Markdown/MDX files under src/content/tutorials. Writing them as
 * content (not hand-built pages) keeps authoring easy: add a file, it shows up
 * in the course, the category pages, the search index, the sitemap and the
 * article route automatically.
 *
 * `track` places the lesson in the curriculum (see src/lib/curriculum.ts) and
 * `order` gives it a position in the overall sequence.
 */
const tutorials = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tutorials' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    excerpt: z.string(),
    category: z.string(),
    track: z.string(),
    author: z.string().default('The Study Cipher'),
    date: z.string(),
    order: z.number().default(999),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
    tags: z.array(z.string()).default([]),
    updated: z.string().optional(),
  }),
});

export const collections = { tutorials };
