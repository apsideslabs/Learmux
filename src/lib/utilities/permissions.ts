/**
 * Unix file permissions.
 *
 * The two representations people meet are the octal one (`755`) and the
 * symbolic one (`rwxr-xr-x`), and most of the confusion comes from the fact
 * that the symbolic string has ten characters while the octal has three or
 * four digits. The first character is the file type and is not a permission at
 * all, which is why `chmod 755 file` and `chmod 755 -` are not the same shape.
 *
 * The other thing worth getting exactly right is the special bits. They live
 * in a fourth octal digit, and in symbolic form they are shown by borrowing the
 * execute position: a lowercase `s` means the execute bit is also set, an
 * uppercase `S` means it is not. `rwsr-xr-x` and `rwSr-xr-x` differ by one bit
 * and mean quite different things.
 */

export type FileType = '-' | 'd' | 'l' | 'c' | 'b' | 'p' | 's';

export const FILE_TYPES: { char: FileType; name: string }[] = [
  { char: '-', name: 'regular file' },
  { char: 'd', name: 'directory' },
  { char: 'l', name: 'symbolic link' },
  { char: 'c', name: 'character device' },
  { char: 'b', name: 'block device' },
  { char: 'p', name: 'named pipe' },
  { char: 's', name: 'socket' },
];

export interface Triad {
  r: boolean;
  w: boolean;
  x: boolean;
}

export interface PermissionBits {
  type: FileType;
  setuid: boolean;
  setgid: boolean;
  sticky: boolean;
  user: Triad;
  group: Triad;
  other: Triad;
}

export function emptyBits(type: FileType = '-'): PermissionBits {
  const t = (): Triad => ({ r: false, w: false, x: false });
  return { type, setuid: false, setgid: false, sticky: false, user: t(), group: t(), other: t() };
}

function triadToDigit(t: Triad): number {
  return (t.r ? 4 : 0) + (t.w ? 2 : 0) + (t.x ? 1 : 0);
}

function digitToTriad(d: number): Triad {
  return { r: (d & 4) !== 0, w: (d & 2) !== 0, x: (d & 1) !== 0 };
}

/** The three or four digit form. The special digit is dropped when it is zero. */
export function toOctal(bits: PermissionBits): string {
  const special = (bits.setuid ? 4 : 0) + (bits.setgid ? 2 : 0) + (bits.sticky ? 1 : 0);
  const rest =
    String(triadToDigit(bits.user)) +
    String(triadToDigit(bits.group)) +
    String(triadToDigit(bits.other));
  return special > 0 ? String(special) + rest : rest;
}

/** Always four digits, for when you want the setuid slot to be explicit. */
export function toOctal4(bits: PermissionBits): string {
  return toOctal(bits).padStart(4, '0');
}

/**
 * The ten character string as `ls -l` prints it.
 *
 * The special bits are rendered in the execute column: lowercase when the
 * execute bit is set alongside them, uppercase when it is not.
 */
export function toSymbolic(bits: PermissionBits): string {
  const xChar = (t: Triad, special: boolean, lower: string, upper: string): string => {
    if (special) return t.x ? lower : upper;
    return t.x ? 'x' : '-';
  };

  return (
    bits.type +
    (bits.user.r ? 'r' : '-') +
    (bits.user.w ? 'w' : '-') +
    xChar(bits.user, bits.setuid, 's', 'S') +
    (bits.group.r ? 'r' : '-') +
    (bits.group.w ? 'w' : '-') +
    xChar(bits.group, bits.setgid, 's', 'S') +
    (bits.other.r ? 'r' : '-') +
    (bits.other.w ? 'w' : '-') +
    xChar(bits.other, bits.sticky, 't', 'T')
  );
}

/** The nine character form with no file type, which is what chmod takes. */
export function toSymbolic9(bits: PermissionBits): string {
  return toSymbolic(bits).slice(1);
}

export interface ParseResult {
  ok: boolean;
  bits?: PermissionBits;
  error?: string;
}

/**
 * Parse `755`, `0755`, `4755`, `1777`.
 *
 * Four digits means the first one is the special digit. Three means there are
 * none, which is the common case.
 */
export function fromOctal(input: string, type: FileType = '-'): ParseResult {
  const s = input.trim();
  if (!/^[0-7]{3,4}$/.test(s)) {
    return { ok: false, error: 'An octal permission is three or four digits, each 0 to 7.' };
  }
  const padded = s.padStart(4, '0');
  const special = Number(padded[0]);
  const bits = emptyBits(type);
  bits.setuid = (special & 4) !== 0;
  bits.setgid = (special & 2) !== 0;
  bits.sticky = (special & 1) !== 0;
  bits.user = digitToTriad(Number(padded[1]));
  bits.group = digitToTriad(Number(padded[2]));
  bits.other = digitToTriad(Number(padded[3]));
  return { ok: true, bits };
}

/**
 * Parse `rwxr-xr-x` or `-rwxr-xr-x`.
 *
 * The ten character form is accepted too, since that is what people copy out of
 * `ls -l`. Its first character becomes the file type.
 */
export function fromSymbolic(input: string): ParseResult {
  const s = input.trim();
  const body = s.length === 10 ? s.slice(1) : s;
  if (body.length !== 9) {
    return {
      ok: false,
      error: 'Symbolic permissions are nine characters, or ten with the file type in front.',
    };
  }
  if (!/^[rwxstST-]{9}$/.test(body)) {
    return { ok: false, error: 'Only r, w, x, s, t and - are allowed in a symbolic permission.' };
  }

  const bits = emptyBits(s.length === 10 ? (s[0] as FileType) : '-');
  const triad = (offset: number): Triad => ({
    r: body[offset] === 'r',
    w: body[offset + 1] === 'w',
    x: body[offset + 2] === 'x' || body[offset + 2] === 's' || body[offset + 2] === 't',
  });

  bits.user = triad(0);
  bits.group = triad(3);
  bits.other = triad(6);

  const ux = body[2];
  const gx = body[5];
  const ox = body[8];
  if (ux === 's' || ux === 'S') bits.setuid = true;
  if (gx === 's' || gx === 'S') bits.setgid = true;
  if (ox === 't' || ox === 'T') bits.sticky = true;

  // An uppercase S or T means the special bit is on but execute is off.
  if (ux === 'S') bits.user.x = false;
  if (gx === 'S') bits.group.x = false;
  if (ox === 'T') bits.other.x = false;

  return { ok: true, bits };
}

/**
 * Apply one symbolic clause the way chmod does, e.g. `u+x`, `go-w`, `a=r`.
 *
 * `=` clears the triad first, `+` and `-` add or remove. A missing who (as in
 * `+x`) means all three, except that the umask is consulted by real chmod; the
 * calculator treats a bare clause as `a`, which is the intuitive reading.
 */
export function applyClause(bits: PermissionBits, clause: string): ParseResult {
  // chmod accepts a comma-separated list, so `u+rwx,go+rx` is one call with two
  // clauses rather than two calls.
  const clauses = clause.split(',').map((c) => c.trim()).filter((c) => c !== '');
  if (clauses.length === 0) {
    return { ok: false, error: 'A clause looks like u+x, go-w or a=r.' };
  }

  let current: PermissionBits = {
    ...bits,
    user: { ...bits.user },
    group: { ...bits.group },
    other: { ...bits.other },
  };

  for (const one of clauses) {
    const m = /^([ugoa]*)([+=-])([rwxXst]*)$/.exec(one);
    if (!m) {
      return { ok: false, error: `"${one}" is not a clause chmod understands. Try u+x, go-w or a=r.` };
    }
    const [, whoRaw, op, perms] = m;
    const who = whoRaw === '' || whoRaw.includes('a') ? 'ugo' : whoRaw;
    const adding = op !== '-';

    const triads: { t: Triad; who: 'u' | 'g' | 'o' }[] = [];
    if (who.includes('u')) triads.push({ t: current.user, who: 'u' });
    if (who.includes('g')) triads.push({ t: current.group, who: 'g' });
    if (who.includes('o')) triads.push({ t: current.other, who: 'o' });

    for (const { t: triad, who: which } of triads) {
      if (op === '=') {
        triad.r = false;
        triad.w = false;
        triad.x = false;
        // `=` also clears the special bit belonging to this position.
        if (which === 'u') current.setuid = false;
        if (which === 'g') current.setgid = false;
        if (which === 'o') current.sticky = false;
      }
      for (const p of perms) {
        if (p === 'r') triad.r = adding;
        if (p === 'w') triad.w = adding;
        if (p === 'x' || p === 'X') triad.x = adding;
        if (p === 't' && which === 'o') current.sticky = adding;
        if (p === 's') {
          if (which === 'u') current.setuid = adding;
          if (which === 'g') current.setgid = adding;
        }
      }
    }
  }

  return { ok: true, bits: current };
}

/** Anything a person might paste: octal, symbolic, or a chmod clause. */
export function parseAny(input: string, type: FileType = '-'): ParseResult {
  const s = input.trim();
  if (s === '') return { ok: false, error: 'Nothing to read.' };
  if (/^[0-7]{3,4}$/.test(s)) return fromOctal(s, type);
  if (/^[rwxstST-]{9}$/.test(s)) return fromSymbolic(s);
  if (/^[rwxdstST-]{10}$/.test(s) && /^[dlcbps-]/.test(s)) return fromSymbolic(s);
  if (/^[ugoa]*[+=-][rwxXst]*$/.test(s)) return applyClause(emptyBits(type), s);
  return {
    ok: false,
    error: 'Not something chmod understands. Try 755, 4755, rwxr-xr-x or u+x.',
  };
}

export interface BitMeaning {
  label: string;
  detail: string;
  risky: boolean;
}

/** Plain English for each set bit, so the calculator explains rather than just converts. */
export function describe(bits: PermissionBits): BitMeaning[] {
  const out: BitMeaning[] = [];
  const add = (label: string, detail: string, risky = false) => out.push({ label, detail, risky });

  if (bits.user.r) add('Owner can read', 'Read the contents of the file.', false);
  if (bits.user.w) add('Owner can write', 'Change or delete the file.', false);
  if (bits.user.x)
    add(
      'Owner can execute',
      bits.type === 'd' ? 'Enter the directory and list what is inside.' : 'Run the file as a program.',
      false,
    );
  if (bits.group.r) add('Group can read', 'Anyone in the owning group can read it.', false);
  if (bits.group.w) add('Group can write', 'Anyone in the owning group can change it.', true);
  if (bits.group.x) add('Group can execute', 'Anyone in the owning group can run it.', false);
  if (bits.other.r) add('Everyone can read', 'Any account on the machine can read it.', false);
  if (bits.other.w)
    add('Everyone can write', 'Any account on the machine can change it. Almost never wanted.', true);
  if (bits.other.x) add('Everyone can execute', 'Any account on the machine can run it.', false);

  if (bits.setuid)
    add(
      'setuid',
      bits.user.x
        ? 'The program runs as its owner, not as whoever started it. This is how sudo works, and it is a common way to gain root.'
        : 'setuid is set but execute is not, so it does nothing until execute is added.',
      true,
    );
  if (bits.setgid)
    add(
      'setgid',
      bits.type === 'd'
        ? 'New files in this directory inherit the group rather than the creator\u2019s.'
        : 'The program runs with the group of its owner.',
      true,
    );
  if (bits.sticky)
    add(
      'sticky',
      'In a directory, only the owner of a file may delete it. This is what stops /tmp being a free-for-all.',
      false,
    );

  if (out.length === 0) add('No permissions at all', 'Nobody but root can touch this file.', false);
  return out;
}
