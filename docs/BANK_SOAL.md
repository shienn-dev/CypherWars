# Bank Soal Cipher Wars

Materi: **Fungsi Linear (100% Linear Murni)** — Nilai & Bentuk Linear (A), Komposisi Fungsi Linear (B), Fungsi Invers Linear (C), dan Enkripsi Finisher (Linear Modulo 26).

Format: pilihan ganda A–D, satu jawaban benar. Setiap soal diberi kode `S<sektor>-<nomor>` dan label materi.

## Peta Kesulitan per Sektor

| Sektor | Musuh | Materi | Fokus |
|---|---|---|---|
| 1 | Sentinel | A | Menghitung nilai fungsi linear, mencari x |
| 2 | Hyena | A | Gradien, rumus dari dua titik, soal cerita (tarif, kuota) |
| 3 | Aegis | A + B | Linear lanjut, substitusi nilai komposisi |
| 4 | Null Snake | B | Rumus komposisi (f∘g)(x), (g∘f)(x), (f∘f)(x) |
| 5 | **REX (Boss)** | B | Komposisi linear tingkat boss, tiga fungsi, parameter |
| 6 | Virus | C | Invers fungsi linear dasar f⁻¹(x) |
| 7 | Mirror | C | Invers linear pecahan konstan, nilai invers, soal cerita |
| 8 | Fox | B | Mencari fungsi asal dari komposisi, syarat f∘g = g∘f |
| 9 | Omega | C (+B) | Invers komposisi linear, kombinasi invers & nilai |
| 10 | **NEXUS (Boss Akhir)** | A + B + C | Campuran linear tersulit (sifat identitas, parameter) |

**Aturan finisher enkripsi:** soal enkripsi hanya muncul di sektor 5 dan 10, **satu kali** per pertarungan, sebagai serangan penutup saat HP boss sudah rendah ($\le 30\%$). Game mengambil satu soal secara acak dari pool finisher sektor itu.

---

## Sektor 1 — Fungsi Linear Dasar

**S1-1 [A].** `f(x) = 2x + 5`. Nilai `f(3)` = ...
A. 11  B. 10  C. 16  D. 8
> **Kunci: A.** 2·3 + 5 = 11.

**S1-2 [A].** `f(x) = 4x − 1`. Nilai `f(−2)` = ...
A. −9  B. −7  C. 9  D. 7
> **Kunci: A.** 4·(−2) − 1 = −9.

**S1-3 [A].** `f(x) = x/2 + 3`. Nilai `f(8)` = ...
A. 7  B. 4  C. 11  D. 19
> **Kunci: A.** 8/2 + 3 = 7.

**S1-4 [A].** `f(x) = 3x + 2` dan `f(a) = 14`. Nilai `a` = ...
A. 4  B. 5  C. 44  D. 16/3
> **Kunci: A.** 3a = 12 → a = 4.

**S1-5 [A].** `f(x) = 5 − 2x` dan `f(x) = −3`. Nilai `x` = ...
A. 4  B. −4  C. 1  D. 11
> **Kunci: A.** −2x = −8 → x = 4.

**S1-6 [A].** `f(x) = 6x − 4`. Nilai `f(0) + f(1)` = ...
A. −2  B. 2  C. −6  D. 6
> **Kunci: A.** (−4) + 2 = −2.

---

## Sektor 2 — Gradien, Rumus, dan Soal Cerita

**S2-1 [A].** Gradien garis melalui (2, 1) dan (5, 10) adalah ...
A. 3  B. 1/3  C. 9  D. 4
> **Kunci: A.** (10 − 1)/(5 − 2) = 3.

**S2-2 [A].** Grafik `f(x) = −3x + 7` memotong sumbu-y di titik ...
A. (0, 7)  B. (7, 0)  C. (0, −3)  D. (7/3, 0)
> **Kunci: A.** x = 0 → f(0) = 7.

**S2-3 [A].** Fungsi linear dengan `f(0) = −2` dan `f(3) = 10` adalah ...
A. 4x − 2  B. 3x − 2  C. 4x + 2  D. −2x + 4
> **Kunci: A.** b = −2; a = 12/3 = 4.

**S2-4 [A].** `f(x) = ax + b`, `f(1) = 7`, `f(4) = 16`. Nilai `f(10)` = ...
A. 34  B. 37  C. 30  D. 40
> **Kunci: A.** 3a = 9 → a = 3, b = 4 → f(10) = 34.

**S2-5 [A].** Tarif ojek online: Rp8.000 + Rp2.500 per km. Tarif untuk 6 km adalah ...
A. Rp23.000  B. Rp15.000  C. Rp20.500  D. Rp25.500
> **Kunci: A.** f(x) = 2500x + 8000 → f(6) = 23.000.

**S2-6 [A].** Kuota internet 30 GB berkurang 1,5 GB per hari. Kuota habis setelah ... hari.
A. 20  B. 15  C. 30  D. 45
> **Kunci: A.** 30 − 1,5x = 0 → x = 20.

---

## Sektor 3 — Linear Lanjut dan Nilai Komposisi

**S3-1 [A].** `f(x) = 2x − 7` dan `g(x) = −x + 5` bernilai sama saat `x` = ...
A. 4  B. −4  C. 2  D. 12
> **Kunci: A.** 3x = 12 → x = 4.

**S3-2 [A].** Fungsi linear dengan `f(2) = 5` dan `f(−1) = −4`. Nilai `f(5)` = ...
A. 14  B. 15  C. 11  D. 16
> **Kunci: A.** a = 9/3 = 3, b = −1 → f(5) = 14.

**S3-3 [B].** `f(x) = 3x + 1`, `g(x) = x + 4`. Nilai `(f∘g)(2)` = ...
A. 19  B. 11  C. 10  D. 21
> **Kunci: A.** g(2) = 6 → f(6) = 19.

**S3-4 [B].** `f(x) = x − 5`, `g(x) = 2x`. Nilai `(g∘f)(7)` = ...
A. 4  B. 9  C. −3  D. 14
> **Kunci: A.** f(7) = 2 → g(2) = 4.

**S3-5 [B].** `f(x) = 4x`, `g(x) = x − 3`. Nilai `(g∘f)(5)` = ...
A. 17  B. 12  C. 20  D. 8
> **Kunci: A.** f(5) = 20 → g(20) = 17.

**S3-6 [B].** `f(x) = 2x + 1`. Nilai `(f∘f)(3)` = ...
A. 15  B. 14  C. 13  D. 49
> **Kunci: A.** f(3) = 7 → f(7) = 15.

---

## Sektor 4 — Rumus Komposisi Linear

**S4-1 [B].** `f(x) = x + 4`, `g(x) = 3x`. Maka `(f∘g)(x)` = ...
A. 3x + 4  B. 3x + 12  C. 3x + 7  D. x + 12
> **Kunci: A.** f(3x) = 3x + 4.

**S4-2 [B].** `f(x) = x + 4`, `g(x) = 3x`. Maka `(g∘f)(x)` = ...
A. 3x + 12  B. 3x + 4  C. 3x + 7  D. 4x + 3
> **Kunci: A.** g(x + 4) = 3x + 12.

**S4-3 [B].** `f(x) = 2x − 3`, `g(x) = 4x + 1`. Maka `(f∘g)(x)` = ...
A. 8x − 1  B. 8x − 11  C. 8x + 1  D. 6x − 2
> **Kunci: A.** 2(4x + 1) − 3 = 8x − 1.

**S4-4 [B].** `f(x) = 5x`, `g(x) = x − 2`. Maka `(g∘f)(x)` = ...
A. 5x − 2  B. 5x − 10  C. x + 3  D. 5x + 2
> **Kunci: A.** g(5x) = 5x − 2.

**S4-5 [B].** `f(x) = 3x − 2`. Maka `(f∘f)(x)` = ...
A. 9x − 8  B. 9x − 6  C. 9x − 4  D. 6x − 4
> **Kunci: A.** 3(3x − 2) − 2 = 9x − 8.

**S4-6 [B].** `f(x) = x + 1`, `g(x) = 2x − 5`. Maka `(g∘f)(x)` = ...
A. 2x − 3  B. 2x − 4  C. 2x + 3  D. x − 4
> **Kunci: A.** g(x + 1) = 2(x + 1) − 5 = 2x − 3.

---

## Sektor 5 — BOSS REX (Komposisi Linear Lanjut)

**S5-1 [B].** `f(x) = 2x + 3`, `g(x) = 3x − 4`. Maka `(f∘g)(x)` = ...
A. 6x − 5  B. 6x + 5  C. 6x − 8  D. 5x − 1
> **Kunci: A.** 2(3x − 4) + 3 = 6x − 5.

**S5-2 [B].** `f(x) = 2x + 3`, `g(x) = 3x − 4`. Maka `(g∘f)(x)` = ...
A. 6x + 5  B. 6x − 5  C. 6x + 9  D. 5x + 7
> **Kunci: A.** 3(2x + 3) − 4 = 6x + 5.

**S5-3 [B].** `f(x) = x − 1`, `g(x) = 3x`, `h(x) = x + 2`. Nilai `(f∘g∘h)(1)` = ...
A. 8  B. 5  C. 6  D. 9
> **Kunci: A.** h(1) = 3 → g(3) = 9 → f(9) = 8.

**S5-4 [B].** `f(x) = 4x + k`, `g(x) = x + 1`, dan `(f∘g)(2) = 17`. Nilai `k` = ...
A. 5  B. 9  C. 3  D. 1
> **Kunci: A.** g(2) = 3 → 12 + k = 17 → k = 5.

**S5-5 [B].** `f(x) = x + 3` dan `(f∘g)(x) = 2x + 7`. Maka `g(x)` = ...
A. 2x + 4  B. 2x + 10  C. 2x + 7  D. x + 4
> **Kunci: A.** g(x) + 3 = 2x + 7 → g(x) = 2x + 4.

**S5-6 [A+B].** `f` linear dengan `f(1) = 4` dan `(f∘f)(1) = 10`. Maka `f(x)` = ...
A. 2x + 2  B. 3x + 1  C. x + 3  D. 6x − 2
> **Kunci: A.** a + b = 4 dan f(4) = 4a + b = 10 → a = 2, b = 2.

### Finisher Enkripsi Sektor 5 (pilih satu secara acak)

Konversi huruf: `A=0, B=1, ..., Z=25`, operasi `mod 26`.

**F5-a.** Caesar `E(x) = (x + 3) mod 26`. Enkripsi `KODE` = ...
A. NRGH  B. LPEF  C. HLAB  D. NRHG
> **Kunci: A.** K→N, O→R, D→G, E→H.

**F5-b.** Pesan `VLVWHP` dienkripsi Caesar geser 3. Pesan aslinya = ...
A. SISTEM  B. SKSTEM  C. SYSTEM  D. YOYZKS
> **Kunci: A.** Dekripsi D(y) = (y − 3) mod 26: V→S, L→I, V→S, W→T, H→E, P→M.

**F5-c.** `E(x) = (x + 5) mod 26`. Enkripsi `BUG` = ...
A. GZL  B. GYL  C. FZL  D. GZK
> **Kunci: A.** B(1)→6=G, U(20)→25=Z, G(6)→11=L.

---

## Sektor 6 — Invers Linear Dasar

**S6-1 [C].** Invers `f(x) = x − 9` adalah ...
A. x + 9  B. 9 − x  C. x/9  D. −x − 9
> **Kunci: A.** y = x − 9 → x = y + 9.

**S6-2 [C].** Invers `f(x) = 5x` adalah ...
A. x/5  B. 5/x  C. x − 5  D. −5x
> **Kunci: A.** y = 5x → x = y/5.

**S6-3 [C].** Invers `f(x) = 2x + 8` adalah ...
A. (x − 8)/2  B. 2x − 8  C. (x + 8)/2  D. x/2 − 8
> **Kunci: A.** x = (y − 8)/2.

**S6-4 [C].** `f(x) = 4x − 3`. Nilai `f⁻¹(9)` = ...
A. 3  B. 33  C. 3/2  D. 12
> **Kunci: A.** 4x − 3 = 9 → x = 3.

**S6-5 [C].** Invers `f(x) = (x + 1)/3` adalah ...
A. 3x − 1  B. 3x + 1  C. (x − 1)/3  D. 3(x + 1)
> **Kunci: A.** 3y = x + 1 → x = 3y − 1.

**S6-6 [C].** Invers `f(x) = 7 − x` adalah ...
A. 7 − x  B. x − 7  C. x + 7  D. −x − 7
> **Kunci: A.** y = 7 − x → x = 7 − y.

---

## Sektor 7 — Invers Linear Lanjut dan Soal Cerita

**S7-1 [C].** Invers `f(x) = (3x − 2)/4` adalah ...
A. (4x + 2)/3  B. (4x − 2)/3  C. (3x + 2)/4  D. 4/(3x − 2)
> **Kunci: A.** 4y = 3x − 2 → x = (4y + 2)/3.

**S7-2 [C].** Invers `f(x) = −2x + 6` adalah ...
A. (6 − x)/2  B. (x − 6)/2  C. (x + 6)/2  D. −2x − 6
> **Kunci: A.** 2x = 6 − y → x = (6 − y)/2.

**S7-3 [C].** Invers `f(x) = x/3 + 2` adalah ...
A. 3x − 6  B. 3x − 2  C. 3(x + 2)  D. (x − 2)/3
> **Kunci: A.** x = 3(y − 2) = 3y − 6.

**S7-4 [C].** `f(x) = 5x + 1`. Nilai `f⁻¹(−9)` = ...
A. −2  B. −44  C. −8/5  D. 2
> **Kunci: A.** 5x + 1 = −9 → x = −2.

**S7-5 [C].** `f(x) = 3x − 7`. Nilai `f⁻¹(14)` = ...
A. 7  B. 5  C. 35  D. 21
> **Kunci: A.** 3x − 7 = 14 → 3x = 21 → x = 7.

**S7-6 [C].** Konversi suhu `F = (9/5)C + 32`. Dengan fungsi inversnya, 77°F sama dengan ...
A. 25°C  B. 45°C  C. 13°C  D. 60°C
> **Kunci: A.** C = (5/9)(F − 32) = (5/9)·45 = 25.

---

## Sektor 8 — Komposisi Linear Lanjut

**S8-1 [B].** `f(x) = 2x + 3` dan `(f∘g)(x) = 6x − 1`. Maka `g(x)` = ...
A. 3x − 2  B. 3x − 4  C. 3x + 1  D. 6x − 4
> **Kunci: A.** 2g(x) + 3 = 6x − 1 → g(x) = 3x − 2.

**S8-2 [B].** `g(x) = 2x + 1` dan `(f∘g)(x) = 10x + 3`. Maka `f(x)` = ...
A. 5x − 2  B. 5x + 3  C. 10x − 2  D. 5x + 2
> **Kunci: A.** 10x + 3 = 5(2x + 1) − 2 → f(x) = 5x − 2.

**S8-3 [B].** `f(x) = x + 2`. Maka `(f∘f∘f)(x)` = ...
A. x + 6  B. 3x + 2  C. x + 8  D. 3x + 6
> **Kunci: A.** Setiap f menambah 2 → x + 6.

**S8-4 [B].** `g(x) = 2x − 1` dan `(f∘g)(x) = 6x + 5`. Maka `f(x)` = ...
A. 3x + 8  B. 3x + 5  C. 3x − 8  D. 6x + 6
> **Kunci: A.** 6x + 5 = 3(2x − 1) + 8 → f(x) = 3x + 8.

**S8-5 [B].** `f(x) = 3x + b`, `g(x) = 2x + 1`. Agar `f∘g = g∘f`, nilai `b` = ...
A. 2  B. 1  C. 3  D. −2
> **Kunci: A.** 6x + 3 + b = 6x + 2b + 1 → b = 2.

**S8-6 [B].** `f(x) = 2x + 3`, `g(x) = 4x − 1`, dan `(g∘f)(x) = 35`. Nilai `x` = ...
A. 3  B. 4  C. 2  D. 5
> **Kunci: A.** 4(2x + 3) − 1 = 8x + 11 = 35 → 8x = 24 → x = 3.

---

## Sektor 9 — Invers Komposisi Linear

**S9-1 [C].** `f(x) = 2x + 6` dan `g(x) = x − 4`. Tentukan `(f∘g)⁻¹(x)`.
A. (x + 2)/2  B. (x − 2)/2  C. 2x + 2  D. (x + 4)/2
> **Kunci: A.** (f∘g)(x) = 2x − 2 → invers (x + 2)/2.

**S9-2 [C].** `f(x) = 4x − 5`. Jika `f⁻¹(a) = 3`, nilai `a` = ...
A. 7  B. 12  C. 2  D. 1
> **Kunci: A.** f⁻¹(a) = 3 ↔ f(3) = a = 4·3 − 5 = 7.

**S9-3 [C].** Invers dari `f(x) = (5 − 2x)/4` adalah ...
A. (5 − 4x)/2  B. (4x − 5)/2  C. (5 − 2x)/4  D. (2x + 5)/4
> **Kunci: A.** 4y = 5 − 2x → 2x = 5 − 4y → x = (5 − 4y)/2.

**S9-4 [B+C].** `f(x) = 2x + 1`, `g(x) = x − 3`. Maka `(f∘g)⁻¹(x)` = ...
A. (x + 5)/2  B. (x − 5)/2  C. 2x + 5  D. (x + 1)/2 − 3
> **Kunci: A.** f∘g = 2x − 5 → invers (x + 5)/2.

**S9-5 [B+C].** `f(x) = 3x`, `g(x) = x + 4`. Nilai `(g∘f)⁻¹(19)` = ...
A. 5  B. 61  C. 23/3  D. 7
> **Kunci: A.** g∘f = 3x + 4 → (19 − 4)/3 = 5.

**S9-6 [C].** `f(x) = 2x − 7` dan `g(x) = 3x + 1`. Nilai `(g∘f)⁻¹(10)` = ...
A. 5  B. 3  C. 8  D. 2
> **Kunci: A.** 3f(x) + 1 = 10 → f(x) = 3 → 2x − 7 = 3 → x = 5.

---

## Sektor 10 — BOSS NEXUS (Campuran Linear Tersulit)

**S10-1 [B+C].** `f⁻¹(x) = (x − 1)/2` dan `g(x) = x + 5`. Maka `(f∘g)(x)` = ...
A. 2x + 11  B. 2x + 6  C. (x + 4)/2  D. 2x + 5
> **Kunci: A.** f(x) = 2x + 1 → f(x + 5) = 2(x + 5) + 1 = 2x + 11.

**S10-2 [B+C].** `f(x) = 2x − 3` dan `(f∘g)(x) = 4x + 1`. Maka `g⁻¹(x)` = ...
A. (x − 2)/2  B. 2x + 2  C. (x + 2)/2  D. (x − 1)/4
> **Kunci: A.** 2g − 3 = 4x + 1 → g(x) = 2x + 2 → g⁻¹(x) = (x − 2)/2.

**S10-3 [B+C].** `f(x) = 3x − 4` dan `g(x) = 2x + 5`. Jika `(f∘g)⁻¹(a) = 1`, nilai `a` = ...
A. 17  B. 13  C. 21  D. 7
> **Kunci: A.** (f∘g)(1) = a → g(1) = 7 → f(7) = 21 − 4 = 17.

**S10-4 [C].** Diketahui `f(x) = ax + 3` dan `f⁻¹(7) = 2`. Nilai `a` = ...
A. 2  B. 3  C. 5  D. 4
> **Kunci: A.** f(2) = 7 → 2a + 3 = 7 → a = 2.

**S10-5 [B+C].** `f(x) = 2x + 3`. Nilai `(f∘f⁻¹∘f)(4)` = ...
A. 11  B. 4  C. 19  D. 8
> **Kunci: A.** f∘f⁻¹ adalah fungsi identitas → hasilnya f(4) = 11.

**S10-6 [A+B].** `f(x) = ax + b` dengan `a > 0` dan `(f∘f)(x) = 9x + 8`. Maka `f(x)` = ...
A. 3x + 2  B. 3x + 4  C. 9x + 2  D. 3x + 8
> **Kunci: A.** a² = 9 → a = 3; ab + b = 4b = 8 → b = 2.

### Finisher Enkripsi Sektor 10 (pilih satu secara acak)

**F10-a.** Affine cipher `E(x) = (5x + 8) mod 26`. Enkripsi `RPL` = ...
A. PFL  B. PLF  C. RPL  D. FPL
> **Kunci: A.** R(17): 93 mod 26 = 15 = P; P(15): 83 mod 26 = 5 = F; L(11): 63 mod 26 = 11 = L.

**F10-b.** Fungsi dekripsi (invers) dari `E(x) = (5x + 8) mod 26` adalah ...
A. 21(y − 8) mod 26  B. 5(y − 8) mod 26  C. (y − 8)/5  D. (21y − 8) mod 26
> **Kunci: A.** Invers 5 modulo 26 adalah 21 karena 5·21 = 105 = 4·26 + 1.

**F10-c.** Affine cipher `E(x) = (3x + 1) mod 26`. Enkripsi `MAT` = ...
A. LBG  B. MBT  C. KBG  D. LAG
> **Kunci: A.** M(12): 37 mod 26 = 11 = L; A(0): 1 = B; T(19): 58 mod 26 = 6 = G.

---

*(Catatan: Pada game, pilihan jawaban diacak secara dinamis saat soal ditampilkan)*
