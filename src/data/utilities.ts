/**
 * The utilities catalogue.
 *
 * Each entry is one interactive tool plus the lesson that shows how to build
 * the same thing in Termux. That pairing is the whole point: the tool is a
 * demonstration, and the lesson is the thing the learner keeps.
 */

export interface Utility {
  slug: string;
  name: string;
  /** One line, for the card and the page lede. */
  tagline: string;
  /** A short paragraph for the index card. */
  about: string;
  icon: 'key' | 'swap' | 'hash' | 'lock' | 'shield' | 'network';
  /** The slug of the companion lesson under src/content/tutorials. */
  lesson: string;
}

export const utilities: Utility[] = [
  {
    slug: 'password-generator',
    name: 'Password generator',
    tagline: 'Random passwords and Diceware passphrases, with an honest entropy figure.',
    about:
      'Generates from your device\u2019s own random source, reports the real entropy in bits rather than a made-up strength bar, and offers a passphrase mode built on the EFF word list.',
    icon: 'key',
    lesson: 'build-a-password-generator',
  },
  {
    slug: 'encode-decode',
    name: 'Encode and decode',
    tagline: 'Base64, Base64URL, hex, URL, ROT13, HTML entities and binary.',
    about:
      'Converts between the representations people confuse with encryption, byte-accurate for anything that is not ASCII, and says plainly which of them hide nothing.',
    icon: 'swap',
    lesson: 'build-an-encoder',
  },
  {
    slug: 'hash',
    name: 'Hash',
    tagline: 'MD5, SHA-1 and the SHA-2 family, over text or a file, with a compare mode.',
    about:
      'Computes real digests, checks a file against a published hash, and is blunt about which of these algorithms are broken and what each is still good for.',
    icon: 'hash',
    lesson: 'build-a-hash-tool',
  },
  {
    slug: 'jwt',
    name: 'JWT inspector',
    tagline: 'Read a token, check its claims, and actually verify the signature.',
    about:
      'Decodes the header and payload, dates the expiry claims, flags alg:none, and verifies an HS or RS signature with a key you supply. It never calls a token verified without checking it.',
    icon: 'lock',
    lesson: 'build-a-jwt-inspector',
  },
  {
    slug: 'permissions',
    name: 'Permissions calculator',
    tagline: 'Octal and symbolic file permissions, including the special bits.',
    about:
      'Toggles the rwx bits, converts between 755 and rwxr-xr-x in both directions, handles setuid, setgid and sticky correctly, and explains what each bit lets someone do.',
    icon: 'shield',
    lesson: 'build-a-permissions-calculator',
  },
  {
    slug: 'subnet',
    name: 'Subnet calculator',
    tagline: 'CIDR to network, broadcast, host range and host count, for v4 and v6.',
    about:
      'Works out what a prefix actually means, handles the /31 and /32 cases that catch people out, splits a network into subnets, and shows the binary so the mask stops being a mystery.',
    icon: 'network',
    lesson: 'build-a-subnet-calculator',
  },
];

export const utilityBySlug = (slug: string): Utility | undefined =>
  utilities.find((u) => u.slug === slug);

export const otherUtilities = (slug: string): Utility[] =>
  utilities.filter((u) => u.slug !== slug);
