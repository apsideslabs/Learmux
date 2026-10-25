/**
 * Practice sets for the Utilities track.
 *
 * These follow the two companion lessons for the on-site tools: the hash and
 * checksum tool, and the JWT inspector. The questions check that the learner
 * can read a checksum result and a token the way the tool would, and the
 * output tasks ask them to run the real pipeline in Termux and paste what it
 * printed. The rules describe the shape of a correct answer rather than exact
 * characters, because a digest, a filename and a signature all differ from
 * device to device.
 */

import type { PracticeSet } from './types';

export const utilitiesBSets: PracticeSet[] = [
  {
    slug: 'build-a-hash-tool',
    title: 'Build a hash and checksum tool',
    topic: 'build-a-hash-tool',
    summary: 'Hash files, write a checksum file, check it later, and read what a match really proves.',
    intro:
      'A checksum file records what your files were when you trusted them, and sha256sum -c tells you later whether any of them changed. This set covers that workflow, the POSIX way to compare two digests, the older tools, and what a matching digest does and does not prove.',
    questions: [
      {
        id: 'hash-1',
        question: 'A line from sha256sum -c reads b.txt: OK. What does that mean?',
        options: [
          'The file hashed to the same digest that the checksum file recorded for it',
          'The file is safe to run and contains no malicious code',
          'The checksum file was written by a trusted publisher',
          'The file is newer than the checksum file',
        ],
        answer: 0,
        explanation:
          'OK means the digest just computed from the file matches the one written on that line, so the file is byte for byte what it was when the line was made. It says nothing about malicious code, and it says nothing about who wrote the checksum file, because a digest cannot carry that. It also does not look at timestamps, only at contents.',
      },
      {
        id: 'hash-2',
        question: 'Why does a portable script use [ "$a" = "$b" ] rather than [ "$a" == "$b" ]?',
        options: [
          'The single equals sign is the POSIX sh form, and == is a bash extension that dash rejects',
          'The double equals sign compares numbers rather than strings',
          'The single equals sign ignores case, which is safer for digests',
          'The double equals sign only works on files, not on variables',
        ],
        answer: 0,
        explanation:
          'POSIX sh defines = for string comparison, and == is a bash extension. Under dash, which is the sh that a script with a #!/bin/sh line gets on many systems, the == form fails with an unexpected operator error, so the script breaks on one machine and passes on another. Neither form ignores case, and both work on variables, so the choice is about portability alone.',
      },
      {
        id: 'hash-3',
        question:
          'A file and its published SHA-256 digest both came from the same download page. What does a matching digest prove?',
        options: [
          'That the download arrived intact, but not that it came from the person you think it did',
          'That the file is free of malicious code',
          'That the file definitely came from the site that published the digest',
          'That nobody can change the file in future',
        ],
        answer: 0,
        explanation:
          'A digest only compares two values. If the file and the digest travelled together, then whoever changed the file could just as easily change the digest to match, so a match proves the download was not corrupted in transit and nothing more. A signature, which can only be produced by the holder of the publisher private key, is what ties a file to an author.',
      },
      {
        id: 'hash-4',
        question:
          'Why is MD5 unsuitable for checking a file against an attacker, even though it still catches corruption?',
        options: [
          'Practical collisions have been built for it, so a changed file can be made to share the real digest',
          'It is slower than SHA-256 on a phone',
          'It only hashes text files and skips binaries',
          'It cannot be read by sha256sum -c',
        ],
        answer: 0,
        explanation:
          'A collision is a second input that produces the same digest, and MD5 collisions are easy to produce, so an attacker can swap in a changed file and keep the digest looking correct. For corruption, where nobody is trying to deceive you, a mismatch still shows up and MD5 remains quick and adequate. SHA-1 has the same weakness, so use SHA-256 for anything an adversary might touch.',
      },
    ],
    tasks: [
      {
        id: 'hash-t1',
        title: 'Write a checksum file, then catch a change',
        prompt:
          'This makes two files, records their digests in a checksum file, checks them, then edits one file and checks again. Read the four result lines: the first two show the files matched, the last two show which one changed.',
        command:
          'mkdir -p "$HOME/hashtool" && cd "$HOME/hashtool" && printf \'alpha\\n\' > a.txt && printf \'bravo\\n\' > b.txt && sha256sum a.txt b.txt > SHA256SUMS && sha256sum -c SHA256SUMS && printf \'ALPHA\\n\' > a.txt && sha256sum -c SHA256SUMS',
        hint: 'Each check line is a filename, a colon, then OK or FAILED. The warning that follows goes to standard error, not standard output.',
        expects:
          'Four result lines in two pairs. The first pair is a.txt: OK and b.txt: OK, because both files still hash to what the checksum file recorded for them. Then a.txt is rewritten and checked again, giving a.txt: FAILED and b.txt: OK. The FAILED line names the file that changed, which is the whole point of the check: it tells you which file is no longer what it was, not merely that something somewhere changed.',
        rules: [
          { type: 'matches', pattern: '^\\s*\\S+:\\s+OK$', label: 'a file still matches its recorded digest' },
          { type: 'matches', pattern: '^\\s*\\S+:\\s+FAILED$', label: 'the edited file is reported as changed' },
          { type: 'lines', min: 4, label: 'both files are checked before and after the edit' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'build-a-jwt-inspector',
    title: 'Build a JWT inspector',
    topic: 'build-a-jwt-inspector',
    summary: 'Split a token, decode its base64url parts, and check the signature by hand.',
    intro:
      'A JWT is three base64url blocks joined by dots, and only the last one protects anything. This set covers reading the claims with no key, adding the padding that base64url drops, and why a verifier has to fix the algorithm itself instead of trusting the header.',
    questions: [
      {
        id: 'jwt-1',
        question: 'Why can you read a JWT payload with no key at all?',
        options: [
          'The payload is base64url-encoded, not encrypted, so anyone holding the token can decode it',
          'The payload is encrypted with a key that is carried inside the token',
          'Termux stores a copy of the key when you install it',
          'Only the header is readable; the payload always needs the secret',
        ],
        answer: 0,
        explanation:
          'Base64url is a public encoding with a public reverse, so decoding the payload needs nothing secret. Encryption would require a key, but a JWT payload is not encrypted. The signature only proves who wrote the token; it does not hide the claims, which is why you should treat every claim in a token as public and never put a password or a card number in one.',
      },
      {
        id: 'jwt-2',
        question: 'Why does the payload segment need = padding before base64 -d, when the header does not?',
        options: [
          'Base64url drops padding, and the payload length is not a multiple of four, so the pad characters must be added back',
          'The payload is encrypted and the padding is part of the key',
          'The header is not base64 at all, so it needs no padding',
          'The signature is longer than the payload',
        ],
        answer: 0,
        explanation:
          'Base64url removes the trailing = characters that standard base64 uses to fill the final group to four. A segment whose length is already a multiple of four decodes without them, which is why the 36-character header is fine, but the 87-character payload needs one = before base64 -d will decode it cleanly. Without it the JSON still appears but the tool exits with an error.',
      },
      {
        id: 'jwt-3',
        question: 'A token arrives with a header that reads {"alg":"none"}. What is the danger?',
        options: [
          'A verifier that trusts the header will skip the signature check and accept the forged token',
          'The token will fail to decode because none is not valid JSON',
          'The payload is encrypted and so cannot be read',
          'The token is valid but expires immediately',
        ],
        answer: 0,
        explanation:
          'none means there is no signature, and the token carries an empty third field. If a verifier reads the algorithm from the token and honours none, it accepts a token that anyone could have written, including one with admin set to true. The defence is that the verifier fixes the algorithm it expects and rejects any token that asks for a different one, none above all.',
      },
      {
        id: 'jwt-4',
        question: 'What is the difference between decoding a JWT and verifying it?',
        options: [
          'Decoding only reads the claims, while verifying proves the signature matches the header and payload',
          'Decoding needs the secret and verifying does not',
          'Verifying only works on the header, and decoding only on the payload',
          'There is no difference; a token that decodes is a token that is valid',
        ],
        answer: 0,
        explanation:
          'Decoding is reversible by anyone and says nothing about who wrote the token. Verification recomputes the signature over the exact header and payload text and compares it with the value in the token, which only succeeds when the verifier holds the right secret and fixed the algorithm itself. A token that decodes perfectly cleanly can still be forged, which is the rule the lesson ends on.',
      },
    ],
    tasks: [
      {
        id: 'jwt-t1',
        title: 'Decode a token and check its signature',
        prompt:
          'This decodes the payload of a token, then recomputes its HS256 signature with the secret termux-demo-secret. Read the decoded claims, then the given and calc lines, then the verdict.',
        command:
          'TOKEN=\'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1pcmEiLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTc1MDAwMDAwMH0.LEqKJqaAnM91I32zKqTjqgBXHshwwisBvLXB77iDaXY\'; SEG=$(printf \'%s\\n\' "$TOKEN" | cut -d. -f2 | tr \'_-\' \'/+\'); while [ $(( ${#SEG} % 4 )) -ne 0 ]; do SEG="$SEG="; done; printf \'%s\' "$SEG" | base64 -d; echo; SIGNING_INPUT=$(printf \'%s\\n\' "$TOKEN" | cut -d. -f1,2); GIVEN=$(printf \'%s\\n\' "$TOKEN" | cut -d. -f3); CALC=$(printf \'%s\' "$SIGNING_INPUT" | openssl dgst -sha256 -hmac \'termux-demo-secret\' -binary | openssl base64 -A | tr \'+/\' \'-_\' | tr -d \'=\'); echo "given: $GIVEN"; echo "calc:  $CALC"; [ "$GIVEN" = "$CALC" ] && echo "signature valid" || echo "signature invalid"',
        hint: 'The first line is the JSON payload on its own. The given line is the signature carried in the token; the calc line is the one you computed.',
        expects:
          'The first line is the decoded payload, a JSON object whose name claim is Mira and whose admin claim is false. Then two signature lines: given, the third segment of the token, and calc, the HMAC you recomputed with the secret. The two are identical, so the final line reads signature valid. Change one character of the secret and the calc line changes completely, and the verdict becomes signature invalid.',
        rules: [
          { type: 'matches', pattern: '^\\s*\\{.*"name"\\s*:\\s*"Mira"', label: 'the payload decodes and shows the name claim' },
          { type: 'contains', value: 'signature valid', label: 'the recomputed signature matches the one in the token' },
          { type: 'lines', min: 3, label: 'the decoded payload and the signature check are both present' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },
];
