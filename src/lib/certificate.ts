/**
 * The certificate.
 *
 * Everything that has to be *true* about a certificate lives here: the ID, the
 * date format, the wording, and the QR that points at it. The page and the
 * component only place it on the page.
 *
 * ## Why the ID is a digest
 *
 * A certificate needs an identifier that is stable, short enough to read out
 * loud, and not guessable from the name. That is a hash, which is the same
 * thing the cryptography lessons teach. The ID is the first eight hex
 * characters of SHA-256 over the name and the date, so the same name issued on
 * the same day always produces the same ID, and changing either changes it.
 *
 * It is not a security control. Anybody can recompute it, because everything
 * it is derived from is printed on the certificate. It is an identifier, and it
 * is honest about being one.
 */

import QRCode from 'qrcode';

/** The eight-character identifier printed on the certificate. */
export async function certificateId(name: string, date: string): Promise<string> {
  const input = `${name.trim().toLowerCase()}|${date}`;
  const bytes = new TextEncoder().encode(input);

  // crypto.subtle needs a secure context. Every real deployment of this site is
  // https, but a local file:// preview is not, so there is a fallback.
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 8)
      .toUpperCase();
  }

  // FNV-1a, only to keep the page working without a secure context. Not a
  // cryptographic hash and not presented as one.
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0').slice(0, 8).toUpperCase();
}

/** A date the way a certificate writes one: 25 October 2026. */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'long' });
  return `${day} ${month} ${d.getFullYear()}`;
}

/** Today, as the value an <input type="date"> expects. */
export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * The QR, as a single SVG path in module coordinates.
 *
 * The whole code is one path rather than 500 rects: same pixels, a fraction of
 * the markup, and it scales by transform rather than by recalculating every
 * rectangle.
 */
export function qrPath(text: string): { d: string; size: number } {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const size = qr.modules.size;
  const data = qr.modules.data;

  const parts: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[y * size + x]) parts.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  return { d: parts.join(''), size };
}

export interface CertificateFacts {
  name: string;
  date: string;
  lessonsDone: number;
  lessonsTotal: number;
  tracksDone: number;
  tracksTotal: number;
}

/**
 * What the certificate actually claims.
 *
 * The claim has to match the progress, because a certificate that says
 * "completed" above a count of zero is a lie printed in a nice typeface. With
 * nothing done it says "is working through", which is true, and the page says
 * plainly that the counts come from this browser.
 */
export function claim(f: CertificateFacts): { headline: string; detail: string } {
  if (f.lessonsDone === 0) {
    return {
      headline: 'is working through the Learmux course',
      detail: `in Termux and the Linux command line, covering ${f.tracksTotal} tracks and ${f.lessonsTotal} lessons.`,
    };
  }

  const lessons = f.lessonsDone === 1 ? '1 lesson' : `${f.lessonsDone} lessons`;
  const tracks = f.tracksDone === 1 ? '1 track' : `${f.tracksDone} tracks`;

  if (f.lessonsDone >= f.lessonsTotal) {
    return {
      headline: 'has completed the Learmux course',
      detail: `all ${f.lessonsTotal} lessons across ${f.tracksTotal} tracks in Termux and the Linux command line.`,
    };
  }

  return {
    headline: `has completed ${lessons} of the Learmux course`,
    detail: `across ${tracks} in Termux and the Linux command line, and passed the practice checks for each.`,
  };
}
