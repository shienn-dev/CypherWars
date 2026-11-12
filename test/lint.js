/* ============================================================
   CIPHER WARS - Syntax lint (no dependencies)
   Runs `node --check` over every JS source + test file.
   Run: node test/lint.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '..');
const targets = [];
['js', 'test'].forEach(dir => {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return;
  fs.readdirSync(abs)
    .filter(f => f.endsWith('.js'))
    .forEach(f => targets.push(path.join(abs, f)));
});
targets.push(path.join(root, 'test', 'lint.js'));

let failed = 0;
for (const file of targets) {
  const res = cp.spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (res.status !== 0) {
    failed++;
    console.error('SYNTAX FAIL ' + path.relative(root, file) + '\n' + (res.stderr || ''));
  }
}
console.log(failed ? failed + ' file(s) failed lint' : 'lint OK (' + targets.length + ' files)');
process.exit(failed ? 1 : 0);
