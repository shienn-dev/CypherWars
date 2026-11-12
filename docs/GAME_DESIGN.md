# GAME DESIGN — Cipher Wars

## Inti loop
1. Pilih sektor di peta.
2. Bertarung melawan **gelombang (wave)** musuh. Setiap aksi butuh satu **dekripsi fungsi**.
3. Jawaban benar → aksi berhasil, **COMBO** naik, dapat energi + **Data Shard ⬡**.
   Jawaban salah / waktu habis → aksi gagal, combo putus, musuh membalas.
4. Di antara gelombang, belanjakan Shard di **Benteng** untuk membangun pertahanan
   (juga butuh dekripsi).
5. Tumpas semua gelombang sektor → dapat XP, buka sektor berikutnya.

Menang = semua wave tumbas. Kalah = HP Operative 0. **Bunuh-sekaligus-mati** (mis. karena
pantulan) dihitung **menang**.

## Sektor & gelombang
10 sektor. Sektor 1–3 satu gelombang (pemanasan); 4–10 dua gelombang.

| # | Nama | Musuh (wave) | Tier | timeMod |
|---|------|--------------|------|---------|
| 1 | Gerbang Perimeter | SENTINEL-01 | 1 | 1.00 |
| 2 | Padang Data | BYTE-HYENA | 2 | 0.95 |
| 3 | Benteng Aegis | AEGIS-WALL | 2 | 0.95 |
| 4 | Sarang Null | NULLSNAKE → BYTE-HYENA | 3 | 0.90 |
| 5 | Tahta Kalkulus | KALKULUS REX ★ | 3 | 0.90 |
| 6 | Zona Mutasi | VIRUS-9 → NULLSNAKE | 4 | 0.85 |
| 7 | Lorong Cermin | MIRRORBOT → AEGIS-WALL | 4 | 0.85 |
| 8 | Hutan Kuantum | QUANTUM FOX → BYTE-HYENA | 4 | 0.80 |
| 9 | Menara Omega | OMEGA-WARD → MIRRORBOT | 5 | 0.80 |
| 10 | Inti NEXUS | NEXUS PRIME ★ → KALKULUS REX | 5 | 0.75 |

## Soal (dibangkitkan prosedural, eksak)
- **eval** — hitung nilai `(f ∘ g)(x)` untuk `x` bulat (rantai 2–3 fungsi).
- **solve** — selesaikan `f(x) = k` untuk `x` (linear, jawaban bulat).
- **symbolic** — tentukan bentuk `(f ∘ g)(x)`.

5 tier kesulitan mengatur bentuk fungsi (linear/kuadrat/komposisi berlapis). Anggaran waktu:
`baseTime = [–, 30, 30, 35, 40, 45]` detik × `timeMod` sektor; debuff **slow** mengali ×0,65.
Distraktor dibuat dari miskonsepsi umum: urutan komposisi dibalik, `f·g`, `f+g`, lupa
substitusi, konstanta hilang, tanda dibalik.

## Ability (9, terbuka seiring level)
| Ability | Energi | Level | Efek |
|---------|:---:|:---:|------|
| Serang | 0 | 1 | Damage dasar (naik oleh Combo) |
| Perisai Darurat | 1 | 1 | +10 SHIELD |
| Analisis | 1 | 1 | Soal berikutnya menampilkan langkah penyelesaian |
| Serangan Kuantum | 2 | 2 | Damage 22 + bonus combo |
| Penembus Kode | 3 | 3 | Damage 26, menembus shield (anti-pantulan) |
| Regenerasi | 2 | 4 | Pulihkan 22 HP |
| Overclock | 2 | 5 | +1 energi/giliran selama 3 giliran |
| Interupsi | 2 | 5 | Batalkan ultimate musuh (soal lebih sulit) |
| Eksekusi Total | 5 | 7 | Damage 40 + bonus combo |

Damage serangan: `round(base × (1 + min(combo,5) × 0,15))`.
Serang tanpa nilai = `10 + combo×2`; ability bernilai memakai `value`.

## Energi & combo
- Energi maks 7, mulai 3, +1/giliran (bonus dari Overclock & Reaktor).
- Combo +1 tiap jawaban benar (tidak pernah dari salah). Ambang combo **3** dan **5**
  memberi +1 energi. Rasio Combo dibatasi 5 untuk pengali damage.

## Struktur pertahanan (Benteng)
Dibangun dengan Data Shard; biaya naik `cost × (level+1)`. Level bertahan selama 1 sektor.

| Struktur | Biaya dasar | Maks Lv | Efek per level |
|----------|:---:|:---:|------|
| Firewall | 6 | 3 | +4 SHIELD setiap giliran |
| Turret Kode | 8 | 3 | +5 damage otomatis ke musuh tiap giliran |
| Reaktor | 7 | 2 | +1 energi tiap giliran |
| Nanomedik | 7 | 3 | +4 HP tiap giliran |

Shard: **+2** per dekripsi benar, **+5** per musuh tumbang.

## Status & mekanik musuh
- **Pemain**: poison (DoT per giliran, dihapus oleh `cleanse`), slow (timer ↓), overclock.
- **Musuh**: shield, heal, drain (curi energi), combo (putus combo), poison, slow,
  reflect (pantulkan 40% damage 3 giliran; **Penembus Kode** menembusnya), enrage
  (+damage permanen 25%/30%), cleanse (hapus shield & buff pemain), ultimate (ber-telegraf).
- Ultimate boss saat HP rendah mendapat varian lebih kuat (+6 damage).

## Profil AI
| AI | Musuh | Perilaku |
|----|-------|----------|
| aggressive | SENTINEL | Serang keras saat HP pemain rendah |
| trickster | BYTE-HYENA | Pasang slow hanya saat slow tidak aktif |
| defensive | AEGIS-WALL | Perkuat shield saat HP < 50% |
| disruptor | NULLSNAKE | Putus combo / curi energi sesuai kondisi pemain |
| berserker | KALKULUS REX | Ult menguat saat HP < 45% |
| toxic | VIRUS-9 | Kelola heal & poison |
| reflector | MIRRORBOT | Fokus shield/attack saat tertekan |
| adaptive | QUANTUM FOX | Heal saat sekarat, drain saat energi pemain tinggi |
| tactician | OMEGA-WARD | Prioritaskan shield saat HP < 45% & tanpa shield |
| boss | NEXUS PRIME | Ult menguat saat HP < 30% |

## Progresi
- XP musuh: sesuai `reward` tiap musuh; pengulangan sektor hanya 40%.
- `xpForLevel(lvl) = 60 + (lvl−1)×45`. Naik level → kemampuan baru + HP maks (+6/level).
- HP Operative dasar 90.

## Mode belajar
- **Materi** (Kamus Kode): definisi `(f ∘ g)(x)=f(g(x))`, contoh, kesalahan umum.
- **Latihan Bebas**: soal tanpa timer/musuh, pilih tier 1–5, langkah bisa dibuka kapan saja.
- **Tutorial interaktif**: 4 langkah (Misi → Konsep dengan demo → Coba sendiri → Bertarung & Bertahan).
