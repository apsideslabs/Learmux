/**
 * Checkpoint marking.
 *
 * A checkpoint says "the output of your code should read like this". Marking it
 * is a comparison, and the comparison is the part worth getting right, so it
 * lives here as plain functions with no DOM in sight.
 *
 * Two decisions shape it:
 *
 *   1. Trailing whitespace never matters. A reader who adds a space at the end
 *      of a line has not got the exercise wrong, and saying they have teaches
 *      them to distrust the marking.
 *   2. A near miss is more useful than a pass or fail. When the text differs,
 *      the first line that differs is the single most helpful thing to show, so
 *      the result carries it.
 */

export type MatchMode = 'exact' | 'contains' | 'regex';

export interface CheckResult {
  pass: boolean;
  /** The first line that differs, when the comparison failed. */
  firstDifference?: { line: number; expected: string; got: string };
  /** A short sentence for the reader. */
  message: string;
}

/** Normalise line endings and strip trailing spaces from every line. */
export function normalise(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}

export function checkOutput(actual: string, expected: string, mode: MatchMode = 'exact'): CheckResult {
  const got = normalise(actual);
  const want = normalise(expected);

  if (mode === 'contains') {
    return got.includes(want)
      ? { pass: true, message: 'The output contains what it should.' }
      : {
          pass: false,
          message: 'That output does not contain the expected text yet.',
        };
  }

  if (mode === 'regex') {
    let re: RegExp;
    try {
      re = new RegExp(expected, 'm');
    } catch {
      return { pass: false, message: `The checkpoint pattern is not a valid regular expression: ${expected}` };
    }
    return re.test(got)
      ? { pass: true, message: 'The output matches.' }
      : { pass: false, message: 'The output does not match the expected shape yet.' };
  }

  // exact
  if (got === want) {
    return { pass: true, message: 'That is exactly right.' };
  }

  const gotLines = got.split('\n');
  const wantLines = want.split('\n');
  const count = Math.max(gotLines.length, wantLines.length);
  for (let i = 0; i < count; i++) {
    const g = gotLines[i];
    const w = wantLines[i];
    if (g !== w) {
      return {
        pass: false,
        firstDifference: {
          line: i + 1,
          expected: w === undefined ? '(nothing, the output ended here)' : w,
          got: g === undefined ? '(nothing, the output ended here)' : g,
        },
        message:
          w === undefined
            ? `Line ${i + 1} is one line too many.`
            : g === undefined
              ? `Line ${i + 1} is missing.`
              : `Line ${i + 1} is not what it should be.`,
      };
    }
  }

  return { pass: false, message: 'That is not quite right yet.' };
}

/**
 * A stable id for a checkpoint, so progress can be recorded against it.
 *
 * Built from the lesson and the cell's position rather than from its text, so
 * editing the prose around a cell never loses a reader's progress.
 */
export function checkpointId(lesson: string, index: number): string {
  return `py/${lesson}/${index}`;
}
