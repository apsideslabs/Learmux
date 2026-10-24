/**
 * Shared types and the category vocabulary for the tool directory.
 *
 * The dataset itself is split across sibling files by subject so that no single
 * module becomes unwieldy; `./index.ts` joins them back into one list.
 */

export type CategoryId =
  | 'files'
  | 'text'
  | 'shell'
  | 'process'
  | 'network'
  | 'transfer'
  | 'security'
  | 'forensics'
  | 'packages'
  | 'dev'
  | 'editors'
  | 'media'
  | 'monitor';

export interface ToolCommand {
  /** Everything after the binary name. For `ls` this is `-la`, never `ls -la`. */
  args: string;
  /** What it does, and when you would reach for it. */
  what: string;
}

export interface ToolExample {
  /** Everything after the binary name. */
  args: string;
  /** Realistic sample output, as plain text. */
  out: string;
  /** Optional one-line reading of the output. */
  note?: string;
}

export interface Tool {
  slug: string;
  name: string;
  category: CategoryId;
  /** One line, under ~90 characters. */
  tagline: string;
  /** Two or three plain sentences. */
  about: string;
  /** The person or organisation that builds it. */
  developer: string;
  license?: string;
  /** Official project page. */
  url: string;
  /** The command you actually type. */
  bin: string;
  /** How to get it in Termux. */
  install: string;
  /** Name of the drawn mark used when no brand logo exists. */
  glyph: string;
  commands: ToolCommand[];
  example?: ToolExample;
}

export interface ToolCategory {
  id: CategoryId;
  name: string;
  blurb: string;
}

export const toolCategories: ToolCategory[] = [
  { id: 'files', name: 'Files and navigation', blurb: 'Finding, moving, packing and unpacking files.' },
  { id: 'text', name: 'Text and data', blurb: 'Reading, searching and reshaping text, tables and JSON.' },
  { id: 'shell', name: 'Shell and sessions', blurb: 'The shell itself, and keeping work alive between sessions.' },
  { id: 'process', name: 'Processes and system', blurb: 'Seeing what runs, and stopping it cleanly.' },
  { id: 'network', name: 'Networking', blurb: 'Addresses, ports, name lookups and reachability.' },
  { id: 'transfer', name: 'Web and transfer', blurb: 'Fetching, downloading and moving files between hosts.' },
  { id: 'security', name: 'Security and cryptography', blurb: 'Keys, hashes, encryption and authorised testing.' },
  { id: 'forensics', name: 'Forensics and reversing', blurb: 'Pulling apart packets, binaries and images.' },
  { id: 'packages', name: 'Package managers', blurb: 'Installing and tracking software.' },
  { id: 'dev', name: 'Languages and build tools', blurb: 'Writing, compiling and running code on the phone.' },
  { id: 'editors', name: 'Editors', blurb: 'Editing files from the terminal.' },
  { id: 'media', name: 'Media and documents', blurb: 'Converting audio, video, images and documents.' },
  { id: 'monitor', name: 'Monitoring and diagnostics', blurb: 'Disk, memory, open files and system state.' },
];
