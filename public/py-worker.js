/**
 * The Python worker.
 *
 * Python runs here, off the main thread, and the page talks to it by message.
 * That matters for three reasons, all of which are felt by the reader:
 *
 *   1. Starting the runtime means compiling nine megabytes of WebAssembly, and
 *      that compile blocks whichever thread it happens on. On the main thread
 *      the page freezes for the whole of it: no spinner moves, no text updates,
 *      and it looks broken. Here it freezes only this worker.
 *   2. Progress can be reported while the runtime starts, because the main
 *      thread is still free to draw.
 *   3. A cell can be given up on. `while True: pass` is something a learner will
 *      type sooner or later, and on the main thread there is no way out of it.
 *      The page can terminate this worker and start a fresh one.
 *
 * This is a classic worker rather than a module worker, so `importScripts` can
 * pull the Pyodide loader from a CDN. A module worker would need the CDN import
 * to be a bare specifier the bundler could see, which it cannot.
 *
 * Nothing here is bundled: it is served from public/ exactly as written.
 */

/* eslint-disable no-restricted-globals */

const VERSION = '314.0.7';

const SOURCES = [
  {
    name: 'jsDelivr',
    script: `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/pyodide.mjs`,
    indexURL: `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`,
  },
  {
    name: 'unpkg',
    script: `https://unpkg.com/pyodide@${VERSION}/pyodide.mjs`,
    indexURL: `https://unpkg.com/pyodide@${VERSION}/`,
  },
  {
    name: 'jsDelivr npm',
    script: `https://cdn.jsdelivr.net/npm/pyodide@${VERSION}/pyodide.mjs`,
    indexURL: `https://cdn.jsdelivr.net/npm/pyodide@${VERSION}/`,
  },
];

const SCRIPT_TIMEOUT_MS = 20000;
const RUNTIME_TIMEOUT_MS = 150000;

let pyodide = null;
let ready = null;

const post = (msg) => self.postMessage(msg);

function withTimeout(promise, ms, what) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${what} did not respond within ${Math.round(ms / 1000)} seconds`)),
      ms,
    );
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/**
 * Fetch the loader module and hand back its `loadPyodide`.
 *
 * This is a module worker using a dynamic import rather than a classic worker
 * using `importScripts`, and that is not a style choice. `importScripts` of a
 * cross-origin script is refused outright here, with nothing more useful than
 * "the script failed to load", while the same URL imports cleanly as a module.
 * The two were tested side by side.
 */
function loadLoader(url, timeoutMs) {
  return withTimeout(
    import(/* webpackIgnore: true */ url).then((mod) => {
      if (typeof mod.loadPyodide !== 'function') {
        throw new Error('the loader module did not export loadPyodide');
      }
      return mod.loadPyodide;
    }),
    timeoutMs,
    new URL(url).host,
  );
}

async function start() {
  const failures = [];
  for (const source of SOURCES) {
    try {
      post({ type: 'stage', stage: 'script', source: source.name });
      const loadPyodide = await loadLoader(source.script, SCRIPT_TIMEOUT_MS);

      post({ type: 'stage', stage: 'runtime', source: source.name });
      const py = await withTimeout(
        loadPyodide({ indexURL: source.indexURL }),
        RUNTIME_TIMEOUT_MS,
        `the runtime from ${source.name}`,
      );

      // One namespace for the page, so cells build on each other the way
      // notebook cells do, plus a way to clear it.
      // The import is inside the function on purpose. Referencing a module
      // global here would break the moment that global is cleaned up, and the
      // failure would only show on the second call, which is exactly the kind
      // of bug that survives a happy-path test.
      py.runPython(
        [
          '_user_ns = {}',
          'def _reset_user_ns():',
          '    import builtins',
          '    _user_ns.clear()',
          '    _user_ns["__builtins__"] = builtins',
          '_reset_user_ns()',
          '',
        ].join('\n'),
      );

      pyodide = py;
      post({ type: 'ready', source: source.name });
      return py;
    } catch (e) {
      failures.push(`${source.name}: ${e && e.message ? e.message : String(e)}`);
    }
  }

  const message =
    `Python could not be loaded from any of ${SOURCES.length} sources. ` +
    `That usually means a network filter is blocking them, or the connection dropped. ` +
    `Everything else on this page works without it. (${failures.join('; ')})`;
  post({ type: 'failed', message });
  throw new Error(message);
}

function ensure() {
  if (!ready) ready = start();
  return ready;
}

function describe(e) {
  let text = '';
  if (typeof e === 'string') text = e;
  else if (e && e.message) text = String(e.message);
  else text = String(e);
  const lines = text.split('\n').map((l) => l.replace(/\s+$/, ''));
  const last = [...lines].reverse().find((l) => l.trim() !== '');
  return { traceback: lines.join('\n').trim(), line: (last || 'the code raised an error').trim() };
}

self.onmessage = async (event) => {
  const msg = event.data || {};

  // Starting the runtime is its own message. It cannot wait for the first run:
  // the page waits for the worker to report ready before it sends anything to
  // run, so waiting for a run would deadlock both sides.
  if (msg.type === 'init') {
    ensure().catch(() => {
      /* start() already posted the failure; nothing more to do here */
    });
    return;
  }

  if (msg.type === 'run') {
    const { id, code, fresh } = msg;
    const started = Date.now();
    let py;
    try {
      py = await ensure();
    } catch (e) {
      post({ type: 'result', id, ok: false, stdout: '', stderr: '', error: String(e && e.message), errorLine: String(e && e.message), ms: Date.now() - started });
      return;
    }

    const out = [];
    const err = [];
    py.setStdout({ batched: (s) => out.push(s) });
    py.setStderr({ batched: (s) => err.push(s) });

    try {
      // Inside the try, so a failure here is reported rather than leaving the
      // page waiting for an answer that never comes.
      if (fresh) py.runPython('_reset_user_ns()');
      const result = py.runPython(code, { globals: py.globals.get('_user_ns') });
      if (result && typeof result.destroy === 'function') result.destroy();
      post({ type: 'result', id, ok: true, stdout: out.join('\n'), stderr: err.join('\n'), ms: Date.now() - started });
    } catch (e) {
      const d = describe(e);
      post({
        type: 'result',
        id,
        ok: false,
        stdout: out.join('\n'),
        stderr: err.join('\n'),
        error: d.traceback,
        errorLine: d.line,
        ms: Date.now() - started,
      });
    }
    return;
  }

  if (msg.type === 'reset') {
    if (pyodide) {
      try {
        pyodide.runPython('_reset_user_ns()');
      } catch (e) {
        /* the namespace may not exist yet */
      }
    }
    post({ type: 'reset-done', id: msg.id });
  }
};
