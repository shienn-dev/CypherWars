/* ============================================================
   CIPHER WARS - E2E wiring test (jsdom)
   Boots the real index.html (scripts fetched from the local
   server) and drives it with real DOM clicks — verifies the
   full game flow that test/qa.js cannot see:
     Run A: fresh save — title → howto → map → battle →
            wrong answer (hint/timer) → victory → next stage → flee
     Run B: defeat via "Menyerah" (give up) → retry
     Run C: level-up card + ability unlock on next battle
     Run D: map boss badges (KALKULUS REX regression), codex, reset
   The correct answer is read from the live battle state
   (window.CW.main.battle) — click paths stay 100% DOM.
   Requires the local server:  python -m http.server 8123
   Run:  node test/e2e.js   (or: npm run e2e)
   ============================================================ */
'use strict';
const { JSDOM, VirtualConsole } = require('jsdom');

const BASE = process.env.E2E_URL || 'http://localhost:8123/';
const SAVE_KEY = 'cipherwars_save_v1';

let checks = 0, failures = 0;
function assert(cond, msg) {
  checks++;
  if (!cond) { failures++; console.error('  FAIL: ' + msg); }
  else console.log('  ok: ' + msg);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitFor(fn, label, timeout = 8000) {
  const t0 = Date.now();
  for (;;) {
    let v = false;
    try { v = fn(); } catch (e) { v = false; }
    if (v) return v;
    if (Date.now() - t0 > timeout) throw new Error('waitFor timeout: ' + label);
    await sleep(100);
  }
}

function seedSave(over) {
  over = over || {};
  const base = {
    version: 1, xp: 0, level: 1, unlockedStage: 1, sound: false, seenIntro: true,
    stats: { wins: 0, losses: 0, correct: 0, wrong: 0, bestCombo: 0 }
  };
  const s = Object.assign(base, over);
  s.stats = Object.assign({ wins: 0, losses: 0, correct: 0, wrong: 0, bestCombo: 0 }, over.stats || {});
  return JSON.stringify(s);
}

function makeVirtualConsole() {
  const pageErrors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => {
    if (/Uncaught/i.test(e.message || '')) pageErrors.push(e.message + '\n' + ((e.detail && e.detail.stack) || ''));
    else console.warn('  [page notice] ' + (e.message || e));
  });
  return { vc, pageErrors };
}

async function boot(opts) {
  opts = opts || {};
  const { vc, pageErrors } = makeVirtualConsole();
  const dom = await JSDOM.fromURL(BASE, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      window.confirm = () => true;   // jsdom has no native confirm() dialog
      if (opts.save) window.localStorage.setItem(SAVE_KEY, opts.save);
    }
  });
  await waitFor(() => dom.window.CW && dom.window.CW.main, 'app boot');
  await sleep(80);
  return { dom, pageErrors };
}

/* ---------- DOM helpers ---------- */
const doc = dom => dom.window.document;
const screenVisible = (dom, id) => doc(dom).getElementById(id).classList.contains('show');
const qOptions = dom => [...doc(dom).querySelectorAll('.q-opt')];

function actionButtons(dom) {
  return [...doc(dom).querySelectorAll('#actions .act-btn')].map(b => ({
    el: b,
    name: b.textContent.replace(/^(\d+\s*⚡|FREE)/, '').trim()
  }));
}

async function doAction(dom, name) {
  const btn = actionButtons(dom).find(a => a.name === name);
  if (!btn) throw new Error('action button not found: ' + name);
  if (btn.el.disabled) throw new Error('action disabled: ' + name);
  btn.el.click();
  await waitFor(() => !doc(dom).getElementById('modal-question').hidden, 'question modal (' + name + ')');
  return doc(dom).getElementById('q-prompt').textContent;
}

async function answerQuestion(dom, pick) {
  const b = dom.window.CW.main.battle;
  if (!b.question) throw new Error('no question open');
  const opts = qOptions(dom);
  const target = pick === 'correct'
    ? opts.find(o => dom.window.CW.math.check(b.question.q, o.textContent))
    : opts.find(o => !dom.window.CW.math.check(b.question.q, o.textContent));
  if (!target) throw new Error('option not found for ' + pick);
  target.click();
}

/* Wait for the modal to close and the turn machinery to finish:
   either the turn counter advanced or the battle is over. */
async function settle(dom, turnBefore, label) {
  await waitFor(() => doc(dom).getElementById('modal-question').hidden, 'modal closed (' + label + ')', 9000);
  await waitFor(() => {
    const b = dom.window.CW.main.battle;
    return b.phase === 'over' || b.turn > turnBefore;
  }, 'turn advanced (' + label + ')', 15000);
  await sleep(600);   // let the busy-lock drop and actions re-render
}

async function battleToVictory(dom) {
  for (let i = 0; i < 25; i++) {
    const b = dom.window.CW.main.battle;
    if (b.phase === 'over') return;
    const turnBefore = b.turn;
    await doAction(dom, 'Serang');
    await answerQuestion(dom, 'correct');
    await settle(dom, turnBefore, 'strike #' + i);
  }
  if (dom.window.CW.main.battle.phase !== 'over') throw new Error('battle did not end within 25 strikes');
}

/* ================= Run A: fresh save, full flow ================= */
async function runA() {
  console.log('\n== Run A: fresh save — title → howto → battle → victory → next → flee ==');
  const { dom, pageErrors } = await boot();
  const win = dom.window;

  assert(screenVisible(dom, 'screen-title'), 'title screen shown on boot');
  assert(doc(dom).getElementById('btn-continue').hidden, 'btn-continue hidden on fresh save');
  assert(doc(dom).getElementById('title-saveinfo').textContent.includes('Belum ada data misi'), 'fresh save info text');

  doc(dom).getElementById('btn-start').click();
  assert(!doc(dom).getElementById('modal-howto').hidden, 'how-to opens on first start');
  doc(dom).getElementById('btn-howto-close').click();
  assert(screenVisible(dom, 'screen-map'), 'map screen after how-to closed');
  assert(doc(dom).getElementById('modal-howto').hidden, 'how-to modal closed');

  const cards = [...doc(dom).querySelectorAll('#stage-grid .stage-card')];
  assert(cards.length === 10, 'map renders 10 stage cards');
  assert(!cards[0].classList.contains('locked'), 'stage 1 unlocked');
  assert(cards.slice(1).every(c => c.classList.contains('locked')), 'stages 2-10 locked');

  cards[0].click();
  assert(screenVisible(dom, 'screen-battle'), 'battle screen after selecting stage 1');
  await sleep(120);
  const b = win.CW.main.battle;
  assert(b && b.enemy.name === 'SENTINEL-01', 'battle created vs SENTINEL-01');
  assert(doc(dom).getElementById('enemy-name').textContent === 'SENTINEL-01', 'enemy name rendered');
  assert(doc(dom).getElementById('player-hptext').textContent === '90 / 90', 'player full HP rendered');
  assert(doc(dom).getElementById('intent-icon').textContent.trim().length > 0, 'enemy intent telegraph rendered');
  assert(actionButtons(dom).map(a => a.name).join(',') === 'Serang,Perisai Darurat,Analisis,Akhiri Giliran',
    'level 1 action bar: ' + actionButtons(dom).map(a => a.name).join(','));

  /* --- wrong answer path (with hint + timer checks) --- */
  const turn0 = b.turn;
  await doAction(dom, 'Serang');
  assert(qOptions(dom).length === 4, '4 answer options rendered');
  assert(qOptions(dom).every(o => o.textContent.trim() !== ''), 'options non-empty');
  doc(dom).getElementById('q-hint').click();
  const fbHint = doc(dom).getElementById('q-feedback');
  assert(!fbHint.hidden && fbHint.textContent.includes('\uD83D\uDCA1'), 'hint shows hint text');
  const t1 = Number(doc(dom).getElementById('q-time').textContent);
  await sleep(1300);
  const t2 = Number(doc(dom).getElementById('q-time').textContent);
  assert(t2 < t1, 'timer counts down (' + t1 + ' -> ' + t2 + ')');
  await answerQuestion(dom, 'wrong');
  await waitFor(() => !doc(dom).getElementById('q-feedback').hidden, 'wrong feedback shows');
  const fb = doc(dom).getElementById('q-feedback').textContent;
  assert(fb.includes('SALAH') || fb.includes('WAKTU HABIS'), 'wrong feedback message');
  assert(fb.includes('Jawaban benar'), 'feedback reveals correct answer');
  await settle(dom, turn0, 'wrong answer');
  assert(win.CW.main.battle.player.combo === 0, 'combo stays 0 after wrong answer');
  assert(win.CW.main.battle.log.some(l => l.msg.includes('menyerang') || l.msg.includes('mengunci')),
    'enemy executed a counter move');
  assert(win.CW.main.battle.player.hp < 90 || win.CW.main.battle.enemy.shield > 0,
    'counter had an effect (player hurt or enemy shielded)');

  /* --- victory loop --- */
  await battleToVictory(dom);
  await waitFor(() => !doc(dom).getElementById('modal-result').hidden, 'result modal shows');
  const box = doc(dom).getElementById('result-box').textContent;
  assert(box.includes('GUARDIAN DIKALAHKAN'), 'victory title for stage 1');
  assert(box.includes('+40 XP'), 'first-clear XP +40 shown');
  assert(doc(dom).getElementById('res-next'), 'next-stage button present');

  const savedAfter = JSON.parse(win.localStorage.getItem(SAVE_KEY));
  assert(savedAfter.unlockedStage === 2, 'save: unlockedStage 2 after victory');
  assert(savedAfter.stats.wins === 1, 'save: wins = 1');
  assert(savedAfter.stats.correct > 0 && savedAfter.stats.wrong >= 1, 'save: answer stats recorded (correct + wrong)');

  doc(dom).getElementById('res-next').click();
  assert(screenVisible(dom, 'screen-battle'), 'next stage battle opens');
  await sleep(120);
  assert(win.CW.main.battle.enemy.name === 'BYTE-HYENA', 'stage 2 enemy BYTE-HYENA');
  assert(doc(dom).getElementById('bh-stage').textContent.includes('SEKTOR 2'), 'HUD shows SEKTOR 2');

  doc(dom).getElementById('btn-flee').click();
  assert(screenVisible(dom, 'screen-map'), 'flee (confirm shim) returns to map');
  const cards2 = [...doc(dom).querySelectorAll('#stage-grid .stage-card')];
  assert(!cards2[1].classList.contains('locked') && cards2[0].classList.contains('done'),
    'stage 2 unlocked & stage 1 marked done after victory');

  assert(pageErrors.length === 0, 'no uncaught page errors in run A' + (pageErrors[0] ? ': ' + pageErrors[0] : ''));
  win.close();
}

/* ================= Run B: defeat via give-up + retry ================= */
async function runB() {
  console.log('\n== Run B: defeat via "Menyerah" + retry ==');
  const { dom, pageErrors } = await boot({ save: seedSave({ seenIntro: true }) });
  const win = dom.window;

  doc(dom).getElementById('btn-start').click();
  await sleep(80);
  assert(screenVisible(dom, 'screen-map'), 'seenIntro skips how-to on start');
  [...doc(dom).querySelectorAll('#stage-grid .stage-card')][0].click();
  await sleep(120);
  const b = win.CW.main.battle;
  assert(b && b.enemy.name === 'SENTINEL-01', 'battle created');
  // TEST PREP: drop HP so one enemy counter triggers defeat — the defeat
  // transition itself (stats, result screen, retry) is what's under test.
  b.player.hp = 5;
  win.CW.ui.updateHUD();

  const turn0 = b.turn;
  await doAction(dom, 'Serang');
  doc(dom).getElementById('q-giveup').click();
  await waitFor(() => !doc(dom).getElementById('modal-result').hidden, 'defeat result shows', 15000);
  const box = doc(dom).getElementById('result-box').textContent;
  assert(box.includes('KONEKSI TERPUTUS'), 'defeat title');
  assert(doc(dom).getElementById('res-retry2') && doc(dom).getElementById('res-map2'), 'retry & map buttons present');
  const sv = JSON.parse(win.localStorage.getItem(SAVE_KEY));
  assert(sv.stats.losses === 1, 'save: losses = 1');

  doc(dom).getElementById('res-retry2').click();
  await sleep(150);
  const b2 = win.CW.main.battle;
  assert(b2 !== b && b2.player.hp === b2.player.maxHp, 'retry starts a fresh full-HP battle');
  assert(screenVisible(dom, 'screen-battle'), 'battle screen after retry');

  assert(pageErrors.length === 0, 'no uncaught page errors in run B' + (pageErrors[0] ? ': ' + pageErrors[0] : ''));
  win.close();
}

/* ================= Run C: level-up + ability unlock ================= */
async function runC() {
  console.log('\n== Run C: level-up + new ability unlock ==');
  const { dom, pageErrors } = await boot({
    save: seedSave({ xp: 50, seenIntro: true, stats: { wins: 1 } })
  });
  const win = dom.window;

  assert(!doc(dom).getElementById('btn-continue').hidden, 'btn-continue visible with progress');
  doc(dom).getElementById('btn-continue').click();
  await sleep(80);
  assert(screenVisible(dom, 'screen-map'), 'continue goes straight to map');

  [...doc(dom).querySelectorAll('#stage-grid .stage-card')][0].click();
  await sleep(120);
  await battleToVictory(dom);
  await waitFor(() => !doc(dom).getElementById('modal-result').hidden, 'result shows');
  const box = doc(dom).getElementById('result-box').textContent;
  assert(box.includes('LEVEL UP'), 'level-up card shown');
  assert(box.includes('Serangan Kuantum'), 'new ability announced');

  const sv = JSON.parse(win.localStorage.getItem(SAVE_KEY));
  assert(sv.level === 2, 'save: level 2');
  assert(sv.xp === 30, 'save: xp remainder 30 (50 + 40 - 60)');

  doc(dom).getElementById('res-next').click();
  await sleep(150);
  const names = actionButtons(dom).map(a => a.name).join(',');
  assert(names === 'Serang,Perisai Darurat,Analisis,Serangan Kuantum,Akhiri Giliran',
    'Serangan Kuantum unlocked in action bar: ' + names);

  assert(pageErrors.length === 0, 'no uncaught page errors in run C' + (pageErrors[0] ? ': ' + pageErrors[0] : ''));
  win.close();
}

/* ================= Run D: boss badges (regression), codex, reset ================= */
async function runD() {
  console.log('\n== Run D: map boss badges + codex + reset ==');
  const { dom, pageErrors } = await boot({
    save: seedSave({ unlockedStage: 5, level: 4, seenIntro: true, stats: { wins: 3 } })
  });
  const win = dom.window;

  doc(dom).getElementById('btn-continue').click();
  await sleep(80);
  const cards = [...doc(dom).querySelectorAll('#stage-grid .stage-card')];
  assert(cards.length === 10, '10 cards');
  assert(cards.slice(0, 4).every(c => c.classList.contains('done')), 'stages 1-4 marked done');
  assert(!cards[4].classList.contains('locked'), 'stage 5 unlocked');
  assert(cards[4].classList.contains('boss-stage'),
    'SEKTOR 05 (KALKULUS REX) carries the boss badge');
  assert(!cards[8].classList.contains('boss-stage'), 'SEKTOR 09 (non-boss AI) has no boss badge');
  assert(cards[9].classList.contains('locked') && !cards[9].classList.contains('boss-stage'),
    'locked final boss has no boss badge');

  doc(dom).getElementById('btn-codex').click();
  await sleep(80);
  assert(screenVisible(dom, 'screen-codex'), 'codex opens');
  assert(doc(dom).querySelectorAll('#codex-abilities .ability-card').length === 9, 'codex lists 9 abilities');
  assert(doc(dom).querySelectorAll('#codex-bestiary .bestiary-card').length === 10, 'bestiary lists 10 guardians');
  doc(dom).getElementById('btn-codex-back').click();
  await sleep(80);
  assert(screenVisible(dom, 'screen-map'), 'codex back returns to map');

  const sndBefore = doc(dom).getElementById('btn-sound').textContent;
  doc(dom).getElementById('btn-sound').click();
  assert(doc(dom).getElementById('btn-sound').textContent !== sndBefore, 'sound toggle flips icon');

  doc(dom).getElementById('btn-reset').click();
  await sleep(80);
  // save.reset() removes the storage key; fresh state is persisted on next save event
  const raw = win.localStorage.getItem(SAVE_KEY);
  const sv = raw ? JSON.parse(raw) : null;
  assert(!sv || (sv.level === 1 && sv.unlockedStage === 1 && sv.stats.wins === 0), 'reset wipes progress');
  assert([...doc(dom).querySelectorAll('#stage-grid .stage-card')].slice(1).every(c => c.classList.contains('locked')),
    'map re-locks stages after reset');

  assert(pageErrors.length === 0, 'no uncaught page errors in run D' + (pageErrors[0] ? ': ' + pageErrors[0] : ''));
  win.close();
}

/* ================= runner ================= */
(async () => {
  console.log('CIPHER WARS E2E (jsdom) — target ' + BASE);
  const runs = { a: runA, b: runB, c: runC, d: runD };
  const only = process.argv[2];
  try {
    if (only && runs[only]) await runs[only]();
    else { await runA(); await runB(); await runC(); await runD(); }
  } catch (e) {
    failures++;
    console.error('\nFATAL: ' + ((e && e.stack) || e));
  }
  console.log('\n' + checks + ' checks run, ' + failures + ' failures');
  process.exit(failures ? 1 : 0);
})();
