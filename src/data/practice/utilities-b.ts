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
        title: "Write a checksum file and verify against it",
        prompt:
          "The hashtool.sh you finished is saved next to you. This creates a small file, writes a checksum file for it, then checks the file against that list. Paste the check output.",
        command:
          "printf 'alpha\n' > a.txt; bash hashtool.sh --write SUMS a.txt; bash hashtool.sh --check SUMS",
        fixture: { lesson: 'build-a-hash-tool', as: 'hashtool.sh' },
        hint: "The check prints one line per file, naming the file and whether it matched.",
        expects:
          "One line reading a.txt: OK. That is sha256sum reporting that the digest it just computed matches the one recorded in SUMS. The value of the exercise is the second half: change the file and run the check again and the same line reads a.txt: FAILED, and the command exits non-zero. A checksum proves the file has not changed since the digest was taken. It does not prove who took the digest, which is what a signature adds.",
        rules: [
          { type: 'matches', pattern: '^\\s*a\\.txt: OK\\s*$', label: 'the file matched its recorded digest' },
          { type: 'contains', value: 'a.txt', label: 'the check named the file' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed|hashtool:', label: 'the script ran' },
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
        title: "Verify a token signature for real",
        prompt:
          "The jwt.sh you finished is saved next to you. This decodes the sample token and then checks its HS256 signature against the secret it was signed with. Paste the last few lines.",
        command:
          "bash jwt.sh --secret termux-demo-secret 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1pcmEiLCJhZG1pbiI6ZmFsc2UsImlhdCI6MTc1MDAwMDAwMH0.LEqKJqaAnM91I32zKqTjqgBXHshwwisBvLXB77iDaXY'",
        fixture: { lesson: 'build-a-jwt-inspector', as: 'jwt.sh' },
        hint: "You are looking for the verdict line at the very bottom.",
        expects:
          "The decoded payload, which includes the name Mira, and then result: VALID, meaning the HMAC the script computed over the header and payload matches the signature in the token. Run the same command with --secret wrong-secret and the verdict flips to INVALID, which is the whole point: the signature is the only part of a token that proves anything, and it only proves it when you hold the right key. The payload was readable without any key at all, so treat every claim in it as public.",
        rules: [
          { type: 'contains', value: '"name": "Mira"', label: 'the payload was decoded' },
          { type: 'contains', value: 'result: VALID', label: 'the signature checked out against the secret' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed|jwt.sh:', label: 'the script ran' },
        ],
      },
    ],
  },
];
