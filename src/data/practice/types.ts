/**
 * Practice sets: multiple-choice questions and output-submission tasks.
 *
 * Both types are self-marked in the browser, which is the only thing a static
 * site can do. Nothing here needs a runtime or a server.
 *
 * The two are graded differently, and deliberately so:
 *
 *   A multiple-choice question has one right answer, and the explanation
 *   matters more than the mark. Getting it wrong and reading why is the point.
 *
 *   An output task cannot be marked against a fixed string, because no two
 *   phones produce the same output. It is marked against authored rules that
 *   describe the shape of a correct answer, so any reasonable formatting
 *   passes as long as the meaning is there.
 */

/** A multiple-choice question. `answer` is an index into `options`. */
export interface McqQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  /** Shown once the question has been answered. Say why, not just what. */
  explanation: string;
}

/**
 * One authored rule for grading a pasted output. Every rule in a task must
 * pass, and each one is reported separately so a near miss is useful.
 */
export type OutputRule =
  /** The text contains this, ignoring case and surrounding whitespace. */
  | { type: 'contains'; value: string; label: string }
  /** Some line of the text matches this regular expression. */
  | { type: 'matches'; pattern: string; label: string }
  /** No part of the text matches this regular expression. */
  | { type: 'absent'; pattern: string; label: string }
  /** The text has at least this many non-empty lines. */
  | { type: 'lines'; min: number; label: string };

export interface OutputTask {
  id: string;
  title: string;
  /** The scenario, in prose. Explain what to do and why. */
  prompt: string;
  /** The command to run on the device. */
  command: string;
  /** Optional nudge, revealed on request rather than by default. */
  hint?: string;
  /**
   * A script this task needs, taken from the lesson that built it.
   *
   * Several tasks ask the learner to run the tool they finished in the
   * previous lesson. Rather than pasting the whole program into the command
   * box, the task names the lesson and the filename, and the checker pulls the
   * final code block out of that lesson and writes it out before running. The
   * command stays short, and the script under test is the one the lesson
   * actually shipped.
   */
  fixture?: { lesson: string; as: string };
  /**
   * Files the learner is expected to have made by hand, for the test harness.
   *
   * Some tasks grade a file the reader created with an editor, which cannot be
   * scripted. Without this the harness runs the command in an empty home, finds
   * nothing, and the task looks ungradeable when it is not. The harness writes
   * these files first; the browser never sees them, and the learner still has
   * to make the file themselves.
   */
  needs?: Record<string, string>;
  /** What a good answer looks like, shown once every rule passes. */
  expects: string;
  rules: OutputRule[];
}

export interface PracticeSet {
  /** Matches a lesson id where one exists, so the lesson can link to it. */
  slug: string;
  title: string;
  /** The lesson this follows, for the breadcrumb and the related links. */
  topic: string;
  /** One line for the index card. */
  summary: string;
  /** A short paragraph at the top of the page. */
  intro: string;
  questions: McqQuestion[];
  tasks: OutputTask[];
}

/** Counts, for the index cards and the lesson link. */
export function setSize(set: PracticeSet): { questions: number; tasks: number } {
  return { questions: set.questions.length, tasks: set.tasks.length };
}

export function totalPoints(set: PracticeSet): number {
  return set.questions.length + set.tasks.length;
}
