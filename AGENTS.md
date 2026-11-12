# AGENTS.md — Cipher Wars

Panduan kerja untuk AI agent / kontributor. Ringkas, faktual. Selaras dengan repo.

## Apa ini
Game edukasi matematika (komposisi fungsi) berbahasa Indonesia, bergaya turn-based RPG
dengan lapisan pertahanan (Defense Protocol). **Vanilla JS**, tanpa framework, tanpa build step.

## Perintah penting
```bash
python -m http.server 8123   # jalankan game (localhost:8123) — atau buka index.html langsung
npm test                     # lint + qa + e2e (mandiri; e2e menyalakan server statisnya sendiri)
npm run lint                 # cek sintaks semua file JS (node --check)
npm run qa                   # stress test mesin matematika & simulasi battle
npm run e2e                  # uji wiring end-to-end di jsdom
```
Selalu jalankan `npm test` sampai hijau sebelum commit. E2E **tidak** butuh server eksternal
(kecuali kamu set `E2E_URL`).

## Struktur nyata
```
index.html            markup semua layar (title, map, codex, practice, battle, modal)
css/style.css         tema cyber-terminal, animasi, layout responsif
js/math.js            mesin polinom eksak + generator soal/tipe/distraktor
js/data.js            musuh, AI, sektor (+wave), struktur, ability, progresi
js/audio.js           SFX WebAudio sintetis
js/save.js            localStorage + kurva XP
js/battle.js          state machine pertarungan (murni logika, tanpa DOM)
js/ui.js              rendering, modal soal/timer, panel benteng, practice, tutorial, FX
js/main.js            orkestrasi alur + animasi event
test/lint.js          cek sintaks (node --check)
test/qa.js            stress test logika (Node, tanpa DOM)
test/e2e.js           uji wiring E2E (jsdom, server statis internal)
.github/workflows/ci.yml  CI: lint + test (Node 20)
```
> Catatan: kode tinggal di `js/`, **bukan** `src/`.

## Arsitektur singkat
- Semua modul IIFE yang menempel ke global `window.CW` (`CW.math`, `CW.data`, `CW.audio`,
  `CW.save`, `CW.battle`, `CW.ui`, `CW.main`). Urutan muat di `index.html`: math → data → audio → save → battle → ui → main.
- `battle.js` = logika murni (tak menyentuh DOM); `ui.js` = render; `main.js` = perekat alur + animasi.
- `math.js` deterministik: RNG dapat di-inject via `CW.math.setRng(fn)`; `CW.math.random()` dipakai
  bersama oleh battle agar bisa diuji.

## Konvensi
- Bahasa UI, komentar, dan pesan: **Indonesia**.
- Tanpa emoji di dalam file (kecuali yang sudah ada di data/string game).
- Tanpa komentar berlebihan; jelaskan "kenapa", bukan "apa".
- Jangan tambah dependency runtime. `jsdom` hanya dev-dependency untuk test.
- Jangan hardcode angka gameplay — taruh di `js/data.js` (mis. `perLevel`, `reward`, `cost`).

## Gotcha
- `battle.js` memakai `CW.math.random()` untuk semua keacakan musuh (jangan `Math.random`) agar deterministik.
- Save key: `cipherwars_save_v1` (lihat `js/save.js`). Ubah skema → naikkan versi + tangani migrasi.
- Selama animasi, `busy` mengunci aksi; tombol dinonaktifkan via `ui.setActionsLocked`.
- Uji baru: tambahkan bagian di `test/qa.js` atau `run` baru di `test/e2e.js`, lalu jaga `npm test` hijau.

## Peta dokumen
- `README.md` — ringkasan fitur & cara pakai.
- `docs/PROJECT_CONTEXT.md` — konteks, tujuan, audiens, status.
- `docs/GAME_DESIGN.md` — desain gameplay.
- `docs/TECHNICAL_ARCHITECTURE.md` — arsitektur teknis & skema data.
- `docs/DEVELOPMENT_LOG.md` — riwayat pengembangan.
