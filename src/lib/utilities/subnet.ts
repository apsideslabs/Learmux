/**
 * Subnet arithmetic.
 *
 * The awkward parts of IPv4 subnetting, all of which are handled explicitly
 * here because getting them wrong is the classic way to embarrass yourself:
 *
 *   /31  Two addresses, and under RFC 3021 both are usable. There is no network
 *        or broadcast address reserved, which is what makes it useful for a
 *        point-to-point link.
 *   /32  One address. It is both the network and the host.
 *   /0   The whole space. 2^32 addresses, which overflows a signed 32-bit
 *        integer, so counts are done in floating point or BigInt.
 *
 * All 32-bit bitwise work is forced back to unsigned with `>>> 0`, because
 * JavaScript's bitwise operators produce signed integers and `192.168.1.1`
 * shifted into place comes out negative otherwise.
 */

export interface SpecialRange {
  cidr: string;
  name: string;
  note: string;
}

const SPECIAL_RANGES: SpecialRange[] = [
  { cidr: '0.0.0.0/8', name: 'This network', note: 'Only valid as a source address during boot.' },
  { cidr: '10.0.0.0/8', name: 'Private', note: 'RFC 1918. Never routed on the public internet.' },
  { cidr: '100.64.0.0/10', name: 'Carrier-grade NAT', note: 'Shared address space inside an ISP.' },
  { cidr: '127.0.0.0/8', name: 'Loopback', note: 'The machine talking to itself. 127.0.0.1 is localhost.' },
  { cidr: '169.254.0.0/16', name: 'Link-local', note: 'Assigned automatically when DHCP fails.' },
  { cidr: '172.16.0.0/12', name: 'Private', note: 'RFC 1918. Covers 172.16.0.0 to 172.31.255.255.' },
  { cidr: '192.0.0.0/24', name: 'Protocol assignments', note: 'Reserved for IETF use.' },
  { cidr: '192.0.2.0/24', name: 'Documentation', note: 'TEST-NET-1. Safe to use in examples.' },
  { cidr: '192.88.99.0/24', name: '6to4 relay', note: 'Deprecated anycast range.' },
  { cidr: '192.168.0.0/16', name: 'Private', note: 'RFC 1918. What your home router hands out.' },
  { cidr: '198.18.0.0/15', name: 'Benchmarking', note: 'Reserved for network testing.' },
  { cidr: '198.51.100.0/24', name: 'Documentation', note: 'TEST-NET-2.' },
  { cidr: '203.0.113.0/24', name: 'Documentation', note: 'TEST-NET-3.' },
  { cidr: '224.0.0.0/4', name: 'Multicast', note: 'One sender, many listeners.' },
  { cidr: '240.0.0.0/4', name: 'Reserved', note: 'Not assignable except 255.255.255.255.' },
  { cidr: '255.255.255.255/32', name: 'Limited broadcast', note: 'Every host on the local link.' },
];

export function ipToInt(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = ((n << 8) | v) >>> 0;
  }
  return n >>> 0;
}

export function intToIp(n: number): string {
  const u = n >>> 0;
  return [(u >>> 24) & 255, (u >>> 16) & 255, (u >>> 8) & 255, u & 255].join('.');
}

export function maskFromPrefix(prefix: number): number {
  if (prefix <= 0) return 0;
  if (prefix >= 32) return 0xffffffff >>> 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

export function prefixFromMask(mask: number): number | null {
  const m = mask >>> 0;
  // A valid mask is a run of ones followed by a run of zeros.
  let seenZero = false;
  let count = 0;
  for (let i = 31; i >= 0; i--) {
    const bit = (m >>> i) & 1;
    if (bit === 1) {
      if (seenZero) return null;
      count++;
    } else {
      seenZero = true;
    }
  }
  return count;
}

export function ipClass(firstOctet: number): { name: string; note: string } {
  if (firstOctet === 0) return { name: 'Reserved', note: 'The 0.0.0.0/8 block.' };
  if (firstOctet < 127) return { name: 'Class A', note: 'First bit 0. Default mask /8.' };
  if (firstOctet === 127) return { name: 'Loopback', note: 'The 127.0.0.0/8 block.' };
  if (firstOctet < 192) return { name: 'Class B', note: 'First bits 10. Default mask /16.' };
  if (firstOctet < 224) return { name: 'Class C', note: 'First bits 110. Default mask /24.' };
  if (firstOctet < 240) return { name: 'Class D', note: 'Multicast, not a host range.' };
  return { name: 'Class E', note: 'Reserved, not a host range.' };
}

export interface SubnetResult {
  ok: boolean;
  error?: string;
  address?: string;
  prefix?: number;
  network?: string;
  broadcast?: string;
  netmask?: string;
  wildcard?: string;
  firstHost?: string;
  lastHost?: string;
  totalAddresses?: number;
  usableHosts?: number;
  specialNote?: string;
  klass?: { name: string; note: string };
  ranges?: SpecialRange[];
  binary?: { address: string; netmask: string; network: string };
}

/**
 * Parse `192.168.1.10/24`, or an address plus a separate prefix or mask.
 */
export function parseCidr(input: string, separatePrefix?: string): { ip: number; prefix: number } | { error: string } {
  const s = input.trim();
  if (s === '') return { error: 'Enter an address, for example 192.168.1.10/24.' };

  let addrPart = s;
  let prefixPart = (separatePrefix ?? '').trim();

  if (s.includes('/')) {
    const [a, p] = s.split('/');
    addrPart = a;
    if (prefixPart === '') prefixPart = p;
  }

  const ip = ipToInt(addrPart);
  if (ip === null) {
    return { error: 'That is not a valid IPv4 address. Four numbers, each 0 to 255, separated by dots.' };
  }

  if (prefixPart === '') {
    return { error: 'Add a prefix length, for example /24.' };
  }

  // A dotted mask is accepted as well as a prefix length.
  if (prefixPart.includes('.')) {
    const m = ipToInt(prefixPart);
    if (m === null) return { error: 'That is not a valid subnet mask.' };
    const p = prefixFromMask(m);
    if (p === null) return { error: 'That mask is not a run of ones followed by zeros.' };
    return { ip, prefix: p };
  }

  if (!/^\d{1,2}$/.test(prefixPart)) return { error: 'A prefix length is a number from 0 to 32.' };
  const p = Number(prefixPart);
  if (p < 0 || p > 32) return { error: 'A prefix length is a number from 0 to 32.' };
  return { ip, prefix: p };
}

export function compute(input: string, separatePrefix?: string): SubnetResult {
  const parsed = parseCidr(input, separatePrefix);
  if ('error' in parsed) return { ok: false, error: parsed.error };

  const { ip, prefix } = parsed;
  const mask = maskFromPrefix(prefix);
  const wildcard = ~mask >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);

  // The two special cases that catch people out.
  let usableHosts: number;
  let firstHost: number;
  let lastHost: number;
  let specialNote: string | undefined;

  if (prefix === 32) {
    usableHosts = 1;
    firstHost = ip;
    lastHost = ip;
    specialNote = 'A /32 is a single host. The address is both the network and the host.';
  } else if (prefix === 31) {
    usableHosts = 2;
    firstHost = network;
    lastHost = broadcast;
    specialNote =
      'A /31 has no reserved network or broadcast address. Both addresses are usable, which is what makes it useful on a point-to-point link.';
  } else {
    usableHosts = totalAddresses - 2;
    firstHost = network + 1;
    lastHost = broadcast - 1;
  }

  const ranges = SPECIAL_RANGES.filter((r) => {
    const parsedRange = parseCidr(r.cidr);
    if ('error' in parsedRange) return false;
    const rMask = maskFromPrefix(parsedRange.prefix);
    const rNet = (parsedRange.ip & rMask) >>> 0;
    const rBcast = (rNet | (~rMask >>> 0)) >>> 0;
    return ip >= rNet && ip <= rBcast;
  });

  const pad = (n: number) => (n >>> 0).toString(2).padStart(32, '0');
  const grouped = (b: string) => b.replace(/(.{8})(?=.)/g, '$1.');

  return {
    ok: true,
    address: intToIp(ip),
    prefix,
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    netmask: intToIp(mask),
    wildcard: intToIp(wildcard),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    totalAddresses,
    usableHosts,
    specialNote,
    klass: ipClass((ip >>> 24) & 255),
    ranges,
    binary: {
      address: grouped(pad(ip)),
      netmask: grouped(pad(mask)),
      network: grouped(pad(network)),
    },
  };
}

export interface SubnetSplit {
  prefix: number;
  total: number;
  shown: { network: string; broadcast: string; firstHost: string; lastHost: string }[];
  truncated: boolean;
}

/**
 * Split the network containing `input` into subnets of a longer prefix.
 *
 * Capped at 128 rows: a /8 split into /30s is four million subnets and printing
 * them helps nobody.
 */
export function splitSubnets(input: string, newPrefix: number, limit = 128): SubnetSplit | { error: string } {
  const parsed = parseCidr(input);
  if ('error' in parsed) return { error: parsed.error };
  if (newPrefix <= parsed.prefix) {
    return { error: `A split has to be longer than the /${parsed.prefix} you started from.` };
  }
  if (newPrefix > 32) return { error: 'A prefix length is a number from 0 to 32.' };

  const mask = maskFromPrefix(parsed.prefix);
  const base = (parsed.ip & mask) >>> 0;
  const step = 2 ** (32 - newPrefix);
  const total = 2 ** (newPrefix - parsed.prefix);
  const shown = [];
  const count = Math.min(total, limit);

  for (let i = 0; i < count; i++) {
    const net = base + i * step;
    const bcast = net + step - 1;
    shown.push({
      network: intToIp(net),
      broadcast: intToIp(bcast),
      firstHost: intToIp(newPrefix === 31 ? net : net + 1),
      lastHost: intToIp(newPrefix === 31 ? bcast : bcast - 1),
    });
  }

  return { prefix: newPrefix, total, shown, truncated: total > count };
}

/** Is `address` inside the network described by `cidr`? */
export function contains(cidr: string, address: string): boolean | { error: string } {
  const net = parseCidr(cidr);
  if ('error' in net) return { error: net.error };
  const ip = ipToInt(address);
  if (ip === null) return { error: 'That is not a valid IPv4 address.' };
  const mask = maskFromPrefix(net.prefix);
  return (ip & mask) >>> 0 === (net.ip & mask) >>> 0;
}

// ── IPv6 ───────────────────────────────────────────────────────────────────

export function parseIpv6(input: string): bigint | null {
  let s = input.trim().toLowerCase();
  if (s.startsWith('[') && s.endsWith(']')) s = s.slice(1, -1);
  if (s.includes('/')) s = s.split('/')[0];
  if (s === '') return null;

  // A trailing dotted quad is legal, e.g. ::ffff:192.168.1.1
  let tail = '';
  const lastColon = s.lastIndexOf(':');
  if (s.slice(lastColon + 1).includes('.')) {
    const v4 = ipToInt(s.slice(lastColon + 1));
    if (v4 === null) return null;
    tail = ((v4 >>> 16) & 0xffff).toString(16) + ':' + (v4 & 0xffff).toString(16);
    s = s.slice(0, lastColon + 1) + tail;
  }

  const halves = s.split('::');
  if (halves.length > 2) return null;

  const parseGroups = (part: string): number[] | null => {
    if (part === '') return [];
    const out: number[] = [];
    for (const g of part.split(':')) {
      if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
      out.push(parseInt(g, 16));
    }
    return out;
  };

  let groups: number[];
  if (halves.length === 2) {
    const head = parseGroups(halves[0]);
    const foot = parseGroups(halves[1]);
    if (head === null || foot === null) return null;
    const fill = 8 - head.length - foot.length;
    if (fill < 1) return null;
    groups = [...head, ...Array(fill).fill(0), ...foot];
  } else {
    const all = parseGroups(s);
    if (all === null || all.length !== 8) return null;
    groups = all;
  }

  let value = 0n;
  for (const g of groups) value = (value << 16n) | BigInt(g);
  return value;
}

export function ipv6ToGroups(value: bigint): number[] {
  const out: number[] = [];
  for (let i = 7; i >= 0; i--) out.push(Number((value >> BigInt(i * 16)) & 0xffffn));
  return out;
}

/** The canonical compressed form: lowercase, longest run of zeros replaced by `::`. */
export function compressIpv6(value: bigint): string {
  const groups = ipv6ToGroups(value).map((g) => g.toString(16));

  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;
  for (let i = 0; i < 8; i++) {
    if (groups[i] === '0') {
      if (curStart === -1) curStart = i;
      curLen++;
      if (curLen > bestLen) {
        bestLen = curLen;
        bestStart = curStart;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }

  if (bestLen < 2) return groups.join(':');
  const head = groups.slice(0, bestStart).join(':');
  const foot = groups.slice(bestStart + bestLen).join(':');
  return `${head}::${foot}`;
}

export function expandIpv6(value: bigint): string {
  return ipv6ToGroups(value)
    .map((g) => g.toString(16).padStart(4, '0'))
    .join(':');
}

export function ipv6Type(value: bigint): { name: string; note: string } {
  const top = Number(value >> 120n);
  if (value === 1n) return { name: 'Loopback', note: '::1, the IPv6 equivalent of 127.0.0.1.' };
  if (value === 0n) return { name: 'Unspecified', note: '::, used as a source before an address is known.' };
  // fc00::/7, so the top seven bits are 1111110. Shifting by 121 leaves
  // exactly those seven bits.
  if ((value >> 121n) === 0b1111110n)
    return { name: 'Unique local', note: 'fc00::/7. The IPv6 private range.' };
  if ((value >> 118n) === 0b1111111010n) return { name: 'Link-local', note: 'fe80::/10. Only valid on one link.' };
  if (top === 0xff) return { name: 'Multicast', note: 'ff00::/8. One sender, many listeners.' };
  if ((value >> 112n) === 0x2001n && Number((value >> 96n) & 0xffffn) === 0x0db8) {
    return { name: 'Documentation', note: '2001:db8::/32. Reserved for examples.' };
  }
  if (top >= 0x20 && top <= 0x3f) return { name: 'Global unicast', note: '2000::/3. The routable range.' };
  return { name: 'Other', note: 'Not in a range this calculator names.' };
}

export interface Ipv6Result {
  ok: boolean;
  error?: string;
  compressed?: string;
  expanded?: string;
  prefix?: number;
  first?: string;
  last?: string;
  count?: string;
  type?: { name: string; note: string };
  binary?: string;
}

export function computeIpv6(input: string): Ipv6Result {
  const s = input.trim();
  if (s === '') return { ok: false, error: 'Enter an IPv6 address, for example 2001:db8::1/64.' };

  let addrPart = s;
  let prefix = 64;
  if (s.includes('/')) {
    const [a, p] = s.split('/');
    addrPart = a;
    if (!/^\d{1,3}$/.test(p) || Number(p) > 128) {
      return { ok: false, error: 'An IPv6 prefix length is a number from 0 to 128.' };
    }
    prefix = Number(p);
  }

  const value = parseIpv6(addrPart);
  if (value === null) {
    return { ok: false, error: 'That is not a valid IPv6 address. Eight groups of four hex digits, or :: to shorten a run of zeros.' };
  }

  const hostBits = BigInt(128 - prefix);
  const mask = prefix === 0 ? 0n : ((1n << BigInt(prefix)) - 1n) << hostBits;
  const network = value & mask;
  const last = network | ((1n << hostBits) - 1n);
  const count = 1n << hostBits;

  return {
    ok: true,
    compressed: compressIpv6(value),
    expanded: expandIpv6(value),
    prefix,
    first: compressIpv6(network),
    last: compressIpv6(last),
    count: count.toLocaleString('en-GB'),
    type: ipv6Type(value),
    binary: value.toString(2).padStart(128, '0').replace(/(.{16})(?=.)/g, '$1 '),
  };
}
