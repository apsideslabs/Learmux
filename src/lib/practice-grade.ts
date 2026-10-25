/**
 * Grading for output-submission tasks.
 *
 * The point of a rule is to describe what a correct answer means, not what it
 * looks like. A learner's `ls -l` output will differ from anyone else's in the
 * owner name, the size, the timestamp and the ordering, so matching on those
 * would be useless. Matching on "a line that starts with a permission string"
 * is not.
 *
 * Two things make this more forgiving than a naive string comparison, and both
 * came from real failures:
 *
 *   The paste is normalised first. Terminal output copied on a phone often
 *   arrives indented, because a clipboard, a notes app or a chat window added
 *   leading whitespace. Anchored rules used to fail all at once on that, which
 *   told the learner nothing. See `normalise`.
 *
 *   A paste that matches nothing is reported differently from a paste that
 *   nearly matches. "This does not look like that command's output" is a much
 *   more useful thing to say than a list of three failed rules.
 */

import type { OutputRule, OutputTask } from '../data/practice/types';

export interface RuleResult {
  label: string;
  ok: boolean;
}

export interface GradeResult {
  passed: boolean;
  results: RuleResult[];
  /** How many lines were read, after normalising. */
  lines: number;
  /** True when nothing matched at all, which usually means the wrong paste. */
  nothingMatched: boolean;
}

/**
 * Prepare a paste for grading.
 *
 * Line endings are unified, trailing whitespace is dropped, and the block is
 * dedented by its common leading prefix. Dedenting rather than stripping every
 * line matters: `uniq -c` output has meaningful leading spaces on each row, and
 * removing all of them would still leave the relative alignment intact, but
 * stripping a common prefix preserves the shape of the whole block.
 */
export function normalise(text: string): string {
  const lines = text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''));

  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0);

  const common = indents.length > 0 ? Math.min(...indents) : 0;
  if (common === 0) return lines.join('\n');

  return lines.map((line) => line.slice(common)).join('\n');
}

/** Build a regular expression, or null if the pattern is not usable. */
function safeRegExp(pattern: string): RegExp | null {
  try {
    // multiline, so ^ and $ mean the start and end of a line rather than of
    // the whole paste, which is what every rule here assumes
    return new RegExp(pattern, 'im');
  } catch {
    return null;
  }
}

export function checkRule(text: string, rule: OutputRule): boolean {
  switch (rule.type) {
    case 'contains':
      return text.toLowerCase().includes(rule.value.toLowerCase());

    case 'matches': {
      const re = safeRegExp(rule.pattern);
      return re !== null && re.test(text);
    }

    case 'absent': {
      const re = safeRegExp(rule.pattern);
      return re === null || !re.test(text);
    }

    case 'lines': {
      const count = text.split('\n').filter((l) => l.trim().length > 0).length;
      return count >= rule.min;
    }

    default:
      return false;
  }
}

export function gradeOutput(rawText: string, task: OutputTask): GradeResult {
  const text = normalise(rawText);
  const results = task.rules.map((rule) => ({ label: rule.label, ok: checkRule(text, rule) }));
  const passed = results.length > 0 && results.every((r) => r.ok);

  return {
    passed,
    results,
    lines: text.split('\n').filter((l) => l.trim().length > 0).length,
    // If not one rule matched, the paste is probably from something else
    // entirely, which is worth saying plainly.
    nothingMatched: !passed && results.every((r) => !r.ok),
  };
}

/** A cheap sanity check before grading, so an empty paste gets a useful message. */
export function looksEmpty(text: string): boolean {
  return text.trim().length < 4;
}
