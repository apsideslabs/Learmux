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
  { href: 'challenges/', label: 'Play CTF', cta: true },
  { href: 'categories/', label: 'Categories' },
  { href: 'about/', label: 'About us' },
];

/** The mobile drawer carries the fuller set, per the design brief. */
export const drawerNav = [
  { href: '', label: 'Home' },
  { href: 'course/', label: 'Course' },
  { href: 'tools/', label: 'Tools' },
  { href: 'categories/', label: 'Categories', chevron: true },
  { href: 'learn/', label: 'All lessons' },
  { href: 'about/', label: 'About Us' },
  { href: 'contact/', label: 'Contact Us' },
  { href: 'privacy/', label: 'Privacy Policy' },
  { href: 'challenges/', label: 'Play CTF Game', tag: 'CTF' },
];
