// LIGHT — band & field (approved Light B / Lit Name). The key contour becomes ONE band with a spectral gradient across
// its width (ultramarine edge → white core → amber edge). Its two halves are the two channels, separated by Phase and
// rejoined at the detents into one clear signal. Density = band width, intensity, internal filaments, residue.
// The Lit Name crosses the signal and receives its light; base fill keeps it legible everywhere.
import type { Ctx, AnyCanvas, Pts } from '../raster.ts';
import { makeCanvas, ctx2d, toPts, poly, normals, mulberry, softBlur, rgb, clamp, window, binTile, tile } from '../raster.ts';
import { density } from '../composition.ts';
import { F } from '../fonts.ts';
import { setFont, fitSize, balance, setTracking } from '../text.ts';
import type { G, Quality } from './types.ts';

const ULTRA = [52, 92, 255], NEUT = [236, 238, 242], AMBER = [255, 168, 52];
const mix = (A: number[], B: number[], t: number) => A.map((v, i) => Math.round(v + (B[i] - v) * t));
const ramp = (t: number) => (t < 0.5 ? mix(ULTRA, NEUT, t * 2) : mix(NEUT, AMBER, (t - 0.5) * 2));
const HORIZON_Y = 0.64;

function stock(x: Ctx, G: G) {
  const { S, set, r } = G;
  if (!set.horizon) { x.fillStyle = set.stock; x.fillRect(0, 0, S, S); return; }
  // Atmospheric horizon: deep navy, cobalt volume, one concentrated amber source, soft reflection falloff, dither.
  const H = HORIZON_Y * S, sx = (0.28 + 0.44 * mulberry(r.seed ^ 0x50a1)()) * S;
  const sky = x.createLinearGradient(0, 0, 0, S);
  sky.addColorStop(0, '#02040b'); sky.addColorStop(0.3, '#050a1d'); sky.addColorStop(HORIZON_Y - 0.1, '#0a1640'); sky.addColorStop(HORIZON_Y, '#11225c');
  sky.addColorStop(HORIZON_Y + 0.001, '#081130'); sky.addColorStop(HORIZON_Y + 0.08, '#050a1e'); sky.addColorStop(1, '#010207');
  x.fillStyle = sky; x.fillRect(0, 0, S, S);
  const ellipse = (cx: number, cy: number, rx: number, ry: number, stops: [number, string][], clipTop: number, clipBottom: number) => {
    x.save(); x.beginPath(); x.rect(0, clipTop, S, clipBottom - clipTop); x.clip();
    x.translate(cx, cy); x.scale(1, ry / rx);
    const gr = x.createRadialGradient(0, 0, 0, 0, 0, rx); stops.forEach(([o, c]) => gr.addColorStop(o, c));
    x.fillStyle = gr; x.globalCompositeOperation = 'lighter'; x.fillRect(-rx, -rx, 2 * rx, 2 * rx); x.restore();
  };
  // cobalt volume above the horizon
  ellipse(sx, H - 0.04 * S, 0.75 * S, 0.42 * S, [[0, 'rgba(46,92,230,0.42)'], [0.45, 'rgba(30,64,190,0.16)'], [1, 'rgba(20,40,140,0)']], 0, H);
  // concentrated amber source sitting on the horizon
  ellipse(sx, H, 0.42 * S, 0.11 * S, [[0, 'rgba(255,226,170,0.95)'], [0.05, 'rgba(255,184,92,0.75)'], [0.22, 'rgba(232,120,40,0.28)'], [0.6, 'rgba(160,70,30,0.06)'], [1, 'rgba(120,40,20,0)']], 0, S);
  // horizon line: bright at the source, dissolving toward the edges
  const hl = x.createLinearGradient(0, 0, S, 0);
  hl.addColorStop(0, 'rgba(233,184,104,0)'); hl.addColorStop(clamp(sx / S - 0.3, 0, 1), 'rgba(233,184,104,0.18)'); hl.addColorStop(sx / S, 'rgba(255,214,150,0.9)');
  hl.addColorStop(clamp(sx / S + 0.3, 0, 1), 'rgba(233,184,104,0.18)'); hl.addColorStop(1, 'rgba(233,184,104,0)');
  x.fillStyle = hl; x.fillRect(0, H - 0.0009 * S, S, 0.0018 * S);
  // reflection: a vertical amber column with soft falloff below the horizon
  ellipse(sx, H, 0.09 * S, 0.34 * S, [[0, 'rgba(255,176,90,0.34)'], [0.35, 'rgba(220,120,50,0.12)'], [1, 'rgba(160,70,30,0)']], H, S);
  // subtle dither against gradient banding (crisp seeded tiles: light + dark)
  const d = makeCanvas(256), dx = ctx2d(d); dx.fillStyle = '#fff'; dx.fillRect(0, 0, 256, 256); dx.globalCompositeOperation = 'destination-in'; dx.drawImage(binTile(r.seed + 303, 0.5) as CanvasImageSource, 0, 0);
  x.save(); x.globalAlpha = 0.014; tile(x, d, S, Math.max(1, Math.round(S / 512))); x.globalAlpha = 0.03; x.globalCompositeOperation = 'multiply'; tile(x, binTile(r.seed + 304, 0.5), S, Math.max(1, Math.round(S / 512))); x.restore();
}

type Layers = { band: AnyCanvas; field: AnyCanvas };

function band(G: G, P: Pts, q: Quality): Layers {
  const { S, r } = G, D = density.light(r.density), base = 0.0021 * S, W = base * D.bandWidth, I = D.intensity;
  const field = makeCanvas(S), fx = ctx2d(field);
  fx.lineCap = fx.lineJoin = 'round'; fx.strokeStyle = rgb([120, 150, 230], 0.05 * I); fx.lineWidth = W * 4.5; poly(fx, P); fx.stroke();
  const B = makeCanvas(S), bx = ctx2d(B);
  bx.lineCap = bx.lineJoin = 'round'; bx.globalCompositeOperation = 'lighter';
  if (q === 'draft') {
    for (let ch = 0; ch < 2; ch++) { bx.save(); if (ch) bx.translate(G.reg.dx, G.reg.dy); bx.strokeStyle = rgb(ch ? AMBER : ULTRA, 0.3 * I); bx.lineWidth = W; poly(bx, P); bx.stroke(); bx.strokeStyle = rgb(NEUT, 0.6); bx.lineWidth = base * 0.7; poly(bx, P); bx.stroke(); bx.restore(); }
    return { band: B, field };
  }
  const Nn = normals(P), K = 24; // offsets per half (more than the lab's 16 to reduce striation)
  for (let ch = 0; ch < 2; ch++) for (let k = 0; k < K; k++) {
    const u = (k + 0.5) / K, o = ch === 0 ? -W * (1 - u) : W * u, t = (o + W) / (2 * W);
    bx.strokeStyle = rgb(ramp(t), 0.22 * I * (0.35 + 0.65 * Math.pow(1 - Math.abs(o) / W, 0.7)));
    bx.lineWidth = ((2 * W) / K) * 1.6;
    const dx = ch ? G.reg.dx : 0, dy = ch ? G.reg.dy : 0;
    bx.beginPath();
    for (let j = 0; j < P.n; j++) { const X = P.X[j] + Nn.NX[j] * o + dx, Y = P.Y[j] + Nn.NY[j] * o + dy; j ? bx.lineTo(X, Y) : bx.moveTo(X, Y); }
    bx.stroke();
  }
  const soft = softBlur(B, Math.max(2, W / 6)), out = makeCanvas(S), ox = ctx2d(out);
  ox.globalCompositeOperation = 'lighter'; ox.drawImage(soft as CanvasImageSource, 0, 0);
  // cores: each channel carries half the core → coincident at register = one bright signal
  ox.lineCap = 'round';
  for (let ch = 0; ch < 2; ch++) { ox.save(); if (ch) ox.translate(G.reg.dx, G.reg.dy); ox.strokeStyle = rgb(ch ? [255, 236, 214] : [214, 226, 255], 0.38); ox.lineWidth = base * 0.6; poly(ox, P); ox.stroke(); ox.restore(); }
  // curve emphasis: one stretch of the signal runs hotter (wide soft lift + bright core)
  { const E = window(P, G.emph.start, G.emph.len); const h = makeCanvas(S), hx = ctx2d(h); hx.lineCap = hx.lineJoin = 'round'; hx.strokeStyle = rgb(NEUT, 0.22 * I); hx.lineWidth = W * 1.6; poly(hx, E); hx.stroke();
    ox.drawImage(softBlur(h, W * 0.8) as CanvasImageSource, 0, 0); ox.strokeStyle = rgb([255, 246, 232], 0.7); ox.lineWidth = base * 1.1; poly(ox, E); ox.stroke(); }
  // internal energy: filaments inside the band (same path), seeded
  const rr = mulberry(r.seed ^ 0xf11);
  for (let f = 0; f < D.filaments; f++) {
    const o = (rr() - 0.5) * 1.3 * W, seg = 96;
    for (let j = 0; j < P.n - seg; j += seg) {
      ox.strokeStyle = rgb(ramp((o + W) / (2 * W)), 0.08 + 0.18 * rr()); ox.lineWidth = base * 0.22; ox.beginPath();
      for (let qq = j; qq <= j + seg; qq += 2) { const X = P.X[qq] + Nn.NX[qq] * o, Y = P.Y[qq] + Nn.NY[qq] * o; qq === j ? ox.moveTo(X, Y) : ox.lineTo(X, Y); }
      ox.stroke();
    }
  }
  // residue: sparse particles shed from the band
  for (let m = 0; m < D.residue; m++) {
    const j = (rr() * P.n) | 0, o = (rr() + rr() + rr() - 1.5) * 1.6 * W, X = P.X[j] + Nn.NX[j] * o, Y = P.Y[j] + Nn.NY[j] * o;
    ox.fillStyle = rgb(ramp(clamp((o + W) / (2 * W), 0, 1)), 0.15 + rr() * 0.45);
    ox.beginPath(); ox.arc(X, Y, (0.0003 + rr() * rr() * 0.0011) * S, 0, 6.283); ox.fill();
  }
  return { band: out, field: softBlur(field, W * 1.6) };
}

/** Lit Name layout. Spectrum: Syne Bold, uppercase, technical. Horizon: EB Garamond Medium Italic. */
type NameFace = { family: string; weight: number; style: string; track: number; upper: boolean; size1: number; size2: number; min: number; lead: number };
const face = (G: G): NameFace => (G.set.horizon
  ? { family: F.horizonDisplay, weight: 500, style: 'italic', track: -0.018, upper: false, size1: 0.22, size2: 0.15, min: 0.07, lead: 0.86 }
  : { family: F.spectrumDisplay, weight: 700, style: 'normal', track: 0.015, upper: true, size1: 0.165, size2: 0.112, min: 0.05, lead: 0.9 });
function nameLayout(x: Ctx, G: G) {
  const { S, r, set } = G, f = face(G), raw = r.artist.trim();
  if (!raw) return null;
  const txt = f.upper ? raw.toUpperCase() : raw, maxW = (set.horizon ? 0.84 : 0.86) * S;
  const L = balance(x, txt, f.weight, f.family, f.size1 * S, maxW, f.style, f.track);
  const size = Math.min(...L.map((l) => fitSize(x, l, f.weight, f.family, (L.length > 1 ? f.size2 : f.size1) * S, f.min * S, maxW, f.style, f.track)));
  // Both Light sets establish the name before the luminous crop. Horizon uses
  // the atmospheric upper-left; Spectrum is tighter and more technical at the crown.
  const cy = set.horizon ? 0.29 : 0.21;
  const left = set.horizon ? 0.07 : 0.055;
  return { L, size, cy, left, f };
}
function drawName(x: Ctx, G: G, n: NonNullable<ReturnType<typeof nameLayout>>, fill: string) {
  setFont(x, n.f.weight, n.size, n.f.family, n.f.style, n.f.track); x.fillStyle = fill; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
  n.L.forEach((l, i) => x.fillText(l, n.left * G.S, n.cy * G.S + (i - (n.L.length - 1) / 2) * n.size * n.f.lead));
  setTracking(x, 0);
}

export function lightArt(x: Ctx, G: G, q: Quality) {
  const { S, set, trs, place } = G;
  stock(x, G);
  const P = toPts(trs[0], place), lay = band(G, P, q);
  x.save(); x.globalCompositeOperation = 'lighter'; x.drawImage(lay.field as CanvasImageSource, 0, 0); x.drawImage(lay.band as CanvasImageSource, 0, 0);
  if (set.horizon && q === 'full') { // faint reflection below the horizon
    x.save(); x.globalAlpha = 0.16; x.translate(0, 2 * HORIZON_Y * S); x.scale(1, -1);
    x.beginPath(); x.rect(0, 0, S, HORIZON_Y * S); x.clip(); x.drawImage(softBlur(lay.band, 0.004 * S) as CanvasImageSource, 0, 0); x.restore();
  }
  x.restore();
  const n = nameLayout(x, G);
  if (!n) return;
  drawName(x, G, n, set.display);
  if (q === 'draft') return;
  // the light field masked into the letterforms: letters brighten where the signal passes
  const m = makeCanvas(S), mx = ctx2d(m);
  drawName(mx, G, n, '#fff');
  mx.globalCompositeOperation = 'source-in';
  const lit = softBlur(lay.band, 0.01 * S);
  mx.drawImage(lit as CanvasImageSource, 0, 0); mx.drawImage(lit as CanvasImageSource, 0, 0); mx.drawImage(lay.field as CanvasImageSource, 0, 0);
  x.save(); x.globalCompositeOperation = 'lighter'; x.drawImage(m as CanvasImageSource, 0, 0); x.drawImage(m as CanvasImageSource, 0, 0); x.restore();
}

export function lightType(x: Ctx, G: G) {
  const { S, r, set } = G;
  const t = r.track.trim().toUpperCase();
  if (t) {
    const tl = balance(x, t, 400, F.mono, 0.022 * S, 0.8 * S, 'normal', 0.12);
    const ts = Math.min(...tl.map((l) => fitSize(x, l, 400, F.mono, 0.022 * S, 0.015 * S, 0.8 * S, 'normal', 0.12)));
    const rightAligned = !set.horizon;
    setFont(x, 400, ts, F.mono, 'normal', 0.12); x.fillStyle = set.accent!; x.textAlign = rightAligned ? 'right' : 'left'; x.textBaseline = 'alphabetic';
    tl.forEach((l, i) => x.fillText(l, (rightAligned ? 0.94 : 0.07) * S, 0.93 * S - (tl.length - 1 - i) * ts * 1.45));
    setTracking(x, 0);
  }
  setTracking(x, 0); x.textAlign = 'left';
}
