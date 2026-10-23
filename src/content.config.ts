import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Tutorials are Markdown/MDX files under src/content/tutorials. Writing them as
 * content (not hand-built pages) keeps authoring easy: add a file, it shows up
 * in the Learn index, the sitemap and the tutorial route automatically.
 */
const tutorials = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tutorials' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Lower sorts first on the index page. */
    order: z.number().default(999),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
    tags: z.array(z.string()).default([]),
    updated: z.string().optional(),
  }),
});

export const collections = { tutorials };
