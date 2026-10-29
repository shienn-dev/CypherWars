/* ============================================================
   CIPHER WARS - UI Layer
   Rendering, screens, question modal, animations, FX.
   Pure DOM + helpers; game flow is orchestrated in main.js.
   Exposes global: CW.ui
   ============================================================ */
(function () {
  'use strict';
  const U = {};
  const $ = id => document.getElementById(id);
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  /* ================= SVG ICONS ================= */
  const STROKE = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  U.icons = {
    sword:   `<svg viewBox="0 0 24 24" ${STROKE}><path d="M3 21l5-1.5L20.5 7 17 3.5 4.5 16 3 21z"/><path d="M13 7l4 4"/></svg>`,
    shield:  `<svg viewBox="0 0 24 24" ${STROKE}><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/></svg>`,
    eye:     `<svg viewBox="0 0 24 24" ${STROKE}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`,
    bolt:    `<svg viewBox="0 0 24 24" ${STROKE}><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>`,
    pierce:  `<svg viewBox="0 0 24 24" ${STROKE}><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" opacity="0.45"/><path d="M2 12h18M16 8l4 4-4 4"/></svg>`,
    heart:   `<svg viewBox="0 0 24 24" ${STROKE}><path d="M12 21C6 16 3 12.5 3 9a5 5 0 019-3 5 5 0 019 3c0 3.5-3 7-9 12z"/></svg>`,
    chip:    `<svg viewBox="0 0 24 24" ${STROKE}><rect x="6" y="6" width="12" height="12"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>`,
    cut:     `<svg viewBox="0 0 24 24" ${STROKE}><path d="M5 5l14 14M19 5L5 19"/></svg>`,
    skull:   `<svg viewBox="0 0 24 24" ${STROKE}><path d="M12 2a8 8 0 00-8 8c0 3 1.5 5 3 6v4h10v-4c1.5-1 3-3 3-6a8 8 0 00-8-8z"/><circle cx="9" cy="11" r="1.4"/><circle cx="15" cy="11" r="1.4"/></svg>`,
    flag:    `<svg viewBox="0 0 24 24" ${STROKE}><path d="M5 21V4M5 4c4-2 8 2 14 0v9c-6 2-10-2-14 0"/></svg>`
  };

  /* ================= ENEMY GLYPHS ================= */
  U.glyphs = {
    sentinel: `<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="2.5"><path d="M50 8L78 20v28c0 18-12 32-28 40C34 80 22 66 22 48V20L50 8z"/><path d="M50 22l16 7v14c0 11-7 20-16 25-9-5-16-14-16-25V29l16-7z" opacity="0.6"/><circle cx="50" cy="44" r="7"/><circle cx="50" cy="44" r="2.5" fill="currentColor"/></g></svg>`,
    hyena: `<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"><path d="M22 30L34 12l10 12h12l10-12 12 18-6 22 6 24-18-8-8 12-8-12-18 8 6-24-6-22z"/><path d="M38 52l6 6M62 52l-6 6" stroke-width="3"/><path d="M44 68h12l-6 8-6-8z" opacity="0.7"/></g></svg>`,
    aegis: `<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="2.5"><path d="M50 6l36 20v40L50 94 14 66V26L50 6z"/><path d="M50 22l22 12v28L50 76 28 62V34l22-12z" opacity="0.6"/><path d="M50 38l10 6v12l-10 6-10-6V44l10-6z"/><path d="M14 26l36 22 36-22M50 48v46" opacity="0.25"/></g></svg>`,
    nullsnake: `<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M14 70c14 0 14-16 28-16s14 16 28 16 14-16 16-22"/><path d="M14 54c14 0 14-16 28-16s14 16 28 16" opacity="0.55"/><path d="M86 48l-8 6 8 6" stroke-width="3"/><circle cx="26" cy="62" r="3" fill="currentColor"/><circle cx="54" cy="62" r="3" fill="currentColor" opacity="0.55"/></g></svg>`,
    rex: `<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"><path d="M28 14l14 10h16l14-10 6 22-8 12 4 26-12-6-4 12-8-10-8 10-4-12-12 6 4-26-8-12 6-22z"/><path d="M40 44l5 5M60 44l-5 5" stroke-width="3"/><path d="M40 62l10 10 10-10" opacity="0.7"/><path d="M28 14l6 14M72 14l-6 14" opacity="0.5"/></g></svg>`,
    virus: `<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="50" cy="50" r="22"/><path d="M50 28V12M50 88V72M28 50H12M88 50H72M34 34L23 23M66 34l11-11M34 66L23 77M66 66l11 11"/><circle cx="50" cy="50" r="9" opacity="0.7"/><circle cx="50" cy="50" r="3" fill="currentColor"/></g></svg>`,
    mirror: `<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"><path d="M42 20v60L14 50l28-30z"/><path d="M58 20v60L86 50 58 20z" opacity="0.6"/><path d="M50 8v84" stroke-dasharray="4 5" opacity="0.8"/><circle cx="30" cy="50" r="4" fill="currentColor" opacity="0.8"/><circle cx="70" cy="50" r="4" fill="currentColor" opacity="0.5"/></g></svg>`,
    fox: `<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"><path d="M26 18l14 12h20l14-12 6 26-12 22-8 16-10-8-10 8-8-16-12-22 6-26z"/><path d="M40 46l6 5M60 46l-6 5" stroke-width="3"/><path d="M50 60l-7 6 7 7 7-7-7-6z" opacity="0.7"/></g></svg>`,
    omega: `<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="50" cy="50" r="42" opacity="0.35"/><path d="M32 72V46a18 18 0 0136 0v26M26 72h16M58 72h16" stroke-width="4"/><path d="M50 20a30 30 0 00-30 30" opacity="0.5"/><circle cx="50" cy="50" r="7" opacity="0.8"/></g></svg>`,
    nexus: `<svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="50" cy="50" r="44" opacity="0.3"/><circle cx="50" cy="50" r="32" stroke-dasharray="10 6" class="spin-ring"/><path d="M50 26l20 12v24L50 74 30 62V38l20-12z"/><circle cx="50" cy="50" r="9"/><circle cx="50" cy="50" r="3.5" fill="currentColor"/><path d="M50 6v12M50 82v12M6 50h12M82 50h12" opacity="0.6"/></g></svg>`
  };

  /* ================= Screens / toasts ================= */
  U.showScreen = id => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('show'));
    $(id).classList.add('show');
  };

  U.toast = (msg, cls) => {
    const t = el('div', 'toast' + (cls ? ' ' + cls : ''), msg);
    $('toast-zone').appendChild(t);
    setTimeout(() => t.remove(), 3200);
  };

  /* ================= Campaign map ================= */
  U.renderMap = save => {
    $('map-level').textContent = save.level;
    const need = CW.save.xpNeeded(save.level);
    $('map-xpfill').style.width = Math.min(100, save.xp / need * 100) + '%';
    $('map-xptext').textContent = 'XP ' + save.xp + '/' + need;
    $('btn-sound').textContent = save.sound ? '\uD83D\uDD0A' : '\uD83D\uDD07';

    const grid = $('stage-grid');
    grid.innerHTML = '';
    CW.data.stages.forEach(st => {
      const enemy = CW.data.enemies[st.enemy];
      const unlocked = st.id <= save.unlockedStage;
      const done = st.id < save.unlockedStage;
      const isBoss = enemy.ai === 'boss' || st.enemy === 'rex';
      const card = el('div', 'stage-card' + (unlocked ? '' : ' locked') + (done ? ' done' : '') + (isBoss && unlocked ? ' boss-stage' : ''));
      card.innerHTML =
        '<div class="stage-num">SEKTOR ' + String(st.id).padStart(2, '0') + '</div>' +
        '<div class="stage-name">' + st.name + '</div>' +
        '<div class="stage-enemy" style="color:' + enemy.color + '">' + enemy.name + '</div>' +
        '<div class="stage-meta"><span>HP ' + enemy.hp + '</span><span>TIER ' + st.tier + '</span>' +
        '<span>' + aiLabel(enemy.ai) + '</span></div>' +
        (done ? '<span class="stage-done">\u2713</span>' : '') +
        (unlocked ? '' : '<span class="stage-lock">\uD83D\uDD12</span>');
      if (unlocked) card.addEventListener('click', () => { CW.audio.ui.click(); U.onStageSelect(st); });
      grid.appendChild(card);
    });
  };

  function aiLabel(ai) {
    return {
      aggressive: 'AGRESIF', trickster: 'PENIPU', defensive: 'BERTAHAN', disruptor: 'PENGACAU',
      berserker: 'BERKERK', toxic: 'TOKSIK', reflector: 'PANTUL', adaptive: 'ADAPTIF',
      tactician: 'TAKTIS', boss: 'BOSS'
    }[ai] || ai;
  }

  /* ================= Codex ================= */
  U.renderCodex = save => {
    const list = $('codex-abilities');
    list.innerHTML = '';
    CW.data.abilities.forEach(ab => {
      const unlocked = ab.unlock <= save.level;
      list.appendChild(el('div', 'ability-card' + (unlocked ? '' : ' locked'),
        '<div class="ability-icon">' + (U.icons[ab.icon] || '') + '</div>' +
        '<div class="ability-info"><b>' + ab.name + '</b>' +
        '<p>' + ab.desc + '</p>' +
        '<span class="ability-cost">' + (ab.cost > 0 ? 'ENERGI ' + ab.cost : 'GRATIS') + '</span> ' +
        (unlocked ? '' : '<span class="ability-unlock">\uD83D\uDD12 Level ' + ab.unlock + '</span>') +
        '</div>'));
    });
    const best = $('codex-bestiary');
    best.innerHTML = '';
    CW.data.stages.forEach(st => {
      const e = CW.data.enemies[st.enemy];
      const seen = st.id < save.unlockedStage || (st.id === save.unlockedStage && save.stats.wins > 0);
      best.appendChild(el('div', 'bestiary-card',
        '<div style="color:' + e.color + '">' + (seen ? U.glyphs[e.svg] : '<svg viewBox="0 0 100 100"><text x="50" y="58" text-anchor="middle" font-size="34" fill="currentColor">?</text></svg>') + '</div>' +
        '<b style="color:' + (seen ? e.color : 'var(--text-dim)') + '">' + (seen ? e.name : '???') + '</b>' +
        '<span class="ai-tag">' + (seen ? e.title + ' \u00B7 ' + aiLabel(e.ai) : 'Belum dihadapi') + '</span>'));
    });
  };

  /* ================= Battle rendering ================= */
  let B = null;           // active battle object
  let saveRef = null;     // active player save
  let flowApi = null;     // callbacks provided by main.js
  let timerInt = null;

  U.bindBattle = (battle, save, flow) => { B = battle; saveRef = save; flowApi = flow; };

  U.renderBattle = () => {
    $('bh-stage').textContent = 'SEKTOR ' + B.stage.id + ' \u00B7 ' + B.stage.name.toUpperCase();
    $('bh-turn').textContent = 'GILIRAN ' + B.turn;
    $('enemy-name').textContent = B.enemy.name;
    $('enemy-name').style.color = B.enemy.color;
    $('enemy-visual').innerHTML = '<div style="color:' + B.enemy.color + ';filter:drop-shadow(0 0 14px ' + B.enemy.color + ')">' + U.glyphs[B.enemy.svg] + '</div>';
    $('bt-level').textContent = saveRef.level;
    U.updateHUD();
    $('battle-log').innerHTML = '';
    B.log.slice(-30).forEach(l => appendLog(l));
  };

  function updateEnemyIntent() {
    const icon = $('intent-icon'), text = $('intent-text'), box = $('enemy-intent');
    box.classList.remove('danger');
    if (B.enemy.chargingUlt) {
      const mv = B.enemy.chargingUlt;
      icon.textContent = '\u2620';
      text.textContent = 'ULTIMATE: PEMBERSIHAN (' + mv.value + ' dmg) \u2014 INTERUPSI SEKARANG!';
      box.classList.add('danger');
      return;
    }
    if (!B.enemy.nextMove) { icon.textContent = '\u2026'; text.textContent = 'Menganalisis Operative\u2026'; return; }
    const mv = B.enemy.nextMove;
    const map = {
      attack: ['\u2694', 'Bersiap menyerang (' + mv.value + ' dmg)'],
      heavy: ['\uD83D\uDCA5', 'MENGISI SERANGAN BERAT (' + mv.value + ' dmg)'],
      shield: ['\uD83D\uDEE1', 'Mengunci perisai (+' + mv.value + ' shield)'],
      heal: ['\u271A', 'Memperbaiki diri (+' + mv.value + ' HP)'],
      drain: ['\u26A1', 'Menyusup: curi ' + mv.value + ' energi'],
      poison: ['\u2620', 'Menyiapkan RACUN DIGITAL'],
      slow: ['\u23F3', 'Mengisi PEMUTAR WAKTU (timer \u2193)'],
      combo: ['\u26D3', 'Mengisi PEMUTUS RANTAI (combo \u2192 0)'],
      ult: ['\u2620', 'MENGISI PROTOCOL PEMBERSIHAN!']
    };
    const m = map[mv.type] || ['?', mv.type];
    icon.textContent = m[0];
    text.textContent = m[1];
    if (mv.type === 'heavy' || mv.type === 'ult') box.classList.add('danger');
  }

  U.updateHUD = () => {
    const p = B.player, e = B.enemy;
    // Enemy
    $('enemy-hpfill').style.width = (e.hp / e.maxHp * 100) + '%';
    $('enemy-hptext').textContent = e.hp + ' / ' + e.maxHp;
    $('enemy-shield').textContent = e.shield > 0 ? '\uD83D\uDEE1 SHIELD ' + e.shield : '';
    $('enemy-status').innerHTML =
      (e.chargingUlt ? '<span class="status-chip charging">\u2620 MENGISI ULTIMATE</span>' : '');
    // Player
    $('player-hpfill').style.width = (p.hp / p.maxHp * 100) + '%';
    $('player-hptext').textContent = p.hp + ' / ' + p.maxHp;
    const pips = $('energy-pips');
    pips.innerHTML = '';
    for (let i = 0; i < p.energyMax; i++) {
      const pip = el('div', 'pip' + (i < p.energy ? ' on' : ''));
      pip.title = 'Energi ' + (i + 1);
      pips.appendChild(pip);
    }
    $('player-shield').textContent = p.shield > 0 ? '\uD83D\uDEE1 SHIELD ' + p.shield : '';
    let statusHtml = '';
    if (p.poison > 0) statusHtml += '<span class="status-chip poison">\u2620 RACUN (' + p.poison + ')</span>';
    if (p.slow > 0) statusHtml += '<span class="status-chip slow">\u23F3 LAMBAT (' + p.slow + ')</span>';
    if (p.overclock > 0) statusHtml += '<span class="status-chip overclock">\u26A1 OVERCLOCK (' + p.overclock + ')</span>';
    if (p.analyzeReady) statusHtml += '<span class="status-chip analyze">\u25CE ANALISIS SIAP</span>';
    $('player-status').innerHTML = statusHtml;
    const cm = $('combo-meter');
    cm.textContent = 'COMBO x' + p.combo;
    cm.classList.toggle('hot', p.combo >= 3);
    $('bh-turn').textContent = 'GILIRAN ' + B.turn;
    updateEnemyIntent();
  };

  function appendLog(l) {
    const box = $('battle-log');
    box.appendChild(el('div', 'lg-' + l.type, '\u203A ' + l.msg));
    box.scrollTop = box.scrollHeight;
  }
  U.refreshLog = () => {
    const box = $('battle-log');
    const known = box.childElementCount;
    for (let i = known; i < B.log.length; i++) appendLog(B.log[i]);
  };

  /* ================= Action buttons ================= */
  U.renderActions = () => {
    const box = $('actions');
    box.innerHTML = '';
    const p = B.player;
    const abilities = CW.battle.unlockedAbilities(saveRef.level);

    abilities.forEach(ab => {
      const btn = el('button', 'act-btn ' + btnClass(ab));
      const affordable = p.energy >= ab.cost;
      const isInterrupt = ab.type === 'interrupt';
      btn.disabled = !affordable || (isInterrupt && !B.enemy.chargingUlt);
      btn.innerHTML =
        '<span class="act-icon">' + (U.icons[ab.icon] || '') + '</span>' +
        '<span class="act-cost">' + (ab.cost > 0 ? ab.cost + '\u26A1' : 'FREE') + '</span>' +
        ab.name;
      if (isInterrupt && !B.enemy.chargingUlt) btn.title = 'Hanya aktif saat musuh mengisi Ultimate!';
      btn.addEventListener('click', () => flowApi.onAction(ab));
      box.appendChild(btn);
    });

    const end = el('button', 'act-btn end-btn',
      '<span class="act-icon">' + U.icons.flag + '</span>Akhiri Giliran');
    end.addEventListener('click', () => flowApi.onEndTurn());
    box.appendChild(end);
  };

  function btnClass(ab) {
    if (ab.type === 'attack') return 'attack-btn';
    if (ab.type === 'shield' || ab.type === 'heal') return 'def-btn';
    return 'util-btn';
  }

  /* ================= Floating FX ================= */
  function floatText(target, text, color, small) {
    const layer = $('fx-layer');
    const r = target.getBoundingClientRect();
    const t = el('div', 'float-text' + (small ? ' small' : ''), text);
    t.style.left = (r.left + r.width / 2 + (Math.random() * 40 - 20)) + 'px';
    t.style.top = (r.top + r.height * 0.35) + 'px';
    t.style.color = color;
    layer.appendChild(t);
    setTimeout(() => t.remove(), 1150);
  }

  U.fx = {
    enemyHit: dealt => {
      const v = $('enemy-visual');
      v.classList.remove('hit'); void v.offsetWidth; v.classList.add('hit');
      floatText(v, '-' + dealt, '#ff5e7a');
    },
    enemyShield: amt => {
      const v = $('enemy-visual');
      floatText(v, '+' + amt + ' SHIELD', '#4dd8ff', true);
    },
    enemyHeal: amt => {
      const v = $('enemy-visual');
      floatText(v, '+' + amt + ' HP', '#8be9a0', true);
    },
    playerHit: dealt => {
      document.body.classList.remove('shake', 'flash-red');
      void document.body.offsetWidth;
      document.body.classList.add('shake', 'flash-red');
      const t = $('player-hpfill');
      if (dealt > 0) floatText(t, '-' + dealt, '#ff5e7a');
      else floatText(t, 'BLOCKED', '#4dd8ff', true);
    },
    playerHeal: amt => {
      if (amt > 0) floatText($('player-hpfill'), '+' + amt + ' HP', '#8be9a0');
      else floatText($('player-hpfill'), 'HP PENUH', '#8be9a0', true);
    },
    playerShield: amt => floatText($('player-hpfill'), '+' + amt + ' SHIELD', '#4dd8ff', true),
    energy: amt => floatText($('energy-pips'), '+' + amt + '\u26A1', '#ffd166', true),
    comboBreak: () => floatText($('combo-meter'), 'COMBO PUTUS', '#ff5e7a', true),
    drain: amt => floatText($('energy-pips'), '-' + amt + '\u26A1', '#ff5e7a', true),
    enemyAttackLunge: () => {
      const v = $('enemy-visual');
      v.classList.remove('attack'); void v.offsetWidth; v.classList.add('attack');
    },
    enemyDeath: () => {
      const v = $('enemy-visual');
      v.classList.add('dead');
      CW.audio.fx.ult();
    }
  };

  /* ================= Question modal ================= */
  const Q = {
    tLeft: 0, total: 1, answered: false, onResolve: null, lastTickSecond: -1
  };
  let currentQuestionData = null;

  U.openQuestion = (questionData, onResolve) => {
    currentQuestionData = questionData;
    Q.answered = false;
    Q.onResolve = onResolve;
    Q.total = questionData.time * 1000;
    Q.tLeft = Q.total;
    Q.lastTickSecond = -1;

    $('q-tag').textContent = questionData.interrupt
      ? '\u2620 INTERUPSI \u2014 PROTOKOL TINGGI'
      : (questionData.purpose && questionData.purpose.name
        ? 'DEKRIPSI \u00B7 ' + questionData.purpose.name.toUpperCase()
        : 'DEKRIPSI DIPERLUKAN');
    $('q-prompt').textContent = questionData.q.prompt;

    const steps = $('q-steps');
    if (questionData.analyze) {
      steps.textContent = questionData.q.steps.join('\n');
      steps.hidden = false;
    } else {
      steps.hidden = true;
    }

    const opts = $('q-options');
    opts.innerHTML = '';
    questionData.q.options.forEach(opt => {
      const btn = el('button', 'q-opt', String(opt));
      btn.addEventListener('click', () => answer(opt, btn));
      opts.appendChild(btn);
    });

    $('q-feedback').hidden = true;
    $('q-hint').disabled = questionData.analyze;
    $('q-giveup').disabled = false;
    $('modal-question').hidden = false;
    startTimer();
  };

  function startTimer() {
    stopTimer();
    const fill = $('q-timerfill'), num = $('q-time');
    const t0 = performance.now();
    timerInt = setInterval(() => {
      const elapsed = performance.now() - t0;
      Q.tLeft = Math.max(0, Q.total - elapsed);
      const frac = Q.tLeft / Q.total;
      fill.style.width = (frac * 100) + '%';
      const secLeft = Math.ceil(Q.tLeft / 1000);
      num.textContent = secLeft;
      const urgent = Q.tLeft <= 5000;
      fill.classList.toggle('urgent', urgent);
      num.classList.toggle('urgent', urgent);
      if (urgent && secLeft !== Q.lastTickSecond && secLeft > 0) { Q.lastTickSecond = secLeft; CW.audio.fx.tick(); }
      if (Q.tLeft <= 0) answer(null, null, true);
    }, 100);
  }
  function stopTimer() { if (timerInt) { clearInterval(timerInt); timerInt = null; } }

  function answer(choice, btn, timedOut) {
    if (Q.answered) return;
    Q.answered = true;
    stopTimer();
    $('q-giveup').disabled = true;
    $('q-hint').disabled = true;
    document.querySelectorAll('.q-opt').forEach(b => {
      b.disabled = true;
      const isAnswer = CW.math.check(activeQuestion(), b.textContent);
      if (isAnswer) b.classList.add('correct');
      else if (b === btn) b.classList.add('wrong');
      else b.classList.add('dimmed');
    });
    const correct = !timedOut && btn != null && CW.math.check(activeQuestion(), String(choice));
    const fb = $('q-feedback');
    fb.hidden = false;
    if (correct) {
      fb.className = 'q-feedback good';
      fb.textContent = '\u2713 DEKRIPSI VALID \u2014 mengeksekusi aksi\u2026';
      CW.audio.fx.correct();
    } else {
      fb.className = 'q-feedback bad';
      fb.textContent = (timedOut ? '\u23F1 WAKTU HABIS!' : '\u2717 SALAH!') +
        ' Jawaban benar: ' + activeQuestion().answer + '\n' + activeQuestion().steps.join('\n');
      CW.audio.fx.wrong();
    }
    const correctMillis = correct ? 950 : 2600;
    setTimeout(() => {
      $('modal-question').hidden = true;
      Q.onResolve && Q.onResolve(correct, choice, timedOut);
    }, correctMillis);
  }

  function activeQuestion() { return currentQuestionData.q; }

  U.onHint = () => {
    if (!currentQuestionData) return;
    CW.audio.ui.click();
    const fb = $('q-feedback');
    fb.hidden = false;
    fb.className = 'q-feedback good';
    fb.textContent = '\uD83D\uDCA1 ' + currentQuestionData.q.hint;
  };

  U.onGiveUp = () => {
    if (Q.answered) return;
    CW.audio.ui.click();
    answer(null, null, true);
  };

  /* ================= Result modal ================= */
  U.showResult = html => {
    $('result-box').innerHTML = html;
    $('modal-result').hidden = false;
  };
  U.hideResult = () => { $('modal-result').hidden = true; };

  window.CW = window.CW || {};
  window.CW.ui = U;
})();
