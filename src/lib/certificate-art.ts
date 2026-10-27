/**
 * The certificate artwork.
 *
 * ## The form
 *
 * A framed diploma, not a page with a border. The sheet is a deep navy mount
 * with gold foil and an engraved security pattern, and the certificate itself
 * sits on an ivory panel inside it. That gives three things a flat pale sheet
 * cannot: real colour contrast, a visible focal frame, and a mount that reads as
 * substantial the way a bevelled card mount does.
 *
 * It also keeps the document printable. The panel is ivory, so all the type is
 * dark on light and a home printer copes; only the margin carries ink.
 *
 * ## The palette
 *
 * Navy and gold on ivory, which is the classic pair for this kind of document.
 * Four colours total: navy, gold, ivory, and one deliberate green in the seal,
 * which is the only place the site's own colour appears.
 *
 * ## Fonts are chosen for the rasteriser
 *
 * The PNG export draws this through an <img>, and an SVG in an <img> cannot load
 * a webfont. So the stacks name faces installed everywhere (Georgia, Helvetica,
 * Courier). The preview, the SVG and the PNG are then the same document.
 *
 * ## Two rules
 *
 * Every value is an attribute, never a class: a delivered SVG has no stylesheet.
 * Every `data-` attribute has a value: an SVG is XML, and XML has no valueless
 * attributes.
 */

const NAVY = '#0b1424';
const NAVY_2 = '#16243d';
const NAVY_3 = '#1e3050';
const IVORY = '#fbf7ee';
const IVORY_2 = '#f6f0e1';
const GOLD_DEEP = '#7a5c16';
const GOLD = '#c9a227';
const GOLD_BRIGHT = '#f3e2a4';
const GREEN = '#20d65a';
const GREEN_DEEP = '#0e7a34';
const INK = '#1a2233';
const MUTED = '#6b6455';
const ON_NAVY = '#e8e2d2';
const ON_NAVY_MUTED = '#9a917c';

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Courier New', Courier, monospace";

const n = (v: number) => Math.round(v * 100) / 100;

/** A corner flourish: nested arcs, a diagonal, and a gilt bead. */
function corner(x: number, y: number, sx: number, sy: number): string {
  const arcs: string[] = [];
  for (const r of [12, 19, 26, 33, 40]) {
    const sweep = sx * sy > 0 ? 1 : 0;
    arcs.push(
      `<path d="M${x + sx * r} ${y} A${r} ${r} 0 0 ${sweep} ${x} ${y + sy * r}" stroke-width="1.1"/>`,
    );
  }
  return [
    `<g fill="none" stroke="url(#gold)" stroke-opacity="0.9">${arcs.join('')}</g>`,
    `<path d="M${x + sx * 47} ${y} L${x} ${y + sy * 47}" stroke="url(#gold)" stroke-opacity="0.45" stroke-width="0.9"/>`,
    `<circle cx="${x + sx * 8}" cy="${y + sy * 8}" r="2.8" fill="${GOLD}"/>`,
    `<circle cx="${x + sx * 8}" cy="${y + sy * 8}" r="1.2" fill="${GOLD_DEEP}"/>`,
  ].join('');
}

/**
 * The seal: a solid gilt disc with an embossed ring, a ring of beads, ribbon
 * tails, and a green centre holding a check.
 *
 * It is solid rather than an outline on purpose. A thin ring reads as a circle
 * somebody drew; a filled disc with light and shade reads as a stamp.
 */
function seal(cx: number, cy: number): string {
  const out: string[] = [];

  // ribbon tails first, so the disc covers their tops
  out.push(
    `<path d="M${cx - 30} ${cy + 38} L${cx - 44} ${cy + 106} L${cx - 27} ${cy + 94} ` +
      `L${cx - 11} ${cy + 108} L${cx - 2} ${cy + 48} Z" fill="url(#gold)"/>`,
  );
  out.push(
    `<path d="M${cx + 30} ${cy + 38} L${cx + 44} ${cy + 106} L${cx + 27} ${cy + 94} ` +
      `L${cx + 11} ${cy + 108} L${cx + 2} ${cy + 48} Z" fill="url(#gold)"/>`,
  );

  // the disc: gold rim, dark inner shadow, ivory face
  out.push(`<circle cx="${cx}" cy="${cy}" r="56" fill="url(#gold)"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="56" fill="none" stroke="${GOLD_DEEP}" stroke-width="1" stroke-opacity="0.55"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="49" fill="${NAVY_2}"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="47" fill="none" stroke="${GOLD_BRIGHT}" stroke-width="1.4" stroke-opacity="0.85"/>`);

  // a ring of beads, gold on navy
  const beads: string[] = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * 2 * Math.PI;
    beads.push(`<circle cx="${n(cx + 43 * Math.cos(a))}" cy="${n(cy + 43 * Math.sin(a))}" r="1.15"/>`);
  }
  out.push(`<g fill="${GOLD_BRIGHT}" fill-opacity="0.75">${beads.join('')}</g>`);

  // the green centre
  out.push(`<circle cx="${cx}" cy="${cy}" r="34" fill="${GREEN_DEEP}"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="34" fill="none" stroke="url(#gold)" stroke-width="2"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="29" fill="none" stroke="${GREEN}" stroke-opacity="0.6" stroke-width="1"/>`);
  out.push(
    `<path d="M${cx - 12} ${cy + 1} l8 8 l17 -19" fill="none" stroke="${GREEN}" ` +
      `stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
  return out.join('');
}

/** A large engraved rosette, for the mount behind the panel. */
function rosette(cx: number, cy: number, r: number): string {
  const rings: string[] = [];
  for (const k of [1, 0.87, 0.74, 0.61, 0.48]) {
    rings.push(`<circle cx="${cx}" cy="${cy}" r="${n(r * k)}"/>`);
  }
  const spokes: string[] = [];
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * 2 * Math.PI;
    spokes.push(
      `<path d="M${n(cx + r * 0.9 * Math.cos(a))} ${n(cy + r * 0.9 * Math.sin(a))} ` +
        `L${n(cx + r * Math.cos(a))} ${n(cy + r * Math.sin(a))}"/>`,
    );
  }
  return (
    `<g fill="none" stroke="${GOLD}" stroke-width="1.1">${rings.join('')}</g>` +
    `<g stroke="${GOLD}" stroke-width="0.7">${spokes.join('')}</g>`
  );
}

const lozenge = (cx: number, cy: number, r = 3.6, fill = GOLD) =>
  `<path d="M${cx} ${cy - r} L${cx + r} ${cy} L${cx} ${cy + r} L${cx - r} ${cy} Z" fill="${fill}"/>`;

const rule = (x1: number, x2: number, y: number, paint = 'url(#gold)', width = 1) =>
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
      // foil: dark to bright and back, so it reads as metal rather than yellow
      `<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${GOLD_DEEP}"/>` +
      `<stop offset="0.2" stop-color="${GOLD}"/>` +
      `<stop offset="0.5" stop-color="${GOLD_BRIGHT}"/>` +
      `<stop offset="0.8" stop-color="${GOLD}"/>` +
      `<stop offset="1" stop-color="${GOLD_DEEP}"/>` +
      `</linearGradient>` +
      // the mount, lit from above the centre
      `<radialGradient id="mount" cx="0.5" cy="0.4" r="0.8">` +
      `<stop offset="0" stop-color="${NAVY_3}"/>` +
      `<stop offset="0.55" stop-color="${NAVY_2}"/>` +
      `<stop offset="1" stop-color="${NAVY}"/>` +
      `</radialGradient>` +
      // the panel, faintly warmer in the middle
      `<radialGradient id="panel" cx="0.5" cy="0.42" r="0.8">` +
      `<stop offset="0" stop-color="#fffdf7"/>` +
      `<stop offset="0.7" stop-color="${IVORY}"/>` +
      `<stop offset="1" stop-color="${IVORY_2}"/>` +
      `</radialGradient>` +
      // the engraved pattern, for the mount margin
      `<pattern id="engine" width="12" height="12" patternUnits="userSpaceOnUse">` +
      `<path d="M0 6 A6 6 0 0 1 12 6 A6 6 0 0 1 0 6" fill="none" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="0.5"/>` +
      `<path d="M6 0 A6 6 0 0 1 6 12 A6 6 0 0 1 6 0" fill="none" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="0.5"/>` +
      `</pattern>` +
      `<clipPath id="margin">` +
      `<path d="M0 0 H1000 V707 H0 Z M40 40 V667 H960 V40 Z" clip-rule="evenodd"/>` +
      `</clipPath>` +
      // a soft drop shadow under the panel, so the mount has depth
      `<filter id="lift" x="-8%" y="-8%" width="116%" height="116%">` +
      `<feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.45"/>` +
      `</filter>` +
      `</defs>`,
  );

  // ── the mount ──────────────────────────────────────────────────────────
  p.push(`<rect width="1000" height="707" fill="url(#mount)"/>`);
  p.push(`<g clip-path="url(#margin)"><rect width="1000" height="707" fill="url(#engine)"/></g>`);
  p.push(`<g clip-path="url(#margin)" opacity="0.16">${rosette(500, 353, 470)}</g>`);

  // ── the panel ──────────────────────────────────────────────────────────
  p.push(`<rect x="40" y="40" width="920" height="627" fill="url(#panel)" filter="url(#lift)"/>`);
  p.push(`<rect x="40" y="40" width="920" height="627" fill="none" stroke="url(#gold)" stroke-width="2.4"/>`);
  p.push(`<rect x="48" y="48" width="904" height="611" fill="none" stroke="${GOLD_DEEP}" stroke-opacity="0.45" stroke-width="0.9"/>`);

  // corner flourishes on the panel
  p.push(corner(48, 48, 1, 1));
  p.push(corner(952, 48, -1, 1));
  p.push(corner(48, 659, 1, -1));
  p.push(corner(952, 659, -1, -1));

  // ── letterhead ─────────────────────────────────────────────────────────
  p.push(
    `<text x="500" y="112" font-family="${SANS}" font-size="10" font-weight="700" letter-spacing="5.6" fill="${MUTED}" text-anchor="middle">APSIDES LABS</text>`,
  );
  p.push(
    `<text x="500" y="146" font-family="${SERIF}" font-size="27" letter-spacing="10" fill="${INK}" text-anchor="middle">LEARMUX</text>`,
  );
  p.push(rule(392, 596, 162));
  p.push(lozenge(500, 162, 4.2));

  // ── title, as one confident line ───────────────────────────────────────
  p.push(
    `<text x="500" y="222" font-family="${SERIF}" font-size="31" letter-spacing="6" fill="${INK}" text-anchor="middle">CERTIFICATE OF COMPLETION</text>`,
  );
  p.push(rule(300, 452, 244, 'url(#gold)', 1.6));
  p.push(rule(548, 700, 244, 'url(#gold)', 1.6));
  p.push(lozenge(500, 244, 4.6));

  p.push(
    `<text x="500" y="276" font-family="${SANS}" font-size="9" font-weight="700" letter-spacing="3.4" fill="${MUTED}" text-anchor="middle">THIS IS TO CERTIFY THAT</text>`,
  );

  // ── the recipient ──────────────────────────────────────────────────────
  p.push(
    `<text x="500" y="336" font-family="${SERIF}" font-size="53" fill="${INK}" text-anchor="middle" data-cert-name="">${esc(o.name)}</text>`,
  );
  p.push(rule(230, 770, 358, 'url(#gold)', 1.2));
  p.push(lozenge(500, 358, 3, GOLD_DEEP));

  // ── the claim ──────────────────────────────────────────────────────────
  p.push(
    `<text x="500" y="392" font-family="${SANS}" font-size="15" fill="${INK}" text-anchor="middle" data-cert-headline="">${esc(o.headline)}</text>`,
  );
  p.push(
    `<text x="500" y="414" font-family="${SANS}" font-size="11.5" fill="${MUTED}" text-anchor="middle" data-cert-detail="">${esc(o.detail)}</text>`,
  );

  // ── date and identifier ────────────────────────────────────────────────
  p.push(rule(96, 372, 444));
  p.push(rule(628, 904, 444));
  p.push(
    `<text x="96" y="466" font-family="${SANS}" font-size="8" font-weight="700" letter-spacing="2.6" fill="${MUTED}">DATE</text>`,
  );
  p.push(
    `<text x="96" y="488" font-family="${SERIF}" font-size="15" fill="${INK}" data-cert-date="">${esc(o.date)}</text>`,
  );
  p.push(
    `<text x="904" y="466" font-family="${SANS}" font-size="8" font-weight="700" letter-spacing="2.6" fill="${MUTED}" text-anchor="end">CERTIFICATE ID</text>`,
  );
  p.push(
    `<text x="904" y="488" font-family="${MONO}" font-size="15" font-weight="700" letter-spacing="2" fill="${INK}" text-anchor="end" data-cert-id="">${esc(o.id)}</text>`,
  );

  // ── the seal, centred on the foot ──────────────────────────────────────
  p.push(seal(500, 544));

  // ── signature ──────────────────────────────────────────────────────────
  p.push(rule(96, 300, 588, INK, 0.9));
  p.push(
    `<text x="96" y="612" font-family="${SERIF}" font-size="17" fill="${INK}">Apsides Labs</text>`,
  );
  p.push(
    `<text x="96" y="629" font-family="${SANS}" font-size="10" fill="${MUTED}">the studio behind Learmux</text>`,
  );

  // ── verification, on its own quiet zone so it scans ────────────────────
  p.push(`<rect x="800" y="548" width="92" height="92" fill="#ffffff" stroke="url(#gold)" stroke-width="1.2"/>`);
  p.push(
    `<g data-cert-qr="" transform="translate(808 556) scale(2.51)" shape-rendering="crispEdges"></g>`,
  );
  p.push(
    `<text x="846" y="538" font-family="${SANS}" font-size="7.5" font-weight="700" letter-spacing="1.6" fill="${MUTED}" text-anchor="middle">SCAN TO VERIFY</text>`,
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
