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
 * need. Pyodide itself does not need threads, and the Pyodide documentation
 * says outright that any static host serving the right MIME types will do,
 * naming GitHub Pages as an example. So this runs on GitHub Pages as it is.
 *
 * ## Why Python runs in a worker
 *
 * Starting the runtime means compiling about nine megabytes of WebAssembly.
 * That compile blocks whichever thread it happens on, for tens of seconds on a
 * slow machine. On the main thread the whole page freezes for the duration: no
 * spinner turns, no text changes, and it is indistinguishable from a broken
 * page. That is exactly what a reader reported.
 *
 * So the work happens in `public/py-worker.js`. The page stays responsive, can
 * show progress while the runtime starts, and can give up on a cell that never
 * finishes. `while True: pass` is something a learner will type eventually, and
 * on the main thread there is no way out of it.
 */

export const PYODIDE_VERSION = '314.0.7';

/** How long one cell may run before the worker is restarted. */
const RUN_TIMEOUT_MS = 30_000;

export interface PyRunResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  error?: string;
  errorLine?: string;
  ms: number;
}

export type LoadStage = 'idle' | 'script' | 'runtime' | 'ready' | 'failed';

export interface LoadState {
  stage: LoadStage;
  source: string | null;
  elapsed: number;
  message?: string;
}

let state: LoadState = { stage: 'idle', source: null, elapsed: 0 };
const listeners = new Set<(s: LoadState) => void>();

export function loadState(): LoadState {
  return state;
}

export function onLoadState(fn: (s: LoadState) => void): () => void {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

function publish(patch: Partial<LoadState>) {
  state = { ...state, ...patch };
  for (const fn of listeners) fn(state);
}

let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;
let loadStartedAt = 0;
let ticker: ReturnType<typeof setInterval> | null = null;
let seq = 0;

interface Waiter {
  resolve: (r: PyRunResult) => void;
  timer: ReturnType<typeof setTimeout>;
}
const waiting = new Map<number, Waiter>();

function workerUrl(): string {
  const base = String(import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');
  return `${base}/py-worker.js`;
}

function stopTicker() {
  if (ticker !== null) {
    clearInterval(ticker);
    ticker = null;
  }
}

function startTicker() {
  stopTicker();
  loadStartedAt = Date.now();
  ticker = setInterval(() => {
    if (state.stage === 'script' || state.stage === 'runtime') {
      publish({ elapsed: Math.round((Date.now() - loadStartedAt) / 1000) });
    }
  }, 1000);
}

/** Discard the worker and everything waiting on it. */
function killWorker(reason?: string) {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  readyPromise = null;
  stopTicker();
  for (const [, w] of waiting) {
    clearTimeout(w.timer);
    w.resolve({
      ok: false,
      stdout: '',
      stderr: '',
      error: reason ?? 'the Python runtime was stopped',
      errorLine: reason ?? 'the Python runtime was stopped',
      ms: 0,
    });
  }
  waiting.clear();
}

function spawn(): Worker {
  // Module worker, because the loader is imported as an ES module. See the
  // note in public/py-worker.js about why importScripts will not do.
  const w = new Worker(workerUrl(), { type: 'module' });

  w.onmessage = (event: MessageEvent) => {
    const msg = event.data || {};

    if (msg.type === 'stage') {
      publish({ stage: msg.stage as LoadStage, source: msg.source });
      return;
    }

    if (msg.type === 'ready') {
      publish({ stage: 'ready', source: msg.source, elapsed: Math.round((Date.now() - loadStartedAt) / 1000) });
      stopTicker();
      return;
    }

    if (msg.type === 'failed') {
      publish({ stage: 'failed', message: msg.message });
      stopTicker();
      return;
    }

    if (msg.type === 'result') {
      const w2 = waiting.get(msg.id);
      if (!w2) return;
      waiting.delete(msg.id);
      clearTimeout(w2.timer);
      w2.resolve({
        ok: Boolean(msg.ok),
        stdout: msg.stdout ?? '',
        stderr: msg.stderr ?? '',
        error: msg.error,
        errorLine: msg.errorLine,
        ms: msg.ms ?? 0,
      });
    }
  };

  w.onerror = () => {
    // The worker itself failed to start, which is different from Python
    // raising. Say so plainly rather than leaving a spinner.
    const message =
      'The Python worker could not start. That usually means a network filter is blocking the ' +
      'runtime, or the connection dropped. Everything else on this page works without it.';
    publish({ stage: 'failed', message });
    killWorker(message);
  };

  return w;
}

function ensureReady(): Promise<void> {
  if (readyPromise) return readyPromise;

  readyPromise = new Promise<void>((resolve, reject) => {
    worker = spawn();
    startTicker();
    publish({ stage: 'script', source: null, elapsed: 0 });
    // Tell the worker to begin. It cannot begin on its own, and it cannot wait
    // for the first run either, because this call is what the run is waiting on.
    worker.postMessage({ type: 'init' });

    const off = onLoadState((s) => {
      if (s.stage === 'ready') {
        off();
        resolve();
      } else if (s.stage === 'failed') {
        off();
        reject(new Error(s.message ?? 'Python could not be loaded'));
      }
    });
  });

  // A rejection should not be cached, or Try again would do nothing.
  readyPromise.catch(() => {
    readyPromise = null;
  });

  return readyPromise;
}

/** Try the whole download again, after a failure. */
export function retryRuntime(): void {
  killWorker();
  publish({ stage: 'idle', source: null, elapsed: 0, message: undefined });
}

export interface RunOptions {
  fresh?: boolean;
}

export async function runPython(code: string, opts: RunOptions = {}): Promise<PyRunResult> {
  const started = performance.now();

  try {
    await ensureReady();
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

  if (!worker) {
    return {
      ok: false,
      stdout: '',
      stderr: '',
      error: 'the Python runtime is not running',
      errorLine: 'the Python runtime is not running',
      ms: Math.round(performance.now() - started),
    };
  }

  const id = ++seq;
  const active = worker;

  return new Promise<PyRunResult>((resolve) => {
    const timer = setTimeout(() => {
      // A cell that never returns: restart the worker so the page survives and
      // the reader can carry on.
      //
      // Our own waiter is removed first. killWorker answers whatever is left
      // with a generic line, and that would beat the specific explanation
      // below, because a promise settles only once.
      waiting.delete(id);
      killWorker();
      resolve({
        ok: false,
        stdout: '',
        stderr: '',
        error:
          `The code was still running after ${RUN_TIMEOUT_MS / 1000} seconds, so it was stopped. ` +
          `That usually means a loop that never ends. Check the condition that is meant to finish it.`,
        errorLine: `stopped after ${RUN_TIMEOUT_MS / 1000} seconds, which usually means an endless loop`,
        ms: Math.round(performance.now() - started),
      });
    }, RUN_TIMEOUT_MS);

    waiting.set(id, { resolve, timer });
    active.postMessage({ type: 'run', id, code, fresh: Boolean(opts.fresh) });
  });
}

/** Clear everything the reader's code defined, leaving the runtime intact. */
export async function resetNamespace(): Promise<void> {
  if (!worker || !readyPromise) return;
  try {
    await readyPromise;
  } catch {
    return;
  }
  worker?.postMessage({ type: 'reset', id: ++seq });
}

export function runtimeReady(): boolean {
  return state.stage === 'ready';
}
