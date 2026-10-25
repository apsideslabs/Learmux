/**
 * The certificate artwork.
 *
 * This module returns the *inside* of the SVG: the frame, the security band,
 * the corner motifs, the seal, and the five pieces of text that change. The
 * page drops it into an <svg> element with `set:html`, and the profile script
 * rewrites those five nodes as the reader types.
 *
 * ## Why it is generated rather than written out
 *
 * A certificate of this kind is mostly geometry: a repeating band, four corner
 * fans, a rosette with a ring of forty-eight ticks, a set of rules and
 * lozenges. Written out by hand that is a thousand lines of coordinates with no
 * way to adjust anything. Built from a few functions it is a page of code, and
 * changing the seal radius or the corner sweep is one number.
 *
 * ## Two rules the artwork has to obey
 *
 * Every value is an attribute, never a class. A downloaded SVG has no
 * stylesheet beside it, so anything that comes from CSS is lost the moment the
 * file leaves the page.
 *
 * Every `data-` attribute has a value, even an empty one. HTML allows a
 * valueless attribute; XML does not, and an SVG is XML. `data-cert-name` alone
 * makes the file unparseable in every viewer that is not a browser.
 */

const NAVY = '#1c1b27';
const NAVY_SOFT = '#34334a';
const GREEN = '#20d65a';
const GREEN_DARK = '#17ab48';
const INK = '#20212b';
const MUTED = '#6d6d76';
const HAIR = '#dcdce4';
const PAPER = '#fffdf9';

const SANS = "Inter, 'Helvetica Neue', Arial, sans-serif";
const HEAD = "Poppins, Inter, 'Helvetica Neue', Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', ui-monospace, 'Courier New', monospace";

/** Round to two places, so the markup stays readable. */
const n = (v: number) => Math.round(v * 100) / 100;

/**
 * A quarter fan of arcs in one corner.
 *
 * `sx` and `sy` are 1 or -1 and say which way the fan opens, so one function
 * serves all four corners.
 */
function corner(x: number, y: number, sx: number, sy: number): string {
  const arcs: string[] = [];
  for (const r of [13, 20, 27, 34]) {
    const sweep = sx * sy > 0 ? 1 : 0;
    arcs.push(
      `<path d="M${x + sx * r} ${y} A${r} ${r} 0 0 ${sweep} ${x} ${y + sy * r}" stroke-width="0.9"/>`,
    );
  }
  return [
    `<g fill="none" stroke="${NAVY}" stroke-opacity="0.55">${arcs.join('')}</g>`,
    `<path d="M${x + sx * 40} ${y} L${x} ${y + sy * 40}" stroke="${NAVY}" stroke-opacity="0.35" stroke-width="0.9"/>`,
    `<circle cx="${x + sx * 6}" cy="${y + sy * 6}" r="2.4" fill="${GREEN}"/>`,
  ].join('');
}

/** A rosette: ribbon tails, rings, a ring of ticks, and a mark. */
function seal(cx: number, cy: number): string {
  const out: string[] = [];

  // ribbons first, so the disc sits over them
  out.push(
    `<path d="M${cx - 26} ${cy + 38} L${cx - 36} ${cy + 96} L${cx - 24} ${cy + 87} ` +
      `L${cx - 12} ${cy + 99} L${cx - 4} ${cy + 48} Z" fill="${GREEN_DARK}"/>`,
  );
  out.push(
    `<path d="M${cx + 26} ${cy + 38} L${cx + 36} ${cy + 96} L${cx + 24} ${cy + 87} ` +
      `L${cx + 12} ${cy + 99} L${cx + 4} ${cy + 48} Z" fill="${GREEN_DARK}"/>`,
  );

  out.push(`<circle cx="${cx}" cy="${cy}" r="48" fill="#ffffff"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="48" fill="none" stroke="${GREEN}" stroke-width="2.4"/>`);

  // forty-eight ticks, every fourth one longer
  const ticks: string[] = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * 2 * Math.PI;
    const r1 = 40;
    const r2 = i % 4 === 0 ? 45 : 43;
    ticks.push(
      `<path d="M${n(cx + r1 * Math.cos(a))} ${n(cy + r1 * Math.sin(a))} ` +
        `L${n(cx + r2 * Math.cos(a))} ${n(cy + r2 * Math.sin(a))}"/>`,
    );
  }
  out.push(`<g stroke="${NAVY}" stroke-opacity="0.5" stroke-width="0.8">${ticks.join('')}</g>`);

  out.push(`<circle cx="${cx}" cy="${cy}" r="37" fill="none" stroke="${HAIR}" stroke-width="1"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="32" fill="#f2fdf6"/>`);
  out.push(`<circle cx="${cx}" cy="${cy}" r="32" fill="none" stroke="${GREEN}" stroke-width="1"/>`);

  // a check drawn as a path, so it needs no font
  out.push(
    `<path d="M${cx - 12} ${cy + 1} l8 8 l16 -18" fill="none" stroke="${NAVY}" ` +
      `stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
  return out.join('');
}

const diamond = (cx: number, cy: number, r = 3.2, fill = GREEN) =>
  `<path d="M${cx} ${cy - r} L${cx + r} ${cy} L${cx} ${cy + r} L${cx - r} ${cy} Z" fill="${fill}"/>`;

const rule = (x1: number, x2: number, y: number, colour = HAIR, width = 1) =>
  `<path d="M${x1} ${y} H${x2}" stroke="${colour}" stroke-width="${width}"/>`;

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

  p.push(`<rect width="1000" height="707" fill="${PAPER}"/>`);

  // The security band. A fine interlocking pattern, clipped to the border so it
  // never runs under the text.
  p.push(
    `<defs>` +
      `<pattern id="lx-guilloche" width="18" height="18" patternUnits="userSpaceOnUse">` +
      `<path d="M0 9 A9 9 0 0 1 18 9 A9 9 0 0 1 0 9" fill="none" stroke="${NAVY}" stroke-opacity="0.16" stroke-width="0.6"/>` +
      `<path d="M9 0 A9 9 0 0 1 9 18 A9 9 0 0 1 9 0" fill="none" stroke="${NAVY}" stroke-opacity="0.16" stroke-width="0.6"/>` +
      `</pattern>` +
      `<clipPath id="lx-band"><path d="M20 20 H980 V687 H20 Z M46 46 V661 H954 V46 Z" clip-rule="evenodd"/></clipPath>` +
      `</defs>`,
  );
  p.push(
    `<rect x="20" y="20" width="960" height="667" fill="url(#lx-guilloche)" clip-path="url(#lx-band)"/>`,
  );

  // frames
  p.push(`<rect x="20" y="20" width="960" height="667" fill="none" stroke="${NAVY}" stroke-width="2"/>`);
  p.push(
    `<rect x="46" y="46" width="908" height="615" fill="none" stroke="${NAVY}" stroke-opacity="0.28" stroke-width="0.9"/>`,
  );

  // corner motifs
  p.push(corner(46, 46, 1, 1));
  p.push(corner(954, 46, -1, 1));
  p.push(corner(46, 661, 1, -1));
  p.push(corner(954, 661, -1, -1));

  // letterhead
  p.push(
    `<text x="500" y="96" font-family="${HEAD}" font-size="11.5" font-weight="600" letter-spacing="5" fill="${MUTED}" text-anchor="middle">APSIDES LABS</text>`,
  );
  p.push(
    `<text x="500" y="122" font-family="${HEAD}" font-size="19" font-weight="600" letter-spacing="9" fill="${NAVY}" text-anchor="middle">LEARMUX</text>`,
  );
  p.push(rule(410, 590, 142, NAVY, 0.9));
  p.push(diamond(500, 142, 3.4));

  // title
  p.push(
    `<text x="500" y="200" font-family="${HEAD}" font-size="25" font-weight="600" letter-spacing="6.5" fill="${NAVY}" text-anchor="middle">CERTIFICATE OF COMPLETION</text>`,
  );
  p.push(rule(300, 430, 218, GREEN, 1.6));
  p.push(rule(570, 700, 218, GREEN, 1.6));
  p.push(diamond(500, 218, 4, GREEN));

  p.push(
    `<text x="500" y="252" font-family="${SANS}" font-size="10" font-weight="500" letter-spacing="3.6" fill="${MUTED}" text-anchor="middle">THIS IS TO CERTIFY THAT</text>`,
  );

  // the recipient
  p.push(
    `<text x="500" y="318" font-family="${SERIF}" font-size="47" fill="${NAVY}" text-anchor="middle" data-cert-name="">${esc(o.name)}</text>`,
  );
  p.push(rule(250, 750, 340, HAIR, 1));
  p.push(diamond(500, 340, 2.6, NAVY_SOFT));

  // the claim
  p.push(
    `<text x="500" y="378" font-family="${SANS}" font-size="15.5" fill="${INK}" text-anchor="middle" data-cert-headline="">${esc(o.headline)}</text>`,
  );
  p.push(
    `<text x="500" y="402" font-family="${SANS}" font-size="12.5" fill="${MUTED}" text-anchor="middle" data-cert-detail="">${esc(o.detail)}</text>`,
  );

  // date and identifier
  p.push(rule(90, 400, 442, HAIR, 1));
  p.push(rule(600, 910, 442, HAIR, 1));
  p.push(
    `<text x="90" y="466" font-family="${HEAD}" font-size="9" font-weight="600" letter-spacing="2.6" fill="${MUTED}">DATE</text>`,
  );
  p.push(
    `<text x="90" y="490" font-family="${SANS}" font-size="14" fill="${NAVY}" data-cert-date="">${esc(o.date)}</text>`,
  );
  p.push(
    `<text x="910" y="466" font-family="${HEAD}" font-size="9" font-weight="600" letter-spacing="2.6" fill="${MUTED}" text-anchor="end">CERTIFICATE ID</text>`,
  );
  p.push(
    `<text x="910" y="490" font-family="${MONO}" font-size="15" font-weight="600" letter-spacing="2" fill="${NAVY}" text-anchor="end" data-cert-id="">${esc(o.id)}</text>`,
  );

  // the seal
  p.push(seal(500, 516));

  // signature
  p.push(rule(90, 310, 576, NAVY, 0.9));
  p.push(
    `<text x="90" y="600" font-family="${HEAD}" font-size="15" font-weight="600" fill="${NAVY}">The Study Cipher</text>`,
  );
  p.push(`<text x="90" y="618" font-family="${SANS}" font-size="11" fill="${MUTED}">Apsides Labs</text>`);

  // verification
  p.push(`<rect x="798" y="556" width="88" height="88" fill="#ffffff" stroke="${HAIR}" stroke-width="1"/>`);
  p.push(
    `<g data-cert-qr="" transform="translate(806 564) scale(2.42)" shape-rendering="crispEdges"></g>`,
  );
  p.push(
    `<text x="842" y="544" font-family="${SANS}" font-size="8.5" letter-spacing="1.8" fill="${MUTED}" text-anchor="middle">SCAN TO VERIFY</text>`,
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
