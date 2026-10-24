/**
 * Site-wide configuration: brand, navigation and social links in one place.
 * Social URLs are placeholders — swap them for real profiles.
 */

export const site = {
  name: 'Learmux',
  tagline: 'A cybersecurity tutorial publication for Termux and the Linux command line.',
  description:
    'Learmux teaches Termux and the Linux command line through short written lessons and an interactive terminal where you capture flags.',
  author: 'The Study Cipher',
};

export const nav = [
  { href: 'learn/', label: 'Course' },
  { href: 'categories/', label: 'Categories' },
  { href: 'challenges/', label: 'Play CTF', cta: true },
  { href: 'about/', label: 'About' },
];

export const drawerNav = [
  { href: 'learn/', label: 'Home', note: '' },
  { href: 'categories/', label: 'Categories', note: 'chevron' },
  { href: 'about/', label: 'About Us', note: '' },
  { href: 'https://www.youtube.com/', label: 'YouTube', note: 'external' },
  { href: 'contact/', label: 'Contact Us', note: '' },
  { href: 'privacy/', label: 'Privacy Policy', note: '' },
  { href: 'learn/', label: 'Course', note: '' },
  { href: 'challenges/', label: 'Play CTF Game', note: 'tag' },
];

export const social = [
  { href: 'https://www.youtube.com/', label: 'YouTube', icon: 'youtube' },
  { href: 'https://www.instagram.com/', label: 'Instagram', icon: 'instagram' },
  { href: 'https://github.com/apsideslabs/Learmux', label: 'GitHub', icon: 'github' },
  { href: 'https://www.facebook.com/', label: 'Facebook', icon: 'facebook' },
];
