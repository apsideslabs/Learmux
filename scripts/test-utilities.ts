/**
 * Tests for the utility logic.
 *
 * A calculator that is quietly wrong is worse than no calculator, because
 * people trust it. Every function that does arithmetic or byte manipulation is
 * checked against published known-answer vectors rather than against itself:
 * MD5 and SHA test vectors from RFC 1321 and FIPS 180-4, an HMAC vector from
 * RFC 4231, subnet boundaries from the RFCs, and the permission strings against
 * what `ls -l` actually prints.
 *
 *   node scripts/test-utilities.mjs
 */

import {
  randomInt,
  alphabetFor,
  passwordEntropyBits,
  passphraseEntropyBits,
  generatePassword,
  generatePassphrase,
  strengthOf,
  shuffle,
  CHAR_SETS,
} from '../src/lib/utilities/random';
import {
  toBase64,
  fromBase64,
  toBase64Url,
  fromBase64Url,
  toHex,
  fromHex,
  toUrl,
  fromUrl,
  rot13,
  toHtml,
  fromHtml,
  toBinary,
  fromBinary,
  encode,
  decode,
} from '../src/lib/utilities/encoding';
import {
  md5Bytes,
  hashText,
  hmac,
  timingSafeEqual,
  hexToBytes,
  guessAlgorithm,
} from '../src/lib/utilities/hashing';
import { inspect, verify, decodeSegment } from '../src/lib/utilities/jwt';
import {
  toOctal,
  toOctal4,
  toSymbolic,
  toSymbolic9,
  fromOctal,
  fromSymbolic,
  applyClause,
  parseAny,
  emptyBits,
  describe,
} from '../src/lib/utilities/permissions';
import {
  ipToInt,
  intToIp,
  maskFromPrefix,
  prefixFromMask,
  compute,
  computeIpv6,
  splitSubnets,
  contains,
  parseIpv6,
  compressIpv6,
  expandIpv6,
  ipv6Type,
} from '../src/lib/utilities/subnet';
import { WORD_LIST, WORD_COUNT, BITS_PER_WORD } from '../src/lib/utilities/words';

let checks = 0;
let failures = 0;
let group = '';

function section(name: string) {
  group = name;
  console.log(`\n── ${name} ──`);
}

function ok(condition: boolean, label: string) {
  checks++;
  if (!condition) {
    failures++;
    console.log(`  FAIL  ${group}: ${label}`);
  }
}

/** JSON, but BigInt values are rendered rather than throwing. */
function show(value: unknown): string {
  return JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? `${v}n` : v));
}

function eq(actual: unknown, expected: unknown, label: string) {
  const a = show(actual);
  const e = show(expected);
  checks++;
  if (a !== e) {
    failures++;
    console.log(`  FAIL  ${group}: ${label}\n        expected ${e}\n        got      ${a}`);
  }
}

function near(actual: number, expected: number, tolerance: number, label: string) {
  checks++;
  if (Math.abs(actual - expected) > tolerance) {
    failures++;
    console.log(`  FAIL  ${group}: ${label} (expected ~${expected}, got ${actual})`);
  }
}

async function main() {
  // Node exposes Web Crypto as a global from 19 onwards; assert it rather than
  // assume it, because every hash and signature check below depends on it.
  ok(typeof crypto?.getRandomValues === 'function', 'crypto.getRandomValues is available');
  ok(typeof crypto?.subtle?.digest === 'function', 'crypto.subtle.digest is available');

  // ── the word list ────────────────────────────────────────────────────────
  section('word list');
  eq(WORD_COUNT, 7776, 'the EFF long list has 7776 words');
  near(BITS_PER_WORD, 12.925, 0.001, 'bits per word is log2(7776)');
  eq(new Set(WORD_LIST).size, 7776, 'no duplicate words');
  ok(WORD_LIST.every((w) => w.length >= 3 && w.length <= 9), 'every word is 3 to 9 characters');
  ok(WORD_LIST.every((w) => /^[a-z-]+$/.test(w)), 'every word is lowercase letters or a hyphen');
  eq(WORD_LIST[0], 'abacus', 'first word is abacus');
  eq(WORD_LIST[7775], 'zoom', 'last word is zoom');

  // ── random ───────────────────────────────────────────────────────────────
  section('randomness');
  eq(randomInt(1), 0, 'a range of one always returns zero');
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < 20000; i++) {
    const v = randomInt(10);
    if (v < min) min = v;
    if (v > max) max = v;
    if (v < 0 || v > 9 || !Number.isInteger(v)) {
      ok(false, 'randomInt(10) stayed in range');
      break;
    }
  }
  eq([min, max], [0, 9], 'randomInt(10) covers the whole range');

  // Uniformity: 60000 draws over 6 buckets should be within ~3% of 10000 each.
  const buckets = new Array(6).fill(0);
  for (let i = 0; i < 60000; i++) buckets[randomInt(6)]++;
  const worst = Math.max(...buckets.map((b) => Math.abs(b - 10000) / 10000));
  ok(worst < 0.05, `six buckets are uniform within 5% (worst was ${(worst * 100).toFixed(1)}%)`);

  // The case modulo bias is worst at: 3 does not divide 2^32.
  const three = new Array(3).fill(0);
  for (let i = 0; i < 60000; i++) three[randomInt(3)]++;
  const worst3 = Math.max(...three.map((b) => Math.abs(b - 20000) / 20000));
  ok(worst3 < 0.05, `three buckets are uniform within 5% (worst was ${(worst3 * 100).toFixed(1)}%)`);

  const sh = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  eq([...sh].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'shuffle keeps every element');

  eq(alphabetFor(['digits'], false), CHAR_SETS.digits, 'digits alphabet');
  eq(alphabetFor(['digits'], true), '23456789', 'ambiguous characters are removed');
  eq(alphabetFor(['lowercase'], true).length, 24, '26 lowercase minus I, l, o');
  eq(alphabetFor(['uppercase'], true).length, 24, '26 uppercase minus I, O');
  eq(alphabetFor(['lowercase', 'uppercase', 'digits', 'symbols'], false).length, 26 + 26 + 10 + 24, 'the full alphabet size is 86');

  near(passwordEntropyBits(62, 16), 95.267, 0.01, '16 characters from 62 is 95.3 bits');
  near(passphraseEntropyBits(6), 77.55, 0.01, '6 EFF words is 77.5 bits');
  eq(passwordEntropyBits(1, 10), 0, 'a one-character alphabet carries no entropy');
  eq(strengthOf(30).verdict, 'weak', '30 bits is weak');
  eq(strengthOf(50).verdict, 'fair', '50 bits is fair');
  eq(strengthOf(70).verdict, 'strong', '70 bits is strong');
  eq(strengthOf(100).verdict, 'excellent', '100 bits is excellent');

  const pw = generatePassword({ length: 20, sets: ['lowercase', 'uppercase', 'digits', 'symbols'], excludeAmbiguous: true, requireEachSet: true });
  eq(pw.value.length, 20, 'the generated password is the requested length');
  eq(pw.present.length, 4, 'all four classes appear when required');
  ok(!/[Il1O0o]/.test(pw.value), 'no ambiguous characters when excluded');
  near(pw.bits, passwordEntropyBits(pw.alphabetSize, 20), 0.001, 'reported entropy matches the alphabet');

  const digitsOnly = generatePassword({ length: 8, sets: ['digits'], excludeAmbiguous: false, requireEachSet: false });
  ok(/^[0-9]{8}$/.test(digitsOnly.value), 'a digits-only password is only digits');

  const phrase = generatePassphrase({ words: 6, separator: '-', capitalise: false, appendNumber: false });
  eq(phrase.words.length, 6, 'the passphrase has the requested word count');
  eq(phrase.value.split('-').length, 6, 'the separator joins them');
  ok(phrase.words.every((w) => WORD_LIST.includes(w)), 'every word comes from the EFF list');

  // ── encoding ─────────────────────────────────────────────────────────────
  section('encoding');
  eq(toBase64('hello'), 'aGVsbG8=', 'base64 of hello');
  eq(fromBase64('aGVsbG8='), 'hello', 'base64 round trip');
  eq(toBase64('café'), 'Y2Fmw6k=', 'base64 is UTF-8, not latin-1');
  eq(fromBase64('Y2Fmw6k='), 'café', 'non-ASCII survives a round trip');
  eq(fromBase64(toBase64('emoji: 🔐 and text')), 'emoji: 🔐 and text', 'emoji survives a round trip');
  eq(toBase64(''), '', 'empty in, empty out');

  eq(toBase64Url('hello'), 'aGVsbG8', 'base64url drops the padding');
  eq(toBase64Url('café'), 'Y2Fmw6k', 'base64url of non-ASCII');
  ok(!/[+/=]/.test(toBase64Url('???>>>~~~')), 'base64url never emits +, / or =');
  eq(fromBase64Url('aGVsbG8'), 'hello', 'base64url round trip');
  eq(fromBase64Url('Y2Fmw6k'), 'café', 'base64url non-ASCII round trip');

  eq(toHex('abc'), '616263', 'hex of abc');
  eq(fromHex('616263'), 'abc', 'hex round trip');
  eq(fromHex('61:62:63'), 'abc', 'hex tolerates colons');
  eq(fromHex('61 62 63'), 'abc', 'hex tolerates spaces');
  eq(toHex('café'), '636166c3a9', 'hex is UTF-8 bytes');
  eq(fromHex('636166c3a9'), 'café', 'hex non-ASCII round trip');

  eq(toUrl('a b&c=d'), 'a%20b%26c%3Dd', 'url encoding escapes the separators');
  eq(fromUrl('a%20b%26c%3Dd'), 'a b&c=d', 'url round trip');
  eq(fromUrl('a+b'), 'a b', 'a plus in a query string means a space');

  eq(rot13('Hello, World!'), 'Uryyb, Jbeyq!', 'rot13 known answer');
  eq(rot13(rot13('anything at all 123')), 'anything at all 123', 'rot13 is its own inverse');

  eq(toHtml('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;', 'html escaping');
  eq(fromHtml('&lt;b&gt;&amp;&lt;/b&gt;'), '<b>&</b>', 'html round trip');
  eq(fromHtml('&#65;&#x42;'), 'AB', 'numeric entities decode');

  eq(toBinary('A'), '01000001', 'binary of A');
  eq(fromBinary('01000001'), 'A', 'binary round trip');
  eq(fromBinary('0100 0001 0010 0000 0100 0010'), 'A B', 'binary tolerates spaces');

  const badB64 = decode('base64', 'not base64!!');
  eq(badB64.ok, false, 'invalid base64 is rejected');
  ok((badB64.error ?? '').length > 20, 'the base64 error explains itself');
  eq(decode('hex', 'abc').ok, false, 'odd-length hex is rejected');
  eq(decode('hex', 'zz').ok, false, 'non-hex characters are rejected');
  eq(decode('binary', '012').ok, false, 'binary that is not a whole byte is rejected');
  eq(encode('base64', 'test').ok, true, 'encoding reports success');
  eq(encode('hex', 'test').inputBytes, 4, 'the byte count is reported');

  // ── hashing ──────────────────────────────────────────────────────────────
  section('hashing');
  const hexOf = (bytes: Uint8Array) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

  // RFC 1321 test suite.
  eq(hexOf(md5Bytes(new TextEncoder().encode(''))), 'd41d8cd98f00b204e9800998ecf8427e', 'MD5 of the empty string');
  eq(hexOf(md5Bytes(new TextEncoder().encode('a'))), '0cc175b9c0f1b6a831c399e269772661', 'MD5 of a');
  eq(hexOf(md5Bytes(new TextEncoder().encode('abc'))), '900150983cd24fb0d6963f7d28e17f72', 'MD5 of abc');
  eq(hexOf(md5Bytes(new TextEncoder().encode('message digest'))), 'f96b697d7cb7938d525a2f31aaf161d0', 'MD5 of message digest');
  eq(hexOf(md5Bytes(new TextEncoder().encode('abcdefghijklmnopqrstuvwxyz'))), 'c3fcd3d76192e4007dfb496cca67e13b', 'MD5 of the alphabet');
  eq(hexOf(md5Bytes(new TextEncoder().encode('12345678901234567890123456789012345678901234567890123456789012345678901234567890'))), '57edf4a22be3c955ac49da2e2107b67a', 'MD5 of the long digit string');

  // FIPS 180-4.
  eq((await hashText('SHA-1', 'abc')).hex, 'a9993e364706816aba3e25717850c26c9cd0d89d', 'SHA-1 of abc');
  eq((await hashText('SHA-256', '')).hex, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'SHA-256 of the empty string');
  eq((await hashText('SHA-256', 'abc')).hex, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'SHA-256 of abc');
  eq((await hashText('SHA-256', 'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).hex, '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1', 'SHA-256 of the 56 byte string');
  eq((await hashText('SHA-512', 'abc')).hex, 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f', 'SHA-512 of abc');
  eq((await hashText('SHA-384', 'abc')).hex.length, 96, 'SHA-384 produces 48 bytes');
  eq((await hashText('MD5', 'abc')).base64, 'kAFQmDzST7DWlj99KOF/cg==', 'the base64 digest is offered too');

  // RFC 4231, test case 2.
  const hmacKey = new TextEncoder().encode('Jefe');
  const hmacData = new TextEncoder().encode('what do ya want for nothing?');
  eq(hexOf(await hmac('SHA-256', hmacKey, hmacData)), '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843', 'HMAC-SHA256, RFC 4231 case 2');
  eq(hexOf(await hmac('SHA-512', hmacKey, hmacData)).length, 128, 'HMAC-SHA512 is 64 bytes');

  ok(timingSafeEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3])), 'equal byte arrays compare equal');
  ok(!timingSafeEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 4])), 'a differing byte is caught');
  ok(!timingSafeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3])), 'different lengths are caught');

  eq(hexToBytes('616263')?.length, 3, 'hexToBytes parses');
  eq(hexToBytes('xyz'), null, 'hexToBytes rejects non-hex');
  eq(guessAlgorithm('d41d8cd98f00b204e9800998ecf8427e'), 'MD5', 'a 32 character digest is guessed as MD5');
  eq(guessAlgorithm('a'.repeat(64)), 'SHA-256', 'a 64 character digest is guessed as SHA-256');
  eq(guessAlgorithm('a'.repeat(65)), null, 'an odd length is not guessed');

  // ── permissions ──────────────────────────────────────────────────────────
  section('permissions');
  const sym = (octal: string) => toSymbolic(fromOctal(octal).bits!);
  eq(sym('755'), '-rwxr-xr-x', '755 is rwxr-xr-x');
  eq(sym('644'), '-rw-r--r--', '644 is rw-r--r--');
  eq(sym('600'), '-rw-------', '600 is rw-------');
  eq(sym('777'), '-rwxrwxrwx', '777 is rwxrwxrwx');
  eq(sym('000'), '----------', '000 is nothing at all');
  eq(sym('4755'), '-rwsr-xr-x', 'setuid with execute is a lowercase s');
  eq(sym('4644'), '-rwSr--r--', 'setuid without execute is an uppercase S');
  eq(sym('2755'), '-rwxr-sr-x', 'setgid with execute is a lowercase s');
  eq(sym('2644'), '-rw-r-Sr--', 'setgid without execute is an uppercase S');
  eq(sym('1777'), '-rwxrwxrwt', 'the sticky bit is a lowercase t');
  eq(sym('1644'), '-rw-r--r-T', 'sticky without execute is an uppercase T');
  eq(sym('6755'), '-rwsr-sr-x', 'setuid and setgid together');

  eq(toOctal(fromOctal('755').bits!), '755', '755 round trips through symbolic');
  eq(toOctal(fromOctal('4755').bits!), '4755', '4755 round trips');
  eq(toOctal4(fromOctal('755').bits!), '0755', 'the four digit form pads');
  eq(toSymbolic9(fromOctal('755').bits!), 'rwxr-xr-x', 'the nine character form drops the type');

  const dir = fromOctal('755', 'd');
  eq(toSymbolic(dir.bits!), 'drwxr-xr-x', 'a directory shows its type character');
  eq(toOctal(dir.bits!), '755', 'the type is not part of the octal');

  eq(fromOctal('888').ok, false, '8 is not an octal digit');
  eq(fromOctal('75').ok, false, 'two digits is too few');
  eq(fromOctal('75555').ok, false, 'five digits is too many');

  eq(toSymbolic(fromSymbolic('rwxr-xr-x').bits!), '-rwxr-xr-x', 'symbolic parses back');
  eq(toOctal(fromSymbolic('rwxr-xr-x').bits!), '755', 'symbolic to octal');
  eq(toOctal(fromSymbolic('rwsr-xr-x').bits!), '4755', 'a lowercase s sets setuid and execute');
  eq(toOctal(fromSymbolic('rwSr--r--').bits!), '4644', 'an uppercase S sets setuid without execute');
  eq(toOctal(fromSymbolic('rwxrwxrwt').bits!), '1777', 'a lowercase t sets sticky');
  eq(toOctal(fromSymbolic('rw-r--r-T').bits!), '1644', 'an uppercase T sets sticky without execute');
  eq(toOctal(fromSymbolic('-rwsr-xr-x').bits!), '4755', 'the ten character form is accepted');
  eq(fromSymbolic('rwx').ok, false, 'a short symbolic string is rejected');

  eq(toOctal(applyClause(emptyBits(), 'u+x').bits!), '100', 'u+x gives the owner execute');
  eq(toOctal(applyClause(fromOctal('777').bits!, 'go-w').bits!), '755', 'go-w removes group and other write');
  eq(toOctal(applyClause(fromOctal('777').bits!, 'a=r').bits!), '444', 'a=r clears then sets read only');
  eq(toOctal(applyClause(fromOctal('000').bits!, 'u+rwx,go+rx').bits!), '755', 'two clauses in sequence');
  eq(applyClause(emptyBits(), 'q+x').ok, false, 'an invalid who is rejected');

  eq(toOctal(parseAny('755').bits!), '755', 'parseAny reads octal');
  eq(toOctal(parseAny('rwxr-xr-x').bits!), '755', 'parseAny reads symbolic');
  eq(toOctal(parseAny('u+x').bits!), '100', 'parseAny reads a clause');
  eq(parseAny('nonsense').ok, false, 'parseAny rejects nonsense');
  ok(describe(fromOctal('4755').bits!).some((m) => m.risky && m.label === 'setuid'), 'setuid is flagged as risky');
  ok(describe(fromOctal('000').bits!).length === 1, 'a file with no permissions explains itself');

  // ── subnets ──────────────────────────────────────────────────────────────
  section('subnets');
  eq(ipToInt('0.0.0.0'), 0, '0.0.0.0 is zero');
  eq(ipToInt('255.255.255.255'), 4294967295, 'the broadcast address is unsigned, not negative');
  eq(ipToInt('192.168.1.1'), 3232235777, '192.168.1.1 as an integer');
  eq(ipToInt('999.1.1.1'), null, 'an octet above 255 is rejected');
  eq(ipToInt('1.2.3'), null, 'three octets is rejected');
  eq(intToIp(3232235777), '192.168.1.1', 'the integer converts back');
  eq(intToIp(4294967295), '255.255.255.255', 'the top of the space converts back');

  eq(maskFromPrefix(24), 4294967040, '/24 mask');
  eq(maskFromPrefix(0), 0, '/0 mask is zero');
  eq(maskFromPrefix(32), 4294967295, '/32 mask is all ones');
  eq(prefixFromMask(maskFromPrefix(24)), 24, 'the mask converts back to a prefix');
  eq(prefixFromMask(maskFromPrefix(0)), 0, '/0 converts back');
  eq(prefixFromMask(0b11000000000000000000000000000000 >>> 0), 2, 'a two-bit mask');
  eq(prefixFromMask(0b11010000000000000000000000000000 >>> 0), null, 'a mask with a gap is rejected');

  const c24 = compute('192.168.1.10/24');
  eq(c24.ok, true, '/24 parses');
  eq(c24.network, '192.168.1.0', '/24 network');
  eq(c24.broadcast, '192.168.1.255', '/24 broadcast');
  eq(c24.netmask, '255.255.255.0', '/24 netmask');
  eq(c24.wildcard, '0.0.0.255', '/24 wildcard');
  eq(c24.firstHost, '192.168.1.1', '/24 first host');
  eq(c24.lastHost, '192.168.1.254', '/24 last host');
  eq(c24.totalAddresses, 256, '/24 holds 256 addresses');
  eq(c24.usableHosts, 254, '/24 has 254 usable');
  eq(c24.klass?.name, 'Class C', '192.x is class C');
  ok((c24.ranges ?? []).some((r) => r.name === 'Private'), '192.168 is flagged private');

  const c25 = compute('192.168.1.130/25');
  eq(c25.network, '192.168.1.128', 'an address in the upper half of a /25 lands in the right subnet');
  eq(c25.broadcast, '192.168.1.255', '/25 broadcast');
  eq(c25.usableHosts, 126, '/25 has 126 usable');

  const c12 = compute('172.16.5.5/12');
  eq(c12.network, '172.16.0.0', '/12 network');
  eq(c12.broadcast, '172.31.255.255', '/12 broadcast, which does not end on a byte boundary');
  eq(c12.totalAddresses, 1048576, '/12 holds a million addresses');
  eq(c12.netmask, '255.240.0.0', '/12 netmask');

  const c31 = compute('10.0.0.5/31');
  eq(c31.network, '10.0.0.4', '/31 network');
  eq(c31.broadcast, '10.0.0.5', '/31 broadcast');
  eq(c31.usableHosts, 2, '/31 has two usable addresses, not zero');
  eq(c31.firstHost, '10.0.0.4', '/31 first usable is the network address');
  eq(c31.lastHost, '10.0.0.5', '/31 last usable is the broadcast address');
  ok((c31.specialNote ?? '').includes('point-to-point'), '/31 explains itself');

  const c32 = compute('192.168.1.7/32');
  eq(c32.usableHosts, 1, '/32 is a single host');
  eq(c32.network, '192.168.1.7', '/32 network is the host');
  eq(c32.broadcast, '192.168.1.7', '/32 broadcast is the host');
  ok((c32.specialNote ?? '').includes('single host'), '/32 explains itself');

  const c0 = compute('8.8.8.8/0');
  eq(c0.totalAddresses, 4294967296, '/0 holds the whole space without overflowing');
  eq(c0.usableHosts, 4294967294, '/0 usable count');
  eq(c0.network, '0.0.0.0', '/0 network');
  eq(c0.broadcast, '255.255.255.255', '/0 broadcast');
  eq(c0.netmask, '0.0.0.0', '/0 netmask');

  const loop = compute('127.0.0.1/8');
  ok((loop.ranges ?? []).some((r) => r.name === 'Loopback'), '127.0.0.1 is flagged loopback');
  const ll = compute('169.254.10.10/16');
  ok((ll.ranges ?? []).some((r) => r.name === 'Link-local'), '169.254 is flagged link-local');
  const mc = compute('224.0.0.1/4');
  ok((mc.ranges ?? []).some((r) => r.name === 'Multicast'), '224.0.0.1 is flagged multicast');
  const doc = compute('203.0.113.9/24');
  ok((doc.ranges ?? []).some((r) => r.name === 'Documentation'), '203.0.113 is flagged documentation');

  eq(compute('192.168.1.1/33').ok, false, 'a prefix above 32 is rejected');
  eq(compute('192.168.1.1').ok, false, 'a missing prefix is rejected');
  eq(compute('192.168.1.1/abc').ok, false, 'a non-numeric prefix is rejected');
  eq(compute('hello/24').ok, false, 'a bad address is rejected');
  eq(compute('192.168.1.10', '255.255.255.0').prefix, 24, 'a dotted mask works as the prefix');
  eq(compute('192.168.1.10', '255.0.255.0').ok, false, 'a non-contiguous mask is rejected');

  eq(c24.binary?.address, '11000000.10101000.00000001.00001010', 'the binary form is grouped by octet');

  const split = splitSubnets('192.168.1.0/24', 26);
  ok(!('error' in split), 'a /24 splits into /26s');
  if (!('error' in split)) {
    eq(split.total, 4, 'four /26 subnets');
    eq(split.shown.length, 4, 'all four are listed');
    eq(split.shown[0].network, '192.168.1.0', 'first subnet');
    eq(split.shown[0].broadcast, '192.168.1.63', 'first subnet broadcast');
    eq(split.shown[3].network, '192.168.1.192', 'last subnet');
    eq(split.shown[3].broadcast, '192.168.1.255', 'last subnet broadcast');
  }
  const splitBig = splitSubnets('10.0.0.0/8', 30);
  ok(!('error' in splitBig) && 'truncated' in splitBig && splitBig.truncated, 'a huge split is capped and says so');
  const splitBad = splitSubnets('192.168.1.0/24', 20);
  ok('error' in splitBad, 'a shorter prefix than the start is rejected');

  eq(contains('10.0.0.0/8', '10.255.255.255'), true, 'the last address of a /8 is inside it');
  eq(contains('10.0.0.0/8', '11.0.0.0'), false, 'the address just past a /8 is outside');
  eq(contains('192.168.1.0/24', '192.168.1.0'), true, 'the network address is inside');

  // IPv6
  eq(parseIpv6('::1'), 1n, '::1 parses to one');
  eq(parseIpv6('::'), 0n, ':: parses to zero');
  eq(parseIpv6('2001:db8::1'), 0x20010db8000000000000000000000001n, 'a full IPv6 address parses');
  eq(parseIpv6('not:an:address'), null, 'a bad IPv6 address is rejected');
  eq(parseIpv6('1:2:3:4:5:6:7'), null, 'seven groups with no :: is rejected');
  eq(expandIpv6(0x20010db8000000000000000000000001n), '2001:0db8:0000:0000:0000:0000:0000:0001', 'the expanded form is eight groups');
  eq(compressIpv6(0x20010db8000000000000000000000001n), '2001:db8::1', 'the compressed form collapses the zeros');
  eq(compressIpv6(1n), '::1', 'loopback compresses to ::1');
  eq(compressIpv6(0n), '::', 'the unspecified address compresses to ::');
  eq(parseIpv6('::ffff:192.168.1.1'), 0xffffc0a80101n, 'an embedded IPv4 tail parses');

  const v6 = computeIpv6('2001:db8::1/64');
  eq(v6.ok, true, 'an IPv6 prefix parses');
  eq(v6.first, '2001:db8::', 'the /64 first address');
  eq(v6.last, '2001:db8::ffff:ffff:ffff:ffff', 'the /64 last address');
  eq(v6.type?.name, 'Documentation', '2001:db8 is flagged as documentation');
  eq(computeIpv6('fe80::1/64').type?.name, 'Link-local', 'fe80 is link-local');
  eq(computeIpv6('fc00::1/7').type?.name, 'Unique local', 'fc00 is unique local');
  eq(computeIpv6('ff02::1/16').type?.name, 'Multicast', 'ff02 is multicast');
  eq(computeIpv6('::1/128').type?.name, 'Loopback', '::1 is loopback');
  eq(computeIpv6('2001:db8::1/129').ok, false, 'a prefix above 128 is rejected');
  eq(computeIpv6('nonsense').ok, false, 'a bad IPv6 address is rejected');

  // ── JWT ──────────────────────────────────────────────────────────────────
  section('jwt');
  const good =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQyIiwicm9sZSI6InN0dWRlbnQiLCJpc3MiOiJsZWFybXV4IiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.Jz09KMMdg3hrDlc5aStuSCoKGtViNHpNMVZqMOww3mE';
  const noneTok = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlzcyI6ImxlYXJtdXgifQ.';

  const g = inspect(good);
  eq(g.ok, true, 'a valid token is inspected');
  eq(g.algorithm, 'HS256', 'the algorithm is read from the header');
  eq(g.algorithmFamily, 'hmac', 'HS256 is recognised as HMAC');
  eq(g.payload?.sub, 'user-42', 'the subject claim is read');
  eq(g.signatureBytes, 32, 'an HS256 signature is 32 bytes');
  eq(g.expired, false, 'a token expiring in 2033 is not expired');
  eq(g.issuedAt?.toISOString(), '2023-11-14T22:13:20.000Z', 'iat is converted to a date');
  ok((g.warnings ?? []).some((w) => w.title.includes('not secret')), 'the payload is flagged as readable');
  ok((g.warnings ?? []).some((w) => w.level === 'info' && w.title.includes('Symmetric')), 'HS256 is explained');

  const n = inspect(noneTok);
  eq(n.ok, true, 'an alg:none token is inspected rather than refused');
  eq(n.algorithmFamily, 'none', 'alg:none is recognised');
  ok((n.warnings ?? []).some((w) => w.level === 'critical'), 'alg:none raises a critical warning');
  ok((n.warnings ?? []).some((w) => w.title.includes('expiry')), 'a token with no exp is flagged');

  eq(inspect('a.b').ok, false, 'a two-part token is rejected');
  eq(inspect('').ok, false, 'an empty token is rejected');
  eq(inspect('a.b.c').ok, false, 'a token whose header is not JSON is rejected');
  eq(inspect('Bearer ' + good).ok, true, 'a Bearer prefix is tolerated');
  eq(decodeSegment('not!base64').ok, false, 'a bad segment is reported, not thrown');

  const okVerify = await verify(g, 'learmux-demo');
  eq(okVerify.status, 'verified', 'the correct secret verifies the signature');
  const wrongVerify = await verify(g, 'wrong-secret');
  eq(wrongVerify.status, 'failed', 'the wrong secret fails');
  const noKey = await verify(g, '');
  eq(noKey.status, 'not-checked', 'no key means the signature is not checked, and says so');
  const noneVerify = await verify(n, 'anything');
  eq(noneVerify.status, 'failed', 'an alg:none token cannot be verified and is refused');

  // Tamper with the payload and confirm the signature stops matching.
  const tampered = good.split('.');
  const newPayload = Buffer.from(JSON.stringify({ sub: 'admin', role: 'admin' })).toString('base64url');
  const tamperedTok = `${tampered[0]}.${newPayload}.${tampered[2]}`;
  const t2 = inspect(tamperedTok);
  eq(t2.payload?.role, 'admin', 'the tampered payload reads as admin');
  const tamperVerify = await verify(t2, 'learmux-demo');
  eq(tamperVerify.status, 'failed', 'a tampered payload fails verification');

  const expiredTok = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQyIiwiaXNzIjoibGVhcm11eCIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAzNjAwfQ.Xu5hu2zEZtpZoLfY1iqLJMbK9KSYJQDZGLWsxkGjcNA';
  const ex = inspect(expiredTok);
  eq(ex.expired, true, 'an expired token is marked expired');
  ok((ex.warnings ?? []).some((w) => w.title.includes('expired')), 'expiry raises a warning');
  eq((await verify(ex, 'learmux-demo')).status, 'verified', 'an expired token still has a valid signature');

  // ── summary ──────────────────────────────────────────────────────────────
  console.log(
    `\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}  (${checks} checks)`,
  );
  if (failures > 0) process.exit(1);
}

await main();
