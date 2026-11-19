/* Cipher Wars — bank soal per sektor (sumber: docs/BANK_SOAL.md).
   Format entri: t = materi (A linear, B komposisi, C invers, E enkripsi),
   p = soal, o = [jawaban benar, pengecoh...], s = pembahasan.
   Opsi diacak saat soal dibuat, jadi jawaban benar selalu ditulis pertama. */
(function () {
  'use strict';

  const HINTS = {
    A: 'Fungsi linear f(x) = ax + b: substitusikan nilai x, atau susun persamaan lalu selesaikan.',
    B: 'Komposisi (f \u2218 g)(x) = f(g(x)): kerjakan fungsi paling kanan dulu, lalu masukkan hasilnya ke fungsi berikutnya.',
    C: 'Invers: tulis y = f(x), nyatakan x dalam y, lalu tukar x dan y.',
    E: 'Ubah huruf ke angka (A=0 \u2026 Z=25), terapkan fungsinya, lalu ambil sisa bagi 26.'
  };

  const BANK = {
    1: [
      { t: 'A', p: 'f(x) = 2x + 5.\nTentukan nilai f(3).', o: ['11', '10', '16', '8'], s: 'f(3) = 2\u00B73 + 5 = 11' },
      { t: 'A', p: 'f(x) = 4x \u2212 1.\nTentukan nilai f(\u22122).', o: ['\u22129', '\u22127', '9', '7'], s: 'f(\u22122) = 4\u00B7(\u22122) \u2212 1 = \u22129' },
      { t: 'A', p: 'f(x) = x/2 + 3.\nTentukan nilai f(8).', o: ['7', '4', '11', '19'], s: 'f(8) = 8/2 + 3 = 7' },
      { t: 'A', p: 'f(x) = 3x + 2 dan f(a) = 14.\nTentukan nilai a.', o: ['4', '5', '44', '16/3'], s: '3a + 2 = 14 \u2192 3a = 12 \u2192 a = 4' },
      { t: 'A', p: 'f(x) = 5 \u2212 2x dan f(x) = \u22123.\nTentukan nilai x.', o: ['4', '\u22124', '1', '11'], s: '5 \u2212 2x = \u22123 \u2192 \u22122x = \u22128 \u2192 x = 4' },
      { t: 'A', p: 'f(x) = 6x \u2212 4.\nTentukan nilai f(0) + f(1).', o: ['\u22122', '2', '\u22126', '6'], s: 'f(0) = \u22124, f(1) = 2 \u2192 jumlah = \u22122' }
    ],
    2: [
      { t: 'A', p: 'Tentukan gradien garis yang melalui titik (2, 1) dan (5, 10).', o: ['3', '1/3', '9', '4'], s: 'm = (10 \u2212 1)/(5 \u2212 2) = 9/3 = 3' },
      { t: 'A', p: 'Grafik f(x) = \u22123x + 7 memotong sumbu-y di titik ...', o: ['(0, 7)', '(7, 0)', '(0, \u22123)', '(7/3, 0)'], s: 'x = 0 \u2192 f(0) = 7, jadi titiknya (0, 7)' },
      { t: 'A', p: 'Fungsi linear f memenuhi f(0) = \u22122 dan f(3) = 10.\nTentukan f(x).', o: ['4x \u2212 2', '3x \u2212 2', '4x + 2', '\u22122x + 4'], s: 'b = f(0) = \u22122; a = (10 \u2212 (\u22122))/3 = 4 \u2192 f(x) = 4x \u2212 2' },
      { t: 'A', p: 'f(x) = ax + b, f(1) = 7, dan f(4) = 16.\nTentukan nilai f(10).', o: ['34', '37', '30', '40'], s: '3a = 9 \u2192 a = 3, b = 4 \u2192 f(10) = 34' },
      { t: 'A', p: 'Tarif ojek online: Rp8.000 + Rp2.500 per km.\nBerapa tarif untuk 6 km?', o: ['Rp23.000', 'Rp15.000', 'Rp20.500', 'Rp25.500'], s: 'f(x) = 2500x + 8000 \u2192 f(6) = 15000 + 8000 = 23000' },
      { t: 'A', p: 'Kuota internet 30 GB berkurang 1,5 GB per hari.\nSetelah berapa hari kuota habis?', o: ['20', '15', '30', '45'], s: '30 \u2212 1,5x = 0 \u2192 x = 20' }
    ],
    3: [
      { t: 'A', p: 'f(x) = 2x \u2212 7 dan g(x) = \u2212x + 5.\nUntuk x berapa f(x) = g(x)?', o: ['4', '\u22124', '2', '12'], s: '2x \u2212 7 = \u2212x + 5 \u2192 3x = 12 \u2192 x = 4' },
      { t: 'A', p: 'Fungsi linear f memenuhi f(2) = 5 dan f(\u22121) = \u22124.\nTentukan nilai f(5).', o: ['14', '15', '11', '16'], s: 'a = (5 \u2212 (\u22124))/3 = 3, b = \u22121 \u2192 f(5) = 14' },
      { t: 'B', p: 'f(x) = 3x + 1, g(x) = x + 4.\nTentukan nilai (f \u2218 g)(2).', o: ['19', '11', '10', '21'], s: 'g(2) = 6 \u2192 f(6) = 19' },
      { t: 'B', p: 'f(x) = x \u2212 5, g(x) = 2x.\nTentukan nilai (g \u2218 f)(7).', o: ['4', '9', '\u22123', '14'], s: 'f(7) = 2 \u2192 g(2) = 4' },
      { t: 'B', p: 'f(x) = x\u00B2, g(x) = x \u2212 3.\nTentukan nilai (g \u2218 f)(5).', o: ['22', '4', '16', '28'], s: 'f(5) = 25 \u2192 g(25) = 22' },
      { t: 'B', p: 'f(x) = 2x + 1.\nTentukan nilai (f \u2218 f)(3).', o: ['15', '14', '13', '49'], s: 'f(3) = 7 \u2192 f(7) = 15' }
    ],
    4: [
      { t: 'B', p: 'f(x) = x + 4, g(x) = 3x.\nTentukan (f \u2218 g)(x).', o: ['3x + 4', '3x + 12', '3x + 7', 'x + 12'], s: 'f(g(x)) = f(3x) = 3x + 4' },
      { t: 'B', p: 'f(x) = x + 4, g(x) = 3x.\nTentukan (g \u2218 f)(x).', o: ['3x + 12', '3x + 4', '3x + 7', '4x + 3'], s: 'g(f(x)) = 3(x + 4) = 3x + 12' },
      { t: 'B', p: 'f(x) = 2x \u2212 3, g(x) = 4x + 1.\nTentukan (f \u2218 g)(x).', o: ['8x \u2212 1', '8x \u2212 11', '8x + 1', '6x \u2212 2'], s: 'f(g(x)) = 2(4x + 1) \u2212 3 = 8x \u2212 1' },
      { t: 'B', p: 'f(x) = 5x, g(x) = x \u2212 2.\nTentukan (g \u2218 f)(x).', o: ['5x \u2212 2', '5x \u2212 10', 'x + 3', '5x + 2'], s: 'g(f(x)) = 5x \u2212 2' },
      { t: 'B', p: 'f(x) = 3x \u2212 2.\nTentukan (f \u2218 f)(x).', o: ['9x \u2212 8', '9x \u2212 6', '9x \u2212 4', '6x \u2212 4'], s: 'f(f(x)) = 3(3x \u2212 2) \u2212 2 = 9x \u2212 8' },
      { t: 'B', p: 'f(x) = x + 1, g(x) = x\u00B2.\nTentukan (g \u2218 f)(x).', o: ['x\u00B2 + 2x + 1', 'x\u00B2 + 1', 'x\u00B2 + x + 1', '2x + 1'], s: 'g(f(x)) = (x + 1)\u00B2 = x\u00B2 + 2x + 1' }
    ],
    5: [
      { t: 'B', p: 'f(x) = 2x + 3, g(x) = x\u00B2 \u2212 1.\nTentukan (f \u2218 g)(x).', o: ['2x\u00B2 + 1', '4x\u00B2 + 12x + 8', '2x\u00B2 + 2', '2x\u00B2 \u2212 1'], s: 'f(g(x)) = 2(x\u00B2 \u2212 1) + 3 = 2x\u00B2 + 1' },
      { t: 'B', p: 'f(x) = 2x + 3, g(x) = x\u00B2 \u2212 1.\nTentukan (g \u2218 f)(x).', o: ['4x\u00B2 + 12x + 8', '2x\u00B2 + 1', '4x\u00B2 + 9', '4x\u00B2 + 6x + 8'], s: 'g(f(x)) = (2x + 3)\u00B2 \u2212 1 = 4x\u00B2 + 12x + 8' },
      { t: 'B', p: 'f(x) = x \u2212 1, g(x) = 3x, h(x) = x + 2.\nTentukan nilai (f \u2218 g \u2218 h)(1).', o: ['8', '5', '6', '9'], s: 'h(1) = 3 \u2192 g(3) = 9 \u2192 f(9) = 8' },
      { t: 'B', p: 'f(x) = 4x + k, g(x) = x + 1, dan (f \u2218 g)(2) = 17.\nTentukan nilai k.', o: ['5', '9', '3', '1'], s: 'g(2) = 3 \u2192 4\u00B73 + k = 17 \u2192 k = 5' },
      { t: 'B', p: 'f(x) = x + 3 dan (f \u2218 g)(x) = 2x + 7.\nTentukan g(x).', o: ['2x + 4', '2x + 10', '2x + 7', 'x + 4'], s: 'g(x) + 3 = 2x + 7 \u2192 g(x) = 2x + 4' },
      { t: 'B', p: 'f linear dengan f(1) = 4 dan (f \u2218 f)(1) = 10.\nTentukan f(x).', o: ['2x + 2', '3x + 1', 'x + 3', '6x \u2212 2'], s: 'a + b = 4 dan f(4) = 4a + b = 10 \u2192 a = 2, b = 2' }
    ],
    6: [
      { t: 'C', p: 'Tentukan invers dari f(x) = x \u2212 9.', o: ['x + 9', '9 \u2212 x', 'x/9', '\u2212x \u2212 9'], s: 'y = x \u2212 9 \u2192 x = y + 9 \u2192 f\u207B\u00B9(x) = x + 9' },
      { t: 'C', p: 'Tentukan invers dari f(x) = 5x.', o: ['x/5', '5/x', 'x \u2212 5', '\u22125x'], s: 'y = 5x \u2192 x = y/5' },
      { t: 'C', p: 'Tentukan invers dari f(x) = 2x + 8.', o: ['(x \u2212 8)/2', '2x \u2212 8', '(x + 8)/2', 'x/2 \u2212 8'], s: 'y = 2x + 8 \u2192 x = (y \u2212 8)/2' },
      { t: 'C', p: 'f(x) = 4x \u2212 3.\nTentukan nilai f\u207B\u00B9(9).', o: ['3', '33', '3/2', '12'], s: '4x \u2212 3 = 9 \u2192 x = 3' },
      { t: 'C', p: 'Tentukan invers dari f(x) = (x + 1)/3.', o: ['3x \u2212 1', '3x + 1', '(x \u2212 1)/3', '3(x + 1)'], s: '3y = x + 1 \u2192 x = 3y \u2212 1' },
      { t: 'C', p: 'Tentukan invers dari f(x) = 7 \u2212 x.', o: ['7 \u2212 x', 'x \u2212 7', 'x + 7', '\u2212x \u2212 7'], s: 'y = 7 \u2212 x \u2192 x = 7 \u2212 y (invers dirinya sendiri)' }
    ],
    7: [
      { t: 'C', p: 'Tentukan invers dari f(x) = (3x \u2212 2)/4.', o: ['(4x + 2)/3', '(4x \u2212 2)/3', '(3x + 2)/4', '4/(3x \u2212 2)'], s: '4y = 3x \u2212 2 \u2192 x = (4y + 2)/3' },
      { t: 'C', p: 'Tentukan invers dari f(x) = \u22122x + 6.', o: ['(6 \u2212 x)/2', '(x \u2212 6)/2', '(x + 6)/2', '\u22122x \u2212 6'], s: '2x = 6 \u2212 y \u2192 x = (6 \u2212 y)/2' },
      { t: 'C', p: 'Tentukan invers dari f(x) = x/3 + 2.', o: ['3x \u2212 6', '3x \u2212 2', '3(x + 2)', '(x \u2212 2)/3'], s: 'x = 3(y \u2212 2) = 3y \u2212 6' },
      { t: 'C', p: 'f(x) = 5x + 1.\nTentukan nilai f\u207B\u00B9(\u22129).', o: ['\u22122', '\u221244', '\u22128/5', '2'], s: '5x + 1 = \u22129 \u2192 x = \u22122' },
      { t: 'C', p: 'f(x) = x\u00B3 + 1.\nTentukan nilai f\u207B\u00B9(9).', o: ['2', '730', '\u221B10', '3'], s: 'f\u207B\u00B9(x) = \u221B(x \u2212 1) \u2192 \u221B8 = 2' },
      { t: 'C', p: 'Konversi suhu F = (9/5)C + 32.\nDengan fungsi inversnya, 77\u00B0F sama dengan ...', o: ['25\u00B0C', '45\u00B0C', '13\u00B0C', '60\u00B0C'], s: 'C = (5/9)(F \u2212 32) = (5/9)\u00B745 = 25' }
    ],
    8: [
      { t: 'B', p: 'f(x) = 2x + 3 dan (f \u2218 g)(x) = 6x \u2212 1.\nTentukan g(x).', o: ['3x \u2212 2', '3x \u2212 4', '3x + 1', '6x \u2212 4'], s: '2g(x) + 3 = 6x \u2212 1 \u2192 g(x) = 3x \u2212 2' },
      { t: 'B', p: 'g(x) = 2x + 1 dan (f \u2218 g)(x) = 10x + 3.\nTentukan f(x).', o: ['5x \u2212 2', '5x + 3', '10x \u2212 2', '5x + 2'], s: '10x + 3 = 5(2x + 1) \u2212 2 \u2192 f(x) = 5x \u2212 2' },
      { t: 'B', p: 'f(x) = x + 2.\nTentukan (f \u2218 f \u2218 f)(x).', o: ['x + 6', '3x + 2', 'x + 8', '3x + 6'], s: 'Setiap f menambah 2 \u2192 x + 6' },
      { t: 'B', p: 'g(x) = x + 3 dan (f \u2218 g)(x) = x\u00B2 + 6x + 10.\nTentukan f(x).', o: ['x\u00B2 + 1', 'x\u00B2 + 3', 'x\u00B2 + 6x + 1', 'x + 1'], s: 'x\u00B2 + 6x + 10 = (x + 3)\u00B2 + 1 \u2192 f(x) = x\u00B2 + 1' },
      { t: 'B', p: 'f(x) = 3x + b, g(x) = 2x + 1.\nAgar f \u2218 g = g \u2218 f, tentukan nilai b.', o: ['2', '1', '3', '\u22122'], s: '6x + 3 + b = 6x + 2b + 1 \u2192 b = 2' },
      { t: 'B', p: 'f(x) = 2x \u2212 1, g(x) = x\u00B2, dan (g \u2218 f)(x) = 9.\nNilai x yang memenuhi adalah ...', o: ['2 atau \u22121', '2 atau 1', '\u22122 atau 1', '5 atau \u22124'], s: '(2x \u2212 1)\u00B2 = 9 \u2192 2x \u2212 1 = \u00B13 \u2192 x = 2 atau x = \u22121' }
    ],
    9: [
      { t: 'C', p: 'Tentukan invers dari f(x) = (x + 3)/(x \u2212 2), x \u2260 2.', o: ['(2x + 3)/(x \u2212 1)', '(x \u2212 2)/(x + 3)', '(2x \u2212 3)/(x + 1)', '(x + 3)/(x \u2212 2)'], s: 'y(x \u2212 2) = x + 3 \u2192 x(y \u2212 1) = 2y + 3 \u2192 x = (2y + 3)/(y \u2212 1)' },
      { t: 'C', p: 'Tentukan invers dari f(x) = (2x \u2212 3)/(x + 4), x \u2260 \u22124.', o: ['(4x + 3)/(2 \u2212 x)', '(4x \u2212 3)/(x \u2212 2)', '(x + 4)/(2x \u2212 3)', '(3 \u2212 4x)/(x + 2)'], s: 'x(y \u2212 2) = \u22124y \u2212 3 \u2192 x = (4y + 3)/(2 \u2212 y)' },
      { t: 'C', p: 'Tentukan invers dari f(x) = 3/(x \u2212 1), x \u2260 1.', o: ['(x + 3)/x', '3/(x + 1)', 'x/(x + 3)', '(3 + x)/(x \u2212 1)'], s: 'x \u2212 1 = 3/y \u2192 x = (y + 3)/y' },
      { t: 'C', p: 'f(x) = 2x + 1, g(x) = x \u2212 3.\nTentukan (f \u2218 g)\u207B\u00B9(x).', o: ['(x + 5)/2', '(x \u2212 5)/2', '2x + 5', '(x + 1)/2 \u2212 3'], s: '(f \u2218 g)(x) = 2x \u2212 5 \u2192 invers (x + 5)/2' },
      { t: 'C', p: 'f(x) = 3x, g(x) = x + 4.\nTentukan nilai (g \u2218 f)\u207B\u00B9(19).', o: ['5', '61', '23/3', '7'], s: '(g \u2218 f)(x) = 3x + 4 \u2192 (19 \u2212 4)/3 = 5' },
      { t: 'C', p: 'Tentukan invers dari f(x) = (x + 2)/(x \u2212 1), x \u2260 1.', o: ['(x + 2)/(x \u2212 1)', '(x \u2212 1)/(x + 2)', '(x \u2212 2)/(x + 1)', '(2 \u2212 x)/(x + 1)'], s: 'x(y \u2212 1) = y + 2 \u2192 fungsi ini invers dirinya sendiri' }
    ],
    10: [
      { t: 'C', p: 'f\u207B\u00B9(x) = (x \u2212 1)/2 dan g(x) = x + 5.\nTentukan (f \u2218 g)(x).', o: ['2x + 11', '2x + 6', '(x + 4)/2', '2x + 5'], s: 'f(x) = 2x + 1 \u2192 f(x + 5) = 2x + 11' },
      { t: 'C', p: 'f(x) = 2x \u2212 3 dan (f \u2218 g)(x) = 4x + 1.\nTentukan g\u207B\u00B9(x).', o: ['(x \u2212 2)/2', '2x + 2', '(x + 2)/2', '(x \u2212 1)/4'], s: '2g(x) \u2212 3 = 4x + 1 \u2192 g(x) = 2x + 2 \u2192 g\u207B\u00B9(x) = (x \u2212 2)/2' },
      { t: 'C', p: 'f(x) = (x + 1)/(x \u2212 3), x \u2260 3.\nTentukan nilai f\u207B\u00B9(2).', o: ['7', '3', '\u22127', '5'], s: '(x + 1)/(x \u2212 3) = 2 \u2192 x + 1 = 2x \u2212 6 \u2192 x = 7' },
      { t: 'C', p: 'f(x) = x\u00B2 + 2x untuk x \u2265 \u22121.\nTentukan f\u207B\u00B9(x).', o: ['\u221A(x + 1) \u2212 1', '\u221Ax \u2212 1', '\u221A(x \u2212 1) + 1', '\u221A(x + 2)'], s: 'x\u00B2 + 2x = (x + 1)\u00B2 \u2212 1 \u2192 x = \u221A(y + 1) \u2212 1' },
      { t: 'C', p: 'f(x) = 2x + 3.\nTentukan nilai (f \u2218 f\u207B\u00B9 \u2218 f)(4).', o: ['11', '4', '19', '8'], s: 'f \u2218 f\u207B\u00B9 adalah fungsi identitas \u2192 hasilnya f(4) = 11' },
      { t: 'B', p: 'f(x) = ax + b dengan a > 0 dan (f \u2218 f)(x) = 9x + 8.\nTentukan f(x).', o: ['3x + 2', '3x + 4', '9x + 2', '3x + 8'], s: 'a\u00B2 = 9 \u2192 a = 3; ab + b = 4b = 8 \u2192 b = 2' }
    ]
  };

  const FINISHER = {
    5: [
      { t: 'E', p: 'Caesar cipher E(x) = (x + 3) mod 26.\nEnkripsi kata KODE.', o: ['NRGH', 'LPEF', 'HLAB', 'NRHG'], s: 'K(10)\u219213=N, O(14)\u219217=R, D(3)\u21926=G, E(4)\u21927=H' },
      { t: 'E', p: 'Pesan VLVWHP dienkripsi dengan Caesar geser 3.\nApa pesan aslinya?', o: ['SISTEM', 'SKSTEM', 'SYSTEM', 'YOYZKS'], s: 'Dekripsi D(y) = (y \u2212 3) mod 26: V\u2192S, L\u2192I, V\u2192S, W\u2192T, H\u2192E, P\u2192M' },
      { t: 'E', p: 'E(x) = (x + 5) mod 26.\nEnkripsi kata BUG.', o: ['GZL', 'GYL', 'FZL', 'GZK'], s: 'B(1)\u21926=G, U(20)\u219225=Z, G(6)\u219211=L' }
    ],
    10: [
      { t: 'E', p: 'Affine cipher E(x) = (5x + 8) mod 26.\nEnkripsi kata RPL.', o: ['PFL', 'PLF', 'RPL', 'FPL'], s: 'R(17): 93 mod 26 = 15 = P; P(15): 83 mod 26 = 5 = F; L(11): 63 mod 26 = 11 = L' },
      { t: 'E', p: 'Tentukan fungsi dekripsi (invers) dari E(x) = (5x + 8) mod 26.', o: ['21(y \u2212 8) mod 26', '5(y \u2212 8) mod 26', '(y \u2212 8)/5', '(21y \u2212 8) mod 26'], s: 'Invers 5 modulo 26 adalah 21 karena 5\u00B721 = 105 = 4\u00B726 + 1' },
      { t: 'E', p: 'Affine cipher E(x) = (3x + 1) mod 26.\nEnkripsi kata MAT.', o: ['LBG', 'MBT', 'KBG', 'LAG'], s: 'M(12): 37 mod 26 = 11 = L; A(0): 1 = B; T(19): 58 mod 26 = 6 = G' }
    ]
  };

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(window.CW.math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function toQuestion(entry, tier) {
    return {
      kind: 'bank',
      topic: entry.t,
      tier,
      prompt: entry.p,
      answer: entry.o[0],
      options: shuffle(entry.o),
      hint: HINTS[entry.t],
      steps: ['Pembahasan: ' + entry.s, 'Jadi jawabannya: ' + entry.o[0] + '.']
    };
  }

  /* Ambil soal acak yang belum dipakai; `used` (array indeks) direset saat pool habis. */
  function pickFrom(pool, used) {
    if (used.length >= pool.length) used.length = 0;
    const free = pool.map((_, i) => i).filter(i => !used.includes(i));
    const idx = free[Math.floor(window.CW.math.random() * free.length)];
    used.push(idx);
    return pool[idx];
  }

  const S = {
    bank: BANK,
    finisher: FINISHER,
    hasBank: stageId => !!BANK[stageId],
    hasFinisher: stageId => !!FINISHER[stageId],
    pick: (stageId, tier, used) => toQuestion(pickFrom(BANK[stageId], used), tier),
    pickFinisher: (stageId, tier) => toQuestion(pickFrom(FINISHER[stageId], []), tier)
  };

  window.CW = window.CW || {};
  window.CW.soal = S;
})();
