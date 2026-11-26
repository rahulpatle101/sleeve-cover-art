// MATTER — FINAL TWO ALTERNATIVES (static study only; not app code). Reads the app's geometry/registration.
// No circle, rim, aperture or container. One continuous surface; the waveform is a height field. Flat typography.
const { traces, boundingBox } = await import('/src/artwork/geometry.ts');
const { registration } = await import('/src/artwork/composition.ts');
const { validateRecipe } = await import('/src/instrument/recipe.ts');

const FD = '/production/creative-review-v0.2/lab2/fonts/';   // existing Matter fonts only (no new fonts)
for (const [fam, file, desc] of [['Bricolage Grotesque', 'BricolageGrotesque-VF.ttf', { weight: '200 800', stretch: '75% 100%' }], ['Martian Mono', 'MartianMono-VF.ttf', { weight: '100 800', stretch: '75% 112.5%' }]]) {
  const f = new FontFace(fam, `url(${FD}${file})`, desc); await f.load(); document.fonts.add(f); }
await document.fonts.ready;

const BASE = { seed: 0x01352905, artist: 'Mira Okafor', track: 'Tidewater', phase: 45, palette: 5 };
const R = (mode, density) => validateRecipe({ ...BASE, mode, form: 3, rhythm: mode === 'radial' ? 2 : 4, density });
const mk = (w, h = w) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const rng = (s) => () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function geom(r, S) { const trs = traces(r, 4096); return { r, S, trs, box: boundingBox(trs), reg: registration(r, S), N: trs.length, d: r.density }; }
function toPx(tr, p) { const n = tr.length / 2, X = new Float32Array(n), Y = new Float32Array(n); for (let j = 0; j < n; j++) { X[j] = tr[j * 2] * p.scale + p.tx; Y[j] = tr[j * 2 + 1] * p.scale + p.ty; } return { X, Y, n }; }
function poly(x, P, ox = 0, oy = 0) { x.beginPath(); x.moveTo(P.X[0] + ox, P.Y[0] + oy); for (let j = 1; j < P.n; j++) x.lineTo(P.X[j] + ox, P.Y[j] + oy); }
function place(g, size, fx, fy) { const b = g.box, S = g.S, sc = Math.min(size * S / (b.maxX - b.minX), size * S / (b.maxY - b.minY)); return { scale: sc, tx: fx * S - (b.minX + b.maxX) / 2 * sc, ty: fy * S - (b.minY + b.maxY) / 2 * sc }; }

// float height field helpers (8-bit canvases terrace a soft swell; convert + smooth)
function toF(c, S) { const D = c.getContext('2d').getImageData(0, 0, S, S).data, F = new Float32Array(S * S); for (let i = 0; i < S * S; i++) F[i] = D[i * 4 + 3] ? D[i * 4] / 255 * D[i * 4 + 3] / 255 : 0; return F; }
function box(F, S, r) { r = Math.max(1, Math.round(r)); const T = new Float32Array(S * S), n = 2 * r + 1;
  for (let y = 0; y < S; y++) { let a = 0; const o = y * S; for (let X = -r; X <= r; X++) a += F[o + clamp(X, 0, S - 1)]; for (let X = 0; X < S; X++) { T[o + X] = a / n; a += F[o + Math.min(S - 1, X + r + 1)] - F[o + Math.max(0, X - r)]; } }
  for (let X = 0; X < S; X++) { let a = 0; for (let y = -r; y <= r; y++) a += T[clamp(y, 0, S - 1) * S + X]; for (let y = 0; y < S; y++) { F[y * S + X] = a / n; a += T[Math.min(S - 1, y + r + 1) * S + X] - T[Math.max(0, y - r) * S + X]; } } return F; }
const smooth = (F, S, r) => box(box(F, S, r), S, r);

// ONE continuous surface. sign = -1 pressed into the sheet (Alt 1), +1 raised from it (Alt 2).
// zoom scales the relief with the macro crop. Density → depth, surface frequency (≤ 4 shallow undulations), micro brushing.
// Phase → channel-B groove offset (at register it sits in the crest → one rolled profile).
function relief(x, g, { place: p, sign, zoom = 1, falloff = 0 }) {
  const S = g.S, d = g.d, base = 0.0021 * S * zoom, rw = base * (4.5 + d * 0.3);
  const key = toPx(g.trs[0], p);
  const ridge = mk(S), rx = ridge.getContext('2d'); rx.lineCap = rx.lineJoin = 'round'; rx.filter = `blur(${rw * 1.15}px)`; rx.strokeStyle = '#fff'; rx.lineWidth = rw * 0.6; poly(rx, key); rx.stroke();
  const groove = mk(S), gx = groove.getContext('2d'); gx.lineCap = gx.lineJoin = 'round'; gx.filter = `blur(${rw * 0.25}px)`; gx.strokeStyle = '#fff'; gx.lineWidth = rw * 0.3; poly(gx, key, g.reg.dx * zoom, g.reg.dy * zoom); gx.stroke();
  const wave = mk(S), wx = wave.getContext('2d'); wx.lineCap = 'round'; wx.filter = `blur(${base * 4}px)`; wx.strokeStyle = '#fff'; wx.lineWidth = base * 3;
  const E = Math.min(4, Math.floor(d / 5)); for (let e = 1; e <= E; e++) { poly(wx, toPx(g.trs[Math.round(e * (g.N - 1) / (E + 1))], p)); wx.stroke(); }
  const A = smooth(toF(ridge, S), S, rw * 0.35), B = smooth(toF(groove, S), S, rw * 0.15), W = smooth(toF(wave, S), S, base * 2);
  const depth = 1.1 + d * 0.06, rowN = new Float32Array(S); { const r = rng(g.r.seed ^ 0xb005); let v = 0; for (let y = 0; y < S; y++) { v = v * 0.6 + (r() - 0.5); rowN[y] = v; } }
  const H = new Float32Array(S * S); for (let i = 0; i < S * S; i++) H[i] = zoom * sign * (depth * A[i] - 0.35 * depth * B[i] + (0.05 + d * 0.004) * W[i]) + rowN[(i / S) | 0] * 0.0025 * (1 + d / 12);
  // shading: one directional light, restrained highlight and shadow; optional light falloff across the frame (macro photo)
  const out = x.getImageData(0, 0, S, S), O = out.data, k = S / 260, L = [-0.6, -0.62, 0.42], ll = Math.hypot(...L); L.forEach((v, i) => (L[i] = v / ll));
  const Hh = [L[0], L[1], L[2] + 1], hl = Math.hypot(...Hh); Hh.forEach((v, i) => (Hh[i] = v / hl)); const alb = [72, 75, 81], spc = [232, 234, 238];
  for (let y = 1; y < S - 1; y++) for (let X = 1; X < S - 1; X++) { const i = y * S + X; let nx = -(H[i + 1] - H[i - 1]) * k, ny = -(H[i + S] - H[i - S]) * k, nz = 1; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
    const dif = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]), sp = Math.pow(Math.max(0, nx * Hh[0] + ny * Hh[1] + nz * Hh[2]), 34);
    const fo = falloff ? 1 - falloff * clamp(Math.hypot(X / S - 0.15, y / S - 0.1) / 1.25, 0, 1) : 1, q = i * 4;
    for (let c = 0; c < 3; c++) O[q + c] = clamp((alb[c] * (0.22 + 1.1 * dif) + spc[c] * sp * 0.55) * fo, 0, 255); O[q + 3] = 255; }
  x.putImageData(out, 0, 0);
}

// flat, sharp, restrained typography (existing Matter layout: catalog head line · track · name bottom-left)
function setF(x, css, stretch = 'normal') { x.font = css; x.fontStretch = stretch; x.textBaseline = 'alphabetic'; x.textAlign = 'left'; }
function fitSize(x, text, css, size, min, maxW, stretch) { let s = size; for (;;) { setF(x, css.replace('$', s.toFixed(1)), stretch); if (x.measureText(text).width <= maxW || s <= min) return s; s = Math.max(min, s * 0.95); } }
const CAT = (r) => ['MATTER · 06', `PLATE ${r.seed.toString(16).padStart(8, '0').toUpperCase()}`, `${r.mode.toUpperCase()} ${r.form}:${r.rhythm}`, `Φ ${String(r.phase).padStart(3, '0')}° OFF REGISTER`, `${r.density} ${r.density === 1 ? 'PASS' : 'PASSES'}`].join('   ');
function type(x, g) { const S = g.S, a = g.r.artist.toUpperCase(), t = g.r.track.toUpperCase();
  const size = fitSize(x, a, '800 $px "Bricolage Grotesque"', 0.085 * S, 0.04 * S, 0.86 * S, 'condensed');
  setF(x, `800 ${size}px "Bricolage Grotesque"`, 'condensed'); x.fillStyle = '#ECEAE5'; x.fillText(a, 0.07 * S, 0.935 * S);
  const ts = 0.02 * S; setF(x, `500 ${ts}px "Martian Mono"`); x.letterSpacing = `${0.12 * ts}px`; x.fillStyle = '#D6B577'; x.fillText(t, 0.07 * S, 0.935 * S - size * 0.78 - 0.02 * S); x.letterSpacing = '0px';
  const cs = 0.0145 * S; setF(x, `400 ${cs}px "Martian Mono"`); x.fillStyle = '#B9BCC2'; x.textAlign = 'center'; x.fillText(CAT(g.r), 0.5 * S, 0.05 * S); x.textAlign = 'left'; }

// placements
const ALT = {
  alt1: { label: 'ALT 1 · Full-bleed relief sheet (pressed into one coated graphite surface)', sign: -1, zoom: 1, falloff: 0,
    place: (g) => place(g, 0.78, 0.5, 0.42) },
  alt2: { label: 'ALT 2 · Macro material crop (raised relief, enlarged past every edge)', sign: 1, zoom: 1.75, falloff: 0.22,
    place: (g) => g.r.mode === 'radial' ? place(g, 1.75, 0.66, 0.36) : place(g, 1.75, 0.5, 0.36) },
};
function cover(alt, r, S, withType = true) { const c = mk(S), x = c.getContext('2d'), g = geom(r, S), A = ALT[alt]; x.fillStyle = '#000'; x.fillRect(0, 0, S, S);
  relief(x, g, { place: A.place(g), sign: A.sign, zoom: A.zoom, falloff: A.falloff }); if (withType) type(x, g); return c; }

const out = {}, perf = {}; const save = (k, c) => { out[k] = c.toDataURL('image/png'); };
for (const alt of ['alt1', 'alt2']) {
  // sheet: Harmonic + Radial rows × Density 2 / 10 / 24
  const S = 900, cell = 420, pad = 16, lab = 26, head = 60, sh = mk(3 * (cell + pad) + pad, head + 2 * (cell + lab + pad) + 10), x = sh.getContext('2d');
  x.fillStyle = '#ECEBE7'; x.fillRect(0, 0, sh.width, sh.height); setF(x, '600 15px "Martian Mono"'); x.fillStyle = '#141416'; x.fillText(ALT[alt].label, pad, 24);
  [2, 10, 24].forEach((d, i) => { setF(x, '500 13px "Martian Mono"'); x.fillStyle = '#5A5A60'; x.fillText(`DENSITY ${d}`, pad + i * (cell + pad), 48); });
  ['harmonic', 'radial'].forEach((m, ri) => [2, 10, 24].forEach((d, ci) => { const t0 = performance.now(); const c = cover(alt, R(m, d), S); perf[`${alt}-${m}-${d}@900`] = Math.round(performance.now() - t0);
    const X = pad + ci * (cell + pad), Y = head + ri * (cell + lab + pad); x.drawImage(c, X, Y, cell, cell); setF(x, '500 12px "Martian Mono"'); x.fillStyle = '#5A5A60'; x.fillText(`${m} ${m === 'radial' ? '3:2' : '3:4'} · Φ045 · d${d}`, X, Y + cell + 17); }));
  save(`matter-${alt}-sheet`, sh);
  // integrated 3000 + true 1:1 crop (relief + flat type edge)
  const t0 = performance.now(); const big = cover(alt, R('harmonic', 10), 3000); perf[`${alt}-integrated@3000`] = Math.round(performance.now() - t0); save(`matter-${alt}-integrated`, big);
  const cr = mk(1000); cr.getContext('2d').drawImage(big, alt === 'alt1' ? 1000 : 900, alt === 'alt1' ? 700 : 900, 1000, 1000, 0, 0, 1000, 1000); save(`matter-${alt}-crop-100pct`, cr);
  const ct = mk(1500, 500); ct.getContext('2d').drawImage(big, 150, 2400, 1500, 500, 0, 0, 1500, 500); save(`matter-${alt}-crop-100pct-type`, ct);
}
out.__perf = JSON.stringify(perf);
return out;
