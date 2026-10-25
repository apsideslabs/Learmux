/**
 * Site-wide configuration: brand, navigation, the studio behind it, and the
 * contact address. One place to change any of them.
 */

export const site = {
  name: 'Learmux',
  tagline: 'A cybersecurity tutorial publication for Termux and the Linux command line.',
  description:
    'Learmux teaches Termux and the Linux command line through an ordered course and an interactive terminal where you capture flags.',
  repository: 'https://github.com/apsideslabs/Learmux',
};

/** The studio that designs, builds and maintains this site. */
export const studio = {
  name: 'Apsides Labs',
  /** One line, used in the footer and the about page. */
  summary: 'An independent research and engineering studio. We build software that teaches.',
  /** Where the studio's own site lives. */
  url: 'https://apsideslabs.github.io/grapheme/',
  github: 'https://github.com/apsideslabs',
  email: 'apsideslabs@gmail.com',
};

export const nav = [
  { href: 'course/', label: 'Course' },
  { href: 'tools/', label: 'Tools' },
  { href: 'utilities/', label: 'Utilities' },
  { href: 'practice/', label: 'Test yourself' },
  { href: 'ctf/', label: 'Termux CTF', cta: true },
  { href: 'challenges/', label: 'In-browser' },
  { href: 'about/', label: 'About us' },
];

/**
 * The mobile drawer.
 *
 * Fourteen flat links in a 320px panel read as one undifferentiated list, so
 * the drawer is grouped instead: a category, the pages inside it, and any
 * sub-pages indented under the page they belong to. The panel keeps its width
 * and its type scale; only the structure changes.
 */
export interface DrawerItem {
  href: string;
  label: string;
  /** A short badge, for the things that need distinguishing at a glance. */
  tag?: string;
  /** Pages that sit under this one, shown indented with a hairline spine. */
  children?: DrawerItem[];
}

export interface DrawerGroup {
  title: string;
  items: DrawerItem[];
}

/**
 * The drawer's first row, above the categories. Home is one tap from anywhere,
 * rather than being buried inside a group you would have to open first.
 */
export const drawerHome: DrawerItem = { href: '', label: 'Home' };

export const drawerNav: DrawerGroup[] = [
  {
    title: 'Learn',
    items: [
      { href: 'course/', label: 'Course' },
      { href: 'categories/', label: 'Categories' },
      { href: 'tools/', label: 'Tools' },
      { href: 'utilities/', label: 'Utilities', tag: '6 tools' },
    ],
  },
  {
    title: 'Practise',
    items: [
      { href: 'practice/', label: 'Test yourself', tag: 'Quiz' },
      {
        href: 'ctf/',
        label: 'Termux CTF',
        tag: 'Real',
        children: [
          { href: 'ctf/play/', label: 'How to play' },
          { href: 'ctf/challenges/', label: 'The challenges' },
          { href: 'ctf/progress/', label: 'Your progress' },
        ],
      },
      { href: 'challenges/', label: 'In-browser CTF', tag: 'Demo' },
    ],
  },
  {
    title: 'About',
    items: [
      { href: 'about/', label: 'About us' },
      { href: 'contact/', label: 'Contact us' },
      { href: 'privacy/', label: 'Privacy' },
    ],
  },
];
