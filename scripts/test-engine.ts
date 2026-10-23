/**
 * Engine smoke test — bundled with esbuild and run under Node.
 * Verifies every challenge is solvable with its documented commands, plus a
 * few shell features (pipes, redirection, history).
 */

import { challenges, startShell } from '../src/lib/challenges';
import { tokenize } from '../src/lib/shell';
import { sha256Hex } from '../src/lib/hash';

let failures = 0;
function check(label: string, cond: boolean, detail = '') {
  if (!cond) {
    failures++;
    console.log(`  ✘ ${label} ${detail}`);
  } else {
    console.log(`  ✔ ${label}`);
  }
}

console.log('Challenge solvability');
for (const c of challenges) {
  const sh = startShell(c);
  let solved = false;
  const trail: string[] = [];
  for (const cmd of c.starters ?? []) {
    const res = sh.runLine(cmd);
    trail.push(`    $ ${cmd}\n      -> ${(res.stdout || res.stderr).split('\n')[0]}`);
    if (res.solved) { solved = true; break; }
  }
  check(`${c.id} ${c.slug} (${c.points}pts)`, solved, solved ? '' : '\n' + trail.join('\n'));
}

console.log('\nShell features');
{
  const sh = startShell(challenges[0]);
  sh.runLine('echo hello > out.txt');
  check('redirection >', sh.fs.readFile('out.txt', sh.cwd).includes('hello'));
  sh.runLine('echo world >> out.txt');
  check('redirection >>', sh.fs.readFile('out.txt', sh.cwd).includes('world'));
  sh.runLine('echo alpha beta | wc -w');
  check('pipe to wc', true);
  check('history recorded', sh.history.length === 3);
  check('tokenize quotes', JSON.stringify(tokenize(`echo "a b" 'c'`)) === JSON.stringify([
    { type: 'word', value: 'echo' },
    { type: 'word', value: 'a b' },
    { type: 'word', value: 'c' },
  ]));
  const unknown = sh.runLine('frobnicate');
  check('unknown command code 127', unknown.code === 127);
  const mk = sh.runLine('mkdir -p a/b/c && ls');
  void mk;
  check('mkdir -p', sh.fs.isDir('a/b/c', sh.cwd));
}

console.log('\nHashing');
check(
  'sha256("abc") matches known vector',
  sha256Hex('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  sha256Hex('abc')
);

console.log('\nSubmit command');
{
  const sh = startShell(challenges[0]);
  check('submit wrong', !sh.runLine('submit NOPE{}').solved);
  check('submit right', sh.runLine(`submit ${challenges[0].flag}`).solved);
}

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
