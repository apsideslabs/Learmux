/**
 * JWT inspection.
 *
 * The single most important thing this module gets right is the difference
 * between decoding and verifying. A JWT's header and payload are base64url, not
 * encryption: anybody holding the token can read every claim in it without any
 * key at all. The signature proves the token was issued by whoever holds the
 * key, and nothing else. A tool that shows you the claims and calls that
 * "verified" is actively dangerous.
 *
 * So `inspect` always reports `verified: false` unless a key was supplied and
 * the signature actually checked out.
 */

import { fromBase64Url } from './encoding';
import { hmac, timingSafeEqual } from './hashing';

export interface JwtParts {
  headerRaw: string;
  payloadRaw: string;
  signatureRaw: string;
  signingInput: string;
}

export interface JwtClaim {
  name: string;
  value: string;
  meaning: string;
  /** For the time claims: when that is, in words. */
  when?: string;
  problem?: string;
}

export interface JwtInspection {
  ok: boolean;
  error?: string;
  parts?: JwtParts;
  header?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  signatureBytes?: number;
  algorithm?: string;
  algorithmFamily?: 'hmac' | 'rsa' | 'ecdsa' | 'none' | 'unknown';
  claims?: JwtClaim[];
  warnings?: { level: 'critical' | 'warning' | 'info'; title: string; detail: string }[];
  issuedAt?: Date;
  expiresAt?: Date;
  notBefore?: Date;
  expired?: boolean;
  expiredAgo?: string;
  validFor?: string;
}

const CLAIM_MEANINGS: Record<string, string> = {
  iss: 'Issuer. Who created the token.',
  sub: 'Subject. Who the token is about.',
  aud: 'Audience. Who the token is intended for.',
  exp: 'Expiry. The token must not be accepted after this time.',
  nbf: 'Not before. The token must not be accepted before this time.',
  iat: 'Issued at. When the token was created.',
  jti: 'JWT ID. A unique identifier, used to prevent replay.',
  scope: 'What the token is allowed to do.',
  role: 'A role or group the subject belongs to.',
  email: 'An email address. Personal data, and readable by anyone with the token.',
};

function describeGap(from: Date, to: Date): string {
  const ms = to.getTime() - from.getTime();
  const past = ms < 0;
  const secs = Math.abs(Math.floor(ms / 1000));
  const units: [number, string][] = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [2592000, 'day'],
    [31536000, 'month'],
  ];
  let text = `${secs} seconds`;
  if (secs >= 60) {
    const [, name] = units.find(([limit]) => secs < limit) ?? [0, 'year'];
    const divisors: Record<string, number> = {
      second: 1,
      minute: 60,
      hour: 3600,
      day: 86400,
      month: 2592000,
      year: 31536000,
    };
    const n = Math.floor(secs / divisors[name]);
    text = `${n} ${name}${n === 1 ? '' : 's'}`;
  }
  return past ? `${text} ago` : `in ${text}`;
}

export function decodeSegment(segment: string): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  try {
    const json = fromBase64Url(segment);
    const value = JSON.parse(json);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return { ok: false, error: 'That segment decodes to JSON, but not to an object.' };
    }
    return { ok: true, value: value as Record<string, unknown> };
  } catch {
    return { ok: false, error: 'That segment is not base64url that decodes to JSON.' };
  }
}

export function inspect(token: string, now: Date = new Date()): JwtInspection {
  const trimmed = token.trim().replace(/^Bearer\s+/i, '');
  if (trimmed === '') return { ok: false, error: 'Paste a token to inspect it.' };

  const parts = trimmed.split('.');
  if (parts.length !== 3) {
    return {
      ok: false,
      error: `A JWT has three parts separated by dots. This one has ${parts.length}.`,
    };
  }

  const [headerRaw, payloadRaw, signatureRaw] = parts;
  const header = decodeSegment(headerRaw);
  if (!header.ok) return { ok: false, error: `The header could not be read. ${header.error}` };
  const payload = decodeSegment(payloadRaw);
  if (!payload.ok) return { ok: false, error: `The payload could not be read. ${payload.error}` };

  const algorithm = typeof header.value.alg === 'string' ? header.value.alg : undefined;
  const family: JwtInspection['algorithmFamily'] = algorithm
    ? algorithm.toLowerCase() === 'none'
      ? 'none'
      : algorithm.toUpperCase().startsWith('HS')
        ? 'hmac'
        : algorithm.toUpperCase().startsWith('RS') || algorithm.toUpperCase().startsWith('PS')
          ? 'rsa'
          : algorithm.toUpperCase().startsWith('ES')
            ? 'ecdsa'
            : 'unknown'
    : 'unknown';

  let signatureBytes: number | undefined;
  try {
    signatureBytes = fromBase64Url(signatureRaw).length;
  } catch {
    signatureBytes = undefined;
  }

  const warnings: JwtInspection['warnings'] = [];

  // The classic one. If a verifier honours this, anyone can mint any token.
  if (family === 'none') {
    warnings.push({
      level: 'critical',
      title: 'This token claims alg: none',
      detail:
        'It says it is unsigned. A verifier that accepts this will accept a token anyone can write, with any claims they like. This is one of the oldest JWT vulnerabilities there is, and it still appears in the wild.',
    });
  }

  if (family === 'hmac') {
    warnings.push({
      level: 'info',
      title: 'Symmetric signature',
      detail:
        'HS256 signs and verifies with the same secret. Everyone who can verify a token can also mint one, so the secret must never leave the issuing server. Watch for a verifier that is handed a public key here: that is the algorithm confusion attack, where an attacker signs with the public key as the HMAC secret.',
    });
  }

  if (signatureBytes === 0 && family !== 'none') {
    warnings.push({
      level: 'critical',
      title: 'The signature is empty',
      detail: `The header says ${algorithm}, but there are no signature bytes at all. Nothing about this token is authenticated.`,
    });
  }

  if (algorithm && signatureBytes !== undefined && family === 'hmac' && signatureBytes !== 32 && signatureBytes !== 48 && signatureBytes !== 64) {
    warnings.push({
      level: 'warning',
      title: 'Signature length does not match the algorithm',
      detail: `${algorithm} produces 32, 48 or 64 bytes. This signature is ${signatureBytes}. Something here is inconsistent.`,
    });
  }

  // The payload is readable by anyone. Say so once, clearly.
  warnings.push({
    level: 'info',
    title: 'The payload is not secret',
    detail:
      'Base64url is encoding, not encryption. Every claim below can be read by anyone holding this token, including an attacker who intercepts it. A JWT is signed to stop tampering, not to hide anything.',
  });

  const claims: JwtClaim[] = [];
  const push = (name: string, value: unknown, extra: Partial<JwtClaim> = {}) => {
    const meaning = CLAIM_MEANINGS[name] ?? 'An application-specific claim.';
    const shown =
      typeof value === 'string' ? value : JSON.stringify(value, null, 0) ?? String(value);
    claims.push({ name, value: shown, meaning, ...extra });
  };

  const timeClaims = new Set(['exp', 'iat', 'nbf']);
  for (const [name, value] of Object.entries(payload.value)) {
    if (timeClaims.has(name) && typeof value === 'number') {
      const when = new Date(value * 1000);
      let problem: string | undefined;
      if (name === 'exp' && when.getTime() < now.getTime()) problem = 'Expired';
      if (name === 'nbf' && when.getTime() > now.getTime()) problem = 'Not valid yet';
      push(name, when.toISOString(), { when: when.toISOString(), problem });
    } else {
      push(name, value);
    }
  }

  const exp = typeof payload.value.exp === 'number' ? new Date(payload.value.exp * 1000) : undefined;
  const iat = typeof payload.value.iat === 'number' ? new Date(payload.value.iat * 1000) : undefined;
  const nbf = typeof payload.value.nbf === 'number' ? new Date(payload.value.nbf * 1000) : undefined;

  const expired = exp !== undefined && exp.getTime() < now.getTime();
  if (expired && exp) {
    warnings.push({
      level: 'warning',
      title: 'This token has expired',
      detail: `It expired ${describeGap(exp, now).replace(' ago', '')} ago. A correct verifier should reject it, though a surprising number do not check exp at all.`,
    });
  }

  // A token that never expires is a real finding in an audit.
  if (exp === undefined) {
    warnings.push({
      level: 'warning',
      title: 'No expiry claim',
      detail:
        'There is no exp claim, so this token is valid forever unless something else revokes it. Long-lived tokens are how a single leak turns into a permanent one.',
    });
  }

  if (iat && exp) {
    const lifetime = (exp.getTime() - iat.getTime()) / 1000;
    if (lifetime > 86400 * 30) {
      warnings.push({
        level: 'info',
        title: 'A long lifetime',
        detail: `This token is valid for about ${Math.round(lifetime / 86400)} days. Access tokens are usually minutes; refresh tokens are the long-lived kind.`,
      });
    }
  }

  return {
    ok: true,
    parts: { headerRaw, payloadRaw, signatureRaw, signingInput: `${headerRaw}.${payloadRaw}` },
    header: header.value,
    payload: payload.value,
    signatureBytes,
    algorithm,
    algorithmFamily: family,
    claims,
    warnings,
    issuedAt: iat,
    expiresAt: exp,
    notBefore: nbf,
    expired,
    expiredAgo: expired && exp ? describeGap(exp, now).replace('in ', '') : undefined,
    validFor: exp && iat ? describeGap(iat, exp) : undefined,
  };
}

export type VerifyOutcome =
  | { status: 'not-checked'; detail: string }
  | { status: 'verified'; detail: string }
  | { status: 'failed'; detail: string }
  | { status: 'unsupported'; detail: string }
  | { status: 'error'; detail: string };

const HMAC_HASHES: Record<string, 'SHA-256' | 'SHA-384' | 'SHA-512'> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
};

const RSA_HASHES: Record<string, 'SHA-256' | 'SHA-384' | 'SHA-512'> = {
  RS256: 'SHA-256',
  RS384: 'SHA-384',
  RS512: 'SHA-512',
  PS256: 'SHA-256',
  PS384: 'SHA-384',
  PS512: 'SHA-512',
};

const EC_HASHES: Record<string, 'SHA-256' | 'SHA-384' | 'SHA-512'> = {
  ES256: 'SHA-256',
  ES384: 'SHA-384',
  ES512: 'SHA-512',
};

/** Strip the PEM armour and return the DER bytes inside. */
function pemToDer(pem: string): Uint8Array | null {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
  if (body === '' || !/^[A-Za-z0-9+/=]+$/.test(body)) return null;
  try {
    return Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

/**
 * Check a signature.
 *
 * `key` is the shared secret for the HS family, or a PEM public key for the RS, PS and ES families.
 */
export async function verify(
  inspection: JwtInspection,
  key: string,
): Promise<VerifyOutcome> {
  if (!inspection.ok || !inspection.parts || !inspection.algorithm) {
    return { status: 'error', detail: 'There is no readable token to verify.' };
  }
  const alg = inspection.algorithm.toUpperCase();
  const { signingInput, signatureRaw } = inspection.parts;

  if (inspection.algorithmFamily === 'none') {
    return {
      status: 'failed',
      detail:
        'The token says alg: none, so there is no signature to check. Nothing about it is authenticated. Treat it as untrusted.',
    };
  }

  if (key.trim() === '') {
    return { status: 'not-checked', detail: 'No key or secret was supplied, so the signature was not checked.' };
  }

  const encoder = new TextEncoder();
  let signature: Uint8Array;
  try {
    signature = Uint8Array.from(atob(signatureRaw.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(signatureRaw.length / 4) * 4, '=')), (c) => c.charCodeAt(0));
  } catch {
    return { status: 'error', detail: 'The signature segment is not valid base64url.' };
  }

  try {
    if (alg in HMAC_HASHES) {
      const computed = await hmac(HMAC_HASHES[alg], encoder.encode(key), encoder.encode(signingInput));
      return timingSafeEqual(computed, signature)
        ? { status: 'verified', detail: `The ${alg} signature matches. Whoever signed this knew the secret.` }
        : { status: 'failed', detail: `The ${alg} signature does not match. Either the secret is wrong or the token was changed after it was signed.` };
    }

    if (alg in RSA_HASHES) {
      const der = pemToDer(key);
      if (!der) {
        return { status: 'error', detail: 'That does not look like a PEM public key. It should begin with -----BEGIN PUBLIC KEY-----.' };
      }
      const name = alg.startsWith('PS') ? 'RSA-PSS' : 'RSASSA-PKCS1-v1_5';
      const importAlg =
        name === 'RSA-PSS'
          ? { name, hash: RSA_HASHES[alg] }
          : { name, hash: RSA_HASHES[alg] };
      const cryptoKey = await crypto.subtle.importKey('spki', der as unknown as ArrayBuffer, importAlg, false, ['verify']);
      const ok = await crypto.subtle.verify(
        name === 'RSA-PSS' ? { name, saltLength: 32 } : { name },
        cryptoKey,
        signature as unknown as ArrayBuffer,
        encoder.encode(signingInput) as unknown as ArrayBuffer,
      );
      return ok
        ? { status: 'verified', detail: `The ${alg} signature matches the public key you supplied.` }
        : { status: 'failed', detail: `The ${alg} signature does not match this public key.` };
    }

    if (alg in EC_HASHES) {
      const der = pemToDer(key);
      if (!der) {
        return { status: 'error', detail: 'That does not look like a PEM public key. It should begin with -----BEGIN PUBLIC KEY-----.' };
      }
      const namedCurve = EC_HASHES[alg] === 'SHA-256' ? 'P-256' : EC_HASHES[alg] === 'SHA-384' ? 'P-384' : 'P-521';
      const cryptoKey = await crypto.subtle.importKey(
        'spki',
        der as unknown as ArrayBuffer,
        { name: 'ECDSA', namedCurve },
        false,
        ['verify'],
      );
      const ok = await crypto.subtle.verify(
        { name: 'ECDSA', hash: EC_HASHES[alg] },
        cryptoKey,
        signature as unknown as ArrayBuffer,
        encoder.encode(signingInput) as unknown as ArrayBuffer,
      );
      return ok
        ? { status: 'verified', detail: `The ${alg} signature matches the public key you supplied.` }
        : { status: 'failed', detail: `The ${alg} signature does not match this public key.` };
    }
  } catch (e) {
    return { status: 'error', detail: `Verification failed: ${(e as Error).message}` };
  }

  return {
    status: 'unsupported',
    detail: `${alg} is not an algorithm this tool can check. HS256, HS384, HS512, RS256, RS384, RS512, PS256, PS384, PS512, ES256, ES384 and ES512 are supported.`,
  };
}

/** A few well-formed tokens to try, so the tool is never a blank page. */
export const SAMPLE_TOKENS: { label: string; token: string; secret: string; note: string }[] = [
  {
    label: 'HS256, still valid',
    note: 'Signed with the secret learmux-demo. Put that in the secret box and the signature verifies.',
    secret: 'learmux-demo',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQyIiwicm9sZSI6InN0dWRlbnQiLCJpc3MiOiJsZWFybXV4IiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.Jz09KMMdg3hrDlc5aStuSCoKGtViNHpNMVZqMOww3mE',
  },
  {
    label: 'alg: none',
    note: 'An unsigned token claiming to be an admin. This is the vulnerability the inspector exists to make visible.',
    secret: '',
    token:
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlzcyI6ImxlYXJtdXgifQ.',
  },
  {
    label: 'Expired, and no expiry to speak of',
    note: 'Signed with the same secret, but its exp is in the past. A correct verifier rejects it.',
    secret: 'learmux-demo',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQyIiwiaXNzIjoibGVhcm11eCIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAzNjAwfQ.Xu5hu2zEZtpZoLfY1iqLJMbK9KSYJQDZGLWsxkGjcNA',
  },
];
