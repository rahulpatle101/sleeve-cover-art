// FORM-LANGUAGE RESET LAB — static study only (not app code). Reads the app's geometry/composition; changes nothing.
// One geometry model per family. Density never just adds equal curves.
const { traces, boundingBox, fitBox } = await import('/src/artwork/geometry.ts');
const { registration } = await import('/src/artwork/composition.ts');
const { validateRecipe } = await import('/src/instrument/recipe.ts');

// ---------- fonts (OFL, lab2/fonts) ----------
const FD = '/production/creative-review-v0.2/lab2/fonts/';
for (const [fam, file, desc] of [
  ['Big Shoulders Display', 'BigShouldersDisplay-VF.ttf', { weight: '100 900' }],
  ['Instrument Serif', 'InstrumentSerif-Regular.ttf', {}], ['Instrument Serif', 'InstrumentSerif-Italic.ttf', { style: 'italic' }],
  ['Anybody', 'Anybody-VF.ttf', { weight: '100 900', stretch: '50% 150%' }],
  ['Bodoni Moda', 'BodoniModa-VF.ttf', { weight: '400 900' }], ['Bodoni Moda', 'BodoniModa-Italic-VF.ttf', { weight: '400 900', style: 'italic' }],
  ['Bricolage Grotesque', 'BricolageGrotesque-VF.ttf', { weight: '200 800', stretch: '75% 100%' }],
  ['Syne', 'Syne-VF.ttf', { weight: '400 800' }],
  ['Space Mono', 'SpaceMono-Regular.ttf', {}],
  ['Martian Mono', 'MartianMono-VF.ttf', { weight: '100 800', stretch: '75% 112.5%' }],
]) { const f = new FontFace(fam, `url(${FD}${file})`, desc); await f.load(); document.fonts.add(f); }
await document.fonts.ready;

// ---------- recipes ----------
const BASE = { seed: 0x01352905, artist: 'Mira Okafor', track: 'Tidewater', phase: 45, palette: 0 };
const R = (mode, density, extra = {}) => validateRecipe({ ...BASE, mode, form: 3, rhythm: mode === 'radial' ? 2 : 4, density, ...extra });
const LONG = { artist: 'The Extraordinarily Long Artist Collective', track: 'Songs For The Long Drive Home (Extended Mix)' };

// ---------- utils ----------
const mk = (w, h = w) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const rng = (s) => () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hash2 = (x, y, s) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 2246822519); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mix = (A, B, t) => A.map((v, i) => Math.round(lerp(v, B[i], t)));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const ULTRA = [52, 92, 255], NEUT = [236, 238, 242], AMBER = [255, 168, 52];
const ramp = (t) => (t < 0.5 ? mix(ULTRA, NEUT, t * 2) : mix(NEUT, AMBER, (t - 0.5) * 2));
function geom(r, S) { const trs = traces(r, 4096); return { r, S, trs, box: boundingBox(trs), reg: registration(r, S), N: trs.length, d: r.density }; }
function toPx(tr, p) { const n = tr.length / 2, X = new Float32Array(n), Y = new Float32Array(n); for (let j = 0; j < n; j++) { X[j] = tr[j * 2] * p.scale + p.tx; Y[j] = tr[j * 2 + 1] * p.scale + p.ty; } return { X, Y, n }; }
function poly(x, P, ox = 0, oy = 0) { x.beginPath(); x.moveTo(P.X[0] + ox, P.Y[0] + oy); for (let j = 1; j < P.n; j++) x.lineTo(P.X[j] + ox, P.Y[j] + oy); }
function normals(P) { const NX = new Float32Array(P.n), NY = new Float32Array(P.n); for (let j = 0; j < P.n; j++) { const a = Math.max(0, j - 2), b = Math.min(P.n - 1, j + 2); let tx = P.X[b] - P.X[a], ty = P.Y[b] - P.Y[a]; const l = Math.hypot(tx, ty) || 1; NX[j] = -ty / l; NY[j] = tx / l; } return { NX, NY }; }
function pressure(seed) { const r = rng(seed); const ph = [r() * 6.28, r() * 6.28, r() * 6.28], fr = [2 + r() * 2, 7 + r() * 5, 23 + r() * 11];
  return (t) => clamp(0.5 + 0.3 * Math.sin(fr[0] * 6.283 * t + ph[0]) + 0.15 * Math.sin(fr[1] * 6.283 * t + ph[1]) + 0.07 * Math.sin(fr[2] * 6.283 * t + ph[2]), 0, 1); }
function binTile(seed, density, T = 256) { const c = mk(T), x = c.getContext('2d'), im = x.createImageData(T, T), r = rng(seed); for (let i = 0; i < T * T; i++) im.data[i * 4 + 3] = r() < density ? 255 : 0; x.putImageData(im, 0, 0); return c; }
function tile(x, img, S, cells) { x.imageSmoothingEnabled = false; const st = S / cells; for (let i = 0; i < cells; i++) for (let j = 0; j < cells; j++) x.drawImage(img, i * st, j * st, st + 0.5, st + 0.5); x.imageSmoothingEnabled = true; }
// paper: crisp quantised tooth tile (compressible), never per-pixel noise
function paper(x, S, color, seed, amt = 0.06) { x.fillStyle = color; x.fillRect(0, 0, S, S); x.save(); x.globalAlpha = amt; x.globalCompositeOperation = 'multiply';
  const t = binTile(seed, 0.35); const tc = mk(256), tx = tc.getContext('2d'); tx.fillStyle = '#6b6358'; tx.fillRect(0, 0, 256, 256); tx.globalCompositeOperation = 'destination-in'; tx.drawImage(t, 0, 0); tile(x, tc, S, Math.max(1, Math.round(S / 384))); x.restore(); }
// place the figure so its box fits `size` and its centre lands on (fx, fy)
function place(g, size, fx, fy) { const b = g.box, S = g.S, sc = Math.min(size * S / (b.maxX - b.minX), size * S / (b.maxY - b.minY)); return { scale: sc, tx: fx * S - (b.minX + b.maxX) / 2 * sc, ty: fy * S - (b.minY + b.maxY) / 2 * sc }; }

// =====================================================================================================
// INK — contour & print. Plate A (vermilion) = the key contour. Plate B (black) = key contour misregistered by Phase
// + one secondary contour + ≤ 5 thin echoes. Density → impressions (build-up), pressure range, ink spread (screened),
// edge breakup. Never more full curves beyond the 5-echo cap. Decisive crop: figure enlarged past the top-left trim.
function ink(x, g, opt = {}) {
  const S = g.S, d = g.d, base = Math.max(1, 0.0026 * S), p = opt.place || place(g, 1.12, 0.43, 0.38);
  const key = toPx(g.trs[0], p), second = g.N > 1 ? toPx(g.trs[Math.min(g.N - 1, Math.max(1, Math.round(g.N * 0.35)))], p) : null;
  const E = Math.min(5, Math.floor((d - 1) / 4)), echoes = []; for (let e = 1; e <= E; e++) echoes.push(toPx(g.trs[Math.round(1 + e * (g.N - 2) / (E + 1))], p));
  const imps = 1 + Math.floor(d / 6), spread = base * (0.6 + d / 9), prange = 0.35 + d / 40, breakup = 0.05 + d * 0.004;
  const plates = [{ col: opt.inkA || [226, 70, 42], paths: [key], k: 0 }, { col: opt.inkB || [27, 26, 30], paths: [key, second].filter(Boolean), echoes, k: 1 }];
  const layers = [];
  plates.forEach((pl, pi) => {
    const L = mk(S), lx = L.getContext('2d'); lx.save();
    if (pl.k === 1) lx.translate(g.reg.dx, g.reg.dy);
    lx.lineCap = 'round'; lx.lineJoin = 'round';
    // ink spread (absorbed halo) → becomes screened tint
    lx.filter = `blur(${spread * 0.55}px)`; lx.strokeStyle = 'rgba(0,0,0,0.42)'; lx.lineWidth = base * 1.4 + spread; pl.paths.forEach((P) => { poly(lx, P); lx.stroke(); }); lx.filter = 'none';
    // impressions: same contour pressed 1..5 times with seeded jitter and pressure → build-up, not new curves
    pl.paths.forEach((P, ci) => { const w0 = base * (ci === 0 ? (pi === 0 ? 2.2 : 1.5) : 0.9);
      for (let m = 0; m < imps; m++) { const r = rng(g.r.seed + pi * 131 + ci * 17 + m * 7), jx = (r() - 0.5) * 0.0014 * S, jy = (r() - 0.5) * 0.0014 * S, pr = pressure(g.r.seed + pi * 31 + ci * 5 + m);
        lx.strokeStyle = `rgba(0,0,0,${m === 0 ? 1 : 0.55})`;
        for (let j = 0; j < P.n - 2; j += 2) { lx.lineWidth = Math.max(0.6, w0 * (1 - prange + 2 * prange * pr(j / P.n))); lx.beginPath(); lx.moveTo(P.X[j] + jx, P.Y[j] + jy); lx.lineTo(P.X[j + 2] + jx, P.Y[j + 2] + jy); lx.stroke(); } } });
    (pl.echoes || []).forEach((P, e) => { lx.strokeStyle = `rgba(0,0,0,${0.55 - e * 0.06})`; lx.lineWidth = base * 0.45; poly(lx, P); lx.stroke(); });
    lx.restore();
    // stochastic screen: solids stay solid, tints (spread, pressure fall-off) become dots
    const im = lx.getImageData(0, 0, S, S), D = im.data, cell = Math.max(1, Math.round(S / 2000)), seed = g.r.seed + 501 + pi;
    for (let y = 0, q = 0; y < S; y++) for (let X = 0; X < S; X++, q += 4) { const a = D[q + 3] / 255; if (!a) continue; const t = hash2((X / cell) | 0, (y / cell) | 0, seed) * 0.94 + 0.03;
      if (a > t) { D[q] = pl.col[0]; D[q + 1] = pl.col[1]; D[q + 2] = pl.col[2]; D[q + 3] = 255; } else D[q + 3] = 0; }
    lx.putImageData(im, 0, 0);
    // paper tooth + edge breakup (grows with Density)
    lx.globalCompositeOperation = 'destination-out'; tile(lx, binTile(g.r.seed + 77 + pi, 0.12), S, Math.max(1, Math.round(S / 256)));
    lx.globalAlpha = 0.85; tile(lx, binTile(g.r.seed + 91 + pi, breakup, 128), S, Math.max(1, Math.round(S / 384))); lx.globalAlpha = 1;
    layers.push(L);
  });
  if (opt.knockout) layers.forEach((L) => opt.knockout(L.getContext('2d')));   // typography may mask the plates
  x.save(); x.globalCompositeOperation = 'multiply'; layers.forEach((L) => x.drawImage(L, 0, 0)); x.restore();
}

// =====================================================================================================
// LIGHT — band & field. The key contour becomes ONE band with a spectral gradient across its width
// (ultramarine edge → white core → amber edge). Channel A = inner half, channel B = outer half, offset by Phase:
// at the detents they rejoin into one clear signal. Density → width, intensity, internal filaments, residue.
function light(x, g, opt = {}) {
  const S = g.S, d = g.d, base = 0.0021 * S, p = opt.place || place(g, 0.6, 0.5, 0.47);
  const P = toPx(g.trs[0], p), Nn = normals(P), W = base * (2.2 + d * 0.32), I = 0.55 + d / 40, K = 16;
  const field = mk(S), fx = field.getContext('2d'); fx.lineCap = fx.lineJoin = 'round'; fx.globalCompositeOperation = 'lighter';
  fx.filter = `blur(${W * 1.6}px)`; fx.strokeStyle = rgb([120, 150, 230], 0.05 * I); fx.lineWidth = W * 4.5; poly(fx, P); fx.stroke(); fx.filter = 'none';
  const band = mk(S), bx = band.getContext('2d'); bx.lineCap = bx.lineJoin = 'round'; bx.globalCompositeOperation = 'lighter';
  const off = (o, ch) => { const dx = ch ? g.reg.dx : 0, dy = ch ? g.reg.dy : 0; bx.beginPath(); for (let j = 0; j < P.n; j++) { const X = P.X[j] + Nn.NX[j] * o + dx, Y = P.Y[j] + Nn.NY[j] * o + dy; j ? bx.lineTo(X, Y) : bx.moveTo(X, Y); } };
  for (let ch = 0; ch < 2; ch++) for (let k = 0; k < K; k++) { const u = (k + 0.5) / K, o = ch === 0 ? -W * (1 - u) : W * u, t = (o + W) / (2 * W);
    bx.strokeStyle = rgb(ramp(t), 0.3 * I * (0.35 + 0.65 * Math.pow(1 - Math.abs(o) / W, 0.7))); bx.lineWidth = (2 * W / K) * 1.5; off(o, ch); bx.stroke(); }
  const blurred = mk(S), blx = blurred.getContext('2d'); blx.filter = `blur(${Math.max(1, W / 9)}px)`; blx.drawImage(band, 0, 0);
  // cores: each channel carries half the core; coincident at register → one bright signal
  const core = mk(S), cx = core.getContext('2d'); cx.globalCompositeOperation = 'lighter'; cx.lineCap = 'round';
  for (let ch = 0; ch < 2; ch++) { cx.save(); if (ch) cx.translate(g.reg.dx, g.reg.dy); cx.strokeStyle = rgb(ch ? [255, 236, 214] : [214, 226, 255], 0.38); cx.lineWidth = base * 0.6; poly(cx, P); cx.stroke(); cx.restore(); }
  // internal energy: filaments inside the band (follow the same path, seeded offset/intensity)
  const r = rng(g.r.seed ^ 0xf11), F = Math.floor(d / 4);
  for (let f = 0; f < F; f++) { const o = (r() - 0.5) * 1.3 * W, seg = 96; for (let j = 0; j < P.n - seg; j += seg) { cx.strokeStyle = rgb(ramp((o + W) / (2 * W)), 0.08 + 0.18 * r()); cx.lineWidth = base * 0.22; cx.beginPath();
    for (let q = j; q <= j + seg; q += 2) { const X = P.X[q] + Nn.NX[q] * o, Y = P.Y[q] + Nn.NY[q] * o; q === j ? cx.moveTo(X, Y) : cx.lineTo(X, Y); } cx.stroke(); } }
  // residue: sparse particles shed from the band
  const M = d * 28; for (let m = 0; m < M; m++) { const j = (r() * P.n) | 0, o = (r() + r() + r() - 1.5) * 1.6 * W; const X = P.X[j] + Nn.NX[j] * o, Y = P.Y[j] + Nn.NY[j] * o;
    cx.fillStyle = rgb(ramp(clamp((o + W) / (2 * W), 0, 1)), 0.15 + r() * 0.45); cx.beginPath(); cx.arc(X, Y, (0.0003 + r() * r() * 0.0011) * S, 0, 6.283); cx.fill(); }
  x.save(); x.globalCompositeOperation = 'lighter'; x.drawImage(field, 0, 0); x.drawImage(blurred, 0, 0); x.drawImage(core, 0, 0); x.restore();
  return { blurred, core, field };
}

// =====================================================================================================
// MATTER — surface & relief. ONE plate (the whole cover) with a recessed aperture dish. The key contour is a raised
// rounded ridge inside the dish; channel B is a groove offset by Phase (at register the groove sits in the ridge →
// one rolled profile). Density → relief depth + low-amplitude surface frequency (≤ 4 shallow undulations) + micro brush.
// Lit per pixel from one top-left light (normal from the height-field gradient). Optional embossed type.
function matter(x, g, opt = {}) {
  const S = g.S, d = g.d, base = 0.0021 * S, gate = { x: 0.5 * S, y: 0.44 * S, r: 0.355 * S }, p = opt.place || place(g, 0.62, 0.5, 0.44);
  const key = toPx(g.trs[0], p);
  const ridge = mk(S), rx = ridge.getContext('2d'), groove = mk(S), gx = groove.getContext('2d'), wave = mk(S), wx = wave.getContext('2d'), dish = mk(S), dx = dish.getContext('2d');
  const rw = base * (4.5 + d * 0.3);
  rx.lineCap = rx.lineJoin = 'round'; rx.filter = `blur(${rw * 1.15}px)`; rx.strokeStyle = '#fff'; rx.lineWidth = rw * 0.6; poly(rx, key); rx.stroke(); rx.filter = 'none'; // soft Gaussian swell, not a plateau
  gx.lineCap = gx.lineJoin = 'round'; gx.filter = `blur(${rw * 0.25}px)`; gx.strokeStyle = '#fff'; gx.lineWidth = rw * 0.32; poly(gx, key, g.reg.dx, g.reg.dy); gx.stroke();
  const E = Math.min(4, Math.floor(d / 5)); wx.lineCap = 'round'; wx.filter = `blur(${base * 4}px)`; wx.strokeStyle = '#fff'; wx.lineWidth = base * 3;
  for (let e = 1; e <= E; e++) { poly(wx, toPx(g.trs[Math.round(e * (g.N - 1) / (E + 1))], p)); wx.stroke(); }
  dx.filter = `blur(${0.012 * S}px)`; dx.fillStyle = '#fff'; dx.beginPath(); dx.arc(gate.x, gate.y, gate.r, 0, 6.283); dx.fill();
  // clip relief to the dish
  for (const c of [ridge, groove, wave]) { const cc = c.getContext('2d'); cc.globalCompositeOperation = 'destination-in'; cc.filter = 'none'; cc.beginPath(); cc.arc(gate.x, gate.y, gate.r * 0.985, 0, 6.283); cc.fill(); }
  const emb = mk(S), ex = emb.getContext('2d'); if (opt.emboss) opt.emboss(ex);
  // 8-bit canvases quantise a soft swell into terraces (read as contour lines); convert to float and smooth.
  const toF = (c) => { const D = c.getContext('2d').getImageData(0, 0, S, S).data, F = new Float32Array(S * S); for (let i = 0; i < S * S; i++) F[i] = D[i * 4 + 3] ? D[i * 4] / 255 * D[i * 4 + 3] / 255 : 0; return F; };
  const box = (F, r) => { r = Math.max(1, Math.round(r)); const T = new Float32Array(S * S), n = 2 * r + 1;
    for (let y = 0; y < S; y++) { let acc = 0; const o = y * S; for (let X = -r; X <= r; X++) acc += F[o + clamp(X, 0, S - 1)]; for (let X = 0; X < S; X++) { T[o + X] = acc / n; acc += F[o + Math.min(S - 1, X + r + 1)] - F[o + Math.max(0, X - r)]; } }
    for (let X = 0; X < S; X++) { let acc = 0; for (let y = -r; y <= r; y++) acc += T[clamp(y, 0, S - 1) * S + X]; for (let y = 0; y < S; y++) { F[y * S + X] = acc / n; acc += T[Math.min(S - 1, y + r + 1) * S + X] - T[Math.max(0, y - r) * S + X]; } } return F; };
  const sm = (F, r) => box(box(F, r), r);
  const Ef = opt.emboss ? sm(toF(emb), 0.0011 * S) : null;
  const Af = sm(toF(ridge), rw * 0.35), Bf = sm(toF(groove), rw * 0.15), Wf = sm(toF(wave), base * 2);
  const A = { length: 0 }, B = A, Wv = A, Dh = A;
  const H = new Float32Array(S * S), depth = 1.1 + d * 0.06, rowNoise = new Float32Array(S); { const r = rng(g.r.seed ^ 0xb005); let v = 0; for (let y = 0; y < S; y++) { v = v * 0.6 + (r() - 0.5); rowNoise[y] = v; } }
  // the aperture is a concave bowl with a raised lip — one curved surface the relief lives in
  const bowl = (X, y) => { const rr = Math.hypot(X - gate.x, y - gate.y) / gate.r; return (rr < 1 ? -0.9 * (1 - rr * rr) : 0) + 0.12 * Math.exp(-Math.pow((rr - 1) / 0.025, 2)); };
  for (let i = 0, q = 0; i < S * S; i++, q += 4) { const y = (i / S) | 0; H[i] = bowl(i % S, y) + (Ef ? 0.55 * Ef[i] : 0) + depth * Af[i] - 0.35 * depth * Bf[i] + (0.05 + d * 0.004) * Wf[i] + rowNoise[y] * 0.0025 * (1 + d / 12); }
  const out = x.getImageData(0, 0, S, S), O = out.data, k = S / 260, L = [-0.6, -0.62, 0.42], ll = Math.hypot(...L); L[0] /= ll; L[1] /= ll; L[2] /= ll;
  const Hh = [L[0], L[1], L[2] + 1], hl = Math.hypot(...Hh); Hh[0] /= hl; Hh[1] /= hl; Hh[2] /= hl;
  const alb = opt.albedo || [74, 77, 83], spc = opt.spec || [236, 238, 242], shin = opt.shin || 28;
  for (let y = 1; y < S - 1; y++) for (let X = 1; X < S - 1; X++) { const i = y * S + X; let nx = -(H[i + 1] - H[i - 1]) * k, ny = -(H[i + S] - H[i - S]) * k, nz = 1; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
    const dif = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]), sp = Math.pow(Math.max(0, nx * Hh[0] + ny * Hh[1] + nz * Hh[2]), shin), q = i * 4;
    for (let c = 0; c < 3; c++) O[q + c] = clamp(alb[c] * (0.18 + 1.25 * dif) + spc[c] * sp * 0.95, 0, 255); O[q + 3] = 255; }
  x.putImageData(out, 0, 0);
}

// =====================================================================================================
// TYPOGRAPHY — two concepts per family (different composition, not just a font). ≤ 2 faces; one treatment on display.
function setF(x, css, stretch = 'normal') { x.font = css; x.fontStretch = stretch; x.fontKerning = 'normal'; x.textBaseline = 'alphabetic'; }
function fitSize(x, text, css, size, min, maxW, stretch = 'normal', track = 0) { let s = size; for (;;) { setF(x, css.replace('$', s.toFixed(1)), stretch); x.letterSpacing = `${track * s}px`; if (x.measureText(text).width <= maxW || s <= min) return s; s = Math.max(min, s * 0.95); } }
function lines2(x, text, css, size, maxW, stretch = 'normal', track = 0) { setF(x, css.replace('$', size), stretch); x.letterSpacing = `${track * size}px`; if (x.measureText(text).width <= maxW) return [text];
  const w = text.split(' '); if (w.length < 2) return [text]; let best = null; for (let k = 1; k < w.length; k++) { const L = [w.slice(0, k).join(' '), w.slice(k).join(' ')]; const m = Math.max(...L.map((l) => x.measureText(l).width)); if (!best || m < best.m) best = { L, m }; } return best.L; }
const CAT = (r, fam) => [fam, `PLATE ${r.seed.toString(16).padStart(8, '0').toUpperCase()}`, `${r.mode.toUpperCase()} ${r.form}:${r.rhythm}`, `Φ ${String(r.phase).padStart(3, '0')}° ${Math.abs(Math.sin(2 * r.phase * Math.PI / 180)) < 1e-6 ? 'IN' : 'OFF'} REGISTER`, `${r.density} ${r.density === 1 ? 'PASS' : 'PASSES'}`];
function notation(x, lines, X, Y, size, color, face, align = 'left', lead = 1.45) { setF(x, `400 ${size}px "${face}"`); x.letterSpacing = `${0.03 * size}px`; x.fillStyle = color; x.textAlign = align; lines.forEach((l, i) => x.fillText(l, X, Y + i * size * lead)); x.letterSpacing = '0px'; x.textAlign = 'left'; }

// INK · A — "Crop": Big Shoulders Display Black, uppercase, oversized; bottom of the letters cropped by the trim;
// the vermilion contour overprints the name (treatment: overprint). Notation in Space Mono as a top-right column.
function inkA(x, g, a = g.r.artist, t = g.r.track) { const S = g.S, txt = a.toUpperCase(), maxW = 0.94 * S;
  const L = lines2(x, txt, '900 $px "Big Shoulders Display"', 0.3 * S, maxW, 'normal', -0.01);
  const size = Math.min(...L.map((l) => fitSize(x, l, '900 $px "Big Shoulders Display"', L.length > 1 ? 0.2 * S : 0.3 * S, 0.09 * S, maxW, 'normal', -0.01)));
  const drawName = (ctx) => { setF(ctx, `900 ${size}px "Big Shoulders Display"`); ctx.letterSpacing = `${-0.01 * size}px`; ctx.textAlign = 'left';
    L.forEach((l, i) => ctx.fillText(l, 0.035 * S, 1.0 * S + size * 0.05 - (L.length - 1 - i) * size * 0.9)); ctx.letterSpacing = '0px'; };
  x.fillStyle = '#1B1A1E'; drawName(x); // printed first; plates overprint it (multiply)
  notation(x, [t.toUpperCase(), '', ...CAT(g.r, 'INK · 01')], 0.95 * S, 0.075 * S, 0.0175 * S, '#2A2824', 'Space Mono', 'right'); }
// INK · B — "Column": Instrument Serif, words stacked in a narrow left column, large; the ink plates are knocked out
// around the letters so type and image interlock (treatment: masking). Track in Instrument Serif italic.
function inkB_knock(g, a = g.r.artist) { const S = g.S; return (ctx) => { ctx.save(); ctx.globalCompositeOperation = 'destination-out'; inkB_name(ctx, g, a, true); ctx.restore(); }; }
function inkB_name(x, g, a, knock = false) { const S = g.S, words = a.split(' '), size = fitSize(x, words.reduce((m, w) => (w.length > m.length ? w : m), ''), '400 $px "Instrument Serif"', 0.17 * S, 0.06 * S, 0.62 * S);
  setF(x, `400 ${size}px "Instrument Serif"`); x.textAlign = 'left'; const y0 = 0.93 * S - (words.length - 1) * size * 0.86;
  if (knock) { x.lineWidth = size * 0.09; x.lineJoin = 'round'; x.strokeStyle = '#000'; words.forEach((w, i) => x.strokeText(w, 0.06 * S, y0 + i * size * 0.86)); }
  x.fillStyle = knock ? '#000' : '#141416'; words.forEach((w, i) => x.fillText(w, 0.06 * S, y0 + i * size * 0.86)); return { size, y0 }; }
function inkB(x, g, a = g.r.artist, t = g.r.track) { const S = g.S; const { size, y0 } = inkB_name(x, g, a);
  const ts = fitSize(x, t, 'italic 400 $px "Instrument Serif"', 0.05 * S, 0.03 * S, 0.5 * S); setF(x, `italic 400 ${ts}px "Instrument Serif"`); x.fillStyle = '#C93A20'; x.textAlign = 'left'; x.fillText(t, 0.065 * S, y0 - size * 0.95);
  notation(x, CAT(g.r, 'INK · 01'), 0.95 * S, 0.88 * S, 0.0165 * S, '#2A2824', 'Space Mono', 'right'); }

// LIGHT · A — "Axis": Anybody at 150 % width, thin uppercase, letter-spaced to span the cover, set ON the signal axis;
// the band is masked behind a thin slot where the line of type sits (treatment: masking). Notation: Martian Mono corners.
function lightA_slot(g, a = g.r.artist) { const S = g.S; return (ctx) => { ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0.474 * S, S, 0.058 * S); ctx.restore(); }; }
function lightA(x, g, a = g.r.artist, t = g.r.track) { const S = g.S, txt = a.toUpperCase(), size = fitSize(x, txt, '300 $px "Anybody"', 0.042 * S, 0.02 * S, 0.88 * S, 'extra-expanded', 0.08);
  setF(x, `300 ${size}px "Anybody"`, 'extra-expanded'); x.letterSpacing = `${0.08 * size}px`; x.fillStyle = '#F1F2F5'; x.textAlign = 'center'; x.fillText(txt, 0.5 * S, 0.503 * S + size * 0.36); x.letterSpacing = '0px'; x.textAlign = 'left';
  notation(x, [t.toUpperCase()], 0.06 * S, 0.075 * S, 0.02 * S, '#FFC27A', 'Martian Mono');
  notation(x, CAT(g.r, 'LIGHT · 03'), 0.94 * S, 0.075 * S, 0.0155 * S, '#8C8F9C', 'Martian Mono', 'right'); }
// LIGHT · B — "Lit name": Bodoni Moda italic, very large, crossing the band; letters are dim until the light field
// passes through them (treatment: the field masked into the letterforms). Notation: Martian Mono at the foot.
function lightB(x, g, layers, a = g.r.artist, t = g.r.track) { const S = g.S, L = lines2(x, a, 'italic 400 $px "Bodoni Moda"', 0.19 * S, 0.9 * S);
  const size = Math.min(...L.map((l) => fitSize(x, l, 'italic 400 $px "Bodoni Moda"', L.length > 1 ? 0.13 * S : 0.19 * S, 0.07 * S, 0.9 * S)));
  const drawN = (ctx, fill) => { setF(ctx, `italic 400 ${size}px "Bodoni Moda"`); ctx.fillStyle = fill; ctx.textAlign = 'left'; L.forEach((l, i) => ctx.fillText(l, 0.05 * S, 0.62 * S + (i - (L.length - 1) / 2) * size * 1.0)); };
  drawN(x, 'rgba(206,210,224,0.72)');
  const m = mk(S), mx = m.getContext('2d'); drawN(mx, '#fff'); mx.globalCompositeOperation = 'source-in'; mx.filter = `blur(${0.01 * S}px)`; mx.drawImage(layers.blurred, 0, 0); mx.drawImage(layers.blurred, 0, 0); mx.drawImage(layers.field, 0, 0); mx.filter = 'none';
  x.save(); x.globalCompositeOperation = 'lighter'; x.drawImage(m, 0, 0); x.drawImage(m, 0, 0); x.restore();
  const tl = lines2(x, t.toUpperCase(), '400 $px "Martian Mono"', 0.022 * S, 0.55 * S, 'normal', 0.03); const ts = Math.min(...tl.map((l) => fitSize(x, l, '400 $px "Martian Mono"', 0.022 * S, 0.015 * S, 0.55 * S, 'normal', 0.03)));
  notation(x, tl, 0.06 * S, 0.92 * S - (tl.length - 1) * ts * 1.45, ts, '#FFC27A', 'Martian Mono');
  notation(x, CAT(g.r, 'LIGHT · 03').slice(0, 4), 0.94 * S, 0.86 * S, 0.0155 * S, '#8C8F9C', 'Martian Mono', 'right'); }

// MATTER · A — "Blind emboss": Bricolage Grotesque condensed ExtraBold, embossed into the same plate as the relief
// (treatment: surface embossing, no ink). Track + catalog printed small in Martian Mono.
function matterA_emboss(g, a = g.r.artist) { const S = g.S; return (ctx) => { const tmp = mk(10).getContext('2d'); const L = lines2(tmp, a.toUpperCase(), '800 $px "Bricolage Grotesque"', 0.085 * S, 0.86 * S, 'condensed');
  const size = Math.min(...L.map((l) => fitSize(tmp, l, '800 $px "Bricolage Grotesque"', L.length > 1 ? 0.065 * S : 0.085 * S, 0.04 * S, 0.86 * S, 'condensed')));
  ctx.save(); setF(ctx, `800 ${size}px "Bricolage Grotesque"`, 'condensed'); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; L.forEach((l, i) => ctx.fillText(l, 0.07 * S, 0.94 * S - (L.length - 1 - i) * size * 0.95)); ctx.restore(); }; }
function matterA(x, g, a = g.r.artist, t = g.r.track) { const S = g.S; notation(x, CAT(g.r, 'MATTER · 06').join('   ').split('\n'), 0.5 * S, 0.05 * S, 0.0145 * S, '#B9BCC2', 'Martian Mono', 'center');
  const tmp = mk(10).getContext('2d'), L = lines2(tmp, a.toUpperCase(), '800 $px "Bricolage Grotesque"', 0.085 * S, 0.86 * S, 'condensed'); const size = Math.min(...L.map((l) => fitSize(tmp, l, '800 $px "Bricolage Grotesque"', L.length > 1 ? 0.065 * S : 0.085 * S, 0.04 * S, 0.86 * S, 'condensed')));
  const top = 0.94 * S - (L.length - 1) * size * 0.95 - size * 0.78; const ts = fitSize(x, t.toUpperCase(), '500 $px "Martian Mono"', 0.02 * S, 0.014 * S, 0.86 * S);
  setF(x, `500 ${ts}px "Martian Mono"`); x.fillStyle = '#D6B577'; x.letterSpacing = `${0.12 * ts}px`; x.fillText(t.toUpperCase(), 0.07 * S, top - 0.02 * S); x.letterSpacing = '0px'; }
// MATTER · B — "Rim notation": Syne ExtraBold uppercase set around the aperture rim (top arc = artist, bottom arc =
// track), like a scale printed on an instrument's edge; catalog as a straight foot line. No display treatment.
function arcText(x, text, cx, cy, r, mid, size, face, weight, color, track, inward = false) { setF(x, `${weight} ${size}px "${face}"`); x.fillStyle = color; x.textAlign = 'center'; const sp = track * size;
  const widths = [...text].map((ch) => x.measureText(ch).width + sp), total = widths.reduce((a, b) => a + b, 0); let ang = mid - (inward ? -1 : 1) * total / (2 * r);
  [...text].forEach((ch, i) => { const w = widths[i], a = ang + (inward ? -1 : 1) * w / (2 * r); x.save(); x.translate(cx + r * Math.cos(a), cy + r * Math.sin(a)); x.rotate(a + (inward ? -Math.PI / 2 : Math.PI / 2)); x.fillText(ch, 0, 0); x.restore(); ang += (inward ? -1 : 1) * w / r; }); x.textAlign = 'left'; }
function matterB(x, g, a = g.r.artist, t = g.r.track) { const S = g.S, cx = 0.5 * S, cy = 0.44 * S, r = 0.395 * S; const A = a.toUpperCase();
  const size = clamp((Math.PI * 0.95 * r) / (A.length * 0.82), 0.022 * S, 0.05 * S);
  arcText(x, A, cx, cy, r, -Math.PI / 2, size, 'Syne', 800, '#ECEAE5', 0.06);
  arcText(x, t.toUpperCase(), cx, cy, r + size * 0.75, Math.PI / 2, 0.02 * S, 'Martian Mono', 500, '#D6B577', 0.18, true);
  notation(x, [CAT(g.r, 'MATTER · 06').join('   ')], 0.5 * S, 0.955 * S, 0.0145 * S, '#B9BCC2', 'Martian Mono', 'center'); }

// =====================================================================================================
const out = {}, perf = {};
const save = (k, c) => { out[k] = c.toDataURL('image/png'); };
const T = (k, fn) => { const t0 = performance.now(); fn(); perf[k] = Math.round(performance.now() - t0); };
const STOCK = { ink: '#ECE5D6', light: '#07070A', matter: null };
function cover(fam, r, S, conceptFn) { const c = mk(S), x = c.getContext('2d'), g = geom(r, S);
  if (fam === 'ink') { paper(x, S, STOCK.ink, r.seed); const extra = conceptFn ? conceptFn.pre?.(x, g) : null; ink(x, g, { knockout: conceptFn?.knock?.(g) }); conceptFn?.post?.(x, g); }
  if (fam === 'light') { x.fillStyle = STOCK.light; x.fillRect(0, 0, S, S); if (conceptFn?.slot) { const tmp = mk(S), tx = tmp.getContext('2d'); const lay = light(tx, g); conceptFn.slot(g)(tx); x.drawImage(tmp, 0, 0); conceptFn.post?.(x, g, lay); } else { const lay = light(x, g); conceptFn?.post?.(x, g, lay); } }
  if (fam === 'matter') { matter(x, g, { emboss: conceptFn?.emboss?.(g) }); conceptFn?.post?.(x, g); }
  return c; }
const CONCEPTS = {
  inkA: { fam: 'ink', label: 'INK · A · Crop — Big Shoulders Display + Space Mono (overprint)', pre: (x, g) => inkA(x, g, g.r.artist, g.r.track),
    // keep the catalog legible: clear the plates behind the notation block (a printer's clear panel), never behind the display name
    knock: (g) => (ctx) => { const S = g.S, sz = 0.0175 * S; const tmp = mk(10).getContext('2d'); setF(tmp, `400 ${sz}px "Space Mono"`); tmp.letterSpacing = `${0.03 * sz}px`;
      const lines = [g.r.track.toUpperCase(), '', ...CAT(g.r, 'INK · 01')], w = Math.max(...lines.map((l) => tmp.measureText(l).width));
      ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.fillRect(0.95 * S - w - 0.012 * S, 0.075 * S - sz * 1.1, w + 0.024 * S, lines.length * sz * 1.45 + 0.012 * S); ctx.restore(); } },
  inkB: { fam: 'ink', label: 'INK · B · Column — Instrument Serif + Space Mono (knockout)', knock: (g) => inkB_knock(g, g.r.artist), post: (x, g) => inkB(x, g, g.r.artist, g.r.track) },
  lightA: { fam: 'light', label: 'LIGHT · A · Axis — Anybody 150 % + Martian Mono (slot mask)', slot: (g) => lightA_slot(g), post: (x, g) => lightA(x, g, g.r.artist, g.r.track) },
  lightB: { fam: 'light', label: 'LIGHT · B · Lit name — Bodoni Moda italic + Martian Mono (field mask)', post: (x, g, lay) => lightB(x, g, lay, g.r.artist, g.r.track) },
  matterA: { fam: 'matter', label: 'MATTER · A · Blind emboss — Bricolage Grotesque + Martian Mono (emboss)', emboss: (g) => matterA_emboss(g, g.r.artist), post: (x, g) => matterA(x, g, g.r.artist, g.r.track) },
  matterB: { fam: 'matter', label: 'MATTER · B · Rim notation — Syne + Martian Mono (none)', post: (x, g) => matterB(x, g, g.r.artist, g.r.track) },
};

// 1+2 · FORM SHEET: family × mode rows, Density 2 / 10 / 24 columns (no display type)
{ const S = 900, cell = 420, pad = 16, lab = 26, head = 56; const rows = [['ink', 'harmonic'], ['ink', 'radial'], ['light', 'harmonic'], ['light', 'radial'], ['matter', 'harmonic'], ['matter', 'radial']], ds = [2, 10, 24];
  const sh = mk(3 * (cell + pad) + pad, head + rows.length * (cell + lab + pad) + 30), x = sh.getContext('2d'); x.fillStyle = '#ECEBE7'; x.fillRect(0, 0, sh.width, sh.height);
  setF(x, '600 16px "Space Mono"'); x.fillStyle = '#141416'; ds.forEach((d, i) => x.fillText(`DENSITY ${d}${d === 2 ? ' · low' : d === 10 ? ' · medium' : ' · maximum'}`, pad + i * (cell + pad), 36));
  rows.forEach(([fam, mode], ri) => ds.forEach((d, ci) => { const r = R(mode, d); let c; T(`form-${fam}-${mode}-${d}`, () => { c = cover(fam, r, S); });
    const X = pad + ci * (cell + pad), Y = head + ri * (cell + lab + pad); x.drawImage(c, X, Y, cell, cell); setF(x, '500 13px "Space Mono"'); x.fillStyle = '#5A5A60'; x.fillText(`${fam.toUpperCase()} · ${mode} ${r.form}:${r.rhythm} · Φ045 · d${d}`, X, Y + cell + 18); }));
  setF(x, '500 13px "Space Mono"'); x.fillStyle = '#5A5A60'; x.fillText('Same recipe per row; only Density changes. No display type on form tests.', pad, sh.height - 10);
  save('form-sheet', sh); }

// 4 · TYPOGRAPHY SHEET: six concepts × (normal, long), Harmonic d10
{ const S = 900, cell = 440, pad = 16, head = 34; const keys = Object.keys(CONCEPTS);
  const sh = mk(4 * (cell + pad) + pad, Math.ceil(keys.length / 2) * (cell + head + pad) + 20), x = sh.getContext('2d'); x.fillStyle = '#ECEBE7'; x.fillRect(0, 0, sh.width, sh.height);
  keys.forEach((k, i) => { const col = (i % 2) * 2, row = Math.floor(i / 2), Y = 10 + row * (cell + head + pad), X0 = pad + col * (cell + pad);
    setF(x, '600 13px "Space Mono"'); x.fillStyle = '#141416'; x.fillText(CONCEPTS[k].label, X0, Y + 18);
    [R('harmonic', 10), R('harmonic', 10, LONG)].forEach((r, j) => { const c = cover(CONCEPTS[k].fam, r, S, CONCEPTS[k]); x.drawImage(c, X0 + j * (cell + pad), Y + head - 6, cell, cell); }); });
  save('typography-sheet', sh); }

// 5 · INTEGRATED COVERS at 3000 (recommended concept per family) + 6 · TRUE 1:1 CROPS
const PICK = { ink: 'inkA', light: 'lightB', matter: 'matterA' };
for (const [fam, k] of Object.entries(PICK)) { let c; T(`integrated-${fam}-3000`, () => { c = cover(fam, R('harmonic', 10), 3000, CONCEPTS[k]); }); save(`integrated-${fam}`, c);
  const cr = (sx, sy, w, h, name) => { const t = mk(w, h); t.getContext('2d').drawImage(c, sx, sy, w, h, 0, 0, w, h); save(name, t); };
  if (fam === 'ink') { cr(700, 650, 900, 900, 'crop-100pct-ink-contour'); cr(60, 2350, 1500, 650, 'crop-100pct-ink-type-overprint'); cr(2150, 180, 720, 500, 'crop-100pct-ink-notation'); }
  if (fam === 'light') { cr(1000, 700, 900, 900, 'crop-100pct-light-band'); cr(100, 1550, 1500, 700, 'crop-100pct-light-litname'); }
  if (fam === 'matter') { cr(1100, 650, 900, 900, 'crop-100pct-matter-relief'); cr(150, 2500, 1500, 450, 'crop-100pct-matter-emboss'); } }
// maximum-density 1:1 crops (texture/material behaviour at d24)
for (const fam of ['ink', 'light', 'matter']) { const c = cover(fam, R('harmonic', 24), 3000); const t = mk(900); t.getContext('2d').drawImage(c, fam === 'ink' ? 700 : 1050, 700, 900, 900, 0, 0, 900, 900); save(`crop-100pct-${fam}-density24`, t); }
out.__perf = JSON.stringify(perf);
return out;
