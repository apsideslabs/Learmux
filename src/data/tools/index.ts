/**
 * The tool directory, joined from the per-subject data files.
 *
 * Pages import from here; the split into siblings is an authoring convenience.
 */

import type { Tool, ToolCategory, CategoryId } from './types';
import { toolCategories } from './types';
import { filesTextTools } from './files-text';
import { shellProcessTools } from './shell-process';
import { networkTransferSecurityTools } from './network-transfer-security';
import { miscTools } from './misc';

export type { Tool, ToolCommand, ToolExample, ToolCategory, CategoryId } from './types';
export { toolCategories } from './types';

/** Every tool, grouped in category order then alphabetical within a category. */
export const tools: Tool[] = [
  ...filesTextTools,
  ...shellProcessTools,
  ...networkTransferSecurityTools,
  ...miscTools,
];

export function toolsByCategory(): { category: ToolCategory; items: Tool[] }[] {
  return toolCategories
    .map((category) => ({ category, items: tools.filter((t) => t.category === category.id) }))
    .filter((g) => g.items.length > 0);
}

export function toolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function categoryById(id: CategoryId): ToolCategory | undefined {
  return toolCategories.find((c) => c.id === id);
}

/** The command a user would type, with its arguments, for display. */
export function displayCommand(tool: Tool, args: string): string {
  return `${tool.bin} ${args}`.trim();
}
