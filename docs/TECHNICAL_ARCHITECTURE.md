# TECHNICAL ARCHITECTURE — Cipher Wars

## Stack
Vanilla JavaScript (ES5-ish IIFE, `'use strict'`), HTML, CSS. **Tanpa build step, tanpa
bundler, tanpa dependency runtime.** Satu-satunya dev-dependency: `jsdom` (untuk E2E).

## Struktur berkas
```
index.html            markup semua layar & modal; memuat skrip berurutan
css/style.css         tema cyber-terminal, animasi, responsif
js/math.js            mesin polinom eksak + generator soal
js/data.js            data gameplay (musuh, sektor, struktur, ability, progresi)
js/audio.js           SFX WebAudio sintetis
js/save.js            localStorage + kurva XP
js/battle.js          state machine pertarungan (murni, tanpa DOM)
js/ui.js              render + input DOM
js/main.js            orkestrasi alur + animasi event
test/lint.js          cek sintaks
test/qa.js            stress test logika (Node)
test/e2e.js           wiring E2E (jsdom + server statis internal)
.github/workflows/ci.yml
```

Urutan muat skrip di `index.html`: `math → data → audio → save → battle → ui → main`.

## Global `window.CW`
Setiap modul adalah IIFE yang menempel ke satu namespace:
`CW.math`, `CW.data`, `CW.audio`, `CW.save`, `CW.battle`, `CW.ui`, `CW.main`.

### `CW.math` (mesin matematika)
- Polinom = array koefisien menaik `[c0, c1, c2, ...]`.
- Operasi: `pAdd`, `pScale`, `pSub`, `pMul`, `pCompose`, `pEval` (Horner), `pIsZero`.
- Format: `formatPoly`, `formatFn`, `composeLabel`.
- RNG: `setRng(fn)`, `random()` — dipakai bersama battle agar deterministik.
- `generate(tier, kind?) → { kind, tier, prompt, answer, options[4], hint, steps[] }`.
- `check(q, choice)` — samakan string untuk `symbolic`, angka untuk lainnya.
- `baseTime(tier)` — anggaran waktu detik.

### `CW.data` (data gameplay)
`enemies`, `stages` (dengan `waves`), `structures`, `abilities`, `shardPerCorrect`,
`shardPerKill`, `playerBase`, `xpForLevel(lvl)`, `comboBonusEnergy`, `maxComboBonus`.

### `CW.battle` (logika murni, tanpa DOM)
- Factory & wave: `create(stage, playerState)`, `spawnEnemy`, `waveInfo`, `nextWave`.
- Soal: `makeQuestion(b, playerState, opts)` — `opts.purpose` (ability / `{type:'build'}`),
  `opts.tierBonus`, `opts.isInterrupt`.
- Resolusi: `answer(b, playerState, choice, timedOut) → events[]`.
- Benteng: `buildCost`, `canBuild`, `buildInfo`, `applyBuild`, `awardKill`.
- Giliran: `endPlayerPhase(b)`, `startPlayerTurn(b)`, `spendEnergy`.
- Lain: `playerMaxHp`, `unlockedAbilities`, `pickEnemyMove`, `strikeDamage`,
  `enemyDead`, `playerDead`, `log(b, type, msg)`.

### `CW.ui` (render + input)
`showScreen`, `toast`, `icons`, `glyphs`, `renderMap`, `renderCodex`,
`bindBattle`, `renderBattle`, `updateHUD`, `renderStructures`, `refreshLog`, `renderActions`,
`setActionsLocked`, `openBuild/closeBuild/renderBuildList`, `fx.*`,
`openQuestion/onHint/onGiveUp`, `showResult/hideResult`,
`openPractice/practiceNew/practiceShowSteps/practiceNext`,
`openTutorial/tutorialNext/tutorialPrev`.

### `CW.main` (orkestrasi)
`boot()`, `startStage(stage)`, getter `battle`, getter `busy`. Menyimpan `save` (state pemain)
dan `B` (battle aktif), serta mengatur `busy` (kunci input selama animasi).

## Alur data kunci

### Dekripsi & aksi
1. `main.flow.onAction(ab)` → cek energi → `setBusy(true)` → `spendEnergy` →
   `battle.makeQuestion(B, save, { purpose: ab })` → `ui.openQuestion(qd, cb)`.
2. UI menjalankan timer; jawaban / timeout → `cb(correct, choice, timedOut)`.
3. `main.resolveAnswer` → `battle.answer(...)` menghasilkan `events[]` →
   `animateEvents(events)` (di `main`) → cek mati/menang → lanjut giliran musuh.

### Event
`battle.answer`, `endPlayerPhase`, `startPlayerTurn` mengembalikan array event:
`correct, energy, shard, enemyHit, playerReflect, playerHit, enemyShield, playerShield,
playerHeal, enemyHeal, drain, poison, slow, comboBreak, telegraph, enemyAct, interrupt,
fizzle, poisonTick, statusTick, analyze, overclock, turretShot, enemyReflect, enemyEnrage,
cleanse, battleOver`.

`main.animateEvents(events)` menerjemahkan tiap event menjadi SFX (`CW.audio.fx`) + FX visual
(`CW.ui.fx`) + jeda (`sleep`). Selama animasi, `busy === true` dan action bar terkunci.

### Gelombang
Saat musuh tumbang: `handleEnemyDown()` → `awardKill` (shard) → `nextWave()`; jika ada wave
berikut ia spawn musuh baru (logika pemain tetap), jika habis → `victory()`. Turret pasif
yang menuntaskan wave juga ditangani di `nextTurn()`.

### Bangun benteng
`flow.onBuild(def)` → `makeQuestion` dengan `purpose.type = 'build'` → `resolveBuild`.
Build **melewati** `battle.answer` (tak memicu balasan musuh, tak memakan giliran); shard hanya
dipotong saat dekripsi berhasil (`applyBuild`). `stats.correct/wrong` tetap dicatat.

## Save (localStorage)
Key: **`cipherwars_save_v1`**, `version: 1`.
```js
{ version, xp, level, unlockedStage, sound,
  stats: { wins, losses, correct, wrong, bestCombo },
  seenIntro, clearedFinal }
```
`load()` melakukan `Object.assign` dangkal dengan `fresh()` (tanpa validasi skema penuh).
`grantXp(state, amount)` memutasi `state` dan mengembalikan `{level, leveledUp, levelsGained}`.
Mengubah skema → naikkan versi + tambahkan migrasi.

## Determinisme & RNG
- Generator soal memakai RNG injeksi (`CW.math.setRng`).
- Keacakan musuh di `battle.js` memakai `CW.math.random()` — bukan `Math.random` — sehingga
  test dapat deterministik.

## Pengujian & CI
- `npm run lint` — `node --check` atas `js/**` + `test/**` (`test/lint.js`).
- `npm run qa` — 7 bagian: (1) 4.000 pembangkitan soal vs evaluator polinom independen,
  (2) spot-check jawaban, (3) simulasi 200 pertarungan, (4) verifikasi `solve`, (5) struktur
  & mekanik, (6) reflect/enrage/cleanse, (7) ketahanan AI + `perLevel`.
- `npm run e2e` — jsdom, menjalankan `index.html` lewat **server statis internal** (tanpa server
  eksternal). Run A–H mencakup: alur penuh, kalah/retry, level-up, peta/codex/reset, multi-wave +
  shard, bangun benteng, Latihan Bebas + Materi, tutorial interaktif.
- `npm test` = lint + qa + e2e.
- CI GitHub Actions (Node 20) menjalankan `npm run lint` + `npm test` pada push ke `main` & PR.
