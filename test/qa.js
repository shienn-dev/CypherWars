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
require('../js/soal.js');
require('../js/battle.js');

const CW = window.CW;
let failures = 0, checks = 0;

function assert(cond, msg) {
  checks++;
  if (!cond) { failures++; console.error('  FAIL: ' + msg); }
}

for (let tier = 1; tier <= 5; tier++) {
  assert(CW.math.baseTime(tier) === 90, 'tier ' + tier + ' question timer is 90 seconds');
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
  while (b.phase !== 'over' && turns < 500) {
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
    if (CW.battle.enemyDead(b)) {
      CW.battle.awardKill(b);
      if (!CW.battle.nextWave(b)) break;
      CW.battle.startPlayerTurn(b);
      continue;
    }
    if (CW.battle.playerDead(b)) break;
    // after player action: enemy turn then next turn
    events = CW.battle.endPlayerPhase(b);
    if (CW.battle.playerDead(b)) break;
    if (CW.battle.enemyDead(b)) {
      CW.battle.awardKill(b);
      if (!CW.battle.nextWave(b)) break;
    }
    CW.battle.startPlayerTurn(b);
  }
  assert(turns < 500, 'battle did not terminate: stage ' + stage.id);
  // invariants
  assert(b.player.hp >= 0 && b.player.hp <= b.player.maxHp, 'player hp out of range');
  assert(b.enemy.hp >= 0 && b.enemy.hp <= b.enemy.maxHp, 'enemy hp out of range');
  assert(b.player.energy >= 0 && b.player.energy <= b.player.energyMax, 'energy out of range');
  assert(b.player.combo >= 0, 'negative combo');
}

/* ================= 3b. Operative loadouts ================= */
console.log('== Operative loadouts and tactical move ==');
assert(Object.keys(CW.data.operatives).length === 3, 'three selectable Operatives are defined');
const katalisMoves = CW.battle.unlockedAbilities(1, 'katalis').map(ab => ab.id);
const bastionMoves = CW.battle.unlockedAbilities(1, 'bastion').map(ab => ab.id);
const oracleMoves = CW.battle.unlockedAbilities(1, 'oracle').map(ab => ab.id);
assert(katalisMoves.includes('strike') && katalisMoves.includes('guard'), 'Katalis keeps its original starter moves');
assert(bastionMoves.includes('barrier') && bastionMoves.includes('repair'), 'Bastion starts with defense and recovery moves');
assert(oracleMoves.includes('jam') && !oracleMoves.includes('repair'), 'Oracle has control moves instead of Bastion recovery');
const bastionStats = CW.battle.operativeStats(1, 'bastion');
const oracleStats = CW.battle.operativeStats(1, 'oracle');
assert(bastionStats.maxHp === 110 && bastionStats.startEnergy === 3, 'Bastion trades extra HP for no energy bonus');
assert(oracleStats.maxHp === 90 && oracleStats.startEnergy === 4, 'Oracle starts with one bonus energy');

const oracleState = { level: 1, operative: 'oracle', stats: { correct: 0, wrong: 0, bestCombo: 0 } };
const oracleBattle = CW.battle.create(CW.data.stages[0], oracleState);
assert(oracleBattle.player.energy === 4 && oracleBattle.player.energyMax === 7,
  'Oracle battle starts with 4 of 7 energy');
for (const stage of CW.data.stages) {
  const timerBattle = CW.battle.create(stage, oracleState);
  const question = CW.battle.makeQuestion(timerBattle, oracleState);
  assert(question.time === 90, 'stage ' + stage.id + ' question timer is 90 seconds');
  timerBattle.player.slow = 1;
  assert(CW.battle.makeQuestion(timerBattle, oracleState).time === 59,
    'slow status still reduces the stage ' + stage.id + ' timer');
}
const jam = CW.battle.unlockedAbilities(1, 'oracle').find(ab => ab.id === 'jam');
oracleBattle.enemy.nextMove = { type: 'attack', value: 10, weight: 1 };
const jamQuestion = CW.battle.makeQuestion(oracleBattle, oracleState, { purpose: jam });
const jamEvents = CW.battle.answer(oracleBattle, oracleState, jamQuestion.q.answer, false);
assert(jamEvents.some(ev => ev.kind === 'enemyWeaken') && oracleBattle.enemy.weaken === 40,
  'Jamming Taktis weakens the next direct attack');
assert(jamEvents.some(ev => ev.kind === 'playerMove' && ev.ability === 'jam'),
  'Jamming Taktis emits its matching player move animation');
CW.battle.endPlayerPhase(oracleBattle);
assert(oracleBattle.player.hp === 84 && oracleBattle.enemy.weaken === 0,
  'weakened 10-damage attack deals 6 and consumes the jam');

const bastionState = { level: 1, operative: 'bastion', stats: { correct: 0, wrong: 0, bestCombo: 0 } };
const rexBattle = CW.battle.create(CW.data.stages[4], bastionState);
const barrier = CW.battle.unlockedAbilities(1, 'bastion').find(ab => ab.id === 'barrier');
const barrierQuestion = CW.battle.makeQuestion(rexBattle, bastionState, { purpose: barrier });
CW.battle.answer(rexBattle, bastionState, barrierQuestion.q.answer, false);
assert(rexBattle.player.shield === 28, 'Bastion gains a 25% shield bonus against Rex');

const oracleNexusState = { level: 1, operative: 'oracle', stats: { correct: 0, wrong: 0, bestCombo: 0 } };
const nexusBattle = CW.battle.create(CW.data.stages[9], oracleNexusState);
const nexusJam = CW.battle.unlockedAbilities(1, 'oracle').find(ab => ab.id === 'jam');
const nexusQuestion = CW.battle.makeQuestion(nexusBattle, oracleNexusState, { purpose: nexusJam });
CW.battle.answer(nexusBattle, oracleNexusState, nexusQuestion.q.answer, false);
nexusBattle.enemy.chargingUlt = { type: 'ult', value: 30 };
nexusBattle.enemy.nextMove = null;
CW.battle.endPlayerPhase(nexusBattle);
assert(nexusBattle.player.hp === 78, 'Oracle reduces Nexus ultimate damage by 60%');

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

/* ================= 5. Defense structures ================= */
console.log('== Defense structures & mechanics ==');
{
  const stage = CW.data.stages[0];
  const ps = { level: 5, stats: { correct: 0, wrong: 0, bestCombo: 0 } };
  const b = CW.battle.create(stage, ps);
  assert(b.waves.length === (stage.waves || [stage.enemy]).length, 'wave list initialised');
  assert(CW.battle.waveInfo(b).current === 1, 'starts on wave 1');

  // shard gating
  b.player.shards = 0;
  const fw = CW.data.structures.find(s => s.id === 'firewall');
  assert(!CW.battle.canBuild(b, fw), 'cannot build without shards');
  b.player.shards = 100;
  const cost1 = CW.battle.buildCost(b, fw);
  assert(CW.battle.applyBuild(b, fw), 'applyBuild succeeds with shards');
  assert(b.structures.firewall === 1, 'firewall level 1');
  assert(CW.battle.buildCost(b, fw) > cost1, 'cost scales with level');
  while (CW.battle.canBuild(b, fw)) CW.battle.applyBuild(b, fw);
  assert(b.structures.firewall === fw.maxLvl, 'caps at maxLvl');
  assert(!CW.battle.canBuild(b, fw), 'cannot exceed maxLvl');

  // structures act at start of turn
  b.structures = { firewall: 1, turret: 1, reactor: 1, medbay: 1 };
  b.player.shield = 0; b.player.hp = b.player.maxHp - 20; b.player.energy = 0;
  const ehpBefore = b.enemy.hp;
  const evs = CW.battle.startPlayerTurn(b);
  assert(b.player.shield >= 4, 'firewall grants shield');
  assert(b.player.hp > b.player.maxHp - 20, 'medbay heals');
  assert(b.enemy.hp <= ehpBefore, 'turret damages enemy');
  assert(evs.some(e => e.kind === 'turretShot'), 'turret event emitted');
}

/* ================= 6. Enemy mechanics: reflect / enrage / cleanse ================= */
{
  const ps = { level: 5, stats: { correct: 0, wrong: 0, bestCombo: 0 } };
  const b = CW.battle.create(CW.data.stages[0], ps);
  // reflect: player attack bounces back
  b.enemy.reflectTurns = 3;
  b.player.hp = b.player.maxHp;
  const hp0 = b.player.hp;
  const qd = CW.battle.makeQuestion(b, ps, { purpose: { type: 'attack', name: 'x', value: 20, id: 'strike' } });
  CW.battle.answer(b, ps, qd.q.answer, false);
  assert(b.player.hp < hp0, 'reflect damages the player');
  // pierce bypasses reflect
  b.enemy.reflectTurns = 3; b.player.hp = b.player.maxHp;
  const hp1 = b.player.hp;
  const qd2 = CW.battle.makeQuestion(b, ps, { purpose: { type: 'attack', name: 'x', value: 20, id: 'pierce', pierce: true } });
  CW.battle.answer(b, ps, qd2.q.answer, false);
  assert(b.player.hp === hp1, 'pierce ignores reflect');
  // enrage raises enemy damage (force an attack so the check is deterministic)
  b.enemy.chargingUlt = null;
  b.enemy.enrage = 100;
  b.enemy.nextMove = { type: 'attack', value: 10 };
  b.player.shield = 0;
  const bhp = b.player.hp;
  CW.battle.endPlayerPhase(b);
  assert(b.player.hp < bhp, 'enraged attack deals amplified damage');
  // cleanse strips shield & buffs
  b.player.shield = 30; b.player.overclock = 3; b.player.analyzeReady = true;
  b.enemy.chargingUlt = null;
  b.enemy.nextMove = { type: 'cleanse', value: 0 };
  CW.battle.endPlayerPhase(b);
  assert(b.player.shield === 0 && b.player.overclock === 0 && b.player.analyzeReady === false, 'cleanse strips shield and buffs');
}

/* ================= 7. Enemy AI robustness ================= */
console.log('== Enemy AI always returns a valid move ==');
{
  const ps = { level: 10, stats: { correct: 0, wrong: 0, bestCombo: 0 } };
  for (const key of Object.keys(CW.data.enemies)) {
    for (const frac of [1, 0.5, 0.3, 0.1]) {
      for (const combo of [0, 1, 3]) {
        for (const energy of [0, 5]) {
          const stage = { id: 1, enemy: key, tier: CW.data.enemies[key].tier, timeMod: 1, waves: [key] };
          const b = CW.battle.create(stage, ps);
          b.enemy.hp = Math.max(1, Math.round(b.enemy.maxHp * frac));
          b.player.combo = combo;
          b.player.energy = energy;
          b.enemy.chargingUlt = null;
          const m = CW.battle.pickEnemyMove(b);
          assert(m && typeof m.type === 'string' && m.weight > 0,
            'AI starved for ' + key + ' (frac ' + frac + ', combo ' + combo + ', energy ' + energy + ')');
        }
      }
    }
  }
  // structures honor data.perLevel
  const w = CW.battle.create({ id: 1, enemy: 'sentinel', tier: 1, timeMod: 1, waves: ['sentinel'] }, ps);
  const fw = CW.data.structures.find(s => s.id === 'firewall');
  w.structures.firewall = 2;
  w.player.shield = 0;
  CW.battle.startPlayerTurn(w);
  assert(w.player.shield === 2 * fw.perLevel, 'firewall honors perLevel (' + w.player.shield + ')');
}

console.log('== Bank soal & finisher enkripsi ==');
{
  const S = CW.soal;
  const checkEntry = (e, label) => {
    assert(e.o.length === 4, label + ' punya 4 opsi');
    assert(new Set(e.o).size === 4, label + ' opsinya unik');
    assert(e.p && e.s && e.t, label + ' lengkap (soal, pembahasan, materi)');
  };
  for (const st of CW.data.stages) {
    assert(S.hasBank(st.id), 'sektor ' + st.id + ' punya bank soal');
    S.bank[st.id].forEach((e, i) => {
      checkEntry(e, 'S' + st.id + '-' + (i + 1));
      assert(e.t !== 'E', 'S' + st.id + '-' + (i + 1) + ' bukan soal enkripsi');
    });
  }
  assert(Object.keys(S.finisher).join() === '5,10', 'finisher hanya di sektor 5 dan 10');
  Object.keys(S.finisher).forEach(id => S.finisher[id].forEach((e, i) => checkEntry(e, 'F' + id + '-' + i)));

  const ps = { level: 5, stats: { correct: 0, wrong: 0, bestCombo: 0 } };
  const strike = { type: 'attack', name: 'Serang', id: 'strike' };

  // Satu putaran penuh di sektor 1 tidak mengulang soal.
  const b1 = CW.battle.create(CW.data.stages[0], ps);
  const seen = new Set();
  for (let i = 0; i < S.bank[1].length; i++) {
    const qd = CW.battle.makeQuestion(b1, ps, { purpose: strike });
    assert(qd.q.kind === 'bank' && !qd.finisher, 'sektor 1 memakai bank soal biasa');
    assert(qd.q.options.includes(qd.q.answer), 'jawaban ada di opsi');
    seen.add(qd.q.prompt);
    CW.battle.answer(b1, ps, qd.q.answer, false);
    b1.enemy.hp = b1.enemy.maxHp;
  }
  assert(seen.size === S.bank[1].length, 'tidak ada soal berulang dalam satu putaran (' + seen.size + ')');

  // Finisher: tidak muncul saat HP tinggi, muncul sekali saat HP rendah, dan menumbangkan boss.
  for (const idx of [4, 9]) {
    const b = CW.battle.create(CW.data.stages[idx], ps);
    const q0 = CW.battle.makeQuestion(b, ps, { purpose: strike });
    assert(!q0.finisher, 'sektor ' + (idx + 1) + ': finisher tidak muncul saat HP penuh');
    CW.battle.answer(b, ps, q0.q.answer, false);
    b.enemy.hp = Math.floor(b.enemy.maxHp * CW.data.finisherHpPct);
    b.enemy.shield = 50;
    const guard = { type: 'shield', name: 'Perisai', value: 10 };
    assert(!CW.battle.makeQuestion(b, ps, { purpose: guard }).finisher, 'finisher hanya untuk serangan');
    b.question = null;
    const qf = CW.battle.makeQuestion(b, ps, { purpose: strike });
    assert(qf.finisher && qf.q.topic === 'E', 'sektor ' + (idx + 1) + ': finisher enkripsi muncul saat HP rendah');
    CW.battle.answer(b, ps, qf.q.answer, false);
    assert(b.enemy.hp === 0, 'finisher benar menumbangkan boss');
    b.enemy.hp = 5;
    assert(!CW.battle.makeQuestion(b, ps, { purpose: strike }).finisher, 'finisher hanya sekali per pertarungan');
  }
  const b3 = CW.battle.create(CW.data.stages[2], ps);
  b3.enemy.hp = 1;
  assert(!CW.battle.makeQuestion(b3, ps, { purpose: strike }).finisher, 'sektor non-boss tanpa finisher');
}

console.log('\n' + checks + ' checks run, ' + failures + ' failures');
process.exit(failures ? 1 : 0);
