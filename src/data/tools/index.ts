/**
 * The tool directory, joined from the per-subject data files.
 *
 * Pages import from here; the split into siblings is an authoring convenience.
 */

import type { Tool, ToolCategory, CategoryId } from './types';
import { toolCategories } from './types';
import { fileTools } from './files';
import { textTools } from './text';
import { shellProcessTools } from './shell-process';
import { networkTransferSecurityTools } from './network-transfer-security';
import { miscTools } from './misc';
import { coreTools } from './core';

export type { Tool, ToolCommand, ToolExample, ToolCategory, CategoryId } from './types';
export { toolCategories } from './types';

/** Every tool, grouped in category order then alphabetical within a category. */
export const tools: Tool[] = [
  ...coreTools,
  ...fileTools,
  ...textTools,
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

/**
 * Which lesson teaches each tool.
 *
 * The glossary has carried a `see` link since it was built, and the tool
 * directory did not, so a reader landing on a reference page had no way to
 * reach the lesson that explains it. This closes that loop.
 *
 * Only tools with an unambiguous lesson appear here. A command the course does
 * not teach (ranger, zellij, hashcat) has no entry rather than a guessed one,
 * because a link to the wrong lesson is worse than no link.
 */
export const toolLessons: Record<string, string> = {
  // files and navigation
  ls: 'navigating-the-filesystem',
  cd: 'navigating-the-filesystem',
  pwd: 'getting-started',
  mkdir: 'navigating-the-filesystem',
  rmdir: 'navigating-the-filesystem',
  touch: 'navigating-the-filesystem',
  cp: 'navigating-the-filesystem',
  mv: 'navigating-the-filesystem',
  rm: 'navigating-the-filesystem',
  ln: 'file-permissions',
  chmod: 'file-permissions',
  chown: 'file-permissions',
  find: 'navigating-the-filesystem',
  tree: 'navigating-the-filesystem',
  file: 'reading-and-searching-text',
  // text
  cat: 'reading-and-searching-text',
  head: 'reading-and-searching-text',
  tail: 'reading-and-searching-text',
  less: 'reading-and-searching-text',
  grep: 'reading-and-searching-text',
  ripgrep: 'reading-and-searching-text',
  wc: 'reading-and-searching-text',
  cut: 'text-processing-awk-sed',
  sort: 'text-processing-awk-sed',
  uniq: 'text-processing-awk-sed',
  tr: 'text-processing-awk-sed',
  sed: 'text-processing-awk-sed',
  gawk: 'text-processing-awk-sed',
  jq: 'http-and-apis-from-the-shell',
  diff: 'file-integrity',
  // shell
  bash: 'shell-config-and-aliases',
  zsh: 'shell-config-and-aliases',
  alias: 'shell-config-and-aliases',
  export: 'environment-and-variables',
  env: 'environment-and-variables',
  history: 'typing-on-a-phone',
  which: 'environment-and-variables',
  man: 'getting-started',
  xargs: 'pipes-and-redirection',
  tee: 'pipes-and-redirection',
  crontab: 'scheduling-with-cron',
  tmux: 'termux-beyond-the-basics',
  screen: 'termux-beyond-the-basics',
  // processes
  ps: 'processes-and-jobs',
  top: 'processes-and-jobs',
  htop: 'processes-and-jobs',
  kill: 'processes-and-jobs',
  jobs: 'processes-and-jobs',
  nohup: 'processes-and-jobs',
  // files: archives
  tar: 'archives-and-compression',
  gzip: 'archives-and-compression',
  zip: 'archives-and-compression',
  unzip: 'archives-and-compression',
  '7z': 'archives-and-compression',
  // network
  ping: 'networking-basics',
  traceroute: 'networking-basics',
  ip: 'networking-basics',
  ss: 'networking-basics',
  nmap: 'reading-a-port-scan',
  netcat: 'reading-a-port-scan',
  dig: 'dns-and-addresses',
  whois: 'dns-and-addresses',
  curl: 'http-and-apis-from-the-shell',
  wget: 'http-and-apis-from-the-shell',
  openssh: 'ssh-and-remote-work',
  rsync: 'transferring-files',
  // security
  openssl: 'symmetric-and-asymmetric',
  gnupg: 'signing-and-verifying',
  base64: 'encoding-and-hashes',
  sha256sum: 'encoding-and-hashes',
  pass: 'passwords-and-keys',
  // packages, editors, dev
  pkg: 'managing-packages',
  apt: 'managing-packages',
  pip: 'run-your-first-python',
  vim: 'editing-a-file',
  nano: 'editing-a-file',
  neovim: 'editing-a-file',
  micro: 'editing-a-file',
  git: 'version-control-with-git',
  python: 'run-your-first-python',
  shellcheck: 'shell-scripting-basics',
  // monitoring
  df: 'baselines',
  du: 'baselines',
  free: 'processes-and-jobs',
  uname: 'getting-started',
  whoami: 'getting-started',
  watch: 'alerting-on-your-own-device',
};

/** The lesson slug that teaches a tool, or undefined if the course does not. */
export function lessonForTool(slug: string): string | undefined {
  return toolLessons[slug];
}
