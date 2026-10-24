/**
 * Site-wide configuration: brand, navigation and the project link in one place.
 */

export const site = {
  name: 'Learmux',
  tagline: 'A cybersecurity tutorial publication for Termux and the Linux command line.',
  description:
    'Learmux teaches Termux and the Linux command line through an ordered course and an interactive terminal where you capture flags.',
  author: 'The Study Cipher',
  repository: 'https://github.com/apsideslabs/Learmux',
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
  { href: 'categories/', label: 'Categories', chevron: true },
  { href: 'tools/', label: 'Tools' },
  { href: 'learn/', label: 'All lessons' },
  { href: 'about/', label: 'About Us' },
  { href: 'contact/', label: 'Contact Us' },
  { href: 'privacy/', label: 'Privacy Policy' },
  { href: 'challenges/', label: 'Play CTF Game', tag: 'CTF' },
];
