/**
 * Hashing.
 *
 * SHA-1 and the SHA-2 family come from the browser's own Web Crypto, so they
 * are the real thing rather than a JavaScript reimplementation. MD5 is here as
 * a small pure-JavaScript version only because Web Crypto refuses to provide it
 * at all, which is itself the clearest possible statement about its standing.
 *
 * The tool exposes MD5 and SHA-1 on purpose. They are both broken for anything
 * that needs collision resistance, and a learner should be able to compute them
 * to recognise them in the wild, while being told plainly not to use them for
 * anything new.
 */

const enc = new TextEncoder();

// ── MD5 ────────────────────────────────────────────────────────────────────
//
// RFC 1321. Included so the tool can identify MD5 digests, not to endorse them.

const MD5_S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14,
  20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6,
  10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const MD5_K = new Uint32Array(64);
for (let i = 0; i < 64; i++) MD5_K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;

export function md5Bytes(input: Uint8Array): Uint8Array {
  const originalBitLen = input.length * 8;

  // Pad: 0x80, then zeros, then the length as a 64-bit little-endian integer.
  const withOne = input.length + 1;
  const padded = withOne + ((56 - (withOne % 64) + 64) % 64) + 8;
  const msg = new Uint8Array(padded);
  msg.set(input);
  msg[input.length] = 0x80;

  // The high 32 bits of the length are only non-zero above 512 MB, but write
  // both halves so the implementation is correct rather than merely usual.
  const lo = originalBitLen >>> 0;
  const hi = Math.floor(originalBitLen / 0x100000000) >>> 0;
  const view = new DataView(msg.buffer);
  view.setUint32(padded - 8, lo, true);
  view.setUint32(padded - 4, hi, true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const rotl = (x: number, c: number) => ((x << c) | (x >>> (32 - c))) >>> 0;

  for (let offset = 0; offset < padded; offset += 64) {
    const M = new Uint32Array(16);
    for (let i = 0; i < 16; i++) M[i] = view.getUint32(offset + i * 4, true);

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + MD5_K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotl(F, MD5_S[i])) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const out = new Uint8Array(16);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, a0, true);
  outView.setUint32(4, b0, true);
  outView.setUint32(8, c0, true);
  outView.setUint32(12, d0, true);
  return out;
}

// ── the Web Crypto family ──────────────────────────────────────────────────

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export const HASH_ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export const HASH_STANDING: Record<HashAlgorithm, { status: string; note: string; risky: boolean }> = {
  MD5: {
    status: 'Broken',
    note: 'Collisions are cheap to produce. Still fine for spotting a corrupted download, never for security.',
    risky: true,
  },
  'SHA-1': {
    status: 'Broken',
    note: 'A chosen-prefix collision was demonstrated in 2020. No longer trusted for signatures or certificates.',
    risky: true,
  },
  'SHA-256': {
    status: 'Current',
    note: 'The default choice. No practical collision is known.',
    risky: false,
  },
  'SHA-384': {
    status: 'Current',
    note: 'A wider truncation of SHA-512. Used in some government profiles.',
    risky: false,
  },
  'SHA-512': {
    status: 'Current',
    note: 'The widest of the common family. On 64-bit hardware it is often faster than SHA-256.',
    risky: false,
  },
};

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function digest(
  algorithm: HashAlgorithm,
  data: Uint8Array,
): Promise<{ hex: string; base64: string }> {
  let bytes: Uint8Array;
  if (algorithm === 'MD5') {
    bytes = md5Bytes(data);
  } else {
    const buf = await crypto.subtle.digest(algorithm, data as unknown as ArrayBuffer);
    bytes = new Uint8Array(buf);
  }
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return { hex: toHex(bytes), base64: btoa(binary) };
}

export async function hashText(
  algorithm: HashAlgorithm,
  text: string,
): Promise<{ hex: string; base64: string }> {
  return digest(algorithm, enc.encode(text));
}

/** Hash a File or Blob, so the tool can do what sha256sum does on a download. */
export async function hashBlob(
  algorithm: HashAlgorithm,
  blob: Blob,
): Promise<{ hex: string; base64: string }> {
  const buf = await blob.arrayBuffer();
  return digest(algorithm, new Uint8Array(buf));
}

// ── HMAC ───────────────────────────────────────────────────────────────────

export type HmacAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

/**
 * HMAC, which is what a HS256 JWT signature actually is: HMAC-SHA256 over the
 * signing input, using the secret as the key. Web Crypto computes it directly.
 */
export async function hmac(
  algorithm: HmacAlgorithm,
  keyBytes: Uint8Array,
  data: Uint8Array,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as ArrayBuffer,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, data as unknown as ArrayBuffer);
  return new Uint8Array(sig);
}

/**
 * Compare two byte arrays without leaking where they differ through timing.
 *
 * The difference is imperceptible over a network for a local tool like this
 * one, but comparing digests with `===` is a habit worth not forming, and the
 * cost of doing it properly is a few lines.
 */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function hexToBytes(hex: string): Uint8Array | null {
  const clean = hex.replace(/[\s:]/g, '').toLowerCase();
  if (clean.length % 2 !== 0 || !/^[0-9a-f]*$/.test(clean)) return null;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/** Look at a string and guess which algorithm produced it, by length alone. */
export function guessAlgorithm(value: string): HashAlgorithm | null {
  const clean = value.replace(/[\s:]/g, '');
  if (!/^[0-9a-f]+$/i.test(clean)) return null;
  switch (clean.length) {
    case 32:
      return 'MD5';
    case 40:
      return 'SHA-1';
    case 64:
      return 'SHA-256';
    case 96:
      return 'SHA-384';
    case 128:
      return 'SHA-512';
    default:
      return null;
  }
}

/** What each length looks like, for the compare panel. */
export const LENGTH_HINTS: { length: number; algorithm: HashAlgorithm }[] = [
  { length: 32, algorithm: 'MD5' },
  { length: 40, algorithm: 'SHA-1' },
  { length: 64, algorithm: 'SHA-256' },
  { length: 96, algorithm: 'SHA-384' },
  { length: 128, algorithm: 'SHA-512' },
];
