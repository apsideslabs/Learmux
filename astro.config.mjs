// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Update this to your real Cloudflare Pages URL once deployed.
  site: 'https://learmux.pages.dev',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
  // Output is fully static — Cloudflare Pages serves it from the edge.
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
});
