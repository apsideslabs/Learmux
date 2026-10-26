/**
 * The certificate artwork.
 *
 * This module returns the *inside* of the SVG: the frame, the engraved band,
 * the corner ornaments, the seal, and the five pieces of text that change. The
 * page drops it into an <svg> with `set:html`, and the profile script rewrites
 * those nodes as the reader types.
 *
 * ## The palette, and why it is not the site's palette
 *
 * A certificate is a document, not a page section, and the conventions are old
 * and specific: deep navy, metallic gold, warm ivory paper. Bright green on
 * white reads as a dashboard, which is exactly what this should not be. So the
 * brand is carried by navy and by one deliberate use of the site green in the
 * seal, and the gold does the ceremonial work.
 *
 * ## Fonts are chosen for the rasteriser, not for the page
 *
 * The PNG export draws this SVG into a canvas through an <img>, and an SVG in
 * an <img> cannot load a webfont: it gets the system fonts and nothing else.
 * So the type stacks here name faces that are installed everywhere (Georgia,
 * Helvetica, Arial) rather than Poppins and Inter. That way the preview, the
 * downloaded SVG and the downloaded PNG are the same document, instead of three
 * near-misses.
 *
 * ## Two rules the artwork obeys
 *
 * Every value is an attribute, never a class: a downloaded SVG has no
 * stylesheet beside it.
 *
 * Every `data-` attribute has a value, even an empty one. HTML allows a
 * valueless attribute; XML does not, and an SVG is XML.
 */

const PAPER = '#fbf7ee';
const PAPER_EDGE = '#f4eddd';
const NAVY = '#14203a';
const NAVY_2 = '#1f2d4d';
const GOLD_DARK = '#8a6a1f';
const GOLD = '#c9a227';
const GOLD_LIGHT = '#f0dfa8';
const GREEN = '#20d65a';
const GREEN_DEEP = '#0e7a34';
const INK = '#2a2a33';
const MUTED = '#6b6455';

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Courier New', Courier, monospace";

const n = (v: number) => Math.round(v * 100) / 100;

/** A quarter fan of arcs in one corner, in gold. */
function corner(x: number, y: number, sx: number, sy: number): string {
  const arcs: string[] = [];
  for (const r of [14, 22, 30, 38]) {
    const sweep = sx * sy > 0 ? 1 : 0;
    arcs.push(
      `<path d="M${x + sx * r} ${y} A${r} ${r} 0 0 ${sweep} ${x} ${y + sy * r}" stroke-width="1"/>`,
    );
  }
  return [
    `<g fill="none" stroke="url(#lx-gold)" stroke-opacity="0.95">${arcs.join('')}</g>`,
    `<path d="M${x + sx * 44} ${y} L${x} ${y + sy * 44}" stroke="url(#lx-gold)" stroke-opacity="0.5" stroke-width="0.9"/>`,
    `<circle cx="${x + sx * 7}" cy="${y + sy * 7}" r="2.6" fill="${GOLD_DARK}"/>`,
  ].join('');
}

/**
 * A rosette: gold ribbon tails, a gilt ring of ticks, and a green centre.
 *
 * The green is the one place the site colour appears. A seal wants a single
 * saturated point and this is it.
 */
function seal(cx: number, cy: number): string {
  const out: string[] = [];

  // ribbon tails, behind the disc
  out.push(
    `<path d="M${cx - 27} ${cy + 40} L${cx - 38} ${cy + 100} L${cx - 25} ${cy + 90} ` +
      `L${cx - 12} ${cy + 102} L${cx - 4} ${cy + 50} Z" fill="url(#lx-gold)"/>`,
  );
  out.push(
    `<path d="M${cx + 27} ${cy + 40} L${cx + 38} ${cy + 100} L${cx + 25} ${cy + 90} ` +
      `L${cx + 12} ${cy + 102} L${cx + 4} ${cy + 50} Z" fill="url(#lx-gold)"/>`,
  );

  out.push(`<circle cx="${cx}" cy="${cy}" r="52" fill="${PAPER}"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="52" fill="none" stroke="url(#lx-gold)" stroke-width="3"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="46" fill="none" stroke="${GOLD_DARK}" stroke-opacity="0.5" stroke-width="0.7"/>`);

  // the tick ring
  const ticks: string[] = [];
  for (let i = 0; i < 56; i++) {
    const a = (i / 56) * 2 * Math.PI;
    const r1 = 40;
    const r2 = i % 4 === 0 ? 45 : 43;
    ticks.push(
      `<path d="M${n(cx + r1 * Math.cos(a))} ${n(cy + r1 * Math.sin(a))} ` +
        `L${n(cx + r2 * Math.cos(a))} ${n(cy + r2 * Math.sin(a))}"/>`,
    );
  }
  out.push(`<g stroke="${GOLD_DARK}" stroke-opacity="0.75" stroke-width="0.8">${ticks.join('')}</g>`);

  // the green centre
  out.push(`<circle cx="${cx}" cy="${cy}" r="34" fill="${GREEN_DEEP}"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="34" fill="none" stroke="url(#lx-gold)" stroke-width="1.6"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="29" fill="none" stroke="${GREEN}" stroke-opacity="0.55" stroke-width="1"/>`);

  // a check drawn as a path, so it needs no font
  out.push(
    `<path d="M${cx - 12} ${cy + 1} l8 8 l17 -19" fill="none" stroke="${GREEN}" ` +
      `stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
  return out.join('');
}

/** A watermark rosette, for depth behind the type. */
function watermark(cx: number, cy: number, r: number): string {
  const rings: string[] = [];
  for (const k of [1, 0.82, 0.64, 0.46]) {
    rings.push(`<circle cx="${cx}" cy="${cy}" r="${n(r * k)}"/>`);
  }
  const ticks: string[] = [];
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * 2 * Math.PI;
    ticks.push(
      `<path d="M${n(cx + r * 0.88 * Math.cos(a))} ${n(cy + r * 0.88 * Math.sin(a))} ` +
        `L${n(cx + r * Math.cos(a))} ${n(cy + r * Math.sin(a))}"/>`,
    );
  }
  return (
    `<g fill="none" stroke="${GOLD_DARK}" stroke-width="1.1">${rings.join('')}</g>` +
    `<g stroke="${GOLD_DARK}" stroke-width="0.7">${ticks.join('')}</g>`
  );
}

const diamond = (cx: number, cy: number, r = 3.4, fill = GOLD_DARK) =>
  `<path d="M${cx} ${cy - r} L${cx + r} ${cy} L${cx} ${cy + r} L${cx - r} ${cy} Z" fill="${fill}"/>`;

const rule = (x1: number, x2: number, y: number, paint = 'url(#lx-gold)', width = 1) =>
  `<path d="M${x1} ${y} H${x2}" stroke="${paint}" stroke-width="${width}"/>`;

export interface ArtOptions {
  name: string;
  date: string;
  id: string;
  headline: string;
  detail: string;
}

/** The inside of the certificate SVG. */
export function certificateArt(o: ArtOptions): string {
  const p: string[] = [];

  p.push(
    `<defs>` +
      // the foil. Five stops, dark to light and back, so the rules read as metal
      // rather than as a flat yellow line.
      `<linearGradient id="lx-gold" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${GOLD_DARK}"/>` +
      `<stop offset="0.22" stop-color="${GOLD}"/>` +
      `<stop offset="0.5" stop-color="${GOLD_LIGHT}"/>` +
      `<stop offset="0.78" stop-color="${GOLD}"/>` +
      `<stop offset="1" stop-color="${GOLD_DARK}"/>` +
      `</linearGradient>` +
      `<radialGradient id="lx-paper" cx="0.5" cy="0.42" r="0.78">` +
      `<stop offset="0" stop-color="#fffdf7"/>` +
      `<stop offset="0.62" stop-color="${PAPER}"/>` +
      `<stop offset="1" stop-color="${PAPER_EDGE}"/>` +
      `</radialGradient>` +
      // the engraved band: interlocking circles, the pattern on a banknote
      `<pattern id="lx-guilloche" width="10" height="10" patternUnits="userSpaceOnUse">` +
      `<path d="M0 5 A5 5 0 0 1 10 5 A5 5 0 0 1 0 5" fill="none" stroke="${GOLD_DARK}" stroke-opacity="0.42" stroke-width="0.45"/>` +
      `<path d="M5 0 A5 5 0 0 1 5 10 A5 5 0 0 1 5 0" fill="none" stroke="${GOLD_DARK}" stroke-opacity="0.42" stroke-width="0.45"/>` +
      `</pattern>` +
      `<clipPath id="lx-band">` +
      `<path d="M20 20 H980 V687 H20 Z M48 48 V659 H952 V48 Z" clip-rule="evenodd"/>` +
      `</clipPath>` +
      `</defs>`,
  );

  p.push(`<rect width="1000" height="707" fill="url(#lx-paper)"/>`);

  // the watermark, under everything
  p.push(`<g opacity="0.04">${watermark(500, 470, 232)}</g>`);

  // ── the frame: gilt rule, hairline, engraved band, gilt rule, hairline ──
  p.push(`<rect x="20" y="20" width="960" height="667" fill="url(#lx-guilloche)" clip-path="url(#lx-band)"/>`);
  p.push(`<rect x="20" y="20" width="960" height="667" fill="none" stroke="url(#lx-gold)" stroke-width="2.6"/>`);
  p.push(`<rect x="28" y="28" width="944" height="651" fill="none" stroke="${NAVY}" stroke-opacity="0.75" stroke-width="0.9"/>`);
  p.push(`<rect x="48" y="48" width="904" height="611" fill="none" stroke="url(#lx-gold)" stroke-width="1.1"/>`);
  p.push(`<rect x="56" y="56" width="888" height="595" fill="none" stroke="${NAVY}" stroke-opacity="0.4" stroke-width="0.8"/>`);

  // corner ornaments
  p.push(corner(56, 56, 1, 1));
  p.push(corner(944, 56, -1, 1));
  p.push(corner(56, 651, 1, -1));
  p.push(corner(944, 651, -1, -1));

  // ── letterhead ──
  p.push(
    `<text x="500" y="104" font-family="${SANS}" font-size="10.5" font-weight="700" letter-spacing="5.4" fill="${MUTED}" text-anchor="middle">APSIDES LABS</text>`,
  );
  p.push(
    `<text x="500" y="136" font-family="${SERIF}" font-size="25" letter-spacing="8" fill="${NAVY}" text-anchor="middle">LEARMUX</text>`,
  );
  p.push(rule(400, 600, 154, 'url(#lx-gold)', 1));
  p.push(diamond(500, 154, 4));

  // ── title ──
  p.push(
    `<text x="500" y="212" font-family="${SERIF}" font-size="29" letter-spacing="5.5" fill="${NAVY}" text-anchor="middle">CERTIFICATE</text>`,
  );
  p.push(
    `<text x="500" y="240" font-family="${SANS}" font-size="9.5" font-weight="700" letter-spacing="4.6" fill="${MUTED}" text-anchor="middle">OF COMPLETION</text>`,
  );
  p.push(rule(330, 452, 262, 'url(#lx-gold)', 1.4));
  p.push(rule(548, 670, 262, 'url(#lx-gold)', 1.4));
  p.push(diamond(500, 262, 4.4));

  p.push(
    `<text x="500" y="292" font-family="${SANS}" font-size="9.5" font-weight="600" letter-spacing="3.2" fill="${MUTED}" text-anchor="middle">THIS IS TO CERTIFY THAT</text>`,
  );

  // ── the recipient, the largest thing on the sheet ──
  p.push(
    `<text x="500" y="352" font-family="${SERIF}" font-size="50" fill="${NAVY}" text-anchor="middle" data-cert-name="">${esc(o.name)}</text>`,
  );
  p.push(rule(240, 760, 372, 'url(#lx-gold)', 1));
  p.push(diamond(500, 372, 2.8, NAVY_2));

  // ── the claim ──
  p.push(
    `<text x="500" y="404" font-family="${SANS}" font-size="15" fill="${INK}" text-anchor="middle" data-cert-headline="">${esc(o.headline)}</text>`,
  );
  p.push(
    `<text x="500" y="426" font-family="${SANS}" font-size="12" fill="${MUTED}" text-anchor="middle" data-cert-detail="">${esc(o.detail)}</text>`,
  );

  // ── date and identifier ──
  p.push(rule(112, 392, 462, 'url(#lx-gold)', 0.9));
  p.push(rule(608, 888, 462, 'url(#lx-gold)', 0.9));
  p.push(
    `<text x="112" y="484" font-family="${SANS}" font-size="8.5" font-weight="700" letter-spacing="2.6" fill="${MUTED}">DATE</text>`,
  );
  p.push(
    `<text x="112" y="506" font-family="${SERIF}" font-size="15" fill="${NAVY}" data-cert-date="">${esc(o.date)}</text>`,
  );
  p.push(
    `<text x="888" y="484" font-family="${SANS}" font-size="8.5" font-weight="700" letter-spacing="2.6" fill="${MUTED}" text-anchor="end">CERTIFICATE ID</text>`,
  );
  p.push(
    `<text x="888" y="506" font-family="${MONO}" font-size="15" font-weight="700" letter-spacing="1.8" fill="${NAVY}" text-anchor="end" data-cert-id="">${esc(o.id)}</text>`,
  );

  // ── the seal ──
  p.push(seal(500, 520));

  // ── signature ──
  p.push(rule(112, 300, 578, NAVY, 0.9));
  p.push(
    `<text x="112" y="602" font-family="${SERIF}" font-size="17" fill="${NAVY}">The Study Cipher</text>`,
  );
  p.push(
    `<text x="112" y="620" font-family="${SANS}" font-size="10.5" fill="${MUTED}">Apsides Labs</text>`,
  );

  // ── verification ──
  p.push(`<rect x="798" y="556" width="90" height="90" fill="${PAPER}" stroke="url(#lx-gold)" stroke-width="1.1"/>`);
  p.push(
    `<g data-cert-qr="" transform="translate(806 562) scale(2.45)" shape-rendering="crispEdges"></g>`,
  );
  p.push(
    `<text x="843" y="546" font-family="${SANS}" font-size="8" font-weight="600" letter-spacing="1.6" fill="${MUTED}" text-anchor="middle">SCAN TO VERIFY</text>`,
  );

  return p.join('');
}

/** Text going into SVG markup has to survive a name with an ampersand in it. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
