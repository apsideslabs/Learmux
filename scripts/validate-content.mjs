#!/usr/bin/env node
/**
 * Content validator.
 *
 * Catches the mistakes that are expensive to find later: a challenge whose
 * validation path does not exist, a tool whose command repeats its own binary
 * name, a lesson with a track that is not in the curriculum, a link that points
 * at a page that was never built.
 *
 *   node scripts/validate-content.mjs           data checks only (fast)
 *   node scripts/validate-content.mjs --links   also check links against dist/
 *
 * Exits non-zero if anything fails, so CI stops before deploying.
 *
 * No dependencies beyond esbuild, which the repo already uses for tests.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative, extname } from 'node:path';
import posix from 'node:path/posix';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WANT_LINKS = process.argv.includes('--links');

const errors = [];
const warnings = [];
const fail = (where, msg) => errors.push(`${where}\n    ${msg}`);
const soft = (where, msg) => warnings.push(`${where}\n    ${msg}`);

const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');
const isKebab = (s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
const isHttps = (s) => /^https:\/\/\S+$/.test(s);
const isIsoDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

/** The plain flag plus every encoding the engine can reverse. */
function flagForms(flag) {
  const rot13 = (s) =>
    s.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
  return [
    flag,
    Buffer.from(flag, 'utf8').toString('base64'),
    rot13(flag),
    [...flag].reverse().join(''),
    Buffer.from(flag, 'utf8').toString('hex'),
  ];
}

// ── load the typed data through esbuild ─────────────────────────────────────
async function loadData() {
  const outfile = join(ROOT, '.validate-data.mjs');
  await build({
    stdin: {
      contents: [
        `export { tools, toolCategories } from './src/data/tools/index.ts';`,
        `export { tracks, course } from './src/lib/curriculum.ts';`,
        `export { practiceSets } from './src/data/practice/index.ts';`,
        `export { terms as glossaryTerms, categories as glossaryCategories } from './src/data/glossary/index.ts';`,
      ].join('\n'),
      resolveDir: ROOT,
      loader: 'ts',
    },
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile,
    logLevel: 'warning',
  });
  return import(pathToFileURL(outfile).href);
}

// ── challenges ──────────────────────────────────────────────────────────────
const RULE_TYPES = new Set(['read', 'command', 'output', 'cwd']);
const DIFFICULTIES = new Set(['Easy', 'Medium', 'Hard']);
const FLAG_RE = /^TERMUX\{[a-z0-9_]+\}$/;
/** Commands that read authored output from `overrides`. */
const OVERRIDABLE = new Set([
  'ps', 'pkg', 'termux-info', 'termux-setup-storage', 'ifconfig', 'ip',
  'ping', 'netstat', 'nmap', 'curl', 'wget', 'ssh', 'nc',
]);

function checkFs(node, path, seen) {
  if (!node || typeof node !== 'object') return 'node is not an object';
  if (node.type === 'file') {
    if (typeof node.content !== 'string') return 'file has no string content';
    seen.files.push({ path, content: node.content });
  } else if (node.type === 'dir') {
    if (!node.children || typeof node.children !== 'object') return 'dir has no children object';
    seen.dirs.push(path);
    for (const [name, child] of Object.entries(node.children)) {
      const bad = checkFs(child, path === '/' ? '/' + name : path + '/' + name, seen);
      if (bad) return `${name}: ${bad}`;
    }
  } else {
    return `unknown node type ${JSON.stringify(node.type)}`;
  }
  if (node.mode !== undefined && !/^[0-7]{3,4}$/.test(String(node.mode))) {
    return `mode ${JSON.stringify(node.mode)} is not octal`;
  }
  return null;
}

function checkChallenges() {
  const file = join(ROOT, 'src/data/challenges.json');
  if (!existsSync(file)) return fail('challenges.json', 'file is missing');

  let list;
  try {
    list = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    return fail('challenges.json', `not valid JSON: ${e.message}`);
  }
  if (!Array.isArray(list) || !list.length) return fail('challenges.json', 'expected a non-empty array');

  const ids = new Map();
  const slugs = new Map();

  for (const c of list) {
    const at = `challenge ${c.slug ?? c.id ?? '(no slug)'}`;

    for (const field of ['id', 'slug', 'title', 'category', 'difficulty', 'summary', 'objective', 'briefing', 'flag', 'cwd', 'user', 'host']) {
      if (typeof c[field] !== 'string' || !c[field].trim()) fail(at, `missing or empty string: ${field}`);
    }
    if (typeof c.points !== 'number' || !Number.isInteger(c.points) || c.points <= 0) {
      fail(at, `points must be a positive integer, got ${JSON.stringify(c.points)}`);
    }
    if (c.difficulty && !DIFFICULTIES.has(c.difficulty)) {
      fail(at, `difficulty must be Easy, Medium or Hard, got ${JSON.stringify(c.difficulty)}`);
    }
    if (typeof c.slug === 'string' && !isKebab(c.slug)) fail(at, `slug is not kebab-case: ${c.slug}`);
    if (typeof c.flag === 'string' && !FLAG_RE.test(c.flag)) {
      fail(at, `flag should look like TERMUX{snake_case}, got ${JSON.stringify(c.flag)}`);
    }

    if (ids.has(c.id)) fail(at, `duplicate id ${c.id} (also in ${ids.get(c.id)})`);
    else ids.set(c.id, c.slug);
    if (slugs.has(c.slug)) fail(at, `duplicate slug ${c.slug}`);
    else slugs.set(c.slug, true);

    // hints
    if (!Array.isArray(c.hints) || !c.hints.length) fail(at, 'hints must be a non-empty array');
    else c.hints.forEach((h, i) => {
      if (typeof h !== 'string' || !h.trim()) fail(at, `hint ${i + 1} is empty`);
    });

    // solutions are what the test suite runs
    if (!Array.isArray(c.solutions) || !c.solutions.length) {
      fail(at, 'solutions must be a non-empty array (the test suite runs these)');
    }

    // filesystem
    const seen = { files: [], dirs: [] };
    if (!c.fs) fail(at, 'fs is missing');
    else {
      const bad = checkFs(c.fs, '/', seen);
      if (bad) fail(at, `invalid fs: ${bad}`);
    }

    // cwd must exist and be a directory
    if (typeof c.cwd === 'string' && seen.dirs.length && !seen.dirs.includes(c.cwd)) {
      fail(at, `cwd ${c.cwd} is not a directory in fs`);
    }

    // overrides
    if (c.overrides) {
      for (const key of Object.keys(c.overrides)) {
        if (!OVERRIDABLE.has(key)) {
          soft(at, `override "${key}" is never read by a command (typo?)`);
        }
        if (typeof c.overrides[key] !== 'string') fail(at, `override "${key}" must be a string`);
      }
    }

    // validation rules
    if (!Array.isArray(c.validation) || !c.validation.length) {
      fail(at, 'validation must be a non-empty array, or the challenge can never be solved');
    } else {
      c.validation.forEach((r, i) => {
        const rAt = `${at} rule ${i + 1}`;
        if (!r || typeof r !== 'object') return fail(rAt, 'rule is not an object');
        if (!RULE_TYPES.has(r.type)) return fail(rAt, `unknown rule type ${JSON.stringify(r.type)}`);
        if (r.type === 'read' || r.type === 'cwd') {
          if (typeof r.path !== 'string' || !r.path.startsWith('/')) {
            return fail(rAt, `${r.type} needs an absolute path, got ${JSON.stringify(r.path)}`);
          }
          if (r.type === 'read' && seen.files.length && !seen.files.some((f) => f.path === r.path)) {
            fail(rAt, `read path does not exist in fs: ${r.path}`);
          }
          if (r.type === 'cwd' && seen.dirs.length && !seen.dirs.includes(r.path)) {
            fail(rAt, `cwd path is not a directory in fs: ${r.path}`);
          }
        } else {
          if (typeof r.pattern !== 'string' || !r.pattern) {
            return fail(rAt, `${r.type} needs a pattern`);
          }
          try {
            new RegExp(r.pattern);
          } catch (e) {
            fail(rAt, `pattern is not a valid regular expression: ${e.message}`);
          }
        }
      });
    }

    // the flag has to be reachable, either plainly or in one of the
    // encodings the engine can reverse (base64, rot13, reversed, hex)
    if (typeof c.flag === 'string' && c.flag) {
      const haystack = [
        ...seen.files.map((f) => f.content),
        ...Object.values(c.overrides ?? {}).filter((v) => typeof v === 'string'),
      ].join('\n');
      const forms = flagForms(c.flag);
      if (!forms.some((form) => haystack.includes(form))) {
        fail(at, `flag ${c.flag} cannot be found: it is absent from fs and overrides, in plain form and as base64, rot13, reversed or hex`);
      }
    }
  }

  const points = list.reduce((s, c) => s + (c.points || 0), 0);
  return { count: list.length, points };
}

// ── tools ───────────────────────────────────────────────────────────────────
function allowedGlyphs() {
  const src = readFileSync(join(ROOT, 'scripts/generate-logos.mjs'), 'utf8');
  const block = src.match(/const GLYPHS = \{([\s\S]*?)\n\};/);
  if (!block) return null;
  const names = new Set();
  for (const m of block[1].matchAll(/^\s{2}'?([a-z][a-z-]*)'?:/gm)) names.add(m[1]);
  return names;
}

function checkTools(tools, toolCategories) {
  if (!Array.isArray(tools) || !tools.length) return fail('tools', 'no tools found');

  const catIds = new Set(toolCategories.map((c) => c.id));
  const glyphs = allowedGlyphs();
  const slugs = new Set();

  for (const t of tools) {
    const at = `tool ${t.slug ?? '(no slug)'}`;

    for (const field of ['slug', 'name', 'category', 'tagline', 'about', 'developer', 'url', 'bin', 'install', 'glyph']) {
      if (typeof t[field] !== 'string' || !t[field].trim()) fail(at, `missing or empty string: ${field}`);
    }
    if (typeof t.slug === 'string') {
      if (!isKebab(t.slug)) fail(at, `slug is not kebab-case: ${t.slug}`);
      if (slugs.has(t.slug)) fail(at, `duplicate slug ${t.slug}`);
      slugs.add(t.slug);
    }
    if (t.category && !catIds.has(t.category)) {
      fail(at, `unknown category ${JSON.stringify(t.category)}`);
    }
    if (t.url && !isHttps(t.url)) {
      if (/^http:\/\/\S+$/.test(t.url)) soft(at, `url is http, not https: ${t.url}`);
      else fail(at, `url must be an http(s) address, got ${JSON.stringify(t.url)}`);
    }
    if (typeof t.tagline === 'string' && t.tagline.length > 100) {
      soft(at, `tagline is ${t.tagline.length} characters, keep it under 100`);
    }
    if (glyphs && t.glyph && !glyphs.has(t.glyph)) {
      fail(at, `glyph "${t.glyph}" is not defined in scripts/generate-logos.mjs`);
    }
    if (t.slug && !existsSync(join(ROOT, 'public/logos', `${t.slug}.svg`))) {
      fail(at, `no logo at public/logos/${t.slug}.svg (run: node scripts/generate-logos.mjs)`);
    }

    // commands
    if (!Array.isArray(t.commands) || t.commands.length < 5 || t.commands.length > 6) {
      fail(at, `commands should number 5 or 6, got ${Array.isArray(t.commands) ? t.commands.length : 'none'}`);
    } else {
      t.commands.forEach((c, i) => {
        // args may be empty: `htop`, `tree` and `fzf` are useful with none
        if (!c || typeof c.args !== 'string') fail(at, `command ${i + 1} needs an args string (use '' for a bare command)`);
        if (!c || typeof c.what !== 'string' || !c.what.trim()) fail(at, `command ${i + 1} has no description`);
        // args carry only what follows the binary name
        if (t.bin && typeof c?.args === 'string' && c.args.trim()) {
          const first = c.args.trim().split(/\s+/)[0];
          if (first === t.bin) {
            fail(at, `command ${i + 1} repeats the binary name in args: ${JSON.stringify(c.args)}`);
          }
        }
      });
    }

    // worked example
    if (t.example) {
      if (typeof t.example.args !== 'string' || !t.example.args.trim()) fail(at, 'example has no args');
      if (typeof t.example.out !== 'string' || !t.example.out.trim()) fail(at, 'example has no output');
    }
  }

  return { count: tools.length };
}

// ── lessons ─────────────────────────────────────────────────────────────────
function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i === -1) return { __error: `cannot parse frontmatter line: ${line}` };
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      out[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    } else {
      out[key] = val.replace(/^['"]|['"]$/g, '');
    }
  }
  return out;
}

function checkLessons(tracks) {
  const dir = join(ROOT, 'src/content/tutorials');
  if (!existsSync(dir)) return fail('lessons', 'src/content/tutorials is missing');

  const files = readdirSync(dir).filter((f) => /\.mdx?$/.test(f));
  if (!files.length) return fail('lessons', 'no lesson files found');

  const trackIds = new Set(tracks.map((t) => t.id));
  const levels = new Set(['Beginner', 'Intermediate', 'Advanced']);
  const positions = new Map();
  const required = ['title', 'description', 'excerpt', 'category', 'track', 'date', 'order', 'level'];

  for (const file of files) {
    const at = `lesson ${file}`;
    const src = readFileSync(join(dir, file), 'utf8');
    const fm = parseFrontmatter(src);

    if (!fm) {
      fail(at, 'no frontmatter block');
      continue;
    }
    if (fm.__error) {
      fail(at, fm.__error);
      continue;
    }
    for (const key of required) {
      if (fm[key] === undefined || fm[key] === '') fail(at, `frontmatter is missing: ${key}`);
    }
    if (fm.track && !trackIds.has(fm.track)) {
      fail(at, `track "${fm.track}" is not in src/lib/curriculum.ts`);
    }
    if (fm.level && !levels.has(fm.level)) {
      fail(at, `level must be Beginner, Intermediate or Advanced, got ${fm.level}`);
    }
    if (fm.date && !isIsoDate(fm.date)) {
      fail(at, `date should be YYYY-MM-DD, got ${JSON.stringify(fm.date)}`);
    }
    if (fm.order !== undefined && !/^\d+$/.test(String(fm.order))) {
      fail(at, `order should be a number, got ${JSON.stringify(fm.order)}`);
    }
    if (fm.track && fm.order !== undefined) {
      const key = `${fm.track}#${fm.order}`;
      if (positions.has(key)) fail(at, `track "${fm.track}" already has a lesson at order ${fm.order} (${positions.get(key)})`);
      else positions.set(key, file);
    }

    // house style: no em or en dashes
    const dashes = (src.match(/[\u2014\u2013]/g) || []).length;
    if (dashes) fail(at, `${dashes} em or en dash(es); use a full stop, comma, or and/but`);

    // a Callout must be imported
    if (/<Callout\b/.test(src) && !/components\/Callout\.astro/.test(src)) {
      fail(at, 'uses <Callout> but does not import it');
    }
    // fenced code blocks must be balanced
    const fences = (src.match(/^```/gm) || []).length;
    if (fences % 2 !== 0) fail(at, `unbalanced code fences (${fences} found)`);
  }

  return { count: files.length };
}

// ── glossary ────────────────────────────────────────────────────────────────
/**
 * A glossary is only useful if every entry is right and every link works. A
 * dead "read the lesson" link is worse than no link, because the page looks
 * authoritative while sending the reader nowhere.
 */
function checkGlossary(terms, cats, lessonSlugs) {
  if (!Array.isArray(terms) || !terms.length) return fail('glossary', 'no terms found');

  const validCats = new Set((cats ?? []).map((c) => c.id));
  if (validCats.size === 0) return fail('glossary', 'no categories defined');

  const seen = new Map();
  let withLesson = 0;

  for (const t of terms) {
    const at = `glossary term "${t.term ?? '(no term)'}"`;

    if (!t.term || !t.term.trim()) fail(at, 'has no headword');
    if (!t.short || t.short.trim().length < 12) fail(at, 'has no usable definition');
    if (!validCats.has(t.category)) fail(at, `category "${t.category}" is not one of the six`);

    // A definition that ends mid-thought is a definition somebody will misread.
    if (t.short && !/[.!?]$/.test(t.short.trim())) fail(at, 'definition does not end in a full stop');
    if (t.detail && !/[.!?]$/.test(t.detail.trim())) fail(at, 'detail does not end in a full stop');

    const key = t.term.trim().toLowerCase();
    if (seen.has(key)) fail(at, `duplicate headword, also at "${seen.get(key)}"`);
    else seen.set(key, t.term);

    // Aliases must not collide with another headword, or search gets confusing.
    for (const a of t.also ?? []) {
      if (!a || !a.trim()) fail(at, 'has an empty alias');
    }

    if (t.see) {
      withLesson++;
      if (!lessonSlugs.has(t.see)) fail(at, `links to lesson "${t.see}", which does not exist`);
    }
  }

  const counts = {};
  for (const t of terms) counts[t.category] = (counts[t.category] ?? 0) + 1;
  for (const id of validCats) {
    if (!counts[id]) fail('glossary', `category "${id}" has no terms`);
  }

  return { count: terms.length, withLesson, categories: validCats.size };
}

// ── practice sets ───────────────────────────────────────────────────────────
// Each set is keyed by lesson slug, and the lesson page looks its set up by
// that key. A set whose slug matches no lesson would never be linked from
// anywhere, which is easy to miss and easy to check for.
function checkPractice(sets) {
  if (!Array.isArray(sets) || !sets.length) return fail('practice', 'no practice sets found');

  const lessonDir = join(ROOT, 'src/content/tutorials');
  const lessons = new Set(
    existsSync(lessonDir)
      ? readdirSync(lessonDir).filter((f) => /\.mdx?$/.test(f)).map((f) => f.replace(/\.mdx?$/, ''))
      : [],
  );

  const seen = new Set();
  let questions = 0;
  let tasks = 0;

  for (const s of sets) {
    const at = `practice set ${s.slug ?? '(no slug)'}`;
    if (!s.slug) fail(at, 'no slug');
    if (seen.has(s.slug)) fail(at, 'duplicate slug');
    seen.add(s.slug);

    if (!lessons.has(s.slug)) {
      fail(at, `no lesson named ${s.slug}.mdx, so nothing will ever link to this set`);
    }
    if (typeof s.title !== 'string' || !s.title.trim()) fail(at, 'no title');
    if (typeof s.summary !== 'string' || !s.summary.trim()) fail(at, 'no summary');
    if (typeof s.intro !== 'string' || !s.intro.trim()) fail(at, 'no intro');

    if (!Array.isArray(s.questions) || s.questions.length < 3) {
      fail(at, `needs at least three questions, has ${s.questions?.length ?? 0}`);
    }
    if (!Array.isArray(s.tasks) || s.tasks.length < 1) {
      fail(at, 'needs at least one output task');
    }

    questions += s.questions?.length ?? 0;
    tasks += s.tasks?.length ?? 0;
  }

  return { count: sets.length, questions, tasks };
}

// ── the Termux CTF catalogue ────────────────────────────────────────────────
// Generated by the tool with `ctf export --challenges`, and committed here so
// the site and the tool cannot drift apart. If it is stale or malformed, the
// site would quietly show the wrong thing, so it is checked like any other
// content.
function checkTermuxCatalogue() {
  const file = join(ROOT, 'src/data/termux-challenges.json');
  const at = 'termux-challenges.json';
  if (!existsSync(file)) {
    return fail(at, 'missing. Regenerate it with: ctf export --challenges > src/data/termux-challenges.json');
  }

  let data;
  try {
    data = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    return fail(at, `not valid JSON: ${e.message}`);
  }

  if (data.format !== 'learmux-ctf/challenges/1') {
    fail(at, `unexpected format ${JSON.stringify(data.format)}`);
  }
  if (!Array.isArray(data.challenges) || !data.challenges.length) {
    return fail(at, 'no challenges in the catalogue');
  }

  const slugs = new Set();
  const ids = new Set();
  const flagPattern = /LEARMUX\{[0-9a-f]{16}\}/;

  for (const c of data.challenges) {
    const cAt = `${at} ${c.slug ?? '(no slug)'}`;
    for (const field of ['id', 'slug', 'title', 'category', 'difficulty', 'objective', 'briefing']) {
      if (typeof c[field] !== 'string' || !c[field].trim()) fail(cAt, `missing or empty: ${field}`);
    }
    if (typeof c.points !== 'number' || c.points <= 0) fail(cAt, `points must be a positive number`);
    if (!['Easy', 'Medium', 'Hard'].includes(c.difficulty)) fail(cAt, `unknown difficulty ${c.difficulty}`);
    if (!Array.isArray(c.hints) || !c.hints.length) fail(cAt, 'no hints');
    if (typeof c.slug === 'string' && !isKebab(c.slug)) fail(cAt, `slug is not kebab-case`);

    if (slugs.has(c.slug)) fail(cAt, 'duplicate slug');
    slugs.add(c.slug);
    if (ids.has(c.id)) fail(cAt, `duplicate id ${c.id}`);
    ids.add(c.id);

    // The catalogue must never carry a real flag. The shape of one is enough
    // to check for, since a real flag is sixteen hex characters.
    if (flagPattern.test(c.briefing) || c.hints.some((h) => flagPattern.test(h))) {
      fail(cAt, 'a flag-shaped string appears in the briefing or hints');
    }
  }

  return {
    count: data.challenges.length,
    points: data.challenges.reduce((s, c) => s + c.points, 0),
    version: data.version,
  };
}

// ── links ───────────────────────────────────────────────────────────────────
function walkHtml(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walkHtml(p, out);
    else if (extname(p) === '.html') out.push(p);
  }
  return out;
}

function checkLinks(base) {
  const dist = join(ROOT, 'dist');
  if (!existsSync(dist)) {
    soft('links', 'dist/ not found, skipped (build first, or run with --links after a build)');
    return { count: 0, skipped: true };
  }

  const pages = walkHtml(dist);

  /**
   * Map a URL found in a built page to a path inside dist, or null when it is
   * not ours to check. Handles the site base prefix, site-root-relative URLs,
   * and page-relative ones.
   */
  const toDistPath = (url, pageRel) => {
    let p = url.split('#')[0].split('?')[0];
    if (!p) return null;
    if (p.startsWith('/')) {
      if (base && p.startsWith(base)) p = p.slice(base.length);
      else p = p.slice(1);
    } else {
      // relative to the directory the page lives in
      const dir = pageRel.includes('/') ? pageRel.slice(0, pageRel.lastIndexOf('/')) : '';
      p = posix.normalize(posix.join(dir, p));
    }
    return p.replace(/^\.\//, '');
  };

  const exists = (p) => {
    const target = join(dist, p);
    if (existsSync(target) && statSync(target).isFile()) return true;
    if (existsSync(join(target, 'index.html'))) return true;
    if (existsSync(target + '.html')) return true;
    return false;
  };

  const checked = new Set();
  let broken = 0;

  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    const where = rel(page);
    for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      const url = m[1];
      if (!url || url.startsWith('#') || url.startsWith('//')) continue;
      if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(url)) continue;
      const target = toDistPath(url, where);
      if (target === null) continue;
      const key = `${where}->${target}`;
      if (checked.has(key)) continue;
      checked.add(key);
      if (!exists(target)) {
        broken++;
        fail(`link in ${where}`, `points at ${url}, which was not built (looked for dist/${target})`);
      }
    }
  }

  return { count: pages.length, broken };
}

// ── built pages ─────────────────────────────────────────────────────────────
// A command box on a web page is ambiguous: it looks like something the page
// might run for you. Every task has to say where the command actually goes, so
// that a learner never wonders whether they are meant to type it here.
function checkBuiltPractice() {
  const dir = join(ROOT, 'dist/practice');
  if (!existsSync(dir)) return null;

  let pages = 0;
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry, 'index.html');
    if (!existsSync(file)) continue;

    const html = readFileSync(file, 'utf8');
    if (!html.includes('data-task')) continue; // a set with no output task
    pages++;

    if (!html.includes('Run this in Termux')) {
      fail(
        `practice/${entry}`,
        'has an output task but never says the command runs in Termux on your own device',
      );
    }
  }
  return { pages };
}

// ── run ─────────────────────────────────────────────────────────────────────
const t0 = Date.now();

let data;
try {
  data = await loadData();
} catch (e) {
  fail('build', `could not load the typed data: ${e.message}`);
}

/**
 * Every lesson slug the course actually has, for the glossary to link against.
 *
 * The slug is the filename: src/content/tutorials/getting-started.mdx is
 * served at /learn/getting-started/. Reading the directory is the only honest
 * source, because the track objects do not list their lessons.
 */
function lessonSlugSet() {
  const dir = join(ROOT, 'src/content/tutorials');
  if (!existsSync(dir)) return new Set();
  return new Set(
    readdirSync(dir)
      .filter((f) => /\.mdx?$/.test(f))
      .map((f) => f.replace(/\.mdx?$/, '')),
  );
}

if (data) {
  const c = checkChallenges();
  const t = checkTools(data.tools, data.toolCategories);
  const l = checkLessons(data.tracks);
  const x = checkTermuxCatalogue();
  const pr = checkPractice(data.practiceSets);
  const gl = checkGlossary(data.glossaryTerms, data.glossaryCategories, lessonSlugSet());
  const base = '/Learmux/';
  const links = WANT_LINKS ? checkLinks(base) : null;
  const built = checkBuiltPractice();

  if (!errors.length) {
    const bits = [];
    if (c) bits.push(`${c.count} challenges (${c.points} pts)`);
    if (t) bits.push(`${t.count} tools`);
    if (l) bits.push(`${l.count} lessons`);
    if (x) bits.push(`${x.count} Termux CTF challenges (${x.points} pts, tool ${x.version})`);
    if (pr) bits.push(`${pr.count} practice sets (${pr.questions} questions, ${pr.tasks} tasks)`);
    if (gl) bits.push(`${gl.count} glossary terms (${gl.withLesson} linked to lessons)`);
    if (links && !links.skipped) bits.push(`${links.count} pages linked`);
    if (built) bits.push(`${built.pages} task pages say where to run the command`);
    console.log(`content ok: ${bits.join(', ')}`);
  }
}

for (const w of warnings) console.log(`warning\n  ${w}\n`);
for (const e of errors) console.log(`error\n  ${e}\n`);

const ms = Date.now() - t0;
if (errors.length) {
  console.error(`${errors.length} error(s), ${warnings.length} warning(s) in ${ms}ms`);
  process.exit(1);
}
console.log(`no errors, ${warnings.length} warning(s) in ${ms}ms`);
