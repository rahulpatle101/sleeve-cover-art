// MATTER — surface & relief (approved Alt 1 Full Sheet / Alt 2 Macro Relief). One continuous coated-graphite surface;
// the key contour is a float height field (pressed in for Full Sheet, raised and magnified for Macro Relief). One light,
// restrained highlight/shadow. No container, circle, rim or aperture. Density = relief depth + shallow surface frequency
// + micro brushing. Phase = channel-B groove offset (at register it sits in the crest → one profile). Type is flat.
import type { Ctx } from '../raster.ts';
import { makeCanvas, ctx2d, toPts, poly, mulberry, toField, smoothField, clamp, rgb, hash2, window, normals } from '../raster.ts';
import { density } from '../composition.ts';
import { F } from '../fonts.ts';
import { setFont, fitSize, balance, setTracking } from '../text.ts';
import type { G, Quality } from './types.ts';

const ZOOM_MACRO = 2.3; // stronger macro crop (matches placement)
const DEPTH = 1.65; // deeper relief than the lab study
const MACRO_CLARITY = 1.15; // approved: Alt 2 relief slightly clearer at preview size

export function matterArt(x: Ctx, G: G, q: Quality) {
  const { S, r, set, trs, place } = G, d = r.density, D = density.matter(d);
  const zoom = set.macro ? ZOOM_MACRO : 1, sign = set.macro ? 1 : -1, base = 0.0021 * S * zoom;
  // Macro: the ridge stops widening after 8 passes (wider = blurrier at this magnification); passes add engraved detail instead.
  // Full Sheet: broader pressed relief.
  const rw = set.macro ? base * density.matter(Math.min(d, 8)).ridgeWidth : base * D.ridgeWidth * 1.45;
  const alb = set.albedo!, key = toPts(trs[0], place);
  if (q === 'draft') {
    // relief hint only: graphite + light/dark offset strokes along the key contour
    x.fillStyle = rgb(alb); x.fillRect(0, 0, S, S);
    const e = Math.max(1, rw * 0.18) * sign;
    x.lineCap = x.lineJoin = 'round';
    x.strokeStyle = 'rgba(0,0,0,0.38)'; x.lineWidth = rw * 0.45; poly(x, key, e, e); x.stroke();
    x.strokeStyle = 'rgba(230,232,236,0.22)'; x.lineWidth = rw * 0.3; poly(x, key, -e, -e); x.stroke();
    return;
  }
  const ridge = makeCanvas(S), rx = ctx2d(ridge);
  rx.lineCap = rx.lineJoin = 'round'; rx.strokeStyle = '#fff'; rx.lineWidth = rw * 0.6; poly(rx, key); rx.stroke();
  rx.lineWidth = rw * 1.05; poly(rx, window(key, G.emph.start, G.emph.len)); rx.stroke(); // curve emphasis: one swelling stretch
  const groove = makeCanvas(S), gx = ctx2d(groove);
  gx.lineCap = gx.lineJoin = 'round'; gx.strokeStyle = '#fff'; gx.lineWidth = rw * 0.3; poly(gx, key, G.reg.dx * zoom, G.reg.dy * zoom); gx.stroke();
  const wave = makeCanvas(S), wx = ctx2d(wave);
  wx.lineCap = 'round'; wx.strokeStyle = '#fff'; wx.lineWidth = base * 3;
  for (let e = 1; e <= D.undulations; e++) { poly(wx, toPts(trs[Math.round((e * (G.N - 1)) / (D.undulations + 1))], place)); wx.stroke(); }
  const A = smoothField(toField(ridge, S), S, rw * 0.7), B = smoothField(toField(groove, S), S, rw * 0.16), Wf = smoothField(toField(wave, S), S, base * 2.6);
  // Macro engraving: fine sharp grooves running parallel to the ridge on both sides (1 → 9 as passes build), like the
  // lands of a record groove. Kept crisp (small blur) so detail grows with Passes instead of softening.
  let E: Float32Array | null = null;
  const lands = set.macro ? Math.min(7, 1 + Math.floor(d / 3)) : 0;
  if (lands) {
    const ec = makeCanvas(S), ex = ctx2d(ec), Nn = normals(key);
    // smooth the normals along the curve (±12 samples): at macro scale the raw polyline normals wobble and serrate the grooves
    { const R = 12, n = key.n, sx = new Float32Array(n), sy = new Float32Array(n);
      for (let j = 0; j < n; j++) { let ax = 0, ay = 0; for (let o = -R; o <= R; o++) { const q = Math.min(n - 1, Math.max(0, j + o)); ax += Nn.NX[q]; ay += Nn.NY[q]; } const l = Math.hypot(ax, ay) || 1; sx[j] = ax / l; sy[j] = ay / l; }
      Nn.NX.set(sx); Nn.NY.set(sy); }
    ex.lineCap = ex.lineJoin = 'round'; ex.lineWidth = base * 0.5;
    for (let k = 0; k < lands; k++) {
      const o = rw * 0.5 + (k + 1) * base * 1.15;
      ex.strokeStyle = `rgba(255,255,255,${(1 - k / (lands + 2)).toFixed(3)})`;
      for (const sgn of [-1, 1]) { ex.beginPath(); for (let j = 0; j < key.n; j++) { const X = key.X[j] + Nn.NX[j] * o * sgn, Y = key.Y[j] + Nn.NY[j] * o * sgn; j ? ex.lineTo(X, Y) : ex.moveTo(X, Y); } ex.stroke(); }
    }
    E = smoothField(toField(ec, S), S, base * 0.42);
  }
  const rowN = new Float32Array(S);
  { const rr = mulberry(r.seed ^ 0xb005); let v = 0; for (let y = 0; y < S; y++) { v = v * 0.6 + (rr() - 0.5); rowN[y] = v; } }
  const amp = DEPTH * zoom * sign * (set.macro ? MACRO_CLARITY : 1), H = new Float32Array(S * S);
  const depth = set.macro ? D.depth * (1 + d / 40) : D.depth, brush = set.macro ? D.brush * 0.25 : D.brush; // macro: deeper with passes, no streaking
  for (let i = 0; i < S * S; i++) H[i] = amp * (depth * A[i] - 0.35 * depth * B[i] + (0.05 + d * 0.004) * Wf[i] - (E ? 0.3 * depth * E[i] : 0)) + rowN[(i / S) | 0] * brush;
  // material grain: fine seeded height noise at a fixed physical scale (~1/1500 of the side)
  const gc = Math.max(1, Math.round(S / 1500)), gs = r.seed ^ 0x6a17, gAmp = 0.0016;
  for (let y = 0; y < S; y++) for (let X = 0; X < S; X++) H[y * S + X] += (hash2((X / gc) | 0, (y / gc) | 0, gs) - 0.5) * gAmp;
  const out = x.createImageData(S, S), O = out.data, k = S / 260;
  const nrm = (v: number[]) => { const l = Math.hypot(v[0], v[1], v[2]); return v.map((q) => q / l); };
  const L = nrm([-0.62, -0.58, 0.52]), Fl = nrm([0.72, 0.38, 0.58]), Hh = nrm([L[0], L[1], L[2] + 1]);
  const warm = [1.0, 0.9, 0.74], cool = [0.7, 0.83, 1.0], amb = [0.84, 0.9, 1.0], spc = [255, 244, 226];
  for (let y = 0; y < S; y++) for (let X = 0; X < S; X++) {
    const i = y * S + X, xl = X > 0 ? i - 1 : i, xr = X < S - 1 ? i + 1 : i, yu = y > 0 ? i - S : i, yd = y < S - 1 ? i + S : i;
    let nx = -(H[xr] - H[xl]) * k, ny = -(H[yd] - H[yu]) * k, nz = 1; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
    const dif = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]), fil = Math.max(0, nx * Fl[0] + ny * Fl[1] + nz * Fl[2]);
    const hv = Math.max(0, nx * Hh[0] + ny * Hh[1] + nz * Hh[2]), sp = Math.pow(hv, 70) * 1.05 + Math.pow(hv, 9) * 0.1;
    // directional falloff: the key light pools toward the upper left, as in a photographed object
    const fo = 1.08 - 0.34 * clamp(Math.hypot(X / S - 0.18, y / S - 0.12) / 1.2, 0, 1), q4 = i * 4;
    for (let c = 0; c < 3; c++) O[q4 + c] = clamp((alb[c] * (0.17 * amb[c] + 1.05 * dif * warm[c] + 0.44 * fil * cool[c]) + spc[c] * sp * 0.6) * fo, 0, 255);
    O[q4 + 3] = 255;
  }
  // putImageData ignores transforms; the art layer is drawn untranslated for square covers
  const tmp = makeCanvas(S); ctx2d(tmp).putImageData(out, 0, 0); x.drawImage(tmp as CanvasImageSource, 0, 0);
}

/** Flat, sharp, restrained: track · name (Bricolage condensed ExtraBold). No metadata on covers. */
export function matterType(x: Ctx, G: G) {
  const { S, r, set } = G, a = r.artist.trim().toUpperCase(), t = r.track.trim().toUpperCase();
  x.textBaseline = 'alphabetic';
  let top = 0.935 * S;
  if (a) {
    const L = balance(x, a, 800, F.matterDisplay, 0.085 * S, 0.86 * S);
    const size = Math.min(...L.map((l) => fitSize(x, l, 800, F.matterDisplay, L.length > 1 ? 0.065 * S : 0.085 * S, 0.04 * S, 0.86 * S)));
    setFont(x, 800, size, F.matterDisplay); x.fillStyle = set.display; x.textAlign = 'left';
    L.forEach((l, i) => x.fillText(l, 0.07 * S, 0.935 * S - (L.length - 1 - i) * size * 0.95));
    top = 0.935 * S - (L.length - 1) * size * 0.95 - size * 0.78;
  }
  if (t) {
    const ts = fitSize(x, t, 500, F.mono, 0.02 * S, 0.014 * S, 0.86 * S, 'normal', 0.12);
    setFont(x, 500, ts, F.mono, 'normal', 0.12); x.fillStyle = set.accent!; x.textAlign = 'left'; x.fillText(t, 0.07 * S, top - 0.02 * S);
  }
  setTracking(x, 0); x.textAlign = 'left';
}
