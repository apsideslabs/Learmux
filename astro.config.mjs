// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Deployed as a GitHub Pages project site: https://apsideslabs.github.io/Learmux/
const BASE = '/Learmux';

/**
 * Prefix root-absolute links inside Markdown/MDX with the site base, so
 * tutorial links like `/challenges/x/` keep working when the site is served
 * from a subpath.
 */
function remarkBaseLinks() {
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'link' && typeof node.url === 'string' && node.url.startsWith('/')) {
      node.url = BASE + node.url;
    }
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) child.forEach(walk);
      else if (child && typeof child === 'object') walk(child);
    }
  };
  return (tree) => walk(tree);
}

// https://astro.build/config
export default defineConfig({
  site: 'https://apsideslabs.github.io',
  base: BASE,
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkBaseLinks],
    // SmartyPants turns `--delete` into `—delete`, which is wrong on a site
    // that documents command-line flags.
    smartypants: false,
    shikiConfig: {
      theme: 'github-light',
      wrap: false,
    },
  },
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
});
