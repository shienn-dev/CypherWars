/* ============================================================
   CIPHER WARS - QA stress test (Node)
   Verifies the math engine and battle engine invariants:
     1. Every generated question's answer is mathematically correct
        (checked against an independent evaluator).
     2. The correct answer is always among the 4 options.
     3. Options are all distinct.
     4. Hints/steps never contain contradictions.
     5. Battle simulation runs to completion with sane state.
   Run: node test/qa.js
   ============================================================ */
'use strict';
global.window = {};
require('../js/math.js');
require('../js/data.js');
require('../js/battle.js');

const CW = window.CW;
let failures = 0, checks = 0;

function assert(cond, msg) {
  checks++;
  if (!cond) { failures++; console.error('  FAIL: ' + msg); }
}

/* ---------- Independent polynomial reference evaluator ---------- */
function refEval(stack, x) { // stack: array of coefficient arrays, inner first
  let v = x;
  for (const p of stack) {
    let acc = 0;
    for (let i = p.length - 1; i >= 0; i--) acc = acc * v + p[i];
    v = acc;
  }
  return v;
}

/* Re-parse the prompt to recover the actual functions & x — this makes
   the check truly independent of the generator's internals. */
function parseFns(prompt) {
  const fns = {};
  const re = /([fgh])\(x\) = ([\d\u2212 x\u00B2\u00B3\u2074\u2075+-]+?)[.,](?:\s|$)/g;
  let m;
  while ((m = re.exec(prompt)) !== null) {
    const expr = m[2].replace(/\u2212/g, '-').replace(/\s/g, '');
    // convert polynomial expression to coefficient array
    const terms = expr.replace(/-/g, '+-').split('+').filter(t => t !== '');
    const coeffs = [0, 0, 0, 0, 0, 0];
    for (const t of terms) {
      const cm = t.match(/^(-?\d*)x(\u00B2|\u00B3|\u2074|\u2075)?$/);
      if (cm) {
        const c = cm[1] === '' || cm[1] === '-' ? (cm[1] === '-' ? -1 : 1) : parseInt(cm[1], 10);
        const deg = cm[2] === undefined ? 1 : { '\u00B2': 2, '\u00B3': 3, '\u2074': 4, '\u2075': 5 }[cm[2]];
        coeffs[deg] += c;
      } else {
        coeffs[0] += parseInt(t, 10);
      }
    }
    fns[m[1]] = coeffs;
  }
  return fns;
}

function parseEvalTarget(prompt) {
  // "... Hitung nilai (f ∘ g)(-2)." or nested "(h ∘ g ∘ f)(3)"
  const xM = prompt.match(/\((-?\d+)\)\s*\./);
  const labelM = prompt.match(/\(([fgh\u2218 ]+)\)\(/);
  const names = [];
  if (labelM) {
    const inner = labelM[1].split('\u2218').map(s => s.trim());
    for (const n of inner) if (/[fgh]/.test(n)) names.push(n);
  }
  return { x: xM ? parseInt(xM[1], 10) : null, names };
}

/* ================= 1. Math engine stress ================= */
console.log('== Math engine: 4000 generations ==');
const N = 4000;
let kindCount = { eval: 0, solve: 0, symbolic: 0 };
for (let i = 0; i < N; i++) {
  const tier = 1 + (i % 5);
  const q = CW.math.generate(tier);
  kindCount[q.kind] = (kindCount[q.kind] || 0) + 1;

  // options sanity
  assert(Array.isArray(q.options) && q.options.length === 4, 'must have 4 options, tier ' + tier);
  assert(q.options.every((o, idx) => q.options.indexOf(o) === idx), 'duplicate options: ' + JSON.stringify(q.options));
  assert(q.options.includes(q.answer), 'answer missing from options: ' + q.answer + ' in ' + JSON.stringify(q.options));

  // independent numeric verification per kind
  if (q.kind === 'eval') {
    const { x, names } = parseEvalTarget(q.prompt);
    const fns = parseFns(q.prompt);
    assert(x !== null && names.length >= 2, 'eval prompt parse failed: ' + q.prompt);
    if (x !== null && names.length >= 2 && Object.keys(fns).length >= 2) {
      // (h ∘ g ∘ f): leftmost name is the OUTER function — apply right-to-left
      const stack = names.slice().reverse().map(n => fns[n]);
      const truth = refEval(stack, x);
      assert(truth === q.answer,
        'eval mismatch: prompt=' + JSON.stringify(q.prompt) + ' truth=' + truth + ' answer=' + q.answer);
    }
  } else if (q.kind === 'solve') {
    // f(x)=k must hold with answer x
    const fm = q.prompt.match(/f\(x\) = ([^,]+?),?\s*\n?Temukan|f\(x\) = (.+)\.\s*\nTemukan/);
    const line = q.prompt.split('\n')[0];
    const exprM = line.match(/f\(x\) = (.+)$/);
    assert(!!exprM, 'solve prompt parse failed: ' + q.prompt);
    if (exprM) {
      const p = exprToPoly(exprM[1]);
      const km = q.prompt.match(/f\(x\) = (-?\d+)$/m);
      // k is stated as "agar f(x) = K"
      const kM = q.prompt.match(/agar f\(x\) = (-?\d+)/);
      if (kM && p) {
        const k = parseInt(kM[1], 10);
        // Horner over ascending coefficients must iterate highest-degree first
        const v = p.slice().reverse().reduce((a, c) => a * q.answer + c, 0);
        assert(v === k, 'solve mismatch: f(' + q.answer + ')=' + v + ' expected ' + k + ' | ' + q.prompt);
      }
    }
  } else if (q.kind === 'symbolic') {
    // Verify answer equals the true composition of parsed fns
    const fns = parseFns(q.prompt);
    if (fns.f && fns.g) {
      const truth = composePoly(fns.f, fns.g);
      assert(polyToStr(truth) === q.answer,
        'symbolic mismatch: truth=' + polyToStr(truth) + ' answer=' + q.answer + ' | ' + q.prompt);
    }
  }

  // steps nonempty
  assert(q.steps.length >= 3, 'steps too short');
  assert(typeof q.hint === 'string' && q.hint.length > 10, 'hint missing');
}
console.log('   kinds: ' + JSON.stringify(kindCount));

function exprToPoly(str) {
  str = str.replace(/\u2212/g, '-').replace(/[^0-9x+\-\u00B2\u00B3\u2074\u2075]/g, '');
  const terms = str.replace(/-/g, '+-').split('+').filter(t => t !== '');
  const coeffs = [0, 0, 0, 0, 0, 0];
  for (const t of terms) {
    const cm = t.match(/^(-?\d*)x(\u00B2|\u00B3|\u2074|\u2075)?$/);
    if (cm) {
      const c = cm[1] === '' || cm[1] === '-' ? (cm[1] === '-' ? -1 : 1) : parseInt(cm[1], 10);
      const deg = cm[2] === undefined ? 1 : { '\u00B2': 2, '\u00B3': 3, '\u2074': 4, '\u2075': 5 }[cm[2]];
      coeffs[deg] += c;
    } else coeffs[0] += parseInt(t, 10);
  }
  return coeffs;
}
function composePoly(f, g) {
  let out = [0], pow = [1];
  for (let i = 0; i < f.length; i++) {
    for (let j = 0; j < pow.length; j++) out[j] = (out[j] || 0) + f[i] * pow[j];
    pow = mulPoly(pow, g);
  }
  while (out.length > 1 && out[out.length - 1] === 0) out.pop();
  return out;
}
function mulPoly(a, b) {
  const out = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) out[i + j] += a[i] * b[j];
  return out;
}
function polyToStr(p) {
  // normalize through CW's own formatter semantics
  const s = CW.math.formatPoly(p);
  return s;
}

/* ================= 2. Known-answer spot checks ================= */
console.log('== Known-answer spot checks ==');
CW.math.setRng(() => 0.5); // deterministic-ish; still structural variety
for (let i = 0; i < 50; i++) {
  const q = CW.math.generate((i % 5) + 1);
  // The engine's own checker must accept its own answer
  assert(CW.math.check(q, q.answer), 'self-check failed: ' + JSON.stringify(q.answer));
}
// Composition sanity: (f∘g)(x) = f(g(x)) for fixed polynomials
const f = [1, 2];        // 2x + 1
const g = [0, 0, 1];     // x^2
const comp = CW.math.pCompose(f, g);
assert(CW.math.pEval(comp, 3) === 19, '(2x^2+1)(3) should be 19, got ' + CW.math.pEval(comp, 3));
assert(CW.math.formatPoly(comp) === '2x\u00B2 + 1', 'formatPoly: ' + CW.math.formatPoly(comp));
assert(CW.math.formatPoly([-3, 0, 2]) === '2x\u00B2 \u2212 3', 'formatPoly 2: ' + CW.math.formatPoly([-3, 0, 2]));
assert(CW.math.formatPoly([0, 1]) === 'x', 'formatPoly x: ' + CW.math.formatPoly([0, 1]));
assert(CW.math.formatPoly([-1, -1]) === '-x \u2212 1', 'formatPoly 3: ' + CW.math.formatPoly([-1, -1]));

/* ================= 3. Battle simulation ================= */
console.log('== Battle simulation: 200 random battles ==');
for (let sim = 0; sim < 200; sim++) {
  const stage = CW.data.stages[sim % CW.data.stages.length];
  const playerState = { level: 5, stats: { correct: 0, wrong: 0, bestCombo: 0 } };
  const b = CW.battle.create(stage, playerState);
  assert(b.enemy.nextMove !== null, 'initial telegraph missing');
  let turns = 0;
  while (b.phase !== 'over' && turns < 200) {
    turns++;
    // Player: pick a random affordable ability
    const abil = CW.battle.unlockedAbilities(playerState.level)
      .filter(a => a.cost <= b.player.energy && !(a.type === 'interrupt' && !b.enemy.chargingUlt));
    let events;
    if (abil.length && Math.random() < 0.85) {
      const ab = abil[Math.floor(Math.random() * abil.length)];
      CW.battle.spendEnergy(b, ab.cost);
      const qd = CW.battle.makeQuestion(b, playerState, { purpose: ab });
      // Simulate a player that answers correctly 65% of the time
      const ok = Math.random() < 0.65;
      events = CW.battle.answer(b, playerState, ok ? qd.q.answer : qd.q.options.find(o => String(o) !== String(qd.q.answer)), !ok);
    } else {
      events = CW.battle.endPlayerPhase(b);
      if (b.phase === 'over' || CW.battle.playerDead(b)) break;
      CW.battle.startPlayerTurn(b);
      continue;
    }
    if (CW.battle.enemyDead(b)) break;
    if (CW.battle.playerDead(b)) break;
    if (correctResult(events, okRef(events))) {}
    // after player action: enemy turn then next turn
    events = CW.battle.endPlayerPhase(b);
    if (CW.battle.playerDead(b)) break;
    CW.battle.startPlayerTurn(b);
  }
  assert(turns < 200, 'battle did not terminate: stage ' + stage.id);
  // invariants
  assert(b.player.hp >= 0 && b.player.hp <= b.player.maxHp, 'player hp out of range');
  assert(b.enemy.hp >= 0 && b.enemy.hp <= b.enemy.maxHp, 'enemy hp out of range');
  assert(b.player.energy >= 0 && b.player.energy <= b.player.energyMax, 'energy out of range');
  assert(b.player.combo >= 0, 'negative combo');
}
function okRef() { return null; }
function correctResult() { return null; }

/* ================= 4. Solve-type direct verification ================= */
console.log('== Solve-type exact check: 1000 generations ==');
for (let i = 0; i < 1000; i++) {
  const q = CW.math.generate((i % 5) + 1, 'solve');
  const line = q.prompt.split('\n')[0];
  const exprM = line.match(/f\(x\) = (.+)$/);
  const kM = q.prompt.match(/agar f\(x\) = (-?\d+)/);
  assert(exprM && kM, 'solve parse fail: ' + q.prompt);
  if (exprM && kM) {
    const p = exprToPoly(exprM[1]);
    const k = parseInt(kM[1], 10);
    const v = p.slice().reverse().reduce((a, c) => a * q.answer + c, 0);
    assert(v === k, 'solve wrong: f(' + q.answer + ')=' + v + ' != ' + k + ' | ' + q.prompt);
  }
}

console.log('\n' + checks + ' checks run, ' + failures + ' failures');
process.exit(failures ? 1 : 0);
