# PROJECT CONTEXT — Cipher Wars

## Ringkasan
**Cipher Wars — Pertempuran Kode** adalah game edukasi matematika berbahasa Indonesia
bergaya *turn-based RPG* dengan lapisan *base defense*. Topik utamanya: **komposisi fungsi**
`(f ∘ g)(x) = f(g(x))`, untuk jenjang SMP/SMA.

Pemain berperan sebagai *Operative* yang melawan **Cipher Guardian** di sejumlah sektor.
Senjata utama bukan tebak-tebakan: setiap aksi (menyerang, membangun pertahanan, membatalkan
ultimate) menuntut satu **dekripsi fungsi** yang benar.

## Masalah yang disasar
Latihan komposisi fungsi sering repetitif dan tanpa konteks. Cipher Wars mengemasnya sebagai
pertempuran bertekanan waktu: jawaban benar = aksi berhasil, salah = musuh membalas. Tujuannya
melatih kelancaran prosedural (substitusi dari dalam ke luar, penjabaran, penyelesaian
persamaan) sekaligus pemahaman konsep melalui pembahasan langkah demi langkah.

## Audiens
- **Siswa SMP/SMA** — pemain utama. Bahasa dan pesan dirancang ramah, tidak teknis.
- **Guru** — distribusi ke kelas: cukup zip folder (tanpa `node_modules/`) atau push ke
  GitHub Pages/Netlify/Vercel (semua statis).

## Tujuan
- Materi kurikuler: notasi komposisi, substitusi & penjabaran polinom, `f(x) = k`.
- Umpan balik formatif: hint, langkah penyelesaian, distraktor dari miskonsepsi nyata.
- Progres ringan: XP, level, unlock sektor, statistik akurasi, tersimpan di `localStorage`.

## Batasan teknis (tidak bisa ditawar)
- **Vanilla JavaScript**, tanpa framework, **tanpa build step**, tanpa dependency runtime.
- Aritmetika polinom **eksak** (integer) — tanpa galat floating-point.
- Dapat dijalankan **offline** dengan membuka `index.html`.
- Aset (SVG, SFX) dibuat **programatik** — tidak ada file gambar/audio eksternal.

## Status saat ini
Selesai dan playable. Riwayat besar:
1. **v1** — 1 musuh/sektor, 3 tipe soal, 9 ability, 10 sektor (`f24e31f`).
2. **Review fix** — racun, boss ultimate, RNG, log, badge boss (`46d4ca4`).
3. **Defense Protocol overhaul** — wave, Data Shard, struktur benteng, mekanik musuh baru,
   mode belajar, tutorial interaktif (`da304dc` … `efc594e`).
4. **Perbaikan review lanjutan** — profil AI, `perLevel`, UX busy, mutual-kill, sektor 10,
   aksesibilitas, test mandiri + CI (`ba6838f`).

`main` sudah memuat seluruhnya. Lihat `docs/DEVELOPMENT_LOG.md` untuk detail commit.

## Non-tujuan
- Multiplayer / backend / akun online (semua statis & lokal).
- Build pipeline, bundler, atau framework UI.
- Fitur editor konten soal (soal dibangkitkan prosedural, bukan ditulis manual).
