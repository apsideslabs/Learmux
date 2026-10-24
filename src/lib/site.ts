/**
 * Site-wide configuration: brand, navigation and social links in one place.
 * Social URLs are placeholders — swap them for real profiles.
 */

export const site = {
  name: 'Learmux',
  tagline: 'A cybersecurity tutorial publication for Termux and the Linux command line.',
  description:
    'Learmux teaches Termux and the Linux command line through an ordered course and an interactive terminal where you capture flags.',
  author: 'The Study Cipher',
};

export const nav = [
  { href: 'course/', label: 'Course' },
  { href: 'challenges/', label: 'Play CTF', cta: true },
  { href: 'categories/', label: 'Categories' },
  { href: 'about/', label: 'About us' },
];

/** The mobile drawer carries the fuller set, per the design brief. */
export const drawerNav = [
  { href: '', label: 'Home' },
  { href: 'course/', label: 'Course' },
  { href: 'categories/', label: 'Categories', chevron: true },
  { href: 'learn/', label: 'All lessons' },
  { href: 'about/', label: 'About Us' },
  { href: 'https://www.youtube.com/', label: 'YouTube', external: true },
  { href: 'contact/', label: 'Contact Us' },
  { href: 'privacy/', label: 'Privacy Policy' },
  { href: 'challenges/', label: 'Play CTF Game', tag: 'CTF' },
];

export const social = [
  { href: 'https://www.youtube.com/', label: 'YouTube', icon: 'youtube' },
  { href: 'https://www.instagram.com/', label: 'Instagram', icon: 'instagram' },
  { href: 'https://github.com/apsideslabs/Learmux', label: 'GitHub', icon: 'github' },
  { href: 'https://www.facebook.com/', label: 'Facebook', icon: 'facebook' },
];
