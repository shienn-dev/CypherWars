# DEVELOPMENT LOG — Cipher Wars

Riwayat pengembangan, terbaru di atas. Tanggal `YYYY-MM-DD`.

Semua perubahan sudah masuk `main`. Cabang `fix/review-issues` dan `feat/defense-gameplay`
tetap ada sebagai arsip (sudah terkandung di `main`).

---

## 2026-11-12 — Perbaikan review lanjutan (`ba6838f`)
Tinjauan menyeluruh dilakukan; ~90% temuan terverifikasi akurat. Yang dikerjakan:
- AI: case untuk `aggressive`, `trickster`, `disruptor`, `berserker`; REX kini berperilaku boss
  (ult diperkuat saat HP < 45%); guard agar filter AI tidak pernah mengosongkan daftar move.
- Data-driven: `battle.js` memakai `structures[].perLevel`, bukan angka hardcode 4/4/5/1.
- Logika: bunuh-sekaligus-mati (pantulan) dihitung menang; sektor 10 ditandai selesai
  via `save.clearedFinal`.
- UX: action bar terkunci selama animasi, di-reset saat ganti/ulang sektor.
- Bangun benteng kini mencatat `stats.correct/wrong`.
- Testing: `npm test` mandiri (server statis internal di E2E), `settle` menunggu idle
  (anti-flaky), tambah `test/lint.js` + CI GitHub Actions.
- Aksesibilitas: zoom aktif, teks bisa diseleksi, `Escape` menutup overlay, ARIA dialog/live.
- Balance: Interupsi turun ke Level 5.

## 2026-11-10 — Defense Protocol overhaul (Phase 1–4)
- **Phase 1** (`da304dc`): engine — gelombang (wave), Data Shard, struktur + API build,
  mekanik musuh `reflect`/`enrage`/`cleanse`. Wiring wave di `main.js`, UI shard/wave.
- **Phase 2** (`be17459`): UI Benteng — panel struktur, modal build, alur bangun-lewat-soal.
- **Phase 3** (`4f6ae71`): mode belajar — tab Materi di Kamus Kode + layar Latihan Bebas.
- **Phase 4** (`efc594e`): tutorial interaktif 4 langkah + pembaruan README.

## 2026-11-10 — Perbaikan bug review (`46d4ca4`)
- Racun memakai `move.value` (bukan hardcode 5).
- Ultimate boss dicari dinamis (`def.moves.find('ult')`), bukan `moves[4]`.
- Keacakan musuh memakai `CW.math.random()` (deterministik).
- Perbaikan duplikasi log; badge boss via flag `boss` eksplisit.
- Bersih-bersih kode (param tak terpakai, no-op replace, `D.enemyNames`).

## 2026-10-29 — Cipher Wars v1 (`f24e31f`)
Rilis awal: 10 sektor (1 musuh/sektor), 3 tipe soal komposisi fungsi, 10 musuh ber-AI,
9 ability, mesin polinom eksak, save localStorage, SFX WebAudio, codex.

---

## Ide / utang teknis (belum dikerjakan)
- Validasi skema `save.load()` + migrasi versi (save korup bisa menghasilkan state aneh).
- Error boundary global bila `CW.math.generate` melempar.
- Tinjau keseimbangan sektor 9–10 dan tekanan timer (tier 5) untuk siswa SMP.
- `battle.js` masih mencampur logika dengan string UI berbahasa Indonesia.
