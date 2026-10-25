/**
 * Practice sets for the Python track: the five interactive lessons that run
 * Python in the page.
 *
 * Each set follows the lesson of the same name, so the two can be read side by
 * side. The output task runs a short `python3 -c` one-liner that shows the idea
 * from the lesson and asks the learner to paste what it printed.
 *
 * The rules describe meaning rather than exact characters. Where the output is
 * fixed, the rule names the figure the lesson works out by hand, so a wrong
 * answer is caught rather than passed. Where the output is random, as with a
 * generated token, the rule asks whether the length and the shape are right,
 * because the value itself changes on every run.
 */

import type { PracticeSet } from './types';

export const pythonSets: PracticeSet[] = [
  {
    slug: 'run-your-first-python',
    title: 'Run your first Python',
    topic: 'run-your-first-python',
    summary: 'Run a few short lines of Python and read what each one prints.',
    intro:
      'Python runs your code line by line and stops at the first mistake, naming it in the last line of the traceback. This set covers what a single = does, why a name that differs only in case is a different name, why the body of a loop is indented, and what the slice that reverses a string actually does. The task runs a few short lines and asks you to read what they print.',
    questions: [
      {
        id: 'py-1',
        question: 'What does a single = do in Python?',
  options: [

          'It prints the value on the right',

          'It joins the two sides into one string',

          'It stores the value on the right under the name on the left',

          'It asks whether the two sides are equal'],
  answer: 2,
        explanation:
          'A single = is assignment, not a question about equality. The name on the left is given the value on the right, so minutes = 60 means that every later mention of minutes stands for 60. The equality test is ==, two characters, and mixing the two up is the mistake that trips up nearly everyone at first. Printing is a separate call, print, and joining text is done with + or an f-string, so the other options describe something else entirely.',
      },
      {
        id: 'py-2',
        question: 'The line print("Hello, " + Name) raises a NameError. Why?',
  options: [

          'The quotes around Hello are the wrong kind',

          'The name Name was never created, and a name with a lowercase n is a different name',

          'print cannot take a + sign',

          'Strings cannot be joined with +'],
  answer: 1,
        explanation:
          'Python is case sensitive, so name and Name are two different names. The line above created name with a lowercase n, and Name with a capital N was never created, so Python stops and says that name Name is not defined. Reading the last line of the traceback names the problem exactly. The + does work on strings, and print is happy to take the result, so neither of those is the cause here.',
      },
      {
        id: 'py-3',
        question: 'Why must the body of a for loop be indented?',
  options: [

          'It is only a style choice and Python runs either way',

          'It makes the loop run faster',

          'It tells Python to print the result',

          'The indentation is what marks the block of lines that belong to the loop'],
  answer: 3,
        explanation:
          'Python uses whitespace rather than braces to show which lines belong together. The four spaces before print are what tells Python that line is inside the loop; remove them and the line runs once, after the loop, which is a different program. Most other languages use braces for this job, and Python is stricter than you expect: mixing tabs and spaces, or an inconsistent indent, is an error rather than a warning.',
      },
      {
        id: 'py-4',
        question: 'What does word[::-1] give you?',
  options: [

          'The string with the first character removed',

          'An error, because a slice needs a start and a stop',

          'The whole string, walked from the end to the start',

          'The first character only'],
  answer: 2,
        explanation:
          'A slice is written start:stop:step. Leaving start and stop out means the whole string, and a step of minus one means walk it backwards, so word[::-1] reverses the word and Termux becomes xumreT. A step of one, which is the default, would give the string unchanged. Omitting start and stop is allowed, so this does not raise an error, and that is what makes the idiom so short.',
      },
    ],
    tasks: [
      {
        id: 'py-t1',
        title: 'Run a few lines and read the output',
        prompt:
          'This runs four short pieces of Python in one go: a print statement, the arithmetic that works out the minutes in a week, a loop that adds every number from one to one hundred, and a slice that reverses a word. Paste all four lines it prints.',
        command: `python3 -c "print('Hello from Python'); print(60 * 24 * 7); print(sum(range(1, 101))); print('Termux'[::-1])"`,
        hint: 'The third line is the total of the whole numbers from one to one hundred, and the fourth is Termux spelt backwards.',
        expects:
          'Four lines. The first is Hello from Python. The second is 10080, the minutes in a week: sixty minutes times twenty four hours times seven days. The third is 5050, the sum of the whole numbers from one to one hundred. The fourth is xumreT, which is Termux read backwards. If the second line is 1440 you worked out the minutes in a day and forgot to multiply by seven, which is the common slip.',
        rules: [
          { type: 'contains', value: 'Hello from Python', label: 'the print statement produced its line' },
          { type: 'matches', pattern: '^\\s*10080$', label: 'the minutes in a week are worked out as 10080' },
          { type: 'matches', pattern: '^\\s*5050$', label: 'the numbers from one to one hundred add up to 5050' },
          { type: 'contains', value: 'xumreT', label: 'the word was reversed' },
          { type: 'absent', pattern: 'command not found|No such file or directory|Traceback', label: 'the command actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'python-working-with-text',
    title: 'Working with text in Python',
    topic: 'python-working-with-text',
    summary: 'Split, join, slice and clean text, and read the four lines it prints.',
    intro:
      'A Python string is an object with methods, and almost every method hands back a new string rather than changing the one you called it on. This set covers indexing from either end, splitting a line into fields and joining it back, slicing a value by position, and cleaning a messy field before you compare it. The task runs one line that does all four jobs and asks you to read what it printed.',
    questions: [
      {
        id: 'text-1',
        question: 'For the string word, what does word[-1] give you?',
  options: [

          'The first character, because indexing starts at one',

          'An error, because an index cannot be negative',

          'The whole string with its last character removed',

          'The last character, because a negative index counts back from the end'],
  answer: 3,
        explanation:
          'Position counting starts at zero, so word[0] is the first character. A negative index counts back from the end, so word[-1] is the last one and word[-2] would be the character before it. That saves writing word[len(word) - 1]. Indexing past the end of a string does raise an error, but a negative index that stays within the string is fine, so the option that claims an error is wrong.',
      },
      {
        id: 'text-2',
        question: 'line holds "Admin:user". The code runs line.lower() and then prints line. What appears?',
  options: [

          'ADMIN:USER, because lower folds the letters up',

          'Admin:user, unchanged, because a method returns a new string and leaves the original alone',

          'admin:user, because lower changed the value in place',

          'An error, because a string cannot be changed'],
  answer: 1,
        explanation:
          'Strings in Python cannot be changed in place. A method such as lower returns a new string and leaves the one it was called on exactly as it was, so printing line after calling line.lower() still shows Admin:user. To keep the cleaned value you have to store it, as in clean = line.lower(). Nothing raises an error, which is what makes the mistake quiet: the code runs and only the result is wrong.',
      },
      {
        id: 'text-3',
        question: 'How do you join a list of parts back into one string with hyphens between them?',
  options: [

          '"-".split(parts), calling split on the separator',

          'join(parts, "-"), passing both as arguments',

          '"-".join(parts), calling join on the separator and passing the list in',

          'parts.join("-"), calling join on the list itself'],
  answer: 2,
        explanation:
          'join is the reverse of split, and it is called on the separator rather than on the list. You write "-".join(parts), so the hyphen is what does the joining and the list is what gets joined. parts.join("-") reads naturally and looks plausible, but a list has no join method, so it raises an error. split does the opposite job, breaking one string into a list, so it cannot join anything.',
      },
      {
        id: 'text-4',
        question: 'code holds "INV-2026-0042". What does code[4:8] give you?',
  options: [

          'INV-, the first four characters',

          '0042, the last four characters',

          'An error, because 8 runs past a short string',

          '2026, the four characters from position 4 up to but not including 8'],
  answer: 3,
        explanation:
          'A slice includes its start and excludes its end, so code[4:8] gives positions 4, 5, 6 and 7, which are the four digits of the year, 2026. The hyphen sits at position 3, so the year starts at 4. The prefix is code[:3] and the last four characters are code[-4:]. A slice that runs past the end of the string simply stops, so it does not raise an error, unlike indexing a single position that is out of range.',
      },
    ],
    tasks: [
      {
        id: 'text-t1',
        title: 'Split, join, slice and clean a field',
        prompt:
          'This splits a line from a passwd-style file into fields and picks two of them out, joins a list of words back together with hyphens, slices a prefix, a year and a suffix out of an ID, and cleans a messy field by stripping the spaces and folding it to lower case. Paste all four lines.',
        command: `python3 -c "line = 'root:x:0:0:root:/root:/bin/sh'; fields = line.split(':'); print(fields[0], fields[2], len(fields)); print('-'.join(['one','two','three'])); code = 'INV-2026-0042'; print(code[:3], code[4:8], code[-4:]); raw = '  Admin  '; print(raw.strip().lower())"`,
        hint: 'The third line has three parts separated by spaces: the prefix, the year, and the last four characters.',
        expects:
          'Four lines. The first is root 0 7, which is the first field, the third field and the number of fields in the line. The second is one-two-three, the list joined with hyphens. The third is INV 2026 0042, the prefix, the year and the last four characters pulled out by position. The fourth is admin, the field with its spaces stripped and its letters folded down. If the third line starts with INV- you used a slice that ran one position too far, which is the usual off-by-one.',
        rules: [
          { type: 'matches', pattern: '^\\s*root\\s+0\\s+7$', label: 'the fields were split and the right two picked out' },
          { type: 'contains', value: 'one-two-three', label: 'the list was joined back with hyphens' },
          { type: 'matches', pattern: '^\\s*INV 2026 0042$', label: 'the prefix, the year and the suffix came out of the ID' },
          { type: 'matches', pattern: '^\\s*admin$', label: 'the field was stripped and folded to lower case' },
          { type: 'absent', pattern: 'command not found|No such file or directory|Traceback', label: 'the command actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'python-hashing-and-encoding',
    title: 'Hashing and encoding in Python',
    topic: 'python-hashing-and-encoding',
    summary: 'Encode, hash and base64 a message, and read the five lines it prints.',
    intro:
      'Python keeps text in a str and raw data in a bytes, and most encoding work is about crossing between the two. This set covers why the character count and the byte count can differ, why a hash needs bytes rather than text, how hex writes each byte as two characters, and when to reach for the URL-safe base64 alphabet. The task runs the whole sequence once and asks you to read what it printed.',
    questions: [
      {
        id: 'hash-1',
        question: 'Why does len("café") print 4 while len("café".encode()) prints 5?',
  options: [

          'len always reports one more for the encoded form',

          'len counts characters in the str and bytes in the encoded form, and the accented e needs two bytes in UTF-8',

          'encode adds a trailing newline that len then counts',

          'encode doubles the length of every string'],
  answer: 1,
        explanation:
          'A str is a sequence of characters and a bytes object is a sequence of raw byte values, so len answers a different question for each. The word has four characters, but the accented e is two bytes in UTF-8, so the encoded form is five bytes long. For plain ASCII text the two figures happen to agree, which is exactly why the difference is easy to miss. No newline is added, and the growth depends on the characters rather than on a fixed rule.',
      },
      {
        id: 'hash-2',
        question: 'Why does hashlib.sha256("hello") raise a TypeError?',
  options: [

          'sha256 only accepts numbers',

          'The string is too short to hash',

          'sha256 needs a key as a second argument',

          'A hash works on bytes, and a Python str is text, so it has to be encoded first'],
  answer: 3,
        explanation:
          'hashlib.sha256 wants a bytes object, and "hello" is a str, so Python refuses and says that strings must be encoded before hashing. Calling .encode() on the string first, or writing it as a bytes literal with a b in front, fixes the type, and the digest is then the same either way because the bytes are identical. Length is not the problem, and no key is involved: SHA-256 takes its input in one piece.',
      },
      {
        id: 'hash-3',
        question: 'Why does base64.urlsafe_b64encode exist?',
  options: [

          'It produces a shorter result than standard base64',

          'It works on text, while the standard version needs bytes',

          'Standard base64 uses + and /, which have meaning inside a URL, so the URL-safe version swaps them for - and _',

          'It encrypts the data, while the standard version does not'],
  answer: 2,
        explanation:
          'Both forms spell the same bytes; only the alphabet differs. Standard base64 uses + and /, and both characters mean something in a URL or a query string, so a value that travels in a link can be mangled. The URL-safe variant uses - and _ instead, so three bytes of 255 become b____ rather than b////. Neither form encrypts anything, the length is the same, and both take bytes and return bytes.',
      },
      {
        id: 'hash-4',
        question: 'Why is a value such as a hash written as hex, so the bytes of Hi become 4869?',
  options: [

          'Hex only works for hashes and not for other bytes',

          'Hex writes each byte as exactly two characters, so a value is easy to read and cannot be confused with ordinary text',

          'Hex hides the value so it cannot be read back',

          'Hex makes the value shorter than the raw bytes'],
  answer: 1,
        explanation:
          'Hex is two characters per byte, so a hash or a key can be written down, copied and compared without ambiguity. The bytes of Hi are 48 and 69, which are H and i in ASCII, and 4869 reads back with bytes.fromhex. It is not hiding anything: hex reverses in one call, unlike a hash. It is also longer than the raw bytes rather than shorter, and every bytes object has the same .hex() method, not only hashes.',
      },
    ],
    tasks: [
      {
        id: 'hash-t1',
        title: 'Encode, hash and base64 in one run',
        prompt:
          'This counts the characters and the bytes in an accented word, shows two bytes as hex, hashes a message with SHA-256, and moves the same message through base64 and its URL-safe variant. Paste all five lines.',
        command: `python3 -c "import hashlib, base64; t = 'café'; print(len(t), len(t.encode())); print('Hi'.encode().hex()); print(hashlib.sha256(b'hello termux').hexdigest()); print(base64.b64encode(b'hello termux')); print(base64.urlsafe_b64encode(bytes([255, 255, 255])))"`,
        hint: 'The first line is two numbers, the character count and then the byte count.',
        expects:
          'Five lines. The first is 4 5, four characters but five bytes, because the accented e takes two bytes in UTF-8. The second is 4869, the hex of the two bytes of Hi. The third is the sixty four character SHA-256 digest of hello termux. The fourth is the base64 of that same message, which is aGVsbG8gdGVybXV4 with a b in front. The fifth is b____ for the three bytes of 255 in the URL-safe alphabet. If the first line is 4 4 you measured the same thing twice, and if the last line ends in four slashes you used the standard alphabet rather than the URL-safe one.',
        rules: [
          { type: 'matches', pattern: '^\\s*4\\s+5$', label: 'the character count and the byte count are both shown' },
          { type: 'contains', value: '4869', label: 'the two bytes are written as hex' },
          { type: 'contains', value: 'ba5223902303e1e372e694a564d1df1f32e87d70ccf5139ccc79bd8bb39da20d', label: 'the SHA-256 digest is the real one for that message' },
          { type: 'contains', value: 'aGVsbG8gdGVybXV4', label: 'the message was encoded as base64' },
          { type: 'matches', pattern: '^\\s*b\'____\'$', label: 'the URL-safe alphabet was used for the three bytes of 255' },
          { type: 'absent', pattern: 'command not found|No such file or directory|Traceback', label: 'the command actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'python-addresses',
    title: 'Addresses in Python',
    topic: 'python-addresses',
    summary: 'Read a network and split it, and read the four lines it prints.',
    intro:
      'The ipaddress module does subnet arithmetic correctly, including the small blocks most calculators get wrong. This set covers building a network from a host address, why a /24 holds 256 addresses but only 254 usable hosts, why a /31 reserves nothing, and how to pull one block out of a split network. The task reads a network, splits it, and asks you to paste the four lines.',
    questions: [
      {
        id: 'addr-1',
        question: 'Why does ipaddress.ip_network("192.168.1.42/24") raise a ValueError?',
  options: [

          'The prefix 24 is not a permitted value',

          'The address has to be written without dots',

          'A network cannot be built from a string',

          'The address has host bits set, and strict=False is needed to round it down to the network'],
  answer: 3,
        explanation:
          'ip_network will not quietly discard the host bits, because doing so would hide a mistake in a config file. The address .42 is a host inside the network, so it has bits set below the prefix, and the module says so plainly. Adding strict=False tells it that you meant a host address and want the network it sits in, and the result becomes 192.168.1.0/24. The prefix is valid, dotted addresses are the normal form, and a string is exactly what the function takes.',
      },
      {
        id: 'addr-2',
        question: 'A /24 holds 256 addresses but hosts() yields 254. Why the difference?',
  options: [

          'Two addresses are held back for the gateway alone',

          'hosts() counts only IPv6 addresses',

          'The network address and the broadcast address are reserved and cannot be given to a machine',

          'hosts() drops two addresses at random on each run'],
  answer: 2,
        explanation:
          'A /24 leaves eight host bits, so two to the power eight is 256 addresses. The first, 192.168.1.0, names the network and the last, 192.168.1.255, is the broadcast address, and neither can be assigned to a host, so hosts() yields the 254 in between. That is the total minus two the shell lesson works out by hand. The reserved pair is fixed rather than random, and hosts() behaves the same way for IPv4 and IPv6.',
      },
      {
        id: 'addr-3',
        question: 'For ip_network("10.0.0.4/31"), how many addresses does hosts() yield?',
  options: [

          'Four, because a /31 is larger than a /30',

          'Two, because a /31 has no room to reserve a network or a broadcast address, so both addresses are usable',

          'None, because two minus two is zero',

          'One, because the first address is the network address'],
  answer: 1,
        explanation:
          'A /31 leaves a single host bit, so the block holds two addresses. There is no room to reserve one for the network and one for the broadcast, so the usual subtraction does not apply and both addresses are usable, which suits a point-to-point link where each end is a machine. Many calculators subtract two and wrongly report zero usable hosts. A /31 is smaller than a /30 rather than larger, and it holds two addresses, not four.',
      },
      {
        id: 'addr-4',
        question: 'net = ip_network("192.168.1.0/24"); subs = list(net.subnets(new_prefix=26)). What is subs[2]?',
  options: [

          '192.168.1.192/26, because the third block is index 3',

          '192.168.1.64/26, because the blocks are sorted backwards',

          '192.168.1.0/26, because every block starts at zero',

          '192.168.1.128/26, because counting starts at zero so the third block is index 2'],
  answer: 3,
        explanation:
          'Four /26 blocks fit inside one /24, stepping by 64 because a /26 holds 64 addresses: .0, .64, .128 and .192. Python counts list positions from zero, so the third block is subs[2] and holds 192.168.1.128/26, while subs[3] is the fourth block at .192. This off-by-one is easy to make and worth meeting here, where the output is easy to read, rather than in a firewall rule where the wrong block would quietly let the wrong traffic through.',
      },
    ],
    tasks: [
      {
        id: 'addr-t1',
        title: 'Read a network and split it',
        prompt:
          'This builds the network that a host address sits in, reads its mask, its broadcast address and its address count, counts the usable hosts, splits the block into four smaller ones, and lists the addresses of a two address point-to-point link. Paste all four lines.',
        command: `python3 -c "import ipaddress; net = ipaddress.ip_network('192.168.1.42/24', strict=False); print(net, net.netmask, net.broadcast_address, net.num_addresses); print(len(list(net.hosts()))); print(len(list(net.subnets(new_prefix=26)))); print(list(ipaddress.ip_network('10.0.0.4/31').hosts()))"`,
        hint: 'The last line is a Python list holding the two IPv4Address values of the point-to-point link.',
        expects:
          'Four lines. The first is the network 192.168.1.0/24, its mask 255.255.255.0, its broadcast address 192.168.1.255 and its address count 256. The second is 254, the usable hosts, because the network and broadcast addresses are reserved. The third is 4, the number of /26 blocks that fit inside the /24. The fourth is a list holding 10.0.0.4 and 10.0.0.5, because a /31 reserves nothing and both addresses are usable. If the second line is 256 you counted all the addresses rather than the usable hosts.',
        rules: [
          { type: 'contains', value: '192.168.1.0/24', label: 'the host address was rounded down to its network' },
          { type: 'contains', value: '255.255.255.0', label: 'the netmask is the one for a /24' },
          { type: 'contains', value: '192.168.1.255', label: 'the broadcast address is the last in the block' },
          { type: 'matches', pattern: '^\\s*254$', label: 'the usable host count is 254, not the address count' },
          { type: 'matches', pattern: '^\\s*4$', label: 'the /24 splits into four /26 blocks' },
          { type: 'contains', value: '10.0.0.5', label: 'the /31 lists both of its addresses as usable' },
          { type: 'absent', pattern: 'command not found|No such file or directory|Traceback', label: 'the command actually ran' },
        ],
      },
    ],
  },

  {
    slug: 'python-secrets-and-tokens',
    title: 'Secrets and tokens in Python',
    topic: 'python-secrets-and-tokens',
    summary: 'Generate, hash and compare a token, and read the five lines it prints.',
    intro:
      'A secret is any value that would cause trouble in the wrong hands, and handling one well is mostly about where it lives and how you compare it. This set covers keeping a token out of your source, generating one with the secrets module, storing a hash rather than the value itself, and comparing tokens without leaking timing. The task runs the whole sequence once and asks you to read what it printed.',
    questions: [
      {
        id: 'sec-1',
        question: 'Why should a token be read from the environment rather than written into the script?',
  options: [

          'A literal in the source is encrypted automatically',

          'The environment hides the value from the program itself',

          'A value in the source is copied into every version of the file, so the environment keeps it outside the code',

          'The environment is faster to read than a literal'],
  answer: 2,
        explanation:
          'Writing API_TOKEN = "abc123" puts the secret into your source, into your editor history and into any copy of the file you send to anyone. Reading it from the environment keeps it outside the file and set for the session, so the same code can run with different secrets and nothing secret is committed. Reading a name is not faster or slower in any way that matters, a literal is not encrypted, and the program still sees the value it reads.',
      },
      {
        id: 'sec-2',
        question: 'Why use the secrets module rather than random to generate a token?',
  options: [

          'secrets runs faster than random',

          'secrets draws from the operating system source of randomness, while random is a seeded generator meant for simulation',

          'secrets produces shorter tokens',

          'random cannot produce letters or digits'],
  answer: 1,
        explanation:
          'The random module is a pseudo-random generator seeded from a known starting point, so its output can be reproduced if the seed is known; that is fine for a game or a simulation and wrong for a secret. The secrets module draws from the operating system source of randomness, which is meant to be unpredictable, so a token made with it cannot be replayed from a seed. Length is set by the argument you pass, random can produce letters, and speed is not the deciding factor.',
      },
      {
        id: 'sec-3',
        question: 'secrets.token_hex(16) is run. How long is the token it returns?',
  options: [

          '8 characters, because hex halves the length',

          '64 characters, because the argument is doubled twice',

          '32 characters, because the argument counts bytes and each byte prints as two hex digits',

          '16 characters, because the argument is a character count'],
  answer: 2,
        explanation:
          'The argument to token_hex is a count of random bytes, not a count of characters. Sixteen bytes are printed as two hexadecimal digits each, so the token is 32 characters long. That is why asking for 32 when you want 32 characters gives you 64 instead, a mistake the lesson has you make on purpose. Nothing halves the length, and only token_hex(32) would reach 64.',
      },
      {
        id: 'sec-4',
        question: 'Why compare a stored token with hmac.compare_digest rather than with ==?',
  options: [

          'compare_digest is the only way to compare two strings',

          '== cannot compare two values of different length',

          'compare_digest alters the tokens so that they match',

          'A plain == stops at the first character that differs, so how long it takes hints at how much of the value was right'],
  answer: 3,
        explanation:
          'A plain == returns as soon as it finds a character that differs, so the time it takes grows with the length of the shared prefix. An attacker who can try a token over and over can measure that time and recover the value one character at a time. hmac.compare_digest looks at every character either way, so the time it takes says nothing about how close the guess was. It does not alter the values, and == can compare strings of any length.',
      },
    ],
    tasks: [
      {
        id: 'sec-t1',
        title: 'Read, generate, hash and compare a secret',
        prompt:
          'This checks whether a token is set in the environment, makes a sixteen byte hex token and confirms its length, makes a URL-safe token, hashes a fixed secret and prints the digest length, and compares two equal tokens in constant time. Paste all five lines.',
        command: `python3 -c "import os, secrets, hashlib, hmac; print('token present:', os.environ.get('LEARMUX_DEMO_TOKEN') is not None); t = secrets.token_hex(16); print(len(t), t.isalnum()); print(len(secrets.token_urlsafe(12))); print(len(hashlib.sha256(b'local-dev-token').hexdigest())); print(hmac.compare_digest('token-abc', 'token-abc'))"`,
        hint: 'The token itself changes on every run, so the lines report its length and shape rather than its value.',
        expects:
          'Five lines. The first is token present: False, because the demo name is not set. The second is 32 True: a sixteen byte hex token is thirty two characters, all of them letters and digits. The third is 16, the length of a twelve byte URL-safe token. The fourth is 64, the length of a SHA-256 digest written in hex. The fifth is True, because the two tokens match. The token values change on every run, so the lines report their length and shape. If the second line is 16 True you asked token_hex for eight bytes when you wanted thirty two characters.',
        rules: [
          { type: 'matches', pattern: '^\\s*token present: False$', label: 'the missing environment name was reported' },
          { type: 'matches', pattern: '^\\s*32 True$', label: 'a sixteen byte hex token is thirty two characters long' },
          { type: 'matches', pattern: '^\\s*16$', label: 'a twelve byte URL-safe token is sixteen characters long' },
          { type: 'matches', pattern: '^\\s*64$', label: 'a SHA-256 digest written in hex is sixty four characters' },
          { type: 'matches', pattern: '^\\s*True$', label: 'the two equal tokens compared as a match' },
          { type: 'absent', pattern: 'command not found|No such file or directory|Traceback', label: 'the command actually ran' },
        ],
      },
    ],
  },
];
