/**
 * Grading for output-submission tasks.
 *
 * The point of a rule is to describe what a correct answer means, not what it
 * looks like. A learner's `nmap` output will differ from anyone else's in the
 * version string, the latency, the ordering and the host name, so matching on
 * those would be useless. Matching on "a port line marked open" is not.
 *
 * Every rule must pass. Each is reported on its own, because a near miss is
 * the most useful thing this can tell someone.
 */

import type { OutputRule, OutputTask } from '../data/practice/types';

export interface RuleResult {
  label: string;
  ok: boolean;
}

export interface GradeResult {
  passed: boolean;
  results: RuleResult[];
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

export function gradeOutput(text: string, task: OutputTask): GradeResult {
  const results = task.rules.map((rule) => ({ label: rule.label, ok: checkRule(text, rule) }));
  return { passed: results.length > 0 && results.every((r) => r.ok), results };
}

/**
 * A cheap sanity check before grading, so an empty or obviously wrong paste
 * gets a useful message rather than a list of failed rules.
 */
export function looksEmpty(text: string): boolean {
  return text.trim().length < 4;
}
