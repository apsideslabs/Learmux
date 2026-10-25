/**
 * Encoding and decoding.
 *
 * The theme of this file is the difference between three things people
 * constantly conflate, and the tool exists to make the difference obvious:
 *
 *   encoding   changes the representation, keeps the meaning, hides nothing
 *   hashing    is one way, and is not encoding
 *   encryption needs a key, and is not either of the above
 *
 * Everything here is encoding. Base64 of a password is not protection.
 *
 * Every function is byte-accurate for non-ASCII input: text goes through
 * TextEncoder before being encoded, so "café" and emoji round-trip correctly
 * rather than producing mojibake.
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

export type EncodingName =
  | 'base64'
  | 'base64url'
  | 'hex'
  | 'url'
  | 'rot13'
  | 'html'
  | 'binary';

export interface EncodingResult {
  ok: boolean;
  value: string;
  error?: string;
  /** Bytes in the input, and in the output where that is meaningful. */
  inputBytes?: number;
  outputBytes?: number;
}

function bytesToBinaryString(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return s;
}

// ── base64 ─────────────────────────────────────────────────────────────────

export function toBase64(text: string): string {
  return btoa(bytesToBinaryString(enc.encode(text)));
}

export function fromBase64(text: string): string {
  const bytes = Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
  return dec.decode(bytes);
}

/** base64url is base64 with the two URL-hostile characters swapped, padding dropped. */
export function toBase64Url(text: string): string {
  return toBase64(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(text: string): string {
  let s = text.replace(/-/g, '+').replace(/_/g, '/');
  // Restore the padding atob expects.
  const pad = s.length % 4;
  if (pad === 2) s += '==';
  else if (pad === 3) s += '=';
  else if (pad === 1) throw new Error('base64url length is not valid');
  return fromBase64(s);
}

// ── hex ────────────────────────────────────────────────────────────────────

export function toHex(text: string): string {
  return [...enc.encode(text)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function fromHex(text: string): string {
  const clean = text.replace(/[\s:]/g, '').toLowerCase();
  if (clean.length % 2 !== 0) throw new Error('hex needs an even number of digits');
  if (!/^[0-9a-f]*$/.test(clean)) throw new Error('hex can only contain 0-9 and a-f');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return dec.decode(bytes);
}

// ── URL ────────────────────────────────────────────────────────────────────

/**
 * Component encoding, which is what you want for a value going into a query
 * string. It escapes `/`, `?`, `&` and `=`, so a whole URL run through this
 * stops being a URL. That is the point.
 */
export function toUrl(text: string): string {
  return encodeURIComponent(text);
}

export function fromUrl(text: string): string {
  return decodeURIComponent(text.replace(/\+/g, ' '));
}

// ── ROT13 ──────────────────────────────────────────────────────────────────

/** Its own inverse, and no secret whatsoever. Included to make that obvious. */
export function rot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

// ── HTML entities ──────────────────────────────────────────────────────────

const HTML_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function toHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => HTML_MAP[c]);
}

export function fromHtml(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

// ── binary ─────────────────────────────────────────────────────────────────

export function toBinary(text: string): string {
  return [...enc.encode(text)].map((b) => b.toString(2).padStart(8, '0')).join(' ');
}

export function fromBinary(text: string): string {
  const clean = text.replace(/\s/g, '');
  if (!/^[01]*$/.test(clean)) throw new Error('binary can only contain 0 and 1');
  if (clean.length % 8 !== 0) throw new Error('binary needs a multiple of 8 bits');
  const bytes = new Uint8Array(clean.length / 8);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 8, i * 8 + 8), 2);
  return dec.decode(bytes);
}

// ── the dispatcher the page uses ───────────────────────────────────────────

const ENCODERS: Record<EncodingName, (s: string) => string> = {
  base64: toBase64,
  base64url: toBase64Url,
  hex: toHex,
  url: toUrl,
  rot13,
  html: toHtml,
  binary: toBinary,
};

const DECODERS: Record<EncodingName, (s: string) => string> = {
  base64: fromBase64,
  base64url: fromBase64Url,
  hex: fromHex,
  url: fromUrl,
  rot13,
  html: fromHtml,
  binary: fromBinary,
};

export function encode(kind: EncodingName, text: string): EncodingResult {
  if (text === '') return { ok: true, value: '' };
  try {
    return {
      ok: true,
      value: ENCODERS[kind](text),
      inputBytes: enc.encode(text).length,
    };
  } catch (e) {
    return { ok: false, value: '', error: (e as Error).message };
  }
}

export function decode(kind: EncodingName, text: string): EncodingResult {
  if (text === '') return { ok: true, value: '' };
  try {
    const value = DECODERS[kind](text);
    return {
      ok: true,
      value,
      inputBytes: enc.encode(text).length,
      outputBytes: enc.encode(value).length,
    };
  } catch (e) {
    // atob and decodeURIComponent throw vague messages; give a useful one.
    const raw = (e as Error).message;
    const friendly =
      kind === 'base64' || kind === 'base64url'
        ? 'That is not valid base64. Check for characters outside A-Z, a-z, 0-9, +, / and =.'
        : kind === 'url'
          ? 'That contains a percent sign that is not part of a valid escape, such as %20.'
          : raw;
    return { ok: false, value: '', error: friendly };
  }
}

export function byteLength(text: string): number {
  return enc.encode(text).length;
}

export const ENCODING_LABELS: Record<EncodingName, string> = {
  base64: 'Base64',
  base64url: 'Base64URL',
  hex: 'Hexadecimal',
  url: 'URL (percent)',
  rot13: 'ROT13',
  html: 'HTML entities',
  binary: 'Binary',
};

export const ENCODING_NOTES: Record<EncodingName, string> = {
  base64: 'Three bytes become four characters. Used everywhere for putting binary in text.',
  base64url: 'Base64 with + and / swapped for - and _, and no padding. What JWTs use.',
  hex: 'Two characters per byte. Easy to read, twice the size, and no padding rules.',
  url: 'Percent-escapes anything that is not safe in a query string. Not a security measure.',
  html: 'Stops a browser reading your text as markup. The fix for cross-site scripting.',
  rot13: 'A Caesar shift of 13. It is not encryption and never was.',
  binary: 'Eight characters per byte. Good for seeing exactly what the machine holds.',
};
