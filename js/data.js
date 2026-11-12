/* ============================================================
   CIPHER WARS - Game Data
   Enemies (with distinct AI behaviors), campaign stages,
   player abilities. Exposes global: CW.data
   ============================================================ */
(function () {
  'use strict';
  const D = {};

  /* ---------- Enemy moves ----------
     Every move is a real, executable intent. Types:
       attack  - flat damage
       heavy   - big damage, longer telegraph
       shield  - gains shield points
       heal    - restores own HP
       drain   - steals player energy
       poison  - applies DoT to player (turns)
       slow    - applies timer debuff to player (turns)
       combo   - resets player combo & small damage
       ult     - telegraphed ultimate (massive damage, 1 turn warning) */

  D.enemies = {
    sentinel: {
      name: 'SENTINEL-01', title: 'Penjaga Gerbang',
      hp: 60, svg: 'sentinel', color: '#4dd8ff',
      ai: 'aggressive', tier: 1, reward: 40,
      intro: 'Protokol dasar terdeteksi. Hitung komposisi fungsinya untuk menembus!',
      moves: [
        { type: 'attack', value: 7, weight: 6 },
        { type: 'attack', value: 10, weight: 3 },
        { type: 'shield', value: 6, weight: 1 }
      ]
    },
    hyena: {
      name: 'BYTE-HYENA', title: 'Pemangsa Data',
      hp: 70, svg: 'hyena', color: '#ffd166',
      ai: 'trickster', tier: 2, reward: 55,
      intro: 'Ia memutar waktu dekripsi-mu. Waspadai serangan PEMUTAR WAKTU!',
      moves: [
        { type: 'attack', value: 8, weight: 5 },
        { type: 'slow', value: 2, weight: 3 },   // turns of slow debuff
        { type: 'attack', value: 12, weight: 2 }
      ]
    },
    aegis: {
      name: 'AEGIS-WALL', title: 'Benteng Reflektif',
      hp: 85, svg: 'aegis', color: '#8be9a0',
      ai: 'defensive', tier: 2, reward: 65,
      intro: 'Kulitnya adalah perisai. Hancurkan pertahanannya sebelum menyerang.',
      moves: [
        { type: 'attack', value: 9, weight: 4 },
        { type: 'shield', value: 14, weight: 4 },
        { type: 'cleanse', value: 0, weight: 2 },
        { type: 'heavy', value: 16, weight: 2 }
      ]
    },
    nullsnake: {
      name: 'NULLSNAKE', title: 'Pemutus Rantai',
      hp: 80, svg: 'nullsnake', color: '#c792ff',
      ai: 'disruptor', tier: 3, reward: 75,
      intro: 'Ular ini memutus rantai komposisi-mu. Jangan biarkan combo-mu patah!',
      moves: [
        { type: 'attack', value: 10, weight: 4 },
        { type: 'combo', value: 6, weight: 3 },   // resets combo + chip damage
        { type: 'cleanse', value: 0, weight: 2 }, // strips player shield & buffs
        { type: 'drain', value: 2, weight: 3 }    // steals energy
      ]
    },
    rex: {
      name: 'KALKULUS REX', title: 'Raja Derivatif \u2605 MIDBOSS',
      hp: 120, svg: 'rex', color: '#ff8f5e',
      ai: 'berserker', tier: 3, reward: 110, boss: true,
      intro: 'BOSS! Ia mengisi pukulan dahsyat \u2014 lihat telegraf-nya dan bersiap!',
      moves: [
        { type: 'attack', value: 9, weight: 4 },
        { type: 'heavy', value: 18, weight: 3 },
        { type: 'enrage', value: 25, weight: 2 }, // +25% damage for the rest of the fight
        { type: 'ult', value: 26, weight: 2 }     // telegraphs, lands next turn
      ]
    },
    virus: {
      name: 'VIRUS-9', title: 'MUTASI-9',
      hp: 95, svg: 'virus', color: '#ff5e8a',
      ai: 'toxic', tier: 4, reward: 95,
      intro: 'Racun digital mengalir dalam darahmu. Segera akhiri pertarungan!',
      moves: [
        { type: 'attack', value: 9, weight: 4 },
        { type: 'poison', value: 5, weight: 3 },  // dmg/turn for 3 turns
        { type: 'heal', value: 14, weight: 2 }
      ]
    },
    mirror: {
      name: 'MIRRORBOT', title: 'Pantulan Sempurna',
      hp: 90, svg: 'mirror', color: '#5ee7ff',
      ai: 'reflector', tier: 4, reward: 100,
      intro: 'Setiap serangan tanpa penetrasi akan dipantulkan kembali padamu.',
      moves: [
        { type: 'attack', value: 11, weight: 4 },
        { type: 'shield', value: 12, weight: 4 },
        { type: 'reflect', value: 3, weight: 3 }, // 3 turns reflecting 40% damage
        { type: 'heavy', value: 15, weight: 2 }
      ]
    },
    fox: {
      name: 'QUANTUM FOX', title: 'Penipu Kuantum',
      hp: 105, svg: 'fox', color: '#ffd166',
      ai: 'adaptive', tier: 4, reward: 115,
      intro: 'Perilakunya berubah mengikuti kelemahanmu. Baca polanya.',
      moves: [
        { type: 'attack', value: 12, weight: 4 },
        { type: 'heal', value: 16, weight: 2 },
        { type: 'heavy', value: 19, weight: 3 },
        { type: 'drain', value: 2, weight: 2 }
      ]
    },
    omega: {
      name: 'OMEGA-WARD', title: 'Warden Kedaulatan',
      hp: 125, svg: 'omega', color: '#8be9fd',
      ai: 'tactician', tier: 5, reward: 130,
      intro: 'Warden tertinggi. Ia menyeimbangkan serangan dan pertahanan sempurna.',
      moves: [
        { type: 'attack', value: 12, weight: 4 },
        { type: 'shield', value: 16, weight: 3 },
        { type: 'heavy', value: 20, weight: 2 },
        { type: 'ult', value: 30, weight: 1 },
        { type: 'poison', value: 5, weight: 1 }
      ]
    },
    nexus: {
      name: 'NEXUS PRIME', title: 'Inti Sempurna \u2605 BOSS AKHIR',
      hp: 170, svg: 'nexus', color: '#ff5ef1',
      ai: 'boss', tier: 5, reward: 200, boss: true,
      intro: 'BOSS AKHIR! Guardian tertua. Kegelapan seluruh jaringan berpusat di sini.',
      moves: [
        { type: 'attack', value: 13, weight: 4 },
        { type: 'heavy', value: 22, weight: 3 },
        { type: 'shield', value: 18, weight: 2 },
        { type: 'poison', value: 6, weight: 1 },
        { type: 'enrage', value: 30, weight: 1 }, // +30% damage when it ramps up
        { type: 'ult', value: 34, weight: 2 },
        { type: 'drain', value: 3, weight: 1 }
      ]
    }
  };

  D.stages = [
    { id: 1,  enemy: 'sentinel', tier: 1, timeMod: 1.0,  name: 'Gerbang Perimeter', waves: ['sentinel'] },
    { id: 2,  enemy: 'hyena',    tier: 2, timeMod: 0.95, name: 'Padang Data',       waves: ['hyena'] },
    { id: 3,  enemy: 'aegis',    tier: 2, timeMod: 0.95, name: 'Benteng Aegis',     waves: ['aegis'] },
    { id: 4,  enemy: 'nullsnake',tier: 3, timeMod: 0.9,  name: 'Sarang Null',       waves: ['nullsnake', 'hyena'] },
    { id: 5,  enemy: 'rex',      tier: 3, timeMod: 0.9,  name: 'Tahta Kalkulus',    waves: ['rex'] },
    { id: 6,  enemy: 'virus',    tier: 4, timeMod: 0.85, name: 'Zona Mutasi',       waves: ['virus', 'nullsnake'] },
    { id: 7,  enemy: 'mirror',   tier: 4, timeMod: 0.85, name: 'Lorong Cermin',     waves: ['mirror', 'aegis'] },
    { id: 8,  enemy: 'fox',      tier: 4, timeMod: 0.8,  name: 'Hutan Kuantum',     waves: ['fox', 'hyena'] },
    { id: 9,  enemy: 'omega',    tier: 5, timeMod: 0.8,  name: 'Menara Omega',      waves: ['omega', 'mirror'] },
    { id: 10, enemy: 'nexus',    tier: 5, timeMod: 0.75, name: 'Inti NEXUS',        waves: ['nexus', 'rex'] }
  ];

  /* ---------- Player abilities ----------
     cost in energy; dmg/heal/shield in points; unlock by player level.
     Every ability (except End Turn) triggers a decryption question. */
  D.abilities = [
    {
      id: 'strike', name: 'Serang', icon: 'sword', cost: 0, unlock: 1,
      desc: 'Serangan dasar. Damage naik seiring COMBO.', type: 'attack'
    },
    {
      id: 'guard', name: 'Perisai Darurat', icon: 'shield', cost: 1, unlock: 1,
      desc: 'Membentuk firewall: +10 SHIELD.', type: 'shield', value: 10
    },
    {
      id: 'analyze', name: 'Analisis', icon: 'eye', cost: 1, unlock: 1,
      desc: 'Scanner: pertanyaan berikutnya menampilkan langkah penyelesaian.', type: 'analyze'
    },
    {
      id: 'quantum', name: 'Serangan Kuantum', icon: 'bolt', cost: 2, unlock: 2,
      desc: 'Damage 22 + bonus combo.', type: 'attack', value: 22, combo: 3
    },
    {
      id: 'pierce', name: 'Penembus Kode', icon: 'pierce', cost: 3, unlock: 3,
      desc: 'Damage 26, MENGABAIKAN shield musuh.', type: 'attack', value: 26, pierce: true
    },
    {
      id: 'regen', name: 'Regenerasi', icon: 'heart', cost: 2, unlock: 4,
      desc: 'Nanomedik: pulihkan 22 HP.', type: 'heal', value: 22
    },
    {
      id: 'overclock', name: 'Overclock', icon: 'chip', cost: 2, unlock: 5,
      desc: '+1 energi ekstra setiap giliran, selama 3 giliran.', type: 'overclock', value: 3
    },
    {
      id: 'interrupt', name: 'Interupsi', icon: 'cut', cost: 2, unlock: 5,
      desc: 'Batalkan SERANGAN ULTIMATE musuh yang sedang diisi. (Pertanyaan lebih sulit.)', type: 'interrupt'
    },
    {
      id: 'execute', name: 'Eksekusi Total', icon: 'skull', cost: 5, unlock: 7,
      desc: 'Damage 40 + bonus combo. Sanggulan terakhir melawan boss.', type: 'attack', value: 40, combo: 4
    }
  ];

  /* ---------- Base structures (Defense Protocol) ----------
     Built between waves with Data Shards. Each build/upgrade costs a
     decryption question to complete. Levels persist for the whole sector. */
  D.structures = [
    {
      id: 'firewall', name: 'Firewall', icon: 'shield', cost: 6, maxLvl: 3, perLevel: 4,
      desc: 'Regenerasi +4 SHIELD setiap giliran per level.'
    },
    {
      id: 'turret', name: 'Turret Kode', icon: 'bolt', cost: 8, maxLvl: 3, perLevel: 5,
      desc: 'Menembak musuh +5 damage otomatis setiap giliran per level.'
    },
    {
      id: 'reactor', name: 'Reaktor', icon: 'chip', cost: 7, maxLvl: 2, perLevel: 1,
      desc: '+1 energi tambahan setiap giliran per level.'
    },
    {
      id: 'medbay', name: 'Nanomedik', icon: 'heart', cost: 7, maxLvl: 3, perLevel: 4,
      desc: 'Memulihkan +4 HP setiap giliran per level.'
    }
  ];

  /* ---------- Progression ---------- */
  D.shardPerCorrect = 2;    // Data Shards earned per correct decryption
  D.shardPerKill = 5;       // bonus Shards per enemy taken down
  D.playerBase = { hp: 90, hpPerLevel: 6, energyMax: 7, energyPerTurn: 1, startEnergy: 3 };
  D.xpForLevel = lvl => 60 + (lvl - 1) * 45;   // XP needed to go from lvl to lvl+1
  D.comboBonusEnergy = [3, 5];                  // combo thresholds granting +1 energy
  D.maxComboBonus = 5;                          // combo multiplier cap

  window.CW = window.CW || {};
  window.CW.data = D;
})();
