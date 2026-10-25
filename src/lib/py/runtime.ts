/**
 * The in-page Python runtime.
 *
 * Pyodide is real CPython compiled to WebAssembly. It runs entirely in the
 * browser tab: there is no server, nothing is uploaded, and the page stays a
 * static file.
 *
 * ## On the two headers
 *
 * The usual claim is that Pyodide needs `Cross-Origin-Opener-Policy` and
 * `Cross-Origin-Embedder-Policy`, which GitHub Pages cannot send. That is half
 * right. Those two headers put a page into a cross-origin isolated state, and
 * what that state unlocks is `SharedArrayBuffer`, which WebAssembly threads
 * need. Pyodide itself does not need threads. It runs single-threaded quite
 * happily, and the Pyodide documentation says outright that any static host
 * serving the right MIME types will do, naming GitHub Pages as an example.
 *
 * So this runs on GitHub Pages as it is, with no headers and no service worker.
 * The only thing given up is threads, which nothing here uses.
 *
 * ## Loading
 *
 * The runtime is about ten megabytes, so it is not fetched until the reader
 * presses Run on a cell. Nothing on a lesson page costs anything until then,
 * and after the first load the browser caches it.
 */

/** Pinned, so a CDN release cannot change behaviour under us. */
export const PYODIDE_VERSION = '314.0.7';
export const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export interface PyRunResult {
  ok: boolean;
  /** Everything the code printed on standard output. */
  stdout: string;
  /** Anything written to standard error, which Python rarely uses. */
  stderr: string;
  /** The Python traceback, when the code raised. */
  error?: string;
  /** Just the exception line, for a compact message. */
  errorLine?: string;
  /** How long the code took, in milliseconds. */
  ms: number;
}

export type LoadStage = 'idle' | 'script' | 'runtime' | 'ready' | 'failed';

let pyodidePromise: Promise<any> | null = null;
let stage: LoadStage = 'idle';
const stageListeners = new Set<(s: LoadStage) => void>();

export function loadStage(): LoadStage {
  return stage;
}

export function onLoadStage(fn: (s: LoadStage) => void): () => void {
  stageListeners.add(fn);
  fn(stage);
  return () => stageListeners.delete(fn);
}

function setStage(s: LoadStage) {
  stage = s;
  for (const fn of stageListeners) fn(s);
}

/**
 * Pull the legacy `pyodide.js` build in with a script tag.
 *
 * The ES module build would have to be imported by a bare specifier, which a
 * bundler then tries to resolve at build time and fails, because the URL is a
 * CDN. The legacy build sets `loadPyodide` on the global object instead, which
 * sidesteps the bundler entirely and is the same file either way.
 */
function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-pyodide]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('the runtime script failed to load')));
      if ((globalThis as any).loadPyodide) resolve();
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.dataset.pyodide = '1';
    el.addEventListener('load', () => resolve());
    el.addEventListener('error', () =>
      reject(new Error(`could not fetch the runtime from ${new URL(src).host}`)),
    );
    document.head.appendChild(el);
  });
}

/** Load the runtime, once per page, sharing the promise between callers. */
export function ensureRuntime(): Promise<any> {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = (async () => {
    try {
      setStage('script');
      await injectScript(`${PYODIDE_CDN}pyodide.js`);
      const loader = (globalThis as any).loadPyodide;
      if (typeof loader !== 'function') {
        throw new Error('the runtime script loaded but did not provide loadPyodide');
      }
      setStage('runtime');
      const py = await loader({ indexURL: PYODIDE_CDN });

      // One namespace for the whole page, so cells build on each other the way
      // notebook cells do, plus a way to clear it.
      py.runPython(`
import builtins as _builtins

_user_ns = {}
def _reset_user_ns():
    _user_ns.clear()
    _user_ns["__builtins__"] = _builtins
_reset_user_ns()
del _builtins
`);

      setStage('ready');
      return py;
    } catch (e) {
      setStage('failed');
      pyodidePromise = null;
      throw e;
    }
  })();

  return pyodidePromise;
}

/** The shared namespace user code runs in. */
function userNamespace(py: any) {
  return py.globals.get('_user_ns');
}

/** Clear everything the reader's code defined, leaving the runtime intact. */
export async function resetNamespace(): Promise<void> {
  if (!pyodidePromise) return;
  const py = await pyodidePromise;
  py.runPython('_reset_user_ns()');
}

/**
 * Turn a Pyodide error into something worth showing.
 *
 * The raw value carries the whole traceback, which is genuinely useful when you
 * are learning to read one, so it is kept. The last line is split out as well,
 * because that is the part that names the mistake.
 */
function describeError(e: unknown): { traceback: string; line: string } {
  const raw = e as any;
  let text = '';
  if (typeof raw === 'string') text = raw;
  else if (raw?.message) text = String(raw.message);
  else text = String(raw);

  // Pyodide appends its own frames; the Python part is what matters.
  const lines = text.split('\n').map((l) => l.trimEnd());
  const lastMeaningful = [...lines].reverse().find((l) => l.trim() !== '');
  return { traceback: lines.join('\n').trim(), line: (lastMeaningful ?? 'the code raised an error').trim() };
}

export interface RunOptions {
  /** Start from an empty namespace rather than the shared one. */
  fresh?: boolean;
}

export async function runPython(code: string, opts: RunOptions = {}): Promise<PyRunResult> {
  const started = performance.now();
  let py: any;
  try {
    py = await ensureRuntime();
  } catch (e) {
    return {
      ok: false,
      stdout: '',
      stderr: '',
      error: (e as Error).message,
      errorLine: (e as Error).message,
      ms: Math.round(performance.now() - started),
    };
  }

  if (opts.fresh) py.runPython('_reset_user_ns()');

  const out: string[] = [];
  const err: string[] = [];
  py.setStdout({ batched: (s: string) => out.push(s) });
  py.setStderr({ batched: (s: string) => err.push(s) });

  try {
    const ns = userNamespace(py);
    const result = py.runPython(code, { globals: ns });
    // runPythonAsync would await top-level await; for lesson snippets the sync
    // call is enough and avoids surprising the reader with async semantics.
    if (result && typeof result.destroy === 'function') result.destroy();
    return {
      ok: true,
      stdout: out.join('\n'),
      stderr: err.join('\n'),
      ms: Math.round(performance.now() - started),
    };
  } catch (e) {
    const { traceback, line } = describeError(e);
    return {
      ok: false,
      stdout: out.join('\n'),
      stderr: err.join('\n'),
      error: traceback,
      errorLine: line,
      ms: Math.round(performance.now() - started),
    };
  }
}

/** Has the runtime already been fetched in this tab? */
export function runtimeReady(): boolean {
  return stage === 'ready';
}
