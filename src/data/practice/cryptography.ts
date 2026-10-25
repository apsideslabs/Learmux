/**
 * Practice sets for the cryptography track.
 *
 * The output tasks here are graded against rules that describe meaning, not
 * exact characters. A fingerprint, a random key and a signature all differ
 * from device to device and from run to run, so each rule asks whether the
 * output says the right thing rather than whether it says it the same way.
 */

import type { PracticeSet } from './types';

export const cryptographySets: PracticeSet[] = [
  {
    slug: 'hashing-encoding-encryption',
    title: 'Hashing, encoding and encryption',
    topic: 'hashing-encoding-encryption',
    summary: 'Tell a one-way hash from a reversible encoding and from encryption that needs a key.',
    intro:
      'A hash is one way, an encoding is reversible by anyone, and encryption needs a key. This set checks that you can tell the three apart, read the signs in the output of each, and say what each one is actually good for.',
    questions: [
      {
        id: 'hhe-1',
        question: 'Which of the three can be reversed by anyone, with no key and no password?',
        options: [
          'Base64 encoding',
          'A SHA-256 hash',
          'AES encryption with a passphrase',
          'A detached GPG signature',
        ],
        answer: 0,
        explanation:
          'Base64 is a public rule, not a secret, so the command that reverses it is the same tool with -d and needs nothing else. A hash is one way: the digest is shorter than the input, so information is thrown away and it cannot be undone. Encryption is meant to be reversed, but only by someone holding the key. That is why base64 of a password is not protection at all.',
      },
      {
        id: 'hhe-2',
        question: 'What does the U2FsdGVkX1 prefix at the start of an openssl enc ciphertext tell you?',
        options: [
          'It is the base64 of Salted__, a header saying a random salt was mixed in',
          'It is the first block of the actual ciphertext',
          'It is the passphrase, stored so the tool can check it later',
          'It is the SHA-256 hash of the plaintext',
        ],
        answer: 0,
        explanation:
          'The eight characters U2FsdGVkX1 decode to the word Salted__ followed by two more bytes. It is a header, not part of your message, and it is present whenever openssl enc derives a key from a passphrase. It says a random salt was used, which is why the same passphrase produces different ciphertext each time. The message itself begins after the header.',
      },
      {
        id: 'hhe-3',
        question: 'Why can a hash not be turned back into the text it came from?',
        options: [
          'The digest is shorter than most inputs, so many inputs share one digest and none can be picked out',
          'Because the digest is encrypted with a secret key that the tool keeps',
          'Because the input is deleted from disk as soon as it is hashed',
          'Because the hash function is a trade secret and the source is hidden',
        ],
        answer: 0,
        explanation:
          'A hash of any input is always 256 bits, while the input can be longer, so the operation throws information away. Many different inputs map to the same digest, which means the digest on its own cannot say which input produced it. This is different from encryption, where the key is what holds the door shut. With a hash there is no door to open, only a summary of what went in.',
      },
      {
        id: 'hhe-4',
        question: 'You download a file and compute its SHA-256 hash, but it does not match the one the vendor published. What does that tell you?',
        options: [
          'Your copy differs from the one that produced the published hash, so it was corrupted or altered',
          'The SHA-256 algorithm has been broken',
          'Your phone hashed the file with the wrong algorithm',
          'The file has been encrypted and needs a key',
        ],
        answer: 0,
        explanation:
          'The published hash is a fingerprint of the exact file the vendor released. If your copy produces a different digest, then your copy is not that file, whether because the download was damaged or because someone changed it. That is the whole point of publishing a hash. It does not mean the algorithm failed, and it says nothing about encryption, which is a different job entirely.',
      },
    ],
    tasks: [
      {
        id: 'hhe-t1',
        title: 'Hash, encode and encrypt the same text',
        prompt:
          'This writes a small file, then does three things to it: a hash, a base64 encoding and an encryption with a passphrase. Read the four output lines and match each one to the job that produced it.',
        command:
          'printf \'hello termux\' > "$HOME/msg.txt"; sha256sum "$HOME/msg.txt"; base64 "$HOME/msg.txt"; openssl enc -aes-256-cbc -pbkdf2 -pass pass:hunter2 -base64 -in "$HOME/msg.txt" -out "$HOME/msg.enc"; cat "$HOME/msg.enc"; echo; openssl enc -d -aes-256-cbc -pbkdf2 -pass pass:hunter2 -base64 -in "$HOME/msg.enc"',
        hint: 'The hash is the line of 64 hex characters. The base64 of the same text is short and reversible. The encrypted line starts with the salted header, and the last line is the text coming back.',
        expects:
          'Four lines. The first is the SHA-256 hash of the file, 64 hex characters followed by the filename, and it is a summary that cannot be reversed. The second is the base64 form, aGVsbG8gdGVybXV4, which looks scrambled but which anyone can decode with no key. The third starts with U2FsdGVkX1, the salted header that shows a passphrase was used, and it changes on every run. The last line is hello termux, the text coming back only because the same passphrase was supplied. That is the difference between the three in one screen.',
        rules: [
          { type: 'matches', pattern: '^\\s*[0-9a-f]{64}\\s', label: 'the SHA-256 hash of the file is printed' },
          { type: 'contains', value: 'aGVsbG8gdGVybXV4', label: 'the base64 form, which reverses with no key' },
          { type: 'matches', pattern: '^\\s*U2FsdGVkX1', label: 'the encrypted copy carries the salted header' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'symmetric-and-asymmetric',
    title: 'Symmetric and asymmetric keys',
    topic: 'symmetric-and-asymmetric',
    summary: 'One shared key, or a pair of related keys? See how each is made and used.',
    intro:
      'A symmetric cipher needs one secret that both sides hold. An asymmetric key comes as a pair, and only one half is shared. This set covers making each with openssl, and why real systems use both together rather than picking one.',
    questions: [
      {
        id: 'sym-1',
        question: 'What is the awkward requirement that a symmetric cipher places on two people who want to talk?',
        options: [
          'They must already share the same secret key before they can send anything privately',
          'They must each own a different public key',
          'They must connect over the same network at the same time',
          'They must agree on a password to publish',
        ],
        answer: 0,
        explanation:
          'A symmetric cipher uses one key for both directions, so both sides must hold that exact key before the conversation starts. If they have never met and have no private channel, agreeing on the key is the hard part, because sending it over the network hands it to anyone watching. This is the key distribution problem, and asymmetric keys were invented to solve it.',
      },
      {
        id: 'sym-2',
        question: 'What does openssl pkey -in priv.pem -pubout -out pub.pem do?',
        options: [
          'It reads the private key and derives the matching public key into a new file',
          'It encrypts the private key with a passphrase',
          'It checks whether the private key is still valid',
          'It merges the private and public keys into one file',
        ],
        answer: 0,
        explanation:
          'A private key file usually holds both halves, so the public half can be derived from it at any time with -pubout. The result is the key you hand out freely. The reverse is not possible: nothing can derive the private half from the public half, which is what makes the pair safe to split. Running this command never reveals the private key.',
      },
      {
        id: 'sym-3',
        question: 'Why is RSA not used on its own to encrypt a large file?',
        options: [
          'It can only carry a message shorter than its key, and it is far slower than a symmetric cipher',
          'Because RSA has been broken and is no longer secure',
          'Because RSA cannot decrypt what it encrypts',
          'Because RSA needs a network connection to work',
        ],
        answer: 0,
        explanation:
          'RSA can only encrypt a short message, shorter than the key itself, and it is slow compared with a symmetric cipher. So it is used to carry a short thing, and that short thing is a fresh symmetric key for the session. The bulk of the data then travels under the fast symmetric cipher. TLS does exactly this: an asymmetric handshake, then symmetric traffic.',
      },
      {
        id: 'sym-4',
        question: 'Which half of an asymmetric key pair is safe to publish, and why?',
        options: [
          'The public half, because it can only check or lock, never sign or decrypt',
          'The private half, because it is the one that proves who you are',
          'Both halves, as long as you keep a copy',
          'Neither half, because publishing either one weakens the pair',
        ],
        answer: 0,
        explanation:
          'The public half can lock a message to you and can check a signature you made, and it cannot do the reverse, so giving it away costs you nothing. The private half is the ability to read your mail and to sign as you, so it stays on your device behind a passphrase. Keeping the public half secret has no security benefit and simply stops people from contacting you privately.',
      },
    ],
    tasks: [
      {
        id: 'sym-t1',
        title: 'Make a symmetric key and an asymmetric pair',
        prompt:
          'This prints a symmetric key, then makes an asymmetric key pair and prints the public half. Compare the two: the first is one value that both sides would share, and the second is the half of a pair that is safe to give away.',
        command:
          'openssl rand -base64 32; echo; openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out "$HOME/demo-key.pem"; echo "private key written"; openssl pkey -in "$HOME/demo-key.pem" -pubout',
        hint: 'The symmetric key is one line of base64 ending in a single equals sign. The public key is the block between the BEGIN and END lines, and the private key stayed in the file.',
        expects:
          'Three parts. First a single line of base64 text ending in one equals sign: 32 random bytes, the symmetric key, which both sides would have to hold. Then the words private key written, confirming the private key went into demo-key.pem and was not printed. Then a block that begins with -----BEGIN PUBLIC KEY----- and ends with -----END PUBLIC KEY-----, the half you can share. Notice that no command printed the private key itself.',
        rules: [
          { type: 'matches', pattern: '^\\s*[A-Za-z0-9+/]{43}=$', label: 'a 32-byte symmetric key in base64' },
          { type: 'contains', value: 'private key written', label: 'the private key was written to a file' },
          { type: 'matches', pattern: '^\\s*-----BEGIN PUBLIC KEY-----', label: 'the public half is printed, ready to share' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'tls-and-certificates',
    title: 'TLS and the chain of trust',
    topic: 'tls-and-certificates',
    summary: 'What the padlock promises, what a certificate says, and who vouches for it.',
    intro:
      'The padlock means the connection is encrypted and the site proved it holds a certificate for the name you typed. This set covers making a certificate, reading its fields, and telling a self-signed certificate from one that chains to a trusted root.',
    questions: [
      {
        id: 'tls-1',
        question: 'In a certificate you made yourself, subject and issuer both read CN = termux.local. What does that mean?',
        options: [
          'It is self-signed, so it vouches for itself and no outside authority backs the name',
          'It is a root certificate trusted by every browser',
          'It has been signed twice for extra safety',
          'The issuer field was left blank by mistake',
        ],
        answer: 0,
        explanation:
          'The subject is who the certificate is for, and the issuer is who signed it. When the two are the same, the certificate signed itself, which is what self-signed means. The encryption still works, but nothing independent has confirmed that the name and the key belong together, so a browser warns rather than showing a padlock. A real site presents a chain ending at a root in your trust store.',
      },
      {
        id: 'tls-2',
        question: 'What does the certificate add beyond encryption?',
        options: [
          'It ties a public key to a name, so you can tell who is on the other end',
          'It makes the connection faster',
          'It hides the address of the server you are visiting',
          'It removes the need for a key exchange',
        ],
        answer: 0,
        explanation:
          'Encryption on its own leaves a gap: an attacker could sit in the middle, encrypt one half of the conversation with you and the other half with the real site, and read everything. The certificate closes that gap by binding a public key to a name and having a trusted authority sign the binding. Without it, the padlock would prove only that you were talking to someone, not to whom.',
      },
      {
        id: 'tls-3',
        question: 'In the Certificate chain block from openssl s_client, what do the s and i lines show?',
        options: [
          's is the subject of a certificate and i is its issuer, one entry per certificate in the chain',
          's is the server and i is the client',
          's is the signature and i is the key size',
          's is the start date and i is the expiry date',
        ],
        answer: 0,
        explanation:
          'The chain lists each certificate the server sent, numbered from zero for the leaf. The s line gives the subject, who that certificate is for, and the i line gives the issuer, who signed it. Walking the i of one entry to the s of the next is how the chain is checked. A single entry where s equals i is a self-signed certificate with a chain of one.',
      },
      {
        id: 'tls-4',
        question: 'What is a root certificate?',
        options: [
          'An anchor certificate in your trust store, signed by nobody because it is where the chain starts',
          'The certificate of the website at the top of the chain',
          'The oldest certificate on the server',
          'A certificate that can decrypt any other certificate',
        ],
        answer: 0,
        explanation:
          'A root certificate is the top of a chain and is trusted because it ships in your device trust store, not because something above it signed it. From that anchor, intermediate certificates are signed down to the leaf that names the site. Verifying a site means checking each signature from the leaf back up to a root you already trust. A self-signed certificate has no anchor, which is why the check fails.',
      },
    ],
    tasks: [
      {
        id: 'tls-t1',
        title: 'Make and read a self-signed certificate',
        prompt:
          'This makes a self-signed certificate for the name termux.local, then prints its key fields. Read the subject and the issuer together, and look for the fingerprint.',
        command:
          'openssl req -x509 -newkey rsa:2048 -keyout "$HOME/demo-key.pem" -out "$HOME/demo-cert.pem" -days 365 -nodes -subj "/CN=termux.local" 2>/dev/null; openssl x509 -in "$HOME/demo-cert.pem" -noout -subject -issuer -dates -fingerprint -sha256',
        hint: 'The subject is who the certificate is for and the issuer is who signed it. Here they should be the same name, and there should be a line with a fingerprint.',
        expects:
          'Five lines from openssl x509. The first is the subject, the name the certificate is for, and it should read CN = termux.local. The second is the issuer, and because this certificate is self-signed it is the same name, which is the sign that no outside authority vouched for it. Then two date lines giving the valid window, and a sha256 Fingerprint line, a colon-separated hash of the whole certificate. If subject and issuer differ, you read someone else certificate.',
        rules: [
          { type: 'matches', pattern: '^\\s*subject=CN = termux\\.local\\s*$', label: 'the certificate is for the name you set' },
          { type: 'matches', pattern: '^\\s*issuer=CN = termux\\.local\\s*$', label: 'a self-signed certificate is its own issuer' },
          { type: 'matches', pattern: '^\\s*sha256 Fingerprint=([0-9A-F]{2}:){31}[0-9A-F]{2}\\s*$', label: 'the certificate carries a SHA-256 fingerprint' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'signing-and-verifying',
    title: 'Signing and verifying a file',
    topic: 'signing-and-verifying',
    summary: 'Prove a file came from a key holder and has not changed since.',
    intro:
      'A signature leaves the file readable and attaches a proof that it came from a particular key and has not been altered. This set covers making a key, signing with gpg, and telling a good signature from a bad one when the file has changed.',
    questions: [
      {
        id: 'sig-1',
        question: 'What does gpg --detach-sign produce?',
        options: [
          'A separate signature file, leaving the original file unchanged and readable',
          'A copy of the file encrypted with your public key',
          'A file with the original contents replaced by the signature',
          'A key pair for signing future files',
        ],
        answer: 0,
        explanation:
          'Detached means the signature is written to its own file, usually named with a .asc or .sig ending, so the original stays exactly as it was and anyone can read it. You then send both files. A signature is not encryption, so nothing is hidden; what it proves is that the file has not changed and that a specific key produced it. Signing also never modifies the file being signed.',
      },
      {
        id: 'sig-2',
        question: 'gpg reports BAD signature when you verify a file against a signature. What has happened?',
        options: [
          'The file no longer matches the signature, so it was changed after signing',
          'The signature is simply older than thirty days',
          'Your own key has been revoked',
          'The signature was made with a public key by mistake',
        ],
        answer: 0,
        explanation:
          'A signature is tied to the exact bytes that were signed. If even one character of the file changes, the check recomputes a different value and the signature no longer matches, so gpg says BAD and exits with a non-zero status. That is the value of signing: a download altered in transit, by one byte, fails the check. It is not a matter of age, and it is not about which key signed it.',
      },
      {
        id: 'sig-3',
        question: 'Which key makes a signature and which key checks it?',
        options: [
          'The private key makes the signature and the public key checks it',
          'The public key makes the signature and the private key checks it',
          'Either key can make or check a signature',
          'A separate signing key is needed for each direction',
        ],
        answer: 0,
        explanation:
          'Signing runs in the opposite direction from encryption. The signer uses the private key, which only they hold, and everyone else uses the public key to check. If it worked the other way round, anyone with the public key could forge a signature, which would make the proof worthless. This is the mirror image of encryption, where the public key locks and the private key opens.',
      },
      {
        id: 'sig-4',
        question: 'What does a good signature not, on its own, prove?',
        options: [
          'That the key that made it really belongs to the person you think it does',
          'That the file has not changed since it was signed',
          'That the signer held the private key',
          'That the signature matches the file exactly',
        ],
        answer: 0,
        explanation:
          'A good signature proves two things: the file has not changed, and whoever signed it held the matching private key. It does not tell you who that key belongs to. If an attacker can convince you that their key is your friend key, a good signature is worthless as proof of identity. Binding a key to a name is the job of a certificate and its chain of trust, not of the signature alone.',
      },
    ],
    tasks: [
      {
        id: 'sig-t1',
        title: 'Sign a file, then verify it before and after a change',
        prompt:
          'This makes a demo key, signs a file, verifies it, then changes the file and verifies again. Watch the two verdicts at the end: one says Good and the other says BAD.',
        command:
          'export GNUPGHOME="$HOME/.gnupg-demo"; mkdir -p "$GNUPGHOME"; chmod 700 "$GNUPGHOME"; gpg --batch --pinentry-mode loopback --passphrase \'\' --quick-gen-key "Learner Demo <learner@example.com>" ed25519 sign 0; printf \'release 1.0\\n\' > "$HOME/release.txt"; gpg --batch --yes --detach-sign --armor -o "$HOME/release.txt.asc" "$HOME/release.txt"; gpg --verify "$HOME/release.txt.asc" "$HOME/release.txt"; printf \'release 2.0\\n\' > "$HOME/release-changed.txt"; gpg --verify "$HOME/release.txt.asc" "$HOME/release-changed.txt"',
        hint: 'The signature file is written once and never changes. The first verify is against the original file and the second is against a changed copy, so the two verdicts differ.',
        expects:
          'Several lines from gpg, ending in two verdicts. The first verify is against the file exactly as it was signed, and it prints gpg: Good signature from followed by the name and email you gave the key. The second verify is against a copy whose contents were changed, and it prints gpg: BAD signature from the same name. The signature itself never changed, so the difference comes entirely from the file. If the second verdict were Good, the file would not really have been altered.',
        rules: [
          { type: 'matches', pattern: '^\\s*gpg: Good signature from', label: 'the untouched file verifies' },
          { type: 'matches', pattern: '^\\s*gpg: BAD signature from', label: 'the changed file fails to verify' },
          { type: 'lines', min: 3, label: 'the sign and both verifications are shown' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'crypto-mistakes',
    title: 'Common crypto mistakes',
    topic: 'crypto-mistakes',
    summary: 'A reused nonce, ECB mode, a fast hash for passwords, and rolling your own.',
    intro:
      'The algorithms are rarely the weak point. What breaks systems is how the pieces are combined: a value that must never repeat, a mode chosen for convenience, a hash used for a job it was never meant to do. This set covers the mistakes that keep turning up.',
    questions: [
      {
        id: 'mis-1',
        question: 'Why is reusing a nonce under a stream cipher such as CTR so damaging?',
        options: [
          'The same keystream is produced twice, so two ciphertexts cancel and leak the difference',
          'It makes the ciphertext twice as long as it needs to be',
          'It turns the stream cipher into a block cipher',
          'It reveals the nonce but nothing else',
        ],
        answer: 0,
        explanation:
          'A stream cipher combines the plaintext with a keystream built from the key and the nonce. Reuse the nonce and the same keystream appears twice, so wherever the two plaintexts agree the ciphertexts agree too, and the ciphertexts differ exactly where the plaintexts differ. An attacker who can guess one message recovers the other. The nonce is not secret; it just must never repeat under a given key.',
      },
      {
        id: 'mis-2',
        question: 'What does ECB mode reveal that a chaining mode hides?',
        options: [
          'That two plaintext blocks are identical, because they produce identical ciphertext blocks',
          'The length of the key that was used',
          'The passphrase behind the encryption',
          'The exact time the file was encrypted',
        ],
        answer: 0,
        explanation:
          'ECB encrypts each block on its own with no link to the block before it, so identical plaintext blocks become identical ciphertext blocks. Encrypt a picture with ECB and you can still see its outline, because large areas of one colour become long runs of the same ciphertext. CBC and CTR chain each block to the previous one, so the pattern disappears. The fault is the mode, not the cipher.',
      },
      {
        id: 'mis-3',
        question: 'Why is a plain SHA-256 hash the wrong thing to store a password as?',
        options: [
          'It is designed to be fast, so a leaked file of hashes is cheap to search',
          'It is reversible, so anyone can read the password back out',
          'It is too long to fit in a database column',
          'It changes every time you compute it',
        ],
        answer: 0,
        explanation:
          'SHA-256 is built for speed, which is exactly what an attacker wants: given a leaked file of hashes, they hash a list of common passwords and compare, and the search is quick. A password should be stored with a function made to be slow and to use memory, such as bcrypt, scrypt or Argon2, salted per user. The hash is not reversible, but being fast is enough to make it the wrong choice here.',
      },
      {
        id: 'mis-4',
        question: 'Why must you check a message authentication tag before you decrypt?',
        options: [
          'Acting on unauthenticated data opens a channel that lets an attacker manipulate the plaintext',
          'Because decrypting first uses more battery',
          'Because the tag contains the decryption key',
          'Because the tag must be checked while the ciphertext is still encrypted',
        ],
        answer: 0,
        explanation:
          'If code acts on decrypted data before it has been authenticated, an attacker who can alter the ciphertext has a way to influence the result. The classic case is the padding oracle, where an error that appears only for bad padding lets the plaintext be recovered one byte at a time. Authenticated modes such as GCM attach a tag and release no plaintext unless the tag checks out, so checking first closes the channel.',
      },
    ],
    tasks: [
      {
        id: 'mis-t1',
        title: 'See ECB repeat a block and CBC break the pattern',
        prompt:
          'This encrypts the same two identical blocks with ECB, then with CBC, and prints the ciphertext as hex bytes. Read the ECB pair and the CBC pair and compare them.',
        command:
          'K=00112233445566778899aabbccddeeff; P="YELLOW SUBMARINEYELLOW SUBMARINE"; echo "ECB mode:"; printf \'%s\' "$P" | openssl enc -aes-128-ecb -K $K -nopad -nosalt | od -An -v -tx1 -w16; echo "CBC mode:"; printf \'%s\' "$P" | openssl enc -aes-128-cbc -K $K -iv 00000000000000000000000000000000 -nopad -nosalt | od -An -v -tx1 -w16',
        hint: 'Look at the two lines under ECB mode and then the two under CBC mode. Under ECB the two lines should be identical; under CBC they should differ.',
        expects:
          'Two labelled sections, each printing two lines of sixteen hex bytes. Under ECB mode the two lines are identical, because the two plaintext blocks were identical and ECB encrypts each block on its own. Under CBC mode the two lines differ, because each block is chained to the one before it and so the same plaintext block no longer produces the same ciphertext. The same AES key was used in both sections, which shows the fault is the mode.',
        rules: [
          { type: 'matches', pattern: '^\\s*([0-9a-f]{2}( [0-9a-f]{2}){15})\\n\\s*\\1\\s*$', label: 'ECB repeats the same block for the same plaintext' },
          { type: 'matches', pattern: '^\\s*[0-9a-f]{2}( [0-9a-f]{2}){15}\\s*$', label: 'each block is printed as 16 bytes of hex' },
          { type: 'lines', min: 4, label: 'both modes print their blocks' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed', label: 'the commands actually ran' },
        ],
      },
    ],
  },
];
