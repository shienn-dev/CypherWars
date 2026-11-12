/* ============================================================
   CIPHER WARS - Battle Engine
   Turn-based combat state machine. Pure logic + callbacks;
   the UI layer (ui.js) renders and drives it.
   Exposes global: CW.battle
   ============================================================ */
(function () {
  'use strict';
  const B = {};
  const data = () => window.CW.data;
  const math = () => window.CW.math;

  /* ---------- Player derived stats ---------- */
  B.playerMaxHp = lvl => data().playerBase.hp + (lvl - 1) * data().playerBase.hpPerLevel;

  B.unlockedAbilities = lvl => data().abilities.filter(a => a.unlock <= lvl);

  /* ---------- Factory ---------- */
  B.create = (stage, playerState) => {
    const waves = (stage.waves && stage.waves.length) ? stage.waves.slice() : [stage.enemy];
    const b = {
      stage,
      waves,
      waveIndex: 0,
      enemyDef: null,
      enemy: null,
      structures: { firewall: 0, turret: 0, reactor: 0, medbay: 0 },
      player: {
        name: 'OPERATIVE', maxHp: B.playerMaxHp(playerState.level),
        hp: B.playerMaxHp(playerState.level),
        shield: 0, energy: data().playerBase.startEnergy,
        energyMax: data().playerBase.energyMax,
        combo: 0, bestCombo: 0, shards: 0,
        poison: 0, poisonDmg: 0, slow: 0, overclock: 0,
        analyzeReady: false
      },
      turn: 1, phase: 'player',       // player | question | enemy | over
      question: null, lastResult: null, log: []
    };
    B.spawnEnemy(b, waves[0]);
    B.log(b, 'sys', 'Menghubungi ' + b.enemy.name + ' \u2014 ' + b.enemy.title);
    B.log(b, 'sys', b.enemyDef.intro);
    b.enemy.nextMove = B.pickEnemyMove(b);   // first telegraph
    return b;
  };

  /* ---------- Waves (Defense Protocol) ---------- */
  B.spawnEnemy = (b, key) => {
    const def = data().enemies[key];
    b.enemyDef = def;
    b.enemy = {
      key, name: def.name, title: def.title,
      svg: def.svg, color: def.color,
      hp: def.hp, maxHp: def.hp, shield: 0,
      chargingUlt: null,      // move object when ult is telegraphed
      nextMove: null,         // telegraphed intent for the upcoming enemy turn
      reflectTurns: 0,        // turns of damage reflection remaining
      enrage: 0               // percentage damage bonus (permanent this fight)
    };
    return b.enemy;
  };

  B.waveInfo = b => ({ current: b.waveIndex + 1, total: b.waves.length, name: b.enemy.name });

  /* Advance to the next wave. Returns true if a new enemy spawned, false if
     the sector is cleared. Resets only enemy-side state, never player state. */
  B.nextWave = b => {
    if (b.waveIndex + 1 >= b.waves.length) return false;
    b.waveIndex++;
    B.spawnEnemy(b, b.waves[b.waveIndex]);
    B.log(b, 'bad', 'GELOMBANG ' + (b.waveIndex + 1) + '/' + b.waves.length + ' \u2014 ' + b.enemy.name + ' menerjang!');
    b.enemy.nextMove = B.pickEnemyMove(b);
    return true;
  };

  /* ---------- Logging ---------- */
  B.log = (b, type, msg) => { b.log.push({ type, msg }); };

  /* ---------- Enemy AI ----------
     Picks next move by weighted random, modified by behavior profile. */
  B.pickEnemyMove = b => {
    const def = b.enemyDef;
    let moves = def.moves.slice();

    switch (def.ai) {
      case 'defensive':
      case 'reflector':
        if (b.enemy.hp < b.enemy.maxHp * 0.5 && b.enemy.shield < 10)
          moves = moves.filter(m => m.type === 'shield' || m.type === 'attack');
        break;
      case 'toxic':
        if (b.player.poison <= 0) moves = moves.filter(m => m.type !== 'heal');
        else if (b.enemy.hp > b.enemy.maxHp * 0.4) moves = moves.filter(m => m.type !== 'heal');
        break;
      case 'adaptive': {
        // Adaptive: heals when wounded, drains when player is energy-rich
        if (b.enemy.hp < b.enemy.maxHp * 0.35) moves.push({ type: 'heal', value: 20, weight: 6 });
        if (b.player.energy >= 4) moves.push({ type: 'drain', value: 3, weight: 5 });
        break;
      }
      case 'tactician':
        if (b.enemy.hp < b.enemy.maxHp * 0.45 && b.enemy.shield <= 0)
          moves = moves.filter(m => m.type === 'shield');
        break;
      case 'aggressive':
        // Presses the attack when the operative is wounded, drops the shield option.
        if (b.player.hp < b.player.maxHp * 0.4)
          moves = moves.filter(m => m.type === 'attack' || m.type === 'heavy');
        break;
      case 'trickster':
        // Reapplies time pressure only when the timer debuff has lapsed.
        if (b.player.slow > 0) moves = moves.filter(m => m.type !== 'slow');
        break;
      case 'disruptor':
        // Targets hoarded combo/energy; skips its disruption moves when there is nothing to break.
        if (b.player.combo < 2) moves = moves.filter(m => m.type !== 'combo');
        if (b.player.energy < 4) moves = moves.filter(m => m.type !== 'drain');
        break;
      case 'berserker':
        // Injured midboss escalates: a stronger self-charged ultimate comes online.
        if (b.enemy.hp < b.enemy.maxHp * 0.45) {
          const ult = def.moves.find(m => m.type === 'ult');
          if (ult) moves.push({ type: 'ult', value: ult.value + 6, weight: 3 });
        }
        break;
      case 'boss':
        if (b.enemy.hp < b.enemy.maxHp * 0.3) {
          const ult = def.moves.find(m => m.type === 'ult');
          if (ult) moves.push({ type: 'ult', value: ult.value + 6, weight: 3 });
        }
        break;
    }
    // Boss/berserker never re-telegraph while an ult is already charging
    if (b.enemy.chargingUlt) moves = moves.filter(m => m.type !== 'ult');
    // Safety: a behavior profile must never starve the enemy of options.
    if (!moves.length) moves = def.moves.slice();

    const total = moves.reduce((s, m) => s + m.weight, 0);
    let roll = math().random() * total;
    for (const m of moves) { roll -= m.weight; if (roll <= 0) return m; }
    return moves[0];
  };

  /* ---------- Damage pipeline (enemy -> player) ---------- */
  function damagePlayer(b, raw) {
    let dmg = raw;
    if (b.player.shield > 0) {
      const absorbed = Math.min(b.player.shield, dmg);
      b.player.shield -= absorbed;
      dmg -= absorbed;
      B.log(b, 'info', 'SHIELD-mu menyerap ' + absorbed + ' damage.');
    }
    if (dmg > 0) b.player.hp = Math.max(0, b.player.hp - dmg);
    return { dealt: dmg, absorbed: raw - dmg };
  }

  function damageEnemy(b, raw, pierce) {
    let dmg = raw;
    if (!pierce && b.enemy.shield > 0) {
      const absorbed = Math.min(b.enemy.shield, dmg);
      b.enemy.shield -= absorbed;
      dmg -= absorbed;
      B.log(b, 'info', 'Shield ' + b.enemy.name + ' menyerap ' + absorbed + ' damage.');
    }
    if (dmg > 0) b.enemy.hp = Math.max(0, b.enemy.hp - dmg);
    let reflected = 0;
    // Mirror: while active, part of the hit bounces back (pierce bypasses it).
    if (!pierce && b.enemy.reflectTurns > 0 && dmg > 0) {
      const back = Math.round(dmg * 0.4);
      if (back > 0) {
        const pr = damagePlayer(b, back);
        reflected = pr.dealt;
      }
    }
    return { dealt: dmg, absorbed: raw - dmg, reflected };
  }

  /* ---------- Base structures (Defense Protocol) ---------- */
  B.buildCost = (b, def) => def.cost * (b.structures[def.id] + 1);
  B.canBuild = (b, def) =>
    b.structures[def.id] < def.maxLvl && b.player.shards >= B.buildCost(b, def);

  B.buildInfo = b => data().structures.map(def => {
    const level = b.structures[def.id];
    return {
      def, level, max: def.maxLvl,
      cost: B.buildCost(b, def),
      maxed: level >= def.maxLvl,
      affordable: b.player.shards >= B.buildCost(b, def)
    };
  });

  /* Commit a build/upgrade after its decryption succeeded. */
  B.applyBuild = (b, def) => {
    if (!B.canBuild(b, def)) return false;
    b.player.shards -= B.buildCost(b, def);
    b.structures[def.id]++;
    B.log(b, 'good', def.name + ' tingkat ' + b.structures[def.id] + ' dibangun!');
    return true;
  };

  B.awardKill = b => {
    const s = data().shardPerKill;
    b.player.shards += s;
    return s;
  };

  /* ---------- Question generation ---------- */
  B.makeQuestion = (b, playerState, opts) => {
    opts = opts || {};
    let tier = Math.max(1, Math.min(5, b.stage.tier + (opts.tierBonus || 0)));
    const q = math().generate(tier, opts.kind);
    const p = b.player;
    let time = math().baseTime(tier) * b.stage.timeMod;
    if (p.slow > 0) time *= 0.65;
    time = Math.max(8, Math.round(time));
    b.question = {
      q,
      time,
      analyze: p.analyzeReady,     // consume analyze when question created
      interrupt: opts.isInterrupt || false,
      purpose: opts.purpose || null
    };
    if (p.analyzeReady) { p.analyzeReady = false; B.log(b, 'good', 'ANALISIS aktif: langkah penyelesaian ditampilkan.'); }
    return b.question;
  };

  /* ---------- Resolve player action after question ---------- */
  B.strikeDamage = (b, ab) => {
    const comboMult = 1 + Math.min(b.player.combo, data().maxComboBonus) * 0.15;
    const base = (ab && ab.value) ? ab.value : 10 + b.player.combo * 2;
    return Math.round(base * comboMult);
  };

  /* Execute the pending action with the chosen answer.
     Returns events[] for the UI to animate. */
  B.answer = (b, playerState, choice, timedOut) => {
    if (!b.question) return [];
    const q = b.question;
    const correct = !timedOut && math().check(q.q, choice);
    b.question = null;
    const events = [];

    if (!correct) {
      b.player.combo = 0;
      playerState.stats.wrong++;
      B.log(b, 'bad', timedOut ? 'WAKTU HABIS! Dekripsi gagal.' : 'DEKRIPSI SALAH! Jawaban yang benar: ' + q.q.answer);
      // Failed decrypt opens a window for the enemy
      const move = B.pickEnemyMove(b);
      b.enemy.nextMove = null;   // old telegraph is consumed by the counter
      if (move.type !== 'ult') {
        events.push(...execEnemyMove(b, move, 'counter'));
      } else {
        b.enemy.chargingUlt = move;
        B.log(b, 'bad', b.enemy.name + ' memanfaatkan celah \u2014 ULTIMATE DIISI!');
        events.push({ kind: 'telegraph', move });
      }
      b.lastResult = 'fail';
      return events;
    }

    // Success: combo, energy gain, stats
    b.player.combo++;
    b.player.bestCombo = Math.max(b.player.bestCombo, b.player.combo);
    playerState.stats.correct++;
    if (b.player.combo > playerState.stats.bestCombo) playerState.stats.bestCombo = b.player.combo;
    if (data().comboBonusEnergy.includes(b.player.combo) && b.player.energy < b.player.energyMax) {
      b.player.energy++;
      events.push({ kind: 'energy', amount: 1, why: 'COMBO ' + b.player.combo });
    }
    B.log(b, 'good', 'DEKRIPSI BERHASIL! Combo x' + b.player.combo);
    events.push({ kind: 'correct', combo: b.player.combo });
    b.player.shards += data().shardPerCorrect;
    events.push({ kind: 'shard', amount: data().shardPerCorrect });

    // Interrupt: cancel telegraphed ult
    if (q.interrupt) {
      if (b.enemy.chargingUlt) {
        b.enemy.chargingUlt = null;
        B.log(b, 'good', 'INTERUPSI BERHASIL! Ultimate ' + b.enemy.name + ' dibatalkan.');
        events.push({ kind: 'interrupt' });
        const dmg = 8;
        const ev = damageEnemy(b, dmg, true);
        events.push({ kind: 'enemyHit', dealt: ev.dealt, absorbed: ev.absorbed, pierce: true });
      } else {
        B.log(b, 'info', 'Interupsi siap \u2014 tapi tidak ada ultimate yang diisi. Energi hangus.');
        events.push({ kind: 'fizzle', why: 'Tidak ada ultimate untuk dibatalkan.' });
      }
      b.lastResult = 'ok';
      return events;
    }

    // Execute the chosen ability
    if (q.purpose) events.push(...executeAbility(b, q.purpose));
    b.lastResult = 'ok';
    return events;
  };

  function executeAbility(b, ab) {
    const events = [];
    const p = b.player;
    switch (ab.type) {
      case 'attack': {
        const dmg = B.strikeDamage(b, ab);
        const ev = damageEnemy(b, dmg, !!ab.pierce);
        B.log(b, 'atk', ab.name + '! Damage ' + ev.dealt + (ab.pierce ? ' (menembus shield)' : '') + '.');
        events.push({ kind: 'enemyHit', dealt: ev.dealt, absorbed: ev.absorbed, pierce: !!ab.pierce, ability: ab.id });
        if (ev.reflected > 0) {
          B.log(b, 'bad', 'Perisai cermin memantulkan ' + ev.reflected + ' damage kembali padamu!');
          events.push({ kind: 'playerReflect', dealt: ev.reflected });
        }
        break;
      }
      case 'shield': {
        p.shield += ab.value;
        B.log(b, 'def', ab.name + ': SHIELD +' + ab.value + '.');
        events.push({ kind: 'playerShield', amount: ab.value });
        break;
      }
      case 'heal': {
        const healed = Math.min(ab.value, p.maxHp - p.hp);
        p.hp += healed;
        B.log(b, 'def', ab.name + ': memulihkan ' + healed + ' HP.');
        events.push({ kind: 'playerHeal', amount: healed });
        break;
      }
      case 'analyze': {
        p.analyzeReady = true;
        B.log(b, 'def', ab.name + ' diaktifkan.');
        events.push({ kind: 'analyze' });
        break;
      }
      case 'overclock': {
        p.overclock = ab.value;
        B.log(b, 'def', 'OVERLOCK: +' + ab.value + ' giliran energi ekstra.');
        events.push({ kind: 'overclock', turns: ab.value });
        break;
      }
    }
    return events;
  }

  /* ---------- Enemy move execution (also used for counters) ---------- */
  function execEnemyMove(b, move, context) {
    const events = [];
    const name = b.enemy.name;
    switch (move.type) {
      case 'attack':
      case 'heavy': {
        const raw = Math.round(move.value * (1 + (b.enemy.enrage || 0) / 100));
        const ev = damagePlayer(b, raw);
        B.log(b, 'bad', name + ' menyerang: ' + raw + ' damage' + (ev.absorbed ? ' (' + ev.absorbed + ' diserap shield)' : '') + '.');
        events.push({ kind: 'playerHit', dealt: ev.dealt, absorbed: ev.absorbed, heavy: move.type === 'heavy' });
        break;
      }
      case 'shield': {
        b.enemy.shield += move.value;
        B.log(b, 'info', name + ' mengunci dirinya: SHIELD +' + move.value + '.');
        events.push({ kind: 'enemyShield', amount: move.value });
        break;
      }
      case 'heal': {
        const healed = Math.min(move.value, b.enemy.maxHp - b.enemy.hp);
        b.enemy.hp += healed;
        B.log(b, 'info', name + ' memperbaiki diri: +' + healed + ' HP.');
        events.push({ kind: 'enemyHeal', amount: healed });
        break;
      }
      case 'drain': {
        const taken = Math.min(move.value, b.player.energy);
        b.player.energy -= taken;
        B.log(b, 'bad', name + ' mencuri ' + taken + ' energi-mu!');
        events.push({ kind: 'drain', amount: taken });
        break;
      }
      case 'poison': {
        b.player.poison = 3;
        b.player.poisonDmg = move.value || 5;
        B.log(b, 'bad', name + ' menyuntik RACUN DIGITAL (3 giliran, \u2212' + b.player.poisonDmg + ' HP/turn).');
        events.push({ kind: 'poison', dmg: b.player.poisonDmg });
        break;
      }
      case 'slow': {
        b.player.slow = move.value;
        B.log(b, 'bad', name + ' memutar waktu: TIMER DEKRIPSI dipangkas ' + move.value + ' giliran!');
        events.push({ kind: 'slow', turns: move.value });
        break;
      }
      case 'combo': {
        if (b.player.combo > 0) B.log(b, 'bad', name + ' MEMUTUS RANTAI! Combo x' + b.player.combo + ' hilang.');
        b.player.combo = 0;
        const ev = damagePlayer(b, move.value);
        events.push({ kind: 'comboBreak', dealt: ev.dealt, absorbed: ev.absorbed });
        break;
      }
      case 'ult': {
        // Should only be reached when landing a previously telegraphed ult
        const raw = Math.round(move.value * (1 + (b.enemy.enrage || 0) / 100));
        const ev = damagePlayer(b, raw);
        B.log(b, 'bad', 'PROTOKOL PEMBERSIHAN! ' + name + ' melepas ULTIMATE: ' + raw + ' damage!');
        events.push({ kind: 'playerHit', dealt: ev.dealt, absorbed: ev.absorbed, ult: true });
        break;
      }
      case 'reflect': {
        b.enemy.reflectTurns = move.value;
        B.log(b, 'info', name + ' mengaktifkan PERISAI CERMIN ' + move.value + ' giliran \u2014 serangan balik padamu!');
        events.push({ kind: 'enemyReflect', turns: move.value });
        break;
      }
      case 'enrage': {
        b.enemy.enrage += move.value;
        B.log(b, 'bad', name + ' mengamuk! Damage musuh +' + move.value + '% (total +' + b.enemy.enrage + '%).');
        events.push({ kind: 'enemyEnrage', amount: move.value });
        break;
      }
      case 'cleanse': {
        const hadShield = b.player.shield;
        const hadBuff = (b.player.overclock > 0 ? 1 : 0) + (b.player.analyzeReady ? 1 : 0);
        b.player.shield = 0;
        b.player.overclock = 0;
        b.player.analyzeReady = false;
        B.log(b, 'bad', name + ' memancarkan PEMBERSIH: ' + hadShield + ' shield & ' + hadBuff + ' buff dihapus!');
        events.push({ kind: 'cleanse', shield: hadShield, buffs: hadBuff });
        break;
      }
    }
    return events;
  }

  /* ---------- Turn flow (called by UI) ---------- */

  /* End of player phase (player ended turn or finished action).
     Runs enemy turn + start-of-player-turn upkeep.
     Returns events[]. */
  B.endPlayerPhase = b => {
    const events = [];
    b.phase = 'enemy';

    // Enemy acts: land charging ult or execute the telegraphed move
    if (b.enemy.chargingUlt) {
      const move = b.enemy.chargingUlt;
      b.enemy.chargingUlt = null;
      b.enemy.nextMove = null;
      events.push({ kind: 'enemyAct', move, ult: true });
      events.push(...execEnemyMove(b, move, 'ult'));
    } else {
      const move = b.enemy.nextMove || B.pickEnemyMove(b);
      b.enemy.nextMove = null;
      if (move.type === 'ult') {
        b.enemy.chargingUlt = move;
        B.log(b, 'bad', b.enemy.name + ' MENGISI PROTOKOL PEMBERSIHAN! Interupsi sebelum giliran berikutnya!');
        events.push({ kind: 'telegraph', move });
      } else {
        events.push({ kind: 'enemyAct', move });
        events.push(...execEnemyMove(b, move, 'normal'));
      }
    }
    return events;
  };

  /* Start of next player turn: upkeep (energy, statuses). Returns events[]. */
  B.startPlayerTurn = b => {
    const events = [];
    const p = b.player;
    b.turn++;
    b.phase = 'player';

    if (p.poison > 0) {
      p.poison--;
      const tick = p.poisonDmg || 5;
      p.hp = Math.max(0, p.hp - tick);
      B.log(b, 'bad', 'Racun digital menggerogoti sistem: \u2212' + tick + ' HP.');
      events.push({ kind: 'poisonTick', amount: tick, turnsLeft: p.poison });
      if (p.hp <= 0) { b.phase = 'over'; events.push({ kind: 'battleOver', win: false, why: 'racun' }); return events; }
    }
    if (p.slow > 0) { p.slow--; events.push({ kind: 'statusTick', status: 'slow' }); }
    if (p.overclock > 0) { p.overclock--; }
    if (b.enemy.reflectTurns > 0) b.enemy.reflectTurns--;

    // Base structures upkeep — values come from data().structures[].perLevel
    const st = b.structures;
    const sDef = data().structures.reduce((m, s) => { m[s.id] = s; return m; }, {});
    if (st.firewall > 0) {
      const amt = st.firewall * sDef.firewall.perLevel;
      p.shield += amt;
      events.push({ kind: 'playerShield', amount: amt, source: 'firewall' });
    }
    if (st.medbay > 0) {
      const healed = Math.min(st.medbay * sDef.medbay.perLevel, p.maxHp - p.hp);
      if (healed > 0) { p.hp += healed; events.push({ kind: 'playerHeal', amount: healed, source: 'medbay' }); }
    }

    // Energy income
    let gain = data().playerBase.energyPerTurn + (p.overclock > 0 ? 1 : 0) + st.reactor * sDef.reactor.perLevel;
    const before = p.energy;
    p.energy = Math.min(p.energyMax, p.energy + gain);
    if (p.energy > before) events.push({ kind: 'energy', amount: p.energy - before, why: 'giliran' });

    // Turret: passive attack on the current enemy
    if (st.turret > 0 && b.enemy.hp > 0) {
      const dmg = st.turret * sDef.turret.perLevel;
      const ev = damageEnemy(b, dmg, true);
      B.log(b, 'atk', 'Turret Kode menembak ' + b.enemy.name + ': ' + ev.dealt + ' damage.');
      events.push({ kind: 'turretShot', dealt: ev.dealt, absorbed: ev.absorbed });
    }

    // Telegraph the enemy's next move for this turn's intent display
    b.enemy.nextMove = b.enemy.chargingUlt ? null : B.pickEnemyMove(b);
    return events;
  };

  B.spendEnergy = (b, amount) => {
    if (b.player.energy < amount) return false;
    b.player.energy -= amount;
    return true;
  };

  B.enemyDead = b => b.enemy.hp <= 0;
  B.playerDead = b => b.player.hp <= 0;

  window.CW = window.CW || {};
  window.CW.battle = B;
})();
