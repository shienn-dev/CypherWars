/* ============================================================
   CIPHER WARS - Math Engine
   Exact-arithmetic polynomial engine for function composition
   challenges. Every question, distractor, hint and solution
   step is derived from real math — never hardcoded strings.
   Exposes global: CW.math
   ============================================================ */
(function () {
  'use strict';
  const M = {};

  /* ---------- Polynomials: coefficient arrays ----------
     p = [c0, c1, c2, ...] represents c0 + c1*x + c2*x^2 ... */

  function trim(p) {
    let n = p.length;
    while (n > 1 && p[n - 1] === 0) n--;
    return p.slice(0, n);
  }

  M.pAdd = (a, b) => {
    const n = Math.max(a.length, b.length), out = new Array(n).fill(0);
    for (let i = 0; i < n; i++) out[i] = (a[i] || 0) + (b[i] || 0);
    return trim(out);
  };

  M.pScale = (a, k) => trim(a.map(c => c * k));

  M.pSub = (a, b) => M.pAdd(a, M.pScale(b, -1));

  M.pMul = (a, b) => {
    const out = new Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i++)
      for (let j = 0; j < b.length; j++) out[i + j] += a[i] * b[j];
    return trim(out);
  };

  /* (p ∘ q)(x) = p(q(x)) */
  M.pCompose = (p, q) => {
    let out = [0], pow = [1];
    for (let i = 0; i < p.length; i++) {
      out = M.pAdd(out, M.pScale(pow, p[i]));
      pow = M.pMul(pow, q);
    }
    return trim(out);
  };

  /* Integer evaluation via Horner — always exact for integer x */
  M.pEval = (p, x) => {
    let acc = 0;
    for (let i = p.length - 1; i >= 0; i--) acc = acc * x + p[i];
    return acc;
  };

  M.pIsZero = p => p.length === 1 && p[0] === 0;

  /* ---------- Pretty printing ---------- */
  const SUP = { 2: '\u00B2', 3: '\u00B3', 4: '\u2074', 5: '\u2075' };

  function term(coef, deg, first) {
    let c = Math.abs(coef);
    let cs;
    if (deg === 0) cs = String(c);
    else {
      cs = (c === 1 ? '' : String(c)) + 'x' + (deg > 1 ? SUP[deg] || ('^' + deg) : '');
    }
    if (first) return (coef < 0 ? '-' : '') + cs;
    return (coef < 0 ? ' \u2212 ' : ' + ') + cs;
  }

  /* Render polynomial descending, e.g. "2x\u00B2 \u2212 3x + 4" */
  M.formatPoly = p => {
    p = trim(p);
    if (p.length === 1) return String(p[0]);
    let out = '';
    for (let d = p.length - 1; d >= 0; d--) {
      if (p[d] === 0) continue;
      out += term(p[d], d, out === '');
    }
    return out;
  };

  /* Render a function definition, e.g. "f(x) = 2x \u2212 3" */
  M.formatFn = (name, p) => name + '(x) = ' + M.formatPoly(p);

  /* Render a full composition expression, e.g. "(f \u2218 g)(x)" */
  M.composeLabel = (a, b) => '(' + a + ' \u2218 ' + b + ')';

  /* ---------- RNG (injectable for deterministic tests) ---------- */
  let rng = Math.random;
  M.setRng = fn => { rng = fn; };
  const ri = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1)); // inclusive
  const pick = arr => arr[Math.floor(rng() * arr.length)];
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---------- Function factories (randomized by tier) ---------- */
  function linFn(lo, hi, allowZeroA) {
    let a = ri(lo, hi);
    if (!allowZeroA && a === 0) a = a >= 0 ? 1 : -1;
    return [ri(-6, 8), a]; // [c, a] => a*x + c
  }
  function quadFn(lo, hi) {
    let a = ri(lo, hi);
    if (a === 0) a = 1;
    return [ri(-6, 8), ri(-7, 7), a];
  }
  const linear  = () => linFn(1, 4, true);
  const linearNeg = () => linFn(-3, 4, false);
  const quad    = () => quadFn(1, 3);
  const constFn = () => [ri(-5, 6)];

  /* Build the inner-to-outer function list for a given tier.
     Returns [{name, poly}] ordered as applied first -> last:
     the value is f3(f2(f1(x))). */
  function buildStack(tier) {
    const names = ['f', 'g', 'h'];
    let polys;
    switch (tier) {
      case 1:
        polys = [linear(), linear()];
        break;
      case 2:
        polys = rng() < 0.5 ? [linear(), linearNeg()] : [linearNeg(), linear()];
        break;
      case 3:
        polys = rng() < 0.5 ? [linear(), quad()] : [quad(), linear()];
        break;
      case 4:
        polys = rng() < 0.5
          ? [linear(), linear(), quad()]
          : [quad(), linear(), linear()];
        break;
      case 5:
        polys = rng() < 0.5
          ? [linear(), quad(), quad()]
          : [quad(), quad(), linear()];
        break;
      default:
        polys = [linear(), linear()];
    }
    return polys.map((p, i) => ({ name: names[i], poly: p }));
  }

  /* ---------- Question kinds ---------- */

  /* Numeric evaluation of a composition chain at integer x. */
  function genEval(tier) {
    const stack = buildStack(tier);
    const x = ri(-3, 4);
    let val = x;
    const steps = ['Langkah 1: substitusi x = ' + x + ' ke fungsi paling dalam.'];
    for (let i = 0; i < stack.length; i++) {
      const s = stack[i];
      const next = M.pEval(s.poly, val);
      steps.push(
        'Langkah ' + (i + 2) + ': ' + s.name + '(' + val + ') = ' +
        M.formatPoly(s.poly).replace(/x/g, '(' + val + ')') + ' = ' + next
      );
      val = next;
    }
    const outer = stack[stack.length - 1].name;
    const label = stack.length === 2
      ? M.composeLabel(stack[1].name, stack[0].name)
      : M.composeLabel(stack[2].name, M.composeLabel(stack[1].name, stack[0].name).replace(/[()]/g, ''));
    const inner = stack.slice(0, -1).map(s => M.formatFn(s.name, s.poly)).join(',  ');
    const defs = inner + ',  ' + M.formatFn(outer, stack[stack.length - 1].poly);
    const answer = val;

    /* Distractors: classic composition mistakes, all recomputed exactly. */
    const cand = [];
    if (stack.length === 2) {
      const swapped = M.pEval(stack[0].poly, M.pEval(stack[1].poly, x));
      cand.push(swapped);
      cand.push(M.pEval(M.pAdd(stack[0].poly, stack[1].poly), x)); // f+g applied
      cand.push(M.pEval(M.pMul(stack[0].poly, stack[1].poly), x)); // f*g applied
    }
    cand.push(M.pEval(stack[stack.length - 1].poly, x)); // forgot to substitute
    cand.push(M.pEval(stack[stack.length - 1].poly, x + 1));
    cand.push(M.pEval(stack[stack.length - 1].poly, x - 1));
    cand.push(answer + ri(1, 3) * (rng() < 0.5 ? 1 : -1));
    cand.push(-answer);
    const options = dedupeNum(answer, cand, 3);

    const hintVal = M.pEval(stack[0].poly, x);
    return {
      kind: 'eval',
      tier,
      prompt:
        'Diketahui ' + defs + '.\n' +
        'Hitung nilai ' + label + '(' + x + ').',
      answer,
      options,
      hint: 'Kerjakan dari dalam ke luar: hitung dulu ' + stack[0].name +
        '(' + x + ') = ' + hintVal + ', lalu substitusikan hasilnya ke fungsi berikutnya.',
      steps: steps.concat(['Jadi ' + label + '(' + x + ') = ' + answer + '.'])
    };
  }

  /* Solve f(x) = k for x — linear only, integer answer. */
  function genSolve(tier) {
    const p = tier >= 4 ? linearNeg() : linear();
    let a = p[1];
    if (a === 0) { a = 2; p[1] = 2; }
    const x = ri(-4, 6);
    const k = M.pEval(p, x);
    const steps = [
      'Langkah 1: tulis persamaan  ' + M.formatPoly(p).replace(/x/g, 'x') + ' = ' + k,
      'Langkah 2: pindahkan konstanta:  ' + a + 'x = ' + k + ' ' + (p[0] < 0 ? '+' : '\u2212') + ' ' + Math.abs(p[0]) + ' = ' + (k - p[0]),
      'Langkah 3: bagi kedua ruas dengan ' + a + ':  x = ' + x,
      'Jadi x = ' + x + '.'
    ];
    const cand = [-x, x + 1, x - 1, Math.round((k + p[0]) / a) + 1, k, k - p[0], x + ri(2, 4) * (rng() < 0.5 ? 1 : -1)];
    const options = dedupeNum(x, cand, 3);
    return {
      kind: 'solve',
      tier,
      prompt: 'Protokol terkunci! Diketahui f(x) = ' + M.formatPoly(p) +
        '.\nTemukan x agar f(x) = ' + k + ' untuk membuka firewall.',
      answer: x,
      options,
      hint: 'Selesaikan persamaan ' + a + 'x ' + (p[0] < 0 ? '\u2212 ' + Math.abs(p[0]) : '+ ' + p[0]) +
        ' = ' + k + ' dengan isolasi variabel x.',
      steps
    };
  }

  /* Symbolic composition: find (f ∘ g)(x) as an expression. */
  function genSymbolic(tier) {
    const f = tier >= 3 ? quad() : linear();
    const g = tier >= 4 ? quad() : linear();
    const comp = M.pCompose(f, g);
    const answer = M.formatPoly(comp);
    const cand = [
      M.formatPoly(M.pCompose(g, f)),                 // reversed order
      M.formatPoly(M.pAdd(f, g)),                     // f + g
      M.formatPoly(M.pMul(f, g)),                     // f * g
      M.formatPoly(M.pSub(comp, [comp[0]])),          // dropped constant
      M.formatPoly(M.pScale(comp, -1)),               // negated
      M.formatPoly(M.pAdd(comp, [0, 0, 1]))           // extra x^2 term
    ];
    const options = dedupeStr(answer, cand, 3);
    return {
      kind: 'symbolic',
      tier,
      prompt: 'Diketahui f(x) = ' + M.formatPoly(f) + ',  g(x) = ' + M.formatPoly(g) +
        '.\nTentukan bentuk fungsi komposisi (f \u2218 g)(x).',
      answer,
      options,
      hint: 'Substitusikan seluruh g(x) ke setiap x pada f(x), kemudian jabarkan dan sederhanakan.',
      steps: [
        'Langkah 1: (f \u2218 g)(x) = f(g(x)) = f(' + M.formatPoly(g) + ')',
        'Langkah 2: substitusikan g(x) ke f:  ' + renderSubstitution(f, M.formatPoly(g)),
        'Langkah 3: jabarkan dan kumpulkan suku sejenis',
        'Jadi (f \u2218 g)(x) = ' + answer + '.'
      ]
    };
  }

  function renderSubstitution(p, inner) {
    return M.formatPoly(p).replace(/x(\u00B2|\u00B3|\u2074|\u2075)?/g, (m, sup) => '(' + inner + ')' + (sup || ''));
  }

  /* ---------- Option helpers ---------- */
  function dedupeNum(answer, cands, n) {
    const out = [answer];
    for (const c of cands) {
      if (typeof c !== 'number' || !isFinite(c)) continue;
      if (!out.some(v => v === c)) out.push(c);
      if (out.length >= n + 1) break;
    }
    let guard = 0;
    while (out.length < n + 1 && guard++ < 50) {
      const c = answer + ri(1, 9) * (rng() < 0.5 ? 1 : -1);
      if (!out.some(v => v === c)) out.push(c);
    }
    return shuffle(out);
  }

  function dedupeStr(answer, cands, n) {
    const out = [answer];
    for (const c of cands) {
      if (typeof c !== 'string') continue;
      if (!out.includes(c)) out.push(c);
      if (out.length >= n + 1) break;
    }
    let guard = 0;
    while (out.length < n + 1 && guard++ < 50) {
      const alt = M.formatPoly(M.pAdd(M.pScale([1, ri(1, 2)], ri(1, 3)), [ri(-4, 4)]));
      if (!out.includes(alt)) out.push(alt);
    }
    return shuffle(out);
  }

  /* ---------- Public generator ----------
     tier 1..5 controls structural difficulty.
     Returns a question object; can throw only on programmer error. */
  M.generate = (tier, kindOverride) => {
    tier = Math.max(1, Math.min(5, tier | 0));
    let kind = kindOverride;
    if (!kind) {
      if (tier === 1) kind = rng() < 0.8 ? 'eval' : 'solve';
      else if (tier === 2) kind = rng() < 0.6 ? 'eval' : (rng() < 0.5 ? 'solve' : 'symbolic');
      else if (tier === 3) kind = rng() < 0.45 ? 'eval' : (rng() < 0.5 ? 'symbolic' : 'solve');
      else kind = rng() < 0.4 ? 'eval' : (rng() < 0.6 ? 'symbolic' : 'solve');
    }
    if (kind === 'eval') return genEval(tier);
    if (kind === 'solve') return genSolve(tier);
    return genSymbolic(tier);
  };

  /* Verify a numeric answer (string compare for symbolic). */
  M.check = (q, choice) => {
    if (q.kind === 'symbolic') return String(choice).trim() === String(q.answer).trim();
    return Number(choice) === Number(q.answer);
  };

  /* Time budget (seconds) for a question, before stage/debuff pressure. */
  M.baseTime = tier => [0, 30, 30, 35, 40, 45][Math.max(1, Math.min(5, tier | 0))];

  /* Self-test hook used by the QA script (Node) — nothing in-game. */
  M._internals = { trim, buildStack, ri, pick };

  window.CW = window.CW || {};
  window.CW.math = M;
})();
