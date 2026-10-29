/* ============================================================
   CIPHER WARS - Audio Engine
   All sound effects synthesized with WebAudio — no assets.
   Exposes global: CW.audio
   ============================================================ */
(function () {
  'use strict';
  const A = { enabled: true };
  let ctx = null;

  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* Tiny helper: one oscillator voice with gain envelope. */
  function tone(freq, dur, opts) {
    if (!A.enabled) return;
    const c = ac(); if (!c) return;
    opts = opts || {};
    const t0 = c.currentTime + (opts.delay || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = opts.type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    if (opts.slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slide), t0 + dur);
    const vol = (opts.vol == null ? 0.15 : opts.vol);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + (opts.attack || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(opts.dest || c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  /* Noise burst (for hits/explosions). */
  function noise(dur, opts) {
    if (!A.enabled) return;
    const c = ac(); if (!c) return;
    opts = opts || {};
    const t0 = c.currentTime + (opts.delay || 0);
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    const vol = (opts.vol == null ? 0.2 : opts.vol);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    const f = c.createBiquadFilter();
    f.type = opts.filter || 'lowpass';
    f.frequency.value = opts.freq || 1200;
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(t0);
  }

  const seq = (notes) => notes.forEach(n => tone(n[0], n[2], { type: n[3] || 'square', delay: n[1] || 0, vol: n[4] }));

  A.ui = {
    click:   () => tone(660, 0.06, { type: 'triangle', vol: 0.08 }),
    hover:   () => tone(440, 0.03, { type: 'sine', vol: 0.03 }),
    back:    () => tone(330, 0.08, { type: 'triangle', vol: 0.08 })
  };

  A.fx = {
    correct: () => seq([[523, 0, 0.09], [659, 0.07, 0.09], [784, 0.14, 0.16, 'triangle']]),
    wrong:   () => { tone(196, 0.22, { type: 'sawtooth', vol: 0.14, slide: 110 }); noise(0.15, { vol: 0.08, freq: 500 }); },
    hit:     () => { noise(0.18, { vol: 0.22, freq: 900 }); tone(140, 0.15, { type: 'square', vol: 0.16, slide: 60 }); },
    bigHit:  () => { noise(0.35, { vol: 0.3, freq: 700 }); tone(90, 0.3, { type: 'sawtooth', vol: 0.2, slide: 40 }); },
    shield:  () => seq([[392, 0, 0.1, 'sine'], [523, 0.06, 0.12, 'sine'], [659, 0.12, 0.18, 'sine']]),
    heal:    () => seq([[523, 0, 0.1, 'sine'], [659, 0.08, 0.1, 'sine'], [784, 0.16, 0.14, 'sine'], [1047, 0.24, 0.2, 'sine']]),
    energy:  () => tone(880, 0.08, { type: 'triangle', vol: 0.1, slide: 1320 }),
    debuff:  () => tone(300, 0.25, { type: 'sawtooth', vol: 0.12, slide: 120 }),
    telegraph: () => seq([[220, 0, 0.12, 'sawtooth', 0.12], [233, 0.15, 0.12, 'sawtooth', 0.12], [220, 0.3, 0.2, 'sawtooth', 0.12]]),
    ult:     () => { noise(0.6, { vol: 0.34, freq: 500 }); seq([[110, 0, 0.5, 'sawtooth', 0.22], [82, 0.1, 0.6, 'sawtooth', 0.22]]); },
    tick:    () => tone(1200, 0.03, { type: 'sine', vol: 0.05 }),
    bossIntro: () => seq([[110, 0, 0.3, 'sawtooth', 0.2], [110, 0.35, 0.3, 'sawtooth', 0.2], [147, 0.7, 0.4, 'sawtooth', 0.2], [98, 1.1, 0.7, 'sawtooth', 0.22]])
  };

  A.fanfare = () => seq([
    [523, 0, 0.12], [523, 0.12, 0.12], [523, 0.24, 0.12], [659, 0.36, 0.2],
    [784, 0.56, 0.3, 'triangle'], [1047, 0.86, 0.5, 'triangle', 0.18]
  ]);
  A.gameover = () => seq([
    [392, 0, 0.2], [330, 0.22, 0.2], [294, 0.44, 0.2], [262, 0.66, 0.5, 'sawtooth', 0.14]
  ]);
  A.levelup = () => seq([
    [659, 0, 0.1], [784, 0.1, 0.1], [988, 0.2, 0.1], [1319, 0.3, 0.35, 'triangle']
  ]);

  window.CW = window.CW || {};
  window.CW.audio = A;
})();
