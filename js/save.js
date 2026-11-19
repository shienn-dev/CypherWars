/* ============================================================
   CIPHER WARS - Save System (localStorage)
   Exposes global: CW.save
   ============================================================ */
(function () {
  'use strict';
  const KEY = 'cipherwars_save_v1';
  const S = {};

  function fresh() {
    return {
      version: 2,
      xp: 0,
      level: 1,
      operative: 'katalis',
      unlockedStage: 1,        // highest stage id available to play
      sound: true,
      stats: { wins: 0, losses: 0, correct: 0, wrong: 0, bestCombo: 0 },
      seenIntro: false,
      clearedFinal: false
    };
  }

  S.load = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      const data = JSON.parse(raw);
      const state = Object.assign(fresh(), data, {
        stats: Object.assign(fresh().stats, data.stats || {})
      });
      if (data.version === 1) {
        state.version = 2;
        state.operative = 'katalis';
        S.persist(state);
      }
      return state;
    } catch (e) { return fresh(); }
  };

  S.persist = state => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { /* storage unavailable — game still playable in-session */ }
  };

  S.reset = () => {
    try { localStorage.removeItem(KEY); } catch (e) {}
    return fresh();
  };

  /* Add XP; returns {level, leveledUp, levelsGained} — mutates state. */
  S.grantXp = (state, amount) => {
    state.xp += amount;
    let gained = 0;
    while (state.xp >= xpNeeded(state.level)) {
      state.xp -= xpNeeded(state.level);
      state.level++;
      gained++;
    }
    return { level: state.level, leveledUp: gained > 0, levelsGained: gained };
  };

  function xpNeeded(lvl) {
    return window.CW.data.xpForLevel(lvl);
  }
  S.xpNeeded = xpNeeded;

  window.CW = window.CW || {};
  window.CW.save = S;
})();
