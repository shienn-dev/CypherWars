/* ============================================================
   CIPHER WARS - Main / Game flow orchestrator
   Wires screens, save state, and the battle loop together.
   Exposes global: CW.main
   ============================================================ */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const ui = () => window.CW.ui;
  const data = () => window.CW.data;

  let save = null;
  let B = null;          // active battle
  let busy = false;      // input lock during animations

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function persist() { window.CW.save.persist(save); }

  /* ================= Boot ================= */
  function boot() {
    save = window.CW.save.load();
    window.CW.audio.enabled = save.sound;

    $('btn-start').addEventListener('click', () => {
      window.CW.audio.ui.click();
      if (!save.seenIntro) {
        openHowto(() => { save.seenIntro = true; persist(); goMap(); });
      } else goMap();
    });
    $('btn-continue').addEventListener('click', () => { window.CW.audio.ui.click(); goMap(); });
    $('btn-howto').addEventListener('click', () => { window.CW.audio.ui.click(); openHowto(null); });
    $('btn-howto-close').addEventListener('click', () => {
      window.CW.audio.ui.back();
      $('modal-howto').hidden = true;
      if (howtoClose) { const f = howtoClose; howtoClose = null; f(); }
    });

    $('btn-codex').addEventListener('click', () => {
      window.CW.audio.ui.click();
      ui().renderCodex(save);
      ui().showScreen('screen-codex');
    });
    $('btn-codex-back').addEventListener('click', () => { window.CW.audio.ui.back(); goMap(); });
    $('btn-sound').addEventListener('click', () => {
      save.sound = !save.sound;
      window.CW.audio.enabled = save.sound;
      persist();
      $('btn-sound').textContent = save.sound ? '\uD83D\uDD0A' : '\uD83D\uDD07';
      if (save.sound) window.CW.audio.ui.click();
    });
    $('btn-reset').addEventListener('click', () => {
      if (confirm('Hapus seluruh progres (level, stage, statistik)?')) {
        save = window.CW.save.reset();
        window.CW.audio.enabled = save.sound;
        ui().toast('Progres direset.', 'warn');
        goMap();
      }
    });
    $('btn-flee').addEventListener('click', () => {
      if (confirm('Kabur dari pertarungan? Progres stage ini hilang.')) {
        window.CW.audio.ui.back();
        goMap();
      }
    });

    $('q-hint').addEventListener('click', () => ui().onHint());
    $('q-giveup').addEventListener('click', () => ui().onGiveUp());

    // "Continue" only matters with existing progress
    const hasProgress = save.unlockedStage > 1 || save.xp > 0 || save.stats.wins > 0;
    $('btn-continue').hidden = !hasProgress;
    const played = save.stats.wins + save.stats.losses;
    $('title-saveinfo').textContent = played > 0
      ? 'Progres tersimpan: Level ' + save.level + ', Sektor ' + save.unlockedStage
      : 'Belum ada data misi';

    window.CW.ui.showScreen('screen-title');
  }

  let howtoClose = null;
  function openHowto(onClose) {
    howtoClose = onClose || null;
    $('modal-howto').hidden = false;
  }

  function goMap() {
    busy = false;
    B = null;
    $('modal-result').hidden = true;
    $('modal-question').hidden = true;
    ui().renderMap(save);
    ui().showScreen('screen-map');
  }

  /* ================= Stage select / battle start ================= */
  function startStage(stage) {
    B = window.CW.battle.create(stage, save);
    ui().bindBattle(B, save, flow);
    ui().showScreen('screen-battle');
    ui().renderBattle();
    ui().renderActions();
    const def = data().enemies[stage.enemy];
    if (def.ai === 'boss' || stage.id === 5 || stage.id === 10) window.CW.audio.fx.bossIntro();
    ui().toast('SEKTOR ' + stage.id + ': ' + stage.name, 'gold');
  }

  const flow = {
    onAction(ab) {
      if (busy || !B || B.phase !== 'player') return;
      if (B.player.energy < ab.cost) return;
      busy = true;
      window.CW.audio.ui.click();
      if (ab.cost > 0) window.CW.battle.spendEnergy(B, ab.cost);
      ui().updateHUD();
      const tierBonus = ab.type === 'interrupt' ? 1 : 0;
      const qd = window.CW.battle.makeQuestion(B, save, {
        purpose: ab, tierBonus, isInterrupt: ab.type === 'interrupt'
      });
      ui().openQuestion(qd, (correct, choice, timedOut) => resolveAnswer(correct, choice, timedOut));
    },
    onEndTurn() {
      if (busy || !B || B.phase !== 'player') return;
      busy = true;
      window.CW.audio.ui.click();
      window.CW.battle.log(B, 'sys', 'Operative menunggu dan mengamati\u2026');
      runEnemyTurn();
    }
  };
  window.CW.ui.flow = flow;   // exposed for testing hooks
  window.CW.ui.onStageSelect = stage => { if (!busy) startStage(stage); };

  /* ================= Question resolution ================= */
  async function resolveAnswer(correct, choice, timedOut) {
    const events = window.CW.battle.answer(B, save, choice, timedOut);
    ui().refreshLog();
    ui().updateHUD();
    await animateEvents(events, correct);
    if (window.CW.battle.enemyDead(B)) return victory();
    if (window.CW.battle.playerDead(B)) return defeat();

    if (correct) await runEnemyTurn();
    else await nextTurn();
  }

  /* ================= Turn machinery ================= */
  async function runEnemyTurn() {
    const events = window.CW.battle.endPlayerPhase(B);
    ui().refreshLog();
    await animateEvents(events, null);
    if (window.CW.battle.playerDead(B)) return defeat();
    if (window.CW.battle.enemyDead(B)) return victory();  // (paranoia: reflect-type future)
    await nextTurn();
  }

  async function nextTurn() {
    const events = window.CW.battle.startPlayerTurn(B);
    ui().refreshLog();
    await animateEvents(events, null);
    if (B.phase === 'over' || window.CW.battle.playerDead(B)) return defeat();
    ui().updateHUD();
    ui().renderActions();
    busy = false;
  }

  /* ================= Event animation ================= */
  const fx = () => window.CW.ui.fx;
  async function animateEvents(events, correct) {
    for (const ev of events) {
      switch (ev.kind) {
        case 'correct':
          window.CW.ui.updateHUD();
          break;
        case 'enemyHit':
          if (ev.dealt > 0) {
            if (ev.ability === 'execute' || ev.ability === 'pierce') window.CW.audio.fx.bigHit();
            else window.CW.audio.fx.hit();
            fx().enemyHit(ev.dealt);
          } else { window.CW.audio.fx.shield(); fx().enemyShield(0); }
          await sleep(560);
          break;
        case 'playerHit':
          fx().enemyAttackLunge();
          await sleep(260);
          if (ev.ult) { window.CW.audio.fx.ult(); }
          else if (ev.dealt >= 14) window.CW.audio.fx.bigHit();
          else window.CW.audio.fx.hit();
          fx().playerHit(ev.dealt);
          await sleep(620);
          break;
        case 'enemyShield':
          window.CW.audio.fx.shield();
          fx().enemyShield(ev.amount);
          await sleep(420);
          break;
        case 'playerShield':
          window.CW.audio.fx.shield();
          fx().playerShield(ev.amount);
          await sleep(420);
          break;
        case 'playerHeal':
          window.CW.audio.fx.heal();
          fx().playerHeal(ev.amount);
          await sleep(520);
          break;
        case 'enemyHeal':
          window.CW.audio.fx.heal();
          fx().enemyHeal(ev.amount);
          await sleep(480);
          break;
        case 'energy':
          window.CW.audio.fx.energy();
          fx().energy(ev.amount);
          await sleep(360);
          break;
        case 'drain':
          window.CW.audio.fx.debuff();
          fx().drain(ev.amount);
          window.CW.ui.toast('Energi dicuri musuh!', 'warn');
          await sleep(420);
          break;
        case 'poison':
          window.CW.audio.fx.debuff();
          window.CW.ui.toast('\u2620 RACUN DIGITAL AKTIF (3 giliran)', 'warn');
          await sleep(420);
          break;
        case 'slow':
          window.CW.audio.fx.debuff();
          window.CW.ui.toast('\u23F3 Timer dekripsi dipangkas ' + ev.turns + ' giliran!', 'warn');
          await sleep(420);
          break;
        case 'comboBreak':
          window.CW.audio.fx.debuff();
          fx().comboBreak();
          await sleep(420);
          break;
        case 'telegraph':
          window.CW.audio.fx.telegraph();
          window.CW.ui.toast('\u2620 ULTIMATE SEDANG DIISI \u2014 GUNAKAN INTERUPSI!', 'warn');
          await sleep(650);
          break;
        case 'interrupt':
          window.CW.audio.fx.energy();
          window.CW.ui.toast('ULTIMATE DIBATALKAN!', 'gold');
          await sleep(520);
          break;
        case 'fizzle':
          window.CW.ui.toast(ev.why, 'warn');
          await sleep(400);
          break;
        case 'poisonTick':
          window.CW.audio.fx.debuff();
          fx().playerHit(ev.amount);
          await sleep(500);
          break;
        case 'enemyAct':
          if (ev.move.type === 'attack' || ev.move.type === 'heavy' || ev.move.type === 'ult') {
            fx().enemyAttackLunge();
            await sleep(240);
          }
          break;
        case 'statusTick':
        case 'analyze':
        case 'overclock':
          await sleep(240);
          break;
      }
      window.CW.ui.updateHUD();
      window.CW.ui.refreshLog();
    }
    await sleep(220);
  }

  /* ================= End states ================= */
  function accuracyPct() {
    const s = save.stats;
    const total = s.correct + s.wrong;
    return total ? Math.round(s.correct / total * 100) : 0;
  }

  function victory() {
    busy = true;
    B.phase = 'over';
    fx().enemyDeath();
    window.CW.audio.fanfare();
    const stage = B.stage;
    const enemy = B.enemyDef;
    const firstClear = stage.id >= save.unlockedStage;
    const xpGain = firstClear ? enemy.reward : Math.round(enemy.reward * 0.4);
    const oldLevel = save.level;
    const lvl = window.CW.save.grantXp(save, xpGain);
    save.unlockedStage = Math.min(10, Math.max(save.unlockedStage, stage.id + 1));
    save.stats.wins++;
    persist();

    const isFinal = stage.id === 10;
    const nextStages = data().stages.filter(s => s.id === stage.id + 1);
    const newAbilities = data().abilities.filter(a => a.unlock > oldLevel && a.unlock <= save.level);

    const html =
      '<div class="result-title win">' + (isFinal ? 'JARINGAN DIBEBASKAN' : 'GUARDIAN DIKALAHKAN') + '</div>' +
      '<div class="result-sub">' + (isFinal
        ? 'NEXUS PRIME tumbang. Seluruh Cipher Guardian melipat diri. Dunia digital bebas \u2014 dan namamu tercatat sebagai Operative legendaris.'
        : enemy.name + ' tumbang. Sektor "' + stage.name + '" berhasil ditembus.') + '</div>' +
      '<div class="result-stats">' +
        '<div class="result-stat"><b>x' + B.player.bestCombo + '</b><span>COMBO TERBAIK</span></div>' +
        '<div class="result-stat"><b>' + B.turn + '</b><span>GILIRAN</span></div>' +
        '<div class="result-stat"><b>' + accuracyPct() + '%</b><span>AKURASI TOTAL</span></div>' +
      '</div>' +
      '<div class="result-xp">+' + xpGain + ' XP' + (firstClear ? '' : ' (pengulangan sektor)') + '</div>' +
      (lvl.leveledUp
        ? '<div class="levelup-card"><b>\u2B50 LEVEL UP! LV ' + oldLevel + ' \u2192 ' + save.level + '</b>' +
          (newAbilities.length
            ? newAbilities.map(a => '<div class="new-ability"><div class="ability-icon">' + ui().icons[a.icon] + '</div><div><b style="letter-spacing:normal">' + a.name + '</b> <span class="ability-cost">(' + (a.cost > 0 ? a.cost + ' energi' : 'gratis') + ')</span><br><small style="color:var(--text-dim)">' + a.desc + '</small></div></div>').join('')
            : '<div style="font-size:12px;color:var(--text-dim);margin-top:6px">HP maksimum +' + data().playerBase.hpPerLevel + '</div>') +
          '</div>'
        : '') +
      '<div class="result-actions">' +
        (isFinal
          ? '<button class="btn btn-primary" id="res-map">Kembali ke Peta</button>'
          : (nextStages.length ? '<button class="btn btn-primary" id="res-next">Sektor Berikutnya \u25B6</button>' : '') +
            '<button class="btn btn-ghost" id="res-retry">Ulangi Sektor</button>' +
            '<button class="btn btn-ghost" id="res-map">Peta</button>') +
      '</div>';
    ui().showResult(html);
    $('res-map').addEventListener('click', () => { window.CW.audio.ui.back(); goMap(); });
    if (!isFinal) {
      const rn = $('res-next'), rr = $('res-retry');
      if (rn) rn.addEventListener('click', () => { window.CW.audio.ui.click(); ui().hideResult(); startStage(data().stages[stage.id]); });
      rr.addEventListener('click', () => { window.CW.audio.ui.click(); ui().hideResult(); startStage(stage); });
    }
  }

  function defeat() {
    busy = true;
    B.phase = 'over';
    window.CW.audio.gameover();
    save.stats.losses++;
    persist();
    const html =
      '<div class="result-title lose">KONEKSI TERPUTUS</div>' +
      '<div class="result-sub">' + B.enemy.name + ' bertahan. Operative dipaksa keluar dari sektor \u2014 namun setiap kegagalan adalah data.</div>' +
      '<div class="result-stats">' +
        '<div class="result-stat"><b>' + B.enemy.hp + '</b><span>SISA HP MUSUH</span></div>' +
        '<div class="result-stat"><b>x' + B.player.bestCombo + '</b><span>COMBO TERBAIK</span></div>' +
        '<div class="result-stat"><b>' + accuracyPct() + '%</b><span>AKURASI TOTAL</span></div>' +
      '</div>' +
      '<div class="result-actions">' +
        '<button class="btn btn-primary" id="res-retry2">Coba Lagi</button>' +
        '<button class="btn btn-ghost" id="res-map2">Peta</button>' +
      '</div>';
    ui().showResult(html);
    $('res-retry2').addEventListener('click', () => { window.CW.audio.ui.click(); ui().hideResult(); startStage(B.stage); });
    $('res-map2').addEventListener('click', () => { window.CW.audio.ui.back(); goMap(); });
  }

  window.CW = window.CW || {};
  window.CW.main = { boot, startStage, get battle() { return B; } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
