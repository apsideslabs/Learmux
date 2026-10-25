/**
 * Practice sets for the Utilities track: the password generator and the
 * encoder and decoder. Each set follows the lesson that builds the same thing
 * in the shell, so the two can be read side by side.
 *
 * The output tasks are graded against rules that describe meaning rather than
 * exact characters. A generated password differs on every run, so the rules
 * ask whether the output has the right shape: a value of the right length
 * under the right label, the bytes of the UTF-8 text, and a clean run with no
 * error message.
 */

import type { PracticeSet } from './types';

export const utilitiesSets: PracticeSet[] = [
  {
    slug: 'build-a-password-generator',
    title: 'Build a password generator',
    topic: 'build-a-password-generator',
    summary: 'Generate a real random secret with openssl and Python, and count its bits.',
    intro:
      'A password is only as strong as the randomness behind it. This set covers why the shell number $RANDOM will not do, what is subtly wrong with the common /dev/urandom pipeline, and how to work out the entropy of a password from its length and its alphabet.',
    questions: [
      {
        id: 'pw-1',
        question: 'Why is $RANDOM a poor source for a password?',
        options: [
          'It is a seeded generator that repeats for a known seed, and each value covers only 15 bits',
          'It is too slow to call many times in a loop',
          'It cannot produce digits or upper case letters',
          'It only works while the phone is charging',
        ],
        answer: 0,
        explanation:
          'Setting RANDOM to a fixed value reseeds it, and the same seed always produces the same sequence, so the output is computed from a small seed rather than drawn from the device randomness. On top of that, each value is a whole number from 0 to 32767, which is only fifteen bits of range. A password needs a source with far more state and no way to replay it from a seed you can set. The other options are not true of $RANDOM.',
      },
      {
        id: 'pw-2',
        question: "What is subtly wrong with tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 20 ?",
        options: [
          'head closes the pipe as soon as it has its bytes, so tr is killed by a signal mid write and the result depends on that race',
          'tr cannot read from /dev/urandom',
          'head -c 20 counts lines rather than bytes',
          'It can only ever produce lower case letters',
        ],
        answer: 0,
        explanation:
          'The pipeline usually returns twenty characters, which is why the idiom spreads. The problem is the mechanism. head exits the moment it has its twenty bytes and closes the pipe, while tr is still writing, so tr is killed by a signal part way through its work. Correctness depends on that signal rather than on the two tools agreeing on a length, and in a script that inspects the status of every stage the same line can report a broken pipe. A tool that asks the kernel for exactly the bytes it needs avoids the race.',
      },
      {
        id: 'pw-3',
        question: 'A twenty character password drawn from 62 letters and digits carries roughly how many bits of entropy?',
        options: ['About 119 bits', 'About 62 bits', 'About 20 bits', 'About 6 bits'],
        answer: 0,
        explanation:
          'Entropy is the length times the log base 2 of the alphabet size. The log base 2 of 62 is about 5.95, so twenty characters give about 20 times 5.95, which is about 119 bits. The other numbers come from common mistakes: 62 is the alphabet size, not the bits, and 20 is the length. Six is close to the bits a single character contributes, which is the per character figure rather than the total.',
      },
      {
        id: 'pw-4',
        question: 'Why is a loop that asks you to type the password characters weaker than openssl or secrets?',
        options: [
          'The characters come from your own habits, so the entropy is limited by what you tend to choose, and the length depends on how many times you press enter',
          'read cannot accept more than one character at a time',
          'The loop hashes each character as it is typed',
          'A shell loop cannot run on a phone',
        ],
        answer: 0,
        explanation:
          'A generator is worth using precisely because it draws from a source you cannot bias. When you type the characters, you reach for the same keys every time, a name, a birthday, the top row of the keyboard, and the result is far less random than it looks. The loop also ties the length to how many times you happen to press enter, and it leaves the password sitting on the screen. read takes a whole line, hashes nothing, and works perfectly well on a phone.',
      },
    ],
    tasks: [
      {
        id: 'pw-t1',
        title: 'Generate a secret three ways',
        prompt:
          'This makes a random secret three times, once with openssl in base64, once with openssl in hex, and once with the Python secrets module, printing a label in front of each so you can see which is which. It needs the openssl and python packages, so run pkg install openssl python first if either is missing. Read the length of each value against its label.',
        command:
          'printf \'base64 : \'; openssl rand -base64 24; printf \'hex    : \'; openssl rand -hex 16; printf \'python : \'; python3 -c "import secrets, string; a = string.ascii_letters + string.digits; print(\'\'.join(secrets.choice(a) for _ in range(20)))"',
        hint: 'Twenty four bytes in base64 is 32 characters, sixteen bytes in hex is also 32 characters, and the Python loop was asked for 20 characters.',
        expects:
          'Three labelled lines. The base64 line is 32 characters from the base64 alphabet, which is 24 random bytes at six bits each. The hex line is 32 characters from the hex alphabet, which is 16 random bytes at four bits each, so it carries fewer bits than the base64 line even though it looks the same length. The python line is 20 characters from letters and digits. Every value changes each time you run it, which is the whole point.',
        rules: [
          {
            type: 'matches',
            pattern: '^\\s*base64\\s*:\\s*[A-Za-z0-9+/]{32}\\s*$',
            label: 'a 32 character base64 secret follows the base64 label',
          },
          {
            type: 'matches',
            pattern: '^\\s*hex\\s*:\\s*[0-9a-f]{32}\\s*$',
            label: 'a 32 character hex secret follows the hex label',
          },
          {
            type: 'matches',
            pattern: '^\\s*python\\s*:\\s*[A-Za-z0-9]{20}\\s*$',
            label: 'a 20 character password follows the python label',
          },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the commands actually ran',
          },
        ],
      },
    ],
  },

  {
    slug: 'build-an-encoder',
    title: 'Build an encoder and decoder',
    topic: 'build-an-encoder',
    summary: 'Move text through base64 and hex, and confirm the round trip.',
    intro:
      'Encoding rewrites the same bytes in a different alphabet, so it hides nothing. This set covers base64 and hex, the decode that quietly succeeds on input that was never base64, and the one place where a phone disagrees with a desktop, the bytes behind an accented letter.',
    questions: [
      {
        id: 'enc-1',
        question: "You run printf 'password' | base64 -d and it exits 0. What does that tell you?",
        options: [
          'Only that the string is well formed base64; it decodes to meaningless bytes, so the exit code alone is not proof that the value was base64',
          'The string really was base64 and now holds a password',
          'base64 refused the input and printed nothing',
          'The string was encrypted on the way in',
        ],
        answer: 0,
        explanation:
          'base64 -d does not ask whether the input was base64, only whether it could be. The word password is eight characters and every one of them is a valid base64 character, so the decoder accepts it and produces eight bytes that mean nothing. A zero exit code rules out malformed input, but it is not proof of intent. Decode the result and encode it again, then compare with the original, to confirm the round trip.',
      },
      {
        id: 'enc-2',
        question: "Why do printf '%s' 'hello' | base64 and echo 'hello' | base64 give different results?",
        options: [
          'echo adds a trailing newline, which is encoded along with the text, so the base64 ends in an extra block',
          'printf encodes in hexadecimal and echo encodes in base64',
          'echo reverses the characters before encoding them',
          'They give the same result',
        ],
        answer: 0,
        explanation:
          'echo appends a newline to whatever it prints, and that newline is a byte like any other, so it becomes part of the text that base64 encodes. The encoded value ends in Cg==, which is the newline. printf with the %s format writes exactly the characters you gave it and no more. A newline that crept in at one end and not the other is the most common reason a value will not match the original after a round trip.',
      },
      {
        id: 'enc-3',
        question: 'What is the difference between xxd -p and od -An -tx1?',
        options: [
          'xxd -p prints plain hex with no offsets and no ASCII column, while od -An -tx1 prints one byte per column separated by spaces and needs no extra package',
          'xxd -p prints base64 and od -An -tx1 prints decimal',
          'xxd -p decodes and od -An -tx1 encodes',
          'od -An -tx1 sorts the bytes before printing them',
        ],
        answer: 0,
        explanation:
          'Both turn bytes into hex, in different layouts. xxd -p writes the hex with nothing else, so it is easy to read and easy to feed back with xxd -r -p, but xxd may need installing on your phone. od comes with the base system, so it is always there, and -An drops the offset column while -tx1 asks for one byte per value in hex. Neither sorts anything, and neither prints base64.',
      },
      {
        id: 'enc-4',
        question: "Why does printf '%s' 'café' | base64 give Y2Fmw6k= rather than Y2Fm6Q==?",
        options: [
          'The accented e is two bytes in UTF-8 (c3 a9), so the base64 is built from four bytes; a latin-1 tool would use one byte (e9) and give the other string',
          'base64 rejects non ASCII characters and returns an error',
          'The two commands are identical and both give Y2Fmw6k=',
          'The accented letter is silently dropped from the input',
        ],
        answer: 0,
        explanation:
          'In UTF-8 the letter e with an acute accent is two bytes, c3 and a9, so the four letters of café become five bytes and the base64 is built from those. A tool that treats the same text as latin-1 uses a single byte, e9, for that letter and produces a different string, Y2Fm6Q==. When a value decodes to the wrong characters, the usual cause is a mismatch between UTF-8 and latin-1 rather than a wrong value, and od shows the bytes plainly.',
      },
    ],
    tasks: [
      {
        id: 'enc-t1',
        title: 'Encode a word, decode it back, and show the bytes',
        prompt:
          'This takes a short word with an accented letter and runs it through base64, then decodes it straight back, then prints the bytes it is made of in hex. Read the three lines together: the encoded form, the original word, and the bytes behind it.',
        command: "printf '%s' 'café' | base64; printf '%s' 'café' | base64 | base64 -d; echo; printf '%s' 'café' | od -An -tx1",
        hint: 'The accented e is two bytes in UTF-8, so the hex line has five values for four letters.',
        expects:
          'Three lines. The first is the base64 of the word, Y2Fmw6k=, which was built from the UTF-8 bytes rather than from one byte per letter. The second is the word back again, which shows that decoding needs no key. The third is the byte values in hex, and the pair c3 a9 near the end is the UTF-8 for the accented e. A tool that used latin-1 would show e9 in that position and a different base64 on the first line.',
        rules: [
          {
            type: 'matches',
            pattern: '^\\s*Y2Fmw6k=\\s*$',
            label: 'the base64 of the UTF-8 word is printed',
          },
          {
            type: 'contains',
            value: 'café',
            label: 'the word decodes back to the original',
          },
          {
            type: 'matches',
            pattern: '^\\s*63\\s+61\\s+66\\s+c3\\s+a9\\s*$',
            label: 'the bytes are shown as UTF-8 hex',
          },
          {
            type: 'absent',
            pattern: 'command not found|No such file or directory|not installed',
            label: 'the commands actually ran',
          },
        ],
      },
    ],
  },
];
