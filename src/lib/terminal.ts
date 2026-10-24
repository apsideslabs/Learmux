/**
 * The terminal UI.
 *
 * A vanilla-TS island (no framework) that wires a real input element to the
 * shell engine. Being plain DOM gives us precise control over the three things
 * that usually break a terminal on a phone: the on-screen keyboard, scrolling,
 * and the prompt line.
 */

import type { Challenge } from './types';
import { startShell } from './challenges';
import type { Shell } from './shell';
import { COMMAND_NAMES } from './commands';
import { markSolved, isSolved } from './progress';

export interface TerminalOptions {
  onSolved?: (challenge: Challenge) => void;
  /** Shorter shell, for the home-page showcase. */
  compact?: boolean;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  return node;
}

export function mountTerminal(root: HTMLElement, challenge: Challenge, opts: TerminalOptions = {}) {
  const shell: Shell = startShell(challenge);
  let historyIndex = shell.history.length;

  root.innerHTML = '';
  root.classList.add('lx-term');
  if (opts.compact) root.classList.add('lx-term--compact');

  // ── chrome ────────────────────────────────────────────────────────────────
  const bar = el('div', 'lx-term__bar');
  const dots = el('div', 'lx-term__dots');
  for (let i = 0; i < 3; i++) dots.appendChild(el('span', 'lx-term__dot'));
  const title = el('div', 'lx-term__title');
  title.textContent = `${challenge.user}@${challenge.host}`;
  const actions = el('div', 'lx-term__actions');
  const resetBtn = el('button', 'lx-term__btn');
  resetBtn.type = 'button';
  resetBtn.textContent = 'reset';
  resetBtn.title = 'Restart this challenge from its original state';
  const clearBtn = el('button', 'lx-term__btn');
  clearBtn.type = 'button';
  clearBtn.textContent = 'clear';
  actions.append(resetBtn, clearBtn);
  bar.append(dots, title, actions);

  // ── screen ────────────────────────────────────────────────────────────────
  const screen = el('div', 'lx-term__screen');
  const output = el('div', 'lx-term__output');
  const inputLine = el('div', 'lx-term__inputline');
  const prompt = el('span', 'lx-term__prompt');
  const input = el('input', 'lx-term__input');
  input.type = 'text';
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('autocorrect', 'off');
  input.setAttribute('spellcheck', 'false');
  input.setAttribute('enterkeyhint', 'send');
  input.setAttribute('aria-label', 'Terminal input');
  inputLine.append(prompt, input);
  screen.append(output, inputLine);

  const footer = el('div', 'lx-term__footer');
  const hintBar = el('div', 'lx-term__hintbar');
  for (const s of challenge.starters ?? []) {
    const b = el('button', 'lx-term__starter');
    b.type = 'button';
    b.textContent = s;
    b.title = 'Insert this command';
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      input.value = s;
      input.focus();
    });
    hintBar.appendChild(b);
  }
  footer.appendChild(hintBar);

  root.append(bar, screen, footer);

  // ── rendering ─────────────────────────────────────────────────────────────
  function scrollToBottom() {
    screen.scrollTop = screen.scrollHeight;
  }

  function line(text: string, cls = '') {
    const div = el('div', 'lx-term__line' + (cls ? ' ' + cls : ''));
    div.textContent = text;
    output.appendChild(div);
    return div;
  }

  function echo(command: string) {
    const div = el('div', 'lx-term__line lx-term__line--echo');
    const p = el('span', 'lx-term__prompt');
    p.textContent = shell.prompt();
    const c = el('span', 'lx-term__cmd');
    c.textContent = ' ' + command;
    div.append(p, c);
    output.appendChild(div);
  }

  function refreshPrompt() {
    prompt.textContent = shell.prompt();
  }

  function banner(text: string) {
    const div = el('div', 'lx-term__line lx-term__banner');
    div.textContent = text;
    output.appendChild(div);
  }

  function boot() {
    output.innerHTML = '';
    banner(`Learmux sandbox: ${challenge.title}`);
    if (isSolved(challenge.slug)) {
      line(`✔ You have already captured this flag (${challenge.flag}).`, 'lx-term__muted');
    }
    line(challenge.objective, 'lx-term__muted');
    line("Type `help` to list commands, or `submit FLAG{...}` when you find it.", 'lx-term__muted');
    line('');
    refreshPrompt();
    scrollToBottom();
  }

  // ── execution ─────────────────────────────────────────────────────────────
  function run(raw: string) {
    const command = raw.trim();
    echo(raw);
    if (command) {
      const res = shell.runLine(command);
      if (res.clear) {
        output.innerHTML = '';
      } else {
        if (res.stdout) line(res.stdout.replace(/\n$/, ''));
        if (res.stderr) line(res.stderr, 'lx-term__err');
      }
      if (res.solved) celebrate();
      if (res.exit) {
        line('Connection to ' + challenge.host + ' closed.', 'lx-term__muted');
      }
      refreshPrompt();
    }
    input.value = '';
    scrollToBottom();
  }

  function celebrate() {
    if (isSolved(challenge.slug)) {
      banner(`✔ ${challenge.flag}  already captured`);
      return;
    }
    markSolved(challenge.slug);
    banner(`★ FLAG CAPTURED  +${challenge.points} pts  ${challenge.flag}`);
    opts.onSolved?.(challenge);
  }

  // ── events ────────────────────────────────────────────────────────────────
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run(input.value);
      historyIndex = shell.history.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = shell.history[historyIndex] ?? '';
        requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < shell.history.length - 1) {
        historyIndex++;
        input.value = shell.history[historyIndex] ?? '';
      } else {
        historyIndex = shell.history.length;
        input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      output.innerHTML = '';
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      echo(input.value + '^C');
      input.value = '';
      scrollToBottom();
    }
  });

  function complete() {
    const value = input.value;
    const tokens = value.split(/\s+/);
    const last = tokens[tokens.length - 1] ?? '';
    let candidates: string[] = [];
    if (tokens.length <= 1) {
      candidates = COMMAND_NAMES;
    } else {
      const slash = last.lastIndexOf('/');
      const dir = slash >= 0 ? last.slice(0, slash + 1) || '/' : '.';
      const base = slash >= 0 ? last.slice(slash + 1) : last;
      const names = shell.fs.list(dir === '' ? '/' : dir, shell.cwd) ?? [];
      candidates = names
        .filter((n) => n.startsWith(base))
        .map((n) => dir === '.' ? n : dir + n);
    }
    const matches = candidates.filter((c) => c.startsWith(last)).sort();
    if (matches.length === 1) {
      tokens[tokens.length - 1] = matches[0];
      input.value = tokens.join(' ');
    } else if (matches.length > 1) {
      echo(value);
      line(matches.join('  '), 'lx-term__muted');
      scrollToBottom();
    }
  }

  // Tap anywhere on the screen to focus the input (mobile-friendly).
  screen.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (window.getSelection()?.toString()) return;
    input.focus();
  });

  resetBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const fresh = startShell(challenge);
    // swap the shell in place
    (shell as unknown as { fs: unknown }).fs = fresh.fs;
    shell.cwd = fresh.cwd;
    shell.env = fresh.env;
    shell.history = [];
    historyIndex = 0;
    boot();
  });
  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    output.innerHTML = '';
    refreshPrompt();
    input.focus();
  });

  // Keep the prompt visible above the on-screen keyboard.
  const vv = window.visualViewport;
  if (vv) {
    const adjust = () => {
      root.style.setProperty('--lx-kb', `${Math.max(0, window.innerHeight - vv.height - vv.offsetTop)}px`);
    };
    vv.addEventListener('resize', adjust);
    vv.addEventListener('scroll', adjust);
    adjust();
  }
  input.addEventListener('focus', () => {
    requestAnimationFrame(scrollToBottom);
  });

  boot();

  return {
    shell,
    run,
    focus: () => input.focus(),
  };
}
