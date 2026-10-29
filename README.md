# 🛡️ CIPHER WARS — Pertempuran Kode

Game edukasi *turn-based RPG* untuk melatih **komposisi fungsi** (SMP/SMA), berbahasa Indonesia.
Dunia dikuasai para Cipher Guardian — satu-satunya senjata adalah kemampuan menghitung `(f ∘ g)(x)`.
Setiap dekripsi yang benar adalah serangan; setiap kesalahan membuka celah bagi musuh untuk membalas.

**100% vanilla JavaScript** — tanpa framework, tanpa build step, tanpa aset eksternal (SVG dan efek suara dibuat secara programatik).

## Fitur

- **10 sektor campaign** dengan 10 Guardian ber-AI berbeda: agresif, bertahan, toksik, pengacau combo, penipu waktu, adaptif, hingga 2 boss dengan *ultimate* ber-telegraf yang bisa dibatalkan lewat **Interupsi**.
- **3 tipe soal** yang dibangkitkan secara prosedural dari mesin polinom eksak (aritmetika integer, tanpa floating-point error):
  - `eval` — hitung nilai `(f ∘ g)(-2)` dari rantai komposisi 2–3 fungsi
  - `solve` — selesaikan `f(x) = k`
  - `symbolic` — tentukan bentuk `(f ∘ g)(x)`
- **5 tier kesulitan** — dari dua fungsi linear hingga komposisi kuadrat tiga lapis; timer mengecil seiring sektor.
- **Distraktor cerdas**: pilihan salah dibuat dari kesalahan umum siswa (mem balik urutan komposisi, mengalikan alih-alih menyusun, lupa substitusi, dsb).
- **9 kemampuan** (Serang, Perisai, Analisis, Kuantum, Penembus Kode, Regenerasi, Overclock, Interupsi, Eksekusi Total) yang terbuka seiring level, sistem energi, combo, shield, poison/slow.
- **Petunjuk & pembahasan lengkap** per soal (tombol 💡, atau ability Analisis untuk menampilkan langkah sebelum menjawab).
- **Progres tersimpan** otomatis di localStorage — level, XP, sektor terbuka, statistik akurasi.
- Efek suara WebAudio sintetis + mode bisu.

## Cara Menjalankan

Cukup buka `index.html` di browser modern — tidak perlu install apa pun.

Untuk pengalaman terbaik (dan agar localStorage selalu tersimpan), jalankan lewat server lokal:

```bash
# salah satu dari:
python -m http.server 8123     # lalu buka http://localhost:8123
npx serve .
```

### Distribusi ke kelas

- **Offline**: zip seluruh folder (tanpa `node_modules/`) dan bagikan; siswa tinggal membuka `index.html`.
- **Online**: push ke GitHub Pages / Netlify / Vercel — semuanya statis, tanpa konfigurasi.

## Pengujian

```bash
npm install        # hanya untuk pengujian (jsdom)
npm test
```

- `npm run qa` — stress test mesin matematika & simulasi 200 pertarungan (~30.000 asersi): setiap jawaban diverifikasi terhadap evaluator polinom independen.
- `npm run e2e` — uji wiring end-to-end di jsdom: alur lengkap title → battle → menang/kalah → level-up → save, dengan klik DOM sungguhan.

## Struktur Proyek

```
index.html        markup semua layar (title, peta, codex, battle, modal soal)
css/style.css     tema cyber-terminal, animasi & efek
js/math.js        mesin polinom eksak + generator soal/tipe/distraktor
js/data.js        musuh, AI, sektor, ability, tabel progresi
js/battle.js      state machine pertarungan (murni logika, tanpa DOM)
js/ui.js          rendering, modal soal + timer, FX animasi
js/main.js        orkestrasi alur permainan & animasi event
js/audio.js       SFX WebAudio sintetis
js/save.js        localStorage + kurva XP
test/qa.js        stress test logika (Node, tanpa dependensi)
test/e2e.js       uji wiring E2E (jsdom)
```

## Materi

Fungsi komposisi sesuai kurikulum: notasi `(f ∘ g)(x) = f(g(x))`, substitusi dan penjabaran polinom,
serta persamaan linear `f(x) = k`. Soal selalu memiliki jawaban bulat dan pembahasan langkah demi langkah.
