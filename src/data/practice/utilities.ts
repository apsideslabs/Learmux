/**
 * Practice sets for the Utilities track: the password generator and the
 * encoder and decoder. Each set follows the lesson that builds the same tool
 * in the shell, so the two can be read side by side.
 *
 * The output tasks run the finished script from the lesson. Each command
 * writes the whole script to a file, runs it once, and prints what it
 * produced on a single line, so the task tests the thing the lesson actually
 * built rather than a loose collection of one liners.
 *
 * The rules describe meaning rather than exact characters. A generated
 * password differs on every run, so the rules ask whether the output has the
 * right shape: a value of the right length from the right alphabet, with the
 * entropy the arithmetic gives for those options, and a clean run with no
 * error message.
 */

import type { PracticeSet } from './types';

export const utilitiesSets: PracticeSet[] = [
  {
    slug: 'build-a-password-generator',
    title: 'Build a password generator',
    topic: 'build-a-password-generator',
    summary: 'Run the genpass.sh script you built, and read the entropy it reports.',
    intro:
      'A password is only as strong as the randomness behind it. This set covers why the shell number $RANDOM will not do, what is subtly wrong with the common /dev/urandom pipeline, and how the finished genpass.sh works out the entropy of a password from its length and its alphabet.',
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
          'The pipeline usually returns twenty characters, which is why the idiom spreads. The problem is the mechanism. head exits the moment it has its twenty bytes and closes the pipe, while tr is still writing, so tr is killed by a signal part way through its work. Correctness depends on that signal rather than on the two tools agreeing on a length, and in a script that inspects the status of every stage the same line can report a broken pipe. A tool that asks the kernel for exactly the bytes it needs avoids the race, which is why the lesson uses openssl rand.',
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
        question: 'In the finished script, why are bytes at or above the limit thrown away rather than used straight away?',
        options: [
          'Taking the byte modulo the alphabet size on its own would favour the low positions, because 256 is not a multiple of the alphabet size',
          'The bytes above the limit are not random',
          'It makes the script faster',
          'It stops the password from being too long',
        ],
        answer: 0,
        explanation:
          'A byte runs from 0 to 255, and 256 is not a multiple of most alphabet sizes, so a plain modulo would hand the first few positions a slightly better chance than the rest. The limit is the largest multiple of the alphabet size that fits in a byte, and any byte at or above it is discarded and drawn again. That is what makes every position equally likely, and it is why the finished script is not biased even though it is short.',
      },
    ],
    tasks: [
      {
        id: 'pw-t1',
        title: "Run the generator you built",
        prompt:
          "The genpass.sh you finished in the last lesson is already saved next to you. This runs it for a twenty character password drawn from lower case, upper case and digits, and prints the password and its entropy on one line. Paste that line.",
        command:
          "bash genpass.sh -l 20 -c lud",
        fixture: { lesson: 'build-a-password-generator', as: 'genpass.sh' },
        hint: "The bracket at the end is the report: the length, the size of the alphabet it drew from, and the entropy in bits.",
        expects:
          "One line, holding a twenty character password and then a bracketed report. The report should read 20 chars, alphabet 62, and a figure near 119.08 bits, because twenty characters drawn from 62 possible ones is 20 times log2(62). Lower case, upper case and digits together are 26 plus 26 plus 10, which is 62. If the alphabet figure is different, the wrong classes were selected; if the bit figure is much lower, the length did not take.",
        rules: [
          { type: 'matches', pattern: '^\\s*[A-Za-z0-9]{20}\\s+\\[20 chars, alphabet 62, \\d+\\.\\d+ bits\\]\\s*$', label: 'a 20 character password with the 62 character alphabet reported' },
          { type: 'contains', value: '119.0', label: 'the entropy is the real figure for that alphabet' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed|genpass:', label: 'the script ran' },
        ],
      },
    ],
  },

  {
    slug: 'build-an-encoder',
    title: 'Build an encoder and decoder',
    topic: 'build-an-encoder',
    summary: 'Run the encdec.sh script you built, and let its round trip check catch a bad decode.',
    intro:
      'Encoding rewrites the same bytes in a different alphabet, so it hides nothing. This set covers base64 and hex, the decode that quietly succeeds on input that was never base64, and the round trip check the finished encdec.sh adds to catch it.',
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
          'base64 -d does not ask whether the input was base64, only whether it could be. The word password is eight characters and every one of them is a valid base64 character, so the decoder accepts it and produces six bytes that mean nothing. A zero exit code rules out malformed input, but it is not proof of intent. That is why the finished script adds the -c flag: it decodes the value, encodes the result again, and compares the two.',
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
        question: 'Why does the finished script read hex back with printf and od rather than with xxd -r -p?',
        options: [
          'od comes with the base system and is always there, while xxd may need installing on the phone',
          'xxd -r -p cannot read plain hex',
          'printf and od produce base64 instead of bytes',
          'xxd -r -p sorts the bytes before writing them',
        ],
        answer: 0,
        explanation:
          'od -An -tx1 turns bytes into hex with nothing else on the line, and it is part of the base install, so it is always available on a phone. xxd prints plain hex with -p and reads it back with -r -p, but xxd may not be installed, and on a phone that is often the deciding factor. The script keeps to od so that it needs no package beyond the base system.',
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
        title: "Encode a value and decode it back",
        prompt:
          "The encdec.sh you finished is saved next to you. This encodes café to hex, which shows the UTF-8 bytes rather than the latin-1 ones, then decodes a base64 string back to text. Paste both lines.",
        command:
          "bash encdec.sh --to hex 'café'; bash encdec.sh -d --to base64 'aGVsbG8gdGVybXV4'",
        fixture: { lesson: 'build-an-encoder', as: 'encdec.sh' },
        hint: "The first line is six pairs of hex digits, because é takes two bytes in UTF-8.",
        expects:
          "Two lines. The first is 63 61 66 c3 a9, which is c, a, f, then the two bytes of é. The second is hello termux. The point of the first line is that é is c3 a9 in UTF-8 and e9 in latin-1, so a tool showing e9 is treating your text as latin-1 and would mangle it on the way back. If you see e9, the encoding path is wrong.",
        rules: [
          { type: 'contains', value: '63 61 66 c3 a9', label: 'the hex is the UTF-8 bytes, not latin-1' },
          { type: 'contains', value: 'hello termux', label: 'the base64 decoded back to text' },
          { type: 'absent', pattern: 'command not found|No such file or directory|not installed|encdec:', label: 'the script ran' },
        ],
      },
    ],
  },
];
